package com.smarttradetracker.app

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build

class SmartTradeTrackerApp : Application() {

    companion object {
        const val NOTIFICATION_CHANNEL_ID = "smart_trade_tracker_notifications"
    }

    override fun onCreate() {
        super.onCreate()
        createNotificationChannels()
    }

    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val notificationManager = getSystemService(NotificationManager::class.java)

            val mainChannel = NotificationChannel(
                NOTIFICATION_CHANNEL_ID,
                "Notifications Trading",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Alertes et notifications de trading"
                enableVibration(true)
                vibrationPattern = longArrayOf(0, 250, 250, 250)
            }

            notificationManager.createNotificationChannel(mainChannel)
        }
    }
}
