package com.smarttradetracker.app

import android.app.Activity
import android.content.Intent
import android.util.Base64
import android.util.Log
import android.webkit.JavascriptInterface
import androidx.core.content.FileProvider
import java.io.File
import java.io.FileOutputStream

/**
 * JS bridge exposed to the web layer as `AndroidBridge`.
 * Web code can prefer this when running inside the native app:
 *
 *   if (window.AndroidBridge) {
 *     window.AndroidBridge.sharePdfBase64(base64, "report.pdf");
 *   }
 */
class PipsKitJsBridge(
    private val activity: Activity,
    private val permissions: PermissionsManager,
    private val onModalState: (Boolean) -> Unit,
) {
    private val tag = "PipsKitJsBridge"

    @JavascriptInterface
    fun isNativeAndroid(): Boolean = true

    @JavascriptInterface
    fun hasMediaPermissions(): Boolean = permissions.hasMediaPermissions()

    @JavascriptInterface
    fun requestMediaPermissions() {
        activity.runOnUiThread { permissions.requestMediaNow() }
    }

    /** Tell native layer that a modal/sheet is open so the back button can close it via JS. */
    @JavascriptInterface
    fun setModalOpen(open: Boolean) {
        activity.runOnUiThread { onModalState(open) }
    }

    /**
     * Share a PDF generated in the web layer via the native Android Share Sheet.
     * @param base64 raw base64 (no data: prefix)
     * @param filename suggested filename, e.g. "pipskit-report.pdf"
     */
    @JavascriptInterface
    fun sharePdfBase64(base64: String, filename: String) {
        activity.runOnUiThread {
            try {
                val cleanName = filename
                    .ifBlank { "pipskit-report.pdf" }
                    .replace(Regex("[^A-Za-z0-9._-]"), "_")
                val sharedDir = File(activity.cacheDir, "shared").apply { mkdirs() }
                val file = File(sharedDir, cleanName)
                val data = Base64.decode(base64, Base64.DEFAULT)
                FileOutputStream(file).use { it.write(data) }

                val uri = FileProvider.getUriForFile(
                    activity,
                    "${activity.packageName}.fileprovider",
                    file
                )

                val send = Intent(Intent.ACTION_SEND).apply {
                    type = "application/pdf"
                    putExtra(Intent.EXTRA_STREAM, uri)
                    putExtra(Intent.EXTRA_SUBJECT, "PipsKit – Rapport de trading")
                    addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                val chooser = Intent.createChooser(
                    send,
                    activity.getString(R.string.share_pdf_title)
                ).apply { addFlags(Intent.FLAG_ACTIVITY_NEW_TASK) }
                activity.startActivity(chooser)
            } catch (e: Exception) {
                Log.e(tag, "sharePdfBase64 failed", e)
            }
        }
    }
}
