package com.ultimatum.app;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.PowerManager;
import android.os.VibrationEffect;
import android.os.Vibrator;
import androidx.core.app.NotificationCompat;

/**
 * Legacy alarm-based entry point for the rest timer. The live timer now runs in
 * {@link RestTimerService}, but this receiver stays registered as a fallback:
 * when it fires it must behave identically, i.e. alert once and then clear the
 * completion notification by itself.
 */
public class RestTimerReceiver extends BroadcastReceiver {
    public static final String COMPLETED_CHANNEL_ID = "ultimatum_rest_timer_completed";

    @Override
    public void onReceive(Context context, Intent intent) {
        boolean vibrate = intent.getBooleanExtra("vibrate", true);

        PowerManager pm = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
        PowerManager.WakeLock wakeLock = pm.newWakeLock(
            PowerManager.PARTIAL_WAKE_LOCK | PowerManager.ACQUIRE_CAUSES_WAKEUP,
            "Ultimatum::RestTimerWakeLock"
        );
        wakeLock.acquire(10000); // 10 seconds

        if (vibrate) {
            Vibrator vibrator = (Vibrator) context.getSystemService(Context.VIBRATOR_SERVICE);
            if (vibrator != null && vibrator.hasVibrator()) {
                // The same pattern the foreground service plays; the wake lock
                // above keeps the receiver alive until it finishes.
                try {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        vibrator.vibrate(VibrationEffect.createWaveform(
                            RestTimerService.DONE_VIBRATION_PATTERN,
                            VibrationEffect.DEFAULT_AMPLITUDE
                        ));
                    } else {
                        //noinspection deprecation
                        vibrator.vibrate(RestTimerService.DONE_VIBRATION_PATTERN, -1);
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

        // Create a high priority completion notification
        NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm != null) {
            // Cancel the live timer notification
            nm.cancel(RestTimerService.NOTIFICATION_ID);

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                NotificationChannel channel = new NotificationChannel(
                    COMPLETED_CHANNEL_ID,
                    "Rest Timer Completed",
                    NotificationManager.IMPORTANCE_HIGH
                );
                channel.setDescription("Alerts you when your rest period is over, then clears itself.");
                // Ensure the channel itself can vibrate
                channel.enableVibration(true);
                nm.createNotificationChannel(channel);
            }

            NotificationCompat.Builder builder = new NotificationCompat.Builder(context, COMPLETED_CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_notification)
                .setContentTitle("Rest Complete")
                .setContentText("Time to hit the next set.")
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setOnlyAlertOnce(true)
                .setAutoCancel(true)
                // Retracts itself once the user has seen and heard it.
                .setTimeoutAfter(RestTimerService.DONE_NOTIFICATION_TIMEOUT_MS);

            // Notify with a different ID
            nm.notify(RestTimerService.NOTIFICATION_DONE_ID, builder.build());
        }

        try {
            wakeLock.release();
        } catch (Exception ignored) {}
    }
}
