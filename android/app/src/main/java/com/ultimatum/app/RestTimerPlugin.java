package com.ultimatum.app;

import android.content.Context;
import android.content.Intent;
import android.os.Build;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Capacitor plugin bridge that delegates all timer logic to RestTimerService
 * (a foreground service). This ensures the timer works even when the screen is
 * locked or the user has switched to another app.
 */
@CapacitorPlugin(name = "RestTimerNative")
public class RestTimerPlugin extends Plugin {

    @PluginMethod
    public void startTimer(PluginCall call) {
        int duration = call.getInt("duration", 90);
        boolean vibrate = Boolean.TRUE.equals(call.getBoolean("vibrate", true));

        Context context = getContext();
        Intent intent = new Intent(context, RestTimerService.class);
        intent.setAction(RestTimerService.ACTION_START);
        intent.putExtra(RestTimerService.EXTRA_DURATION, duration);
        intent.putExtra(RestTimerService.EXTRA_VIBRATE, vibrate);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            context.startForegroundService(intent);
        } else {
            context.startService(intent);
        }
        call.resolve();
    }

    @PluginMethod
    public void stopTimer(PluginCall call) {
        Context context = getContext();
        Intent intent = new Intent(context, RestTimerService.class);
        intent.setAction(RestTimerService.ACTION_CANCEL);
        context.startService(intent);
        call.resolve();
    }

    @PluginMethod
    public void startWorkoutSession(PluginCall call) {
        int duration = call.getInt("duration", 0);
        Context context = getContext();
        Intent serviceIntent = new Intent(context, WorkoutForegroundService.class);
        serviceIntent.putExtra("duration", duration);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            context.startForegroundService(serviceIntent);
        } else {
            context.startService(serviceIntent);
        }
        call.resolve();
    }

    @PluginMethod
    public void stopWorkoutSession(PluginCall call) {
        Context context = getContext();
        Intent serviceIntent = new Intent(context, WorkoutForegroundService.class);
        serviceIntent.setAction("STOP_SERVICE");
        context.startService(serviceIntent);
        call.resolve();
    }

    /**
     * True when this WebView load is an Activity rebuild (design mode toggles,
     * font scale, OS reclaim, recents tap) rather than a fresh launch, so the
     * user must stay on the screen they were reading.
     */
    @PluginMethod
    public void getLaunchState(PluginCall call) {
        JSObject result = new JSObject();
        result.put("restoring", !MainActivity.lastLaunchWasCold);
        call.resolve(result);
    }
}
