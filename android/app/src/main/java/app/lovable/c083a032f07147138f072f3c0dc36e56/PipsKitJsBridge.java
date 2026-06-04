package app.lovable.c083a032f07147138f072f3c0dc36e56;

import android.app.Activity;
import android.content.Intent;
import android.util.Base64;
import android.util.Log;
import android.webkit.JavascriptInterface;
import androidx.core.content.FileProvider;
import java.io.File;
import java.io.FileOutputStream;

public class PipsKitJsBridge {
    public interface ModalStateListener { void setModalOpen(boolean open); }
    private final Activity activity;
    private final PermissionsManager permissions;
    private final ModalStateListener modalListener;

    public PipsKitJsBridge(Activity activity, PermissionsManager permissions, ModalStateListener modalListener) {
        this.activity = activity;
        this.permissions = permissions;
        this.modalListener = modalListener;
    }

    @JavascriptInterface public boolean isNativeAndroid() { return true; }
    @JavascriptInterface public boolean hasMediaPermissions() { return permissions.hasMediaPermissions(); }
    @JavascriptInterface public void requestMediaPermissions() { activity.runOnUiThread(permissions::requestMediaNow); }
    @JavascriptInterface public void setModalOpen(boolean open) { activity.runOnUiThread(() -> modalListener.setModalOpen(open)); }

    @JavascriptInterface
    public void sharePdfBase64(String base64, String filename) {
        activity.runOnUiThread(() -> {
            try {
                String cleanName = (filename == null || filename.trim().isEmpty() ? "pipskit-report.pdf" : filename).replaceAll("[^A-Za-z0-9._-]", "_");
                File sharedDir = new File(activity.getCacheDir(), "shared");
                if (!sharedDir.exists()) sharedDir.mkdirs();
                File file = new File(sharedDir, cleanName);
                byte[] data = Base64.decode(base64, Base64.DEFAULT);
                try (FileOutputStream out = new FileOutputStream(file)) { out.write(data); }
                android.net.Uri uri = FileProvider.getUriForFile(activity, activity.getPackageName() + ".fileprovider", file);
                Intent send = new Intent(Intent.ACTION_SEND);
                send.setType("application/pdf");
                send.putExtra(Intent.EXTRA_STREAM, uri);
                send.putExtra(Intent.EXTRA_SUBJECT, "PipsKit – Rapport de trading");
                send.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                activity.startActivity(Intent.createChooser(send, activity.getString(R.string.share_pdf_title)));
            } catch (Exception e) {
                Log.e("PipsKitJsBridge", "sharePdfBase64 failed", e);
            }
        });
    }
}
