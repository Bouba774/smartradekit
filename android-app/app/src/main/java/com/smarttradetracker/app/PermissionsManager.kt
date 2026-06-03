package com.smarttradetracker.app

import android.Manifest
import android.app.Activity
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.provider.Settings
import androidx.appcompat.app.AlertDialog
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat

/**
 * Native Android permissions manager.
 * - Requests modern granular media permissions (Android 13+)
 * - Falls back to READ_EXTERNAL_STORAGE for older devices
 * - Requests only once on first launch
 * - Shows rationale + open-settings dialog on denial
 */
class PermissionsManager(private val activity: Activity) {

    companion object {
        const val REQ_MEDIA = 1001
        private const val PREFS = "pipskit_permissions"
        private const val KEY_ASKED_MEDIA = "asked_media_v1"
    }

    private val prefs: SharedPreferences =
        activity.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

    private fun mediaPermissions(): Array<String> =
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            arrayOf(
                Manifest.permission.READ_MEDIA_IMAGES,
                Manifest.permission.READ_MEDIA_VIDEO,
                Manifest.permission.READ_MEDIA_AUDIO
            )
        } else {
            arrayOf(Manifest.permission.READ_EXTERNAL_STORAGE)
        }

    fun hasMediaPermissions(): Boolean = mediaPermissions().all {
        ContextCompat.checkSelfPermission(activity, it) == PackageManager.PERMISSION_GRANTED
    }

    /** Request once on first launch. No-op if already granted or already asked. */
    fun maybeRequestMediaOnFirstLaunch() {
        if (hasMediaPermissions()) return
        if (prefs.getBoolean(KEY_ASKED_MEDIA, false)) return
        prefs.edit().putBoolean(KEY_ASKED_MEDIA, true).apply()
        ActivityCompat.requestPermissions(activity, mediaPermissions(), REQ_MEDIA)
    }

    /** Force a request (called from JS bridge when user retries from web UI). */
    fun requestMediaNow() {
        if (hasMediaPermissions()) return
        val perms = mediaPermissions()
        val canShowSystemPrompt = perms.any {
            ActivityCompat.shouldShowRequestPermissionRationale(activity, it)
        } || !prefs.getBoolean(KEY_ASKED_MEDIA, false)

        if (canShowSystemPrompt) {
            prefs.edit().putBoolean(KEY_ASKED_MEDIA, true).apply()
            ActivityCompat.requestPermissions(activity, perms, REQ_MEDIA)
        } else {
            showOpenSettingsDialog()
        }
    }

    fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        if (requestCode != REQ_MEDIA) return
        val allGranted = grantResults.isNotEmpty() &&
            grantResults.all { it == PackageManager.PERMISSION_GRANTED }
        if (!allGranted) {
            val permanentlyDenied = permissions.any {
                !ActivityCompat.shouldShowRequestPermissionRationale(activity, it)
            }
            if (permanentlyDenied) showOpenSettingsDialog() else showRationaleDialog()
        }
    }

    private fun showRationaleDialog() {
        AlertDialog.Builder(activity)
            .setTitle(R.string.permission_storage_rationale_title)
            .setMessage(R.string.permission_storage_rationale_message)
            .setPositiveButton(R.string.retry) { _, _ -> requestMediaNow() }
            .setNegativeButton(R.string.permission_cancel, null)
            .setCancelable(true)
            .show()
    }

    private fun showOpenSettingsDialog() {
        AlertDialog.Builder(activity)
            .setTitle(R.string.permission_storage_rationale_title)
            .setMessage(R.string.permission_denied_settings)
            .setPositiveButton(R.string.permission_open_settings) { _, _ ->
                val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                    data = Uri.fromParts("package", activity.packageName, null)
                }
                activity.startActivity(intent)
            }
            .setNegativeButton(R.string.permission_cancel, null)
            .show()
    }
}
