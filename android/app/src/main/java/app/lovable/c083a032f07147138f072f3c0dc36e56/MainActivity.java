package app.lovable.c083a032f07147138f072f3c0dc36e56;

import android.os.Bundle;
import android.view.View;
import android.view.inputmethod.InputMethodManager;
import android.content.Context;
import android.widget.Toast;
import androidx.activity.OnBackPressedCallback;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final long DOUBLE_BACK_INTERVAL_MS = 2000L;
    private PermissionsManager permissions;
    private boolean modalOpen = false;
    private long lastBackPressTime = 0L;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        permissions = new PermissionsManager(this);
        super.onCreate(savedInstanceState);
        if (getBridge() != null && getBridge().getWebView() != null) {
            getBridge().getWebView().addJavascriptInterface(new PipsKitJsBridge(this, permissions, open -> modalOpen = open), "AndroidBridge");
            getBridge().getWebView().postDelayed(() -> permissions.maybeRequestMediaOnFirstLaunch(), 1200);
        }
        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override public void handleOnBackPressed() { handleNativeBack(); }
        });
    }

    private void handleNativeBack() {
        if (hideKeyboardIfOpen()) return;
        if (getBridge() != null && getBridge().getWebView() != null) {
            if (modalOpen) {
                getBridge().getWebView().evaluateJavascript("window.dispatchEvent(new CustomEvent('android-back'));", null);
                return;
            }
            getBridge().getWebView().evaluateJavascript("Boolean(window.__pipskitCanGoBack && window.__pipskitCanGoBack())", value -> {
                if ("true".equals(value)) {
                    getBridge().getWebView().evaluateJavascript("window.__pipskitGoBack && window.__pipskitGoBack();", null);
                } else {
                    handleExitBack();
                }
            });
            return;
        }
        handleExitBack();
    }

    private void handleExitBack() {
        long now = System.currentTimeMillis();
        if (now - lastBackPressTime < DOUBLE_BACK_INTERVAL_MS) finish();
        else {
            lastBackPressTime = now;
            Toast.makeText(this, R.string.press_back_again, Toast.LENGTH_SHORT).show();
        }
    }

    private boolean hideKeyboardIfOpen() {
        try {
            InputMethodManager imm = (InputMethodManager) getSystemService(Context.INPUT_METHOD_SERVICE);
            View focus = getCurrentFocus();
            if (imm != null && focus != null && imm.isAcceptingText()) {
                imm.hideSoftInputFromWindow(focus.getWindowToken(), 0);
                focus.clearFocus();
                return true;
            }
        } catch (Exception ignored) {}
        return false;
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissionsArray, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissionsArray, grantResults);
        if (permissions != null) permissions.onRequestPermissionsResult(requestCode, permissionsArray, grantResults);
    }
}
