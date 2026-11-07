package com.ultimatum.app;

import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.content.Intent;
import android.content.SharedPreferences;
import android.view.Window;
import android.view.WindowManager;
import androidx.core.splashscreen.SplashScreen;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    // True while this process holds a user session. Every onCreate reached
    // with it set is a rebuild (configuration change, system-initiated
    // destruction, recents tap), not a fresh launch, so the saved screen must
    // survive. A brand-new process never sees it.
    static boolean active;
    // An Activity teardown that is really the task ending. Once set, nothing
    // in this process may restore the saved screen.
    static boolean taskFinishing;
    // Read by the RestTimerNative bridge on first page load so the web layer can
    // decide whether to resume the last screen before auth restores.
    static boolean lastLaunchWasCold = true;
    // The task that was last shown to the user. A swipe away from recents ends
    // the task and clears its token (see markTaskEnded); a new task means
    // the user launched the app from closed whatever the caches still say.
    private static final String PREF_LAST_TASK = "_last_task_id";
    // Where the app was when it left the foreground normally (home / app switch).
    private static final String PREF_WAS_BACKGROUND = "_exited_to_background";
    // True when the previous process left with the home button / app switch and
    // was reclaimed afterwards, so the next launch opens on the saved screen
    // rather than the landing page.
    static boolean lastExitWasBackground;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        if (savedInstanceState != null) {
            // Android only passes a non-null bundle on a configuration change,
            // never for a launch, so the bundle is the authoritative signal.
            active = true;
        }
        registerPlugin(RestTimerPlugin.class);
        registerPlugin(BackupFilePlugin.class);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            registerPlugin(HealthConnectPlugin.class);
        }

        // A rebuilt Activity (design mode toggles, rotation, font size, OS
        // reclaim, recents tap) is NOT a cold start: the WebView replays the
        // previous URL and the app must stay on that screen. Activity state is
        // only passed for a rebuild, never for a launch, so it is authoritative.
        //
        // The in-memory and SharedPreferences markers used to decide this are
        // NOT: `_task_alive` was never cleared and `active` survived a swipe
        // away, so relaunching after removing the app from recents looked like a
        // rebuild. The landing page then saw "restoring" and sent the user
        // straight to the app. A task id matches the platform's own lifecycle,
        // and a swipe away is recorded via markTaskEnded on destroy/trim.
        SharedPreferences prefs = getSharedPreferences("CapacitorStorage", MODE_PRIVATE);
        int taskId = getTaskId();
        boolean sameTask = String.valueOf(taskId).equals(prefs.getString(PREF_LAST_TASK, null));
        boolean alive = savedInstanceState != null || (active && sameTask) || (!taskFinishing && sameTask);
        lastLaunchWasCold = !alive;
        lastExitWasBackground = lastLaunchWasCold
                && "1".equals(prefs.getString(PREF_WAS_BACKGROUND, null));

        // The saved Bundle is only a marker written by onSaveInstanceState; it
        // never contains WebView URL state. It MUST be forwarded: Capacitor's
        // BridgeActivity relies on it to decide whether to reuse the retained
        // Bridge (WebView) or build a new one. Passing null made every restart
        // look like a brand-new launch and reloaded the app shell.
        //
        // installSplashScreen MUST run before super.onCreate: it is what hands
        // the postSplashScreenTheme over to the activity. Without it the launch
        // theme stayed applied, so the system splash, a black window and the web
        // landing page all painted one after another on every cold start.
        SplashScreen.installSplashScreen(this);

        super.onCreate(savedInstanceState);
        active = true;
        markTaskAlive();
        applySystemBars();
    }

    /**
     * Keeps the status bar and navigation bar black with light icons.
     *
     * Done natively rather than through a JS plugin so it is applied before the
     * first frame — a bar that turns dark a moment after launch is exactly the
     * "web page in a shell" impression we are avoiding. The activity theme
     * already sets these colours; this repeats the work for the cases where the
     * system re-applies its own contrast defaults (gesture nav, light mode,
     * theme reloads after a configuration change).
     */
    private void applySystemBars() {
        Window window = getWindow();
        // Draw the bars black. FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS is required
        // before the colour calls have any effect on older releases.
        window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
        window.setStatusBarColor(Color.BLACK);
        window.setNavigationBarColor(Color.BLACK);

        // androidx.core is already a dependency, so use the real compat helper
        // instead of hand-rolled flag values.
        WindowInsetsControllerCompat controller =
                WindowCompat.getInsetsController(window, window.getDecorView());
        if (controller != null) {
            controller.setAppearanceLightStatusBars(false);
            controller.setAppearanceLightNavigationBars(false);
        }
    }

    // BridgeActivity does not expose a weaker visibility for onPause/onResume.
    // Overriding them is intentionally public to match the parent signature.
    @Override
    public void onPause() {
        super.onPause();
        // Record "went to background" as soon as the Activity is no longer
        // visible. If Android then kills the process, the next launch knows the
        // user never dismissed the app and must return to the same screen.
        try {
            getSharedPreferences("CapacitorStorage", MODE_PRIVATE)
                    .edit()
                    .putString(PREF_WAS_BACKGROUND, "1")
                    .apply();
        } catch (Exception ignored) {}
    }

    @Override
    public void onResume() {
        super.onResume();
        // Back in the foreground: nothing is pending, so a later kill no longer
        // has a "leave point" to restore from.
        try {
            getSharedPreferences("CapacitorStorage", MODE_PRIVATE)
                    .edit()
                    .remove(PREF_WAS_BACKGROUND)
                    .apply();
        } catch (Exception ignored) {}
    }

    @Override
    public void onSaveInstanceState(Bundle outState) {
        // Save a minimal marker so Android knows this Activity had state.
        // We intentionally do NOT call super to avoid saving WebView URL state.
        outState.putBoolean("_activity_alive", true);
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        // destroy() lands as the task is torn down by the recents gesture. A
        // rotation or font change rebuild sends isChangingConfigurations, and a
        // Back that only finishes this Activity keeps the process (and its
        // flags) for the next launch in the same task.
        boolean taskEnding = isFinishing()
                && !isChangingConfigurations()
                && !isTaskRoot()
                && Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT_WATCH;
        if (taskEnding) markTaskEnded();
    }

    /**
     * Swiping the app away from recents does not destroy the process, so every
     * in-memory flag would survive and the next launch would look like a
     * rebuild (the landing page then skips ENTER). Clearing them here makes the
     * next launch a cold one: the landing page is shown again and the previous
     * screen counts as stale.
     */
    private void markTaskEnded() {
        taskFinishing = true;
        active = false;
        lastLaunchWasCold = true;
        lastExitWasBackground = false;
        try {
            getSharedPreferences("CapacitorStorage", MODE_PRIVATE)
                    .edit()
                    .remove(PREF_LAST_TASK)
                    .remove("_task_alive")
                    .remove(PREF_WAS_BACKGROUND)
                    .apply();
        } catch (Exception ignored) {}
    }

    @Override
    public void onTrimMemory(int level) {
        super.onTrimMemory(level);
        // A recents swipe destroys the Activity before the process is trimmed.
        // TRIM_MEMORY_UI_HIDDEN arrives while still alive and is not used, so a
        // post-swipe trim with no attached Activity means the task is gone.
        boolean noUi = Build.VERSION.SDK_INT < Build.VERSION_CODES.P
                || getApplication() == null
                || MainActivity.active == false;
        if (level == TRIM_MEMORY_COMPLETE && noUi && isTaskRoot() == false) {
            markTaskEnded();
        }
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        // Tapping the recents card of a live app can recreate this Activity
        // after the system already called onDestroy(isFinishing()). This is a
        // resume, not a relaunch, so the saved screen must survive it.
        boolean fromHistory = (intent.getFlags() & Intent.FLAG_ACTIVITY_LAUNCHED_FROM_HISTORY) != 0;
        if (fromHistory) {
            active = true;
            taskFinishing = false;
            lastLaunchWasCold = false;
            // The recents card is a resume, so a later kill must restore the
            // same screen rather than falling back to the landing page.
            lastExitWasBackground = true;
            markTaskAlive();
        }
    }

    private void markTaskAlive() {
        getSharedPreferences("CapacitorStorage", MODE_PRIVATE)
                .edit()
                .putString("_task_alive", "1")
                .putString(PREF_LAST_TASK, String.valueOf(getTaskId()))
                .apply();
    }
}
