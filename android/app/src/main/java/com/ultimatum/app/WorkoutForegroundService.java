package com.ultimatum.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Intent;
import android.os.Build;
import android.os.CountDownTimer;
import android.os.IBinder;
import android.os.VibrationEffect;
import android.os.Vibrator;
import androidx.core.app.NotificationCompat;
import android.content.pm.ServiceInfo;

public class WorkoutForegroundService extends Service {
    public static final String CHANNEL_ID = "ultimatum_workout_service";
    public static final int NOTIFICATION_ID = 888;
    
    private CountDownTimer countDownTimer;
    private NotificationManager nm;

    @Override
    public void onCreate() {
        super.onCreate();
        nm = getSystemService(NotificationManager.class);
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && "STOP_SERVICE".equals(intent.getAction())) {
            stopTimer();
            stopForeground(true);
            stopSelf();
            return START_NOT_STICKY;
        }

        int durationSeconds = 0;
        if (intent != null) {
            durationSeconds = intent.getIntExtra("duration", 0);
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "Disciplined Tracker",
                NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Keeps your session tracker alive.");
            if (nm != null) nm.createNotificationChannel(channel);
        }

        long finishTimeMillis = 0;
        if (durationSeconds > 0) {
            finishTimeMillis = System.currentTimeMillis() + (durationSeconds * 1000L);
        }
        
        startForegroundServiceWithNotification(formatTime(durationSeconds), finishTimeMillis);
        
        if (durationSeconds > 0) {
            startTimer(durationSeconds);
        }

        // NOT sticky on purpose. When Android reclaims memory it kills the whole
        // process; a sticky service tells the system to restart that process
        // afterwards with no task attached, which left a restored-but-invisible
        // app and dropped the user to the home screen instead of back into the
        // session. The web layer re-arms the timer on resume, so nothing is
        // lost by letting the process die cleanly.
        return START_NOT_STICKY;
    }

    private void startForegroundServiceWithNotification(String text, long finishTimeMillis) {
        Notification notification = buildNotification(text, finishTimeMillis);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            try {
                startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC);
            } catch (Exception e) {
                startForeground(NOTIFICATION_ID, notification);
            }
        } else {
            startForeground(NOTIFICATION_ID, notification);
        }
    }

    private Notification buildNotification(String text, long finishTimeMillis) {
        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Disciplined Tracker")
            .setSmallIcon(R.drawable.ic_notification)
            .setOngoing(true);
            
        if (finishTimeMillis > 0 && Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            builder.setUsesChronometer(true)
                   .setChronometerCountDown(true)
                   .setWhen(finishTimeMillis);
        } else {
            builder.setContentText(text);
        }
        
        return builder.build();
    }

    private void startTimer(int durationSeconds) {
        stopTimer();
        long durationMillis = durationSeconds * 1000L;
        long finishTimeMillis = System.currentTimeMillis() + durationMillis;
        
        // Update notification immediately with Chronometer
        if (nm != null) {
            nm.notify(NOTIFICATION_ID, buildNotification("", finishTimeMillis));
        }

        countDownTimer = new CountDownTimer(durationMillis, 1000) {
            @Override
            public void onTick(long millisUntilFinished) {
                // OS chronometer handles the visual countdown now
            }

            @Override
            public void onFinish() {
                if (nm != null) {
                    Notification notification = buildNotification("Session Complete!", 0);
                    nm.notify(NOTIFICATION_ID, notification);
                }
                triggerAlarm();
                stopForeground(false);
            }
        }.start();
    }

    private void stopTimer() {
        if (countDownTimer != null) {
            countDownTimer.cancel();
            countDownTimer = null;
        }
    }

    private String formatTime(int totalSeconds) {
        if (totalSeconds <= 0) return "Ultimatum is tracking your workout.";
        
        int hours = totalSeconds / 3600;
        int minutes = (totalSeconds % 3600) / 60;
        int seconds = totalSeconds % 60;

        if (hours > 0) {
            return hours + " hr " + minutes + " min remaining";
        } else {
            return String.format("%d:%02d remaining", minutes, seconds);
        }
    }

    private void triggerAlarm() {
        Vibrator vibrator = (Vibrator) getSystemService(VIBRATOR_SERVICE);
        if (vibrator != null && vibrator.hasVibrator()) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vibrator.vibrate(VibrationEffect.createWaveform(new long[]{0, 1000, 500, 1000, 500, 1000}, -1));
            } else {
                vibrator.vibrate(new long[]{0, 1000, 500, 1000, 500, 1000}, -1);
            }
        }
    }

    @Override
    public void onDestroy() {
        stopTimer();
        super.onDestroy();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
