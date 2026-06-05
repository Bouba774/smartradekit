package app.lovable.c083a032f07147138f072f3c0dc36e56;

import android.Manifest;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import androidx.appcompat.app.AlertDialog;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

public class PermissionsManager {
    public static final int REQ_MEDIA = 1001;
    public static final int REQ_NOTIFICATIONS = 1002;
    private static final String PREFS = "pipskit_permissions";
    private static final String KEY_ASKED_MEDIA = "asked_media_v2";
    private static final String KEY_ASKED_NOTIFS = "asked_notifs_v1";
    private final Activity activity;
    private final SharedPreferences prefs;

    public PermissionsManager(Activity activity) {
        this.activity = activity;
        this.prefs = activity.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    }

    private String[] mediaPermissions() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            return new String[] {
                Manifest.permission.READ_MEDIA_IMAGES,
                Manifest.permission.READ_MEDIA_VIDEO
            };
        }
        return new String[] { Manifest.permission.READ_EXTERNAL_STORAGE };
    }

    public boolean hasNotificationPermission() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) return true;
        return ContextCompat.checkSelfPermission(activity, Manifest.permission.POST_NOTIFICATIONS)
            == PackageManager.PERMISSION_GRANTED;
    }

    public void maybeRequestNotificationsOnFirstLaunch() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) return;
        if (hasNotificationPermission() || prefs.getBoolean(KEY_ASKED_NOTIFS, false)) return;
        prefs.edit().putBoolean(KEY_ASKED_NOTIFS, true).apply();
        ActivityCompat.requestPermissions(activity,
            new String[] { Manifest.permission.POST_NOTIFICATIONS }, REQ_NOTIFICATIONS);
    }

    public boolean hasMediaPermissions() {
        for (String permission : mediaPermissions()) {
            if (ContextCompat.checkSelfPermission(activity, permission) != PackageManager.PERMISSION_GRANTED) return false;
        }
        return true;
    }

    public void maybeRequestMediaOnFirstLaunch() {
        if (hasMediaPermissions() || prefs.getBoolean(KEY_ASKED_MEDIA, false)) return;
        prefs.edit().putBoolean(KEY_ASKED_MEDIA, true).apply();
        ActivityCompat.requestPermissions(activity, mediaPermissions(), REQ_MEDIA);
    }

    public void requestMediaNow() {
        if (hasMediaPermissions()) return;
        String[] permissions = mediaPermissions();
        boolean canShowPrompt = !prefs.getBoolean(KEY_ASKED_MEDIA, false);
        for (String permission : permissions) {
            if (ActivityCompat.shouldShowRequestPermissionRationale(activity, permission)) canShowPrompt = true;
        }
        if (canShowPrompt) {
            prefs.edit().putBoolean(KEY_ASKED_MEDIA, true).apply();
            ActivityCompat.requestPermissions(activity, permissions, REQ_MEDIA);
        } else {
            showOpenSettingsDialog();
        }
    }

    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        if (requestCode != REQ_MEDIA) return;
        boolean allGranted = grantResults.length > 0;
        for (int result : grantResults) allGranted = allGranted && result == PackageManager.PERMISSION_GRANTED;
        if (!allGranted) showOpenSettingsDialog();
    }

    private void showOpenSettingsDialog() {
        new AlertDialog.Builder(activity)
            .setTitle(R.string.permission_storage_rationale_title)
            .setMessage(R.string.permission_denied_settings)
            .setPositiveButton(R.string.permission_open_settings, (dialog, which) -> {
                Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
                intent.setData(Uri.fromParts("package", activity.getPackageName(), null));
                activity.startActivity(intent);
            })
            .setNegativeButton(R.string.permission_cancel, null)
            .show();
    }
}
