package com.ultimatum.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.CountDownTimer;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.VibrationEffect;
import android.os.Vibrator;
import androidx.core.app.NotificationCompat;

/**
 * A foreground service that runs the rest timer natively in Java.
 * This guarantees the timer works even when the screen is locked or the user
 * has switched to another app. It updates the notification every second with
 * the remaining time (just like FitNotes).
 */
public class RestTimerService extends Service {

    public static final String CHANNEL_ID = "ultimatum_rest_timer_live";
    public static final String CHANNEL_DONE_ID = "ultimatum_rest_timer_done";
    public static final int NOTIFICATION_ID = 999;
    public static final int NOTIFICATION_DONE_ID = 1000;

    /**
     * How long the "Rest Complete" alert stays on screen. It is posted only
     * after the vibration pattern below has played out, then it retracts on its
     * own, so the user is alerted once and is never left with a stale
     * notification to dismiss between sets.
     */
    public static final long DONE_NOTIFICATION_TIMEOUT_MS = 6000L;
    /** Must outlast {@link #DONE_VIBRATION_PATTERN_MS} so it never cuts the buzz short. */
    public static final long DONE_VIBRATION_PATTERN_MS = 2000L;
    static final long[] DONE_VIBRATION_PATTERN = {0, 500, 250, 500, 250, 500};

    public static final String ACTION_START  = "START_TIMER";
    public static final String ACTION_CANCEL = "CANCEL_TIMER";

    public static final String EXTRA_DURATION = "duration";
    public static final String EXTRA_VIBRATE  = "vibrate";

    private CountDownTimer countDownTimer;
    /** Runs the post-alert teardown; cancelled if a new rest period starts first. */
    private final Handler teardownHandler = new Handler(Looper.getMainLooper());
    private Runnable teardownRunnable;
    private boolean vibrate = true;

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent == null) return START_NOT_STICKY;

        String action = intent.getAction();
        if (ACTION_CANCEL.equals(action)) {
            cancelTimer();
            return START_NOT_STICKY;
        }

        if (ACTION_START.equals(action)) {
            int durationSecs = intent.getIntExtra(EXTRA_DURATION, 90);
            vibrate = intent.getBooleanExtra(EXTRA_VIBRATE, true);

            // Cancel any existing countdown
            if (countDownTimer != null) {
                countDownTimer.cancel();
                countDownTimer = null;
            }

            // Drop a pending teardown from the previous set, and any completion
            // alert it left on screen, so a new rest period starts clean.
            cancelPendingTeardown();
            NotificationManager nm = getNotificationManager();
            if (nm != null) {
                nm.cancel(NOTIFICATION_DONE_ID);
            }

            ensureChannels();
            startForeground(NOTIFICATION_ID, buildTimerNotification(durationSecs));
            startCountdown(durationSecs);
        }

        return START_NOT_STICKY;
    }

    private void startCountdown(final int totalSeconds) {
        countDownTimer = new CountDownTimer((long) totalSeconds * 1000, 1000) {
            @Override
            public void onTick(long millisUntilFinished) {
                int secondsLeft = (int) Math.ceil(millisUntilFinished / 1000.0);
                NotificationManager nm = getNotificationManager();
                if (nm != null) {
                    nm.notify(NOTIFICATION_ID, buildTimerNotification(secondsLeft));
                }
            }

            @Override
            public void onFinish() {
                onTimerFinished();
            }
        }.start();
    }

    private void onTimerFinished() {
        // 1. Remove the live timer notification
        NotificationManager nm = getNotificationManager();
        if (nm != null) {
            nm.cancel(NOTIFICATION_ID);
        }

        // 2. Vibrate — this works from a foreground service even on locked screen.
        //    The foreground service keeps running while the pattern plays, so the
        //    process is never trimmed before the alert has been delivered.
        if (vibrate) {
            Vibrator vibrator = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
            if (vibrator != null && vibrator.hasVibrator()) {
                try {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        vibrator.vibrate(
                            VibrationEffect.createWaveform(DONE_VIBRATION_PATTERN, VibrationEffect.DEFAULT_AMPLITUDE)
                        );
                    } else {
                        //noinspection deprecation
                        vibrator.vibrate(DONE_VIBRATION_PATTERN, -1);
                    }
                } catch (Exception e) {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        vibrator.vibrate(VibrationEffect.createOneShot(2000, VibrationEffect.DEFAULT_AMPLITUDE));
                    } else {
                        //noinspection deprecation
                        vibrator.vibrate(2000);
                    }
                }
            }
        }

        // 3. Show a "Rest Complete!" notification (high priority to wake screen).
        //    It is posted once the buzz is over and retracts itself after
        //    DONE_NOTIFICATION_TIMEOUT_MS, so the user only taps it if they want
        //    to jump back in — never to clear it.
        if (nm != null) {
            NotificationCompat.Builder done = new NotificationCompat.Builder(this, CHANNEL_DONE_ID)
                    .setSmallIcon(R.drawable.ic_notification)
                    .setContentTitle("Rest Complete")
                    .setContentText("Time to hit the next set.")
                    .setPriority(NotificationCompat.PRIORITY_HIGH)
                    .setAutoCancel(true)
                    .setOnlyAlertOnce(true)
                    .setTimeoutAfter(DONE_NOTIFICATION_TIMEOUT_MS)
                    .setDefaults(NotificationCompat.DEFAULT_LIGHTS);
            nm.notify(NOTIFICATION_DONE_ID, done.build());
        }

        // 4. Stay alive until both the vibration and the alert have run their
        //    course. Stopping the service immediately used to let Android tear
        //    the process down mid-alert and leave the notification stuck.
        cancelPendingTeardown();
        teardownRunnable = new Runnable() {
            @Override
            public void run() {
                teardownRunnable = null;
                stopForeground(true);
                stopSelf();
            }
        };
        teardownHandler.postDelayed(teardownRunnable, DONE_NOTIFICATION_TIMEOUT_MS + 500L);
    }

    private void cancelPendingTeardown() {
        if (teardownRunnable != null) {
            teardownHandler.removeCallbacks(teardownRunnable);
            teardownRunnable = null;
        }
    }

    private void cancelTimer() {
        if (countDownTimer != null) {
            countDownTimer.cancel();
            countDownTimer = null;
        }
        // A rest period stopped by the user is a cancellation, not a completion:
        // no alert should follow.
        cancelPendingTeardown();
        NotificationManager nm = getNotificationManager();
        if (nm != null) {
            nm.cancel(NOTIFICATION_ID);
        }
        stopForeground(true);
        stopSelf();
    }

    private Notification buildTimerNotification(int secondsLeft) {
        int mins = secondsLeft / 60;
        int secs = secondsLeft % 60;
        String timeStr = String.format("%d:%02d", mins, secs);

        // Cancel action so user can stop from notification shade
        Intent cancelIntent = new Intent(this, RestTimerService.class);
        cancelIntent.setAction(ACTION_CANCEL);
        PendingIntent cancelPi = PendingIntent.getService(
                this, 0, cancelIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        // Tap notification to open app
        Intent openIntent = new Intent(this, MainActivity.class);
        openIntent.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP);
        PendingIntent openPi = PendingIntent.getActivity(
                this, 0, openIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        return new NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_notification)
                .setContentTitle("Ultimatum Rest Timer")
                .setContentText(timeStr + " remaining")
                .setOngoing(true)
                .setSilent(true)
                .setOnlyAlertOnce(true)
                .setContentIntent(openPi)
                .addAction(android.R.drawable.ic_delete, "Cancel", cancelPi)
                .build();
    }

    private void ensureChannels() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        NotificationManager nm = getNotificationManager();
        if (nm == null) return;

        // Live timer channel — silent, ongoing
        NotificationChannel live = new NotificationChannel(
                CHANNEL_ID,
                "Rest Timer",
                NotificationManager.IMPORTANCE_LOW
        );
        live.setDescription("Shows remaining rest time while the timer is running.");
        live.setSound(null, null);
        live.enableVibration(false);
        nm.createNotificationChannel(live);

        // Done channel — high priority to wake screen
        NotificationChannel done = new NotificationChannel(
                CHANNEL_DONE_ID,
                "Rest Timer Complete",
                NotificationManager.IMPORTANCE_HIGH
        );
        done.setDescription("Alerts you when your rest period is over, then clears itself.");
        done.enableVibration(true);
        nm.createNotificationChannel(done);
    }

    private NotificationManager getNotificationManager() {
        return (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
    }

    @Override
    public void onDestroy() {
        if (countDownTimer != null) {
            countDownTimer.cancel();
        }
        cancelPendingTeardown();
        super.onDestroy();
    }
}
