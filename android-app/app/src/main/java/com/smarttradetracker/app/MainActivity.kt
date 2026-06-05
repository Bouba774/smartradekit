package com.smarttradetracker.app

import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.net.Uri
import android.os.Bundle
import android.util.Log
import android.view.KeyEvent
import android.view.View
import android.view.inputmethod.InputMethodManager
import android.webkit.*
import android.widget.ProgressBar
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout

class MainActivity : AppCompatActivity() {

    private val tag = "PipsKitAndroid"

    companion object {
        private const val WEB_URL = "https://smartradekit.lovable.app"
        private val ALLOWED_HOSTS = listOf(
            "smartradekit.lovable.app",
            "pipskit.lovable.app",
            "lovable.app",
            "supabase.co",
            "supabase.com"
        )
        private const val DOUBLE_BACK_INTERVAL_MS = 2000L
    }

    private lateinit var webView: WebView
    private lateinit var progressBar: ProgressBar
    private lateinit var swipeRefresh: SwipeRefreshLayout
    private lateinit var errorView: View
    private lateinit var permissions: PermissionsManager

    private var lastBackPressTime = 0L
    private var modalOpen = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        Log.d(tag, "App Start")
        setContentView(R.layout.activity_main)

        permissions = PermissionsManager(this)

        initViews()
        setupWebView()
        setupSwipeRefresh()
        setupBackPressed()

        if (isNetworkAvailable()) {
            loadWebApp()
        } else {
            Log.w(tag, "Network unavailable at startup")
            showOfflineError()
        }

        // Ask for media permissions natively once, after splash dismiss.
        webView.postDelayed({ permissions.maybeRequestMediaOnFirstLaunch() }, 1500)
    }

    private fun initViews() {
        webView = findViewById(R.id.webView)
        progressBar = findViewById(R.id.progressBar)
        swipeRefresh = findViewById(R.id.swipeRefresh)
        errorView = findViewById(R.id.errorView)

        findViewById<View>(R.id.btnRetry).setOnClickListener {
            if (isNetworkAvailable()) {
                hideOfflineError()
                loadWebApp()
            } else {
                Toast.makeText(this, R.string.no_internet, Toast.LENGTH_SHORT).show()
            }
        }
    }

    @SuppressLint("SetJavaScriptEnabled", "AddJavascriptInterface")
    private fun setupWebView() {
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            cacheMode = WebSettings.LOAD_DEFAULT
            setSupportZoom(true)
            builtInZoomControls = true
            displayZoomControls = false
            loadWithOverviewMode = true
            useWideViewPort = true
            allowFileAccess = false
            allowContentAccess = false
            mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
            mediaPlaybackRequiresUserGesture = false
        }

        webView.webViewClient = SecureWebViewClient()
        webView.webChromeClient = AppWebChromeClient()
        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null)

        // Expose native bridge as window.AndroidBridge
        val bridge = PipsKitJsBridge(this, permissions) { open -> modalOpen = open }
        webView.addJavascriptInterface(bridge, "AndroidBridge")
    }

    private fun setupSwipeRefresh() {
        swipeRefresh.setColorSchemeResources(R.color.primary, R.color.primary_dark)
        swipeRefresh.setOnRefreshListener { webView.reload() }
    }

    /**
     * Native back-button behaviour (Play Store style):
     *  1. If keyboard is open  -> hide it
     *  2. If a web modal/sheet -> close it via JS event
     *  3. If WebView can goBack -> navigate back
     *  4. On root page -> "press again to exit" within 2s
     */
    private fun setupBackPressed() {
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (hideKeyboardIfOpen()) return
                if (modalOpen) {
                    webView.evaluateJavascript(
                        "window.dispatchEvent(new CustomEvent('android-back'));", null
                    )
                    return
                }
                if (webView.canGoBack()) {
                    webView.goBack()
                    return
                }
                val now = System.currentTimeMillis()
                if (now - lastBackPressTime < DOUBLE_BACK_INTERVAL_MS) {
                    finish()
                } else {
                    lastBackPressTime = now
                    Toast.makeText(
                        this@MainActivity,
                        R.string.press_back_again,
                        Toast.LENGTH_SHORT
                    ).show()
                }
            }
        })
    }

    private fun hideKeyboardIfOpen(): Boolean {
        val imm = getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager
        val focus = currentFocus ?: webView
        return if (imm.isAcceptingText) {
            imm.hideSoftInputFromWindow(focus.windowToken, 0)
            true
        } else false
    }

    private fun loadWebApp() {
        Log.d(tag, "Loading web app: $WEB_URL")
        webView.loadUrl(WEB_URL)
    }

    private fun isNetworkAvailable(): Boolean {
        val cm = getSystemService(CONNECTIVITY_SERVICE) as ConnectivityManager
        val network = cm.activeNetwork ?: return false
        val caps = cm.getNetworkCapabilities(network) ?: return false
        return caps.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
    }

    private fun showOfflineError() {
        webView.visibility = View.GONE
        errorView.visibility = View.VISIBLE
        progressBar.visibility = View.GONE
    }

    private fun hideOfflineError() {
        webView.visibility = View.VISIBLE
        errorView.visibility = View.GONE
    }

    private fun isAllowedHost(url: String): Boolean = try {
        val host = Uri.parse(url).host ?: return false
        ALLOWED_HOSTS.any { host == it || host.endsWith(".$it") }
    } catch (_: Exception) { false }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        this.permissions.onRequestPermissionsResult(requestCode, permissions, grantResults)
    }

    inner class SecureWebViewClient : WebViewClient() {
        override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
            val url = request?.url?.toString() ?: return false
            return if (isAllowedHost(url)) false else {
                try {
                    startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
                } catch (_: Exception) {
                    Toast.makeText(this@MainActivity, R.string.cannot_open_link, Toast.LENGTH_SHORT).show()
                }
                true
            }
        }

        override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
            super.onPageStarted(view, url, favicon)
            progressBar.visibility = View.VISIBLE
        }

        override fun onPageFinished(view: WebView?, url: String?) {
            super.onPageFinished(view, url)
            progressBar.visibility = View.GONE
            swipeRefresh.isRefreshing = false
        }

        override fun onReceivedError(view: WebView?, request: WebResourceRequest?, error: WebResourceError?) {
            super.onReceivedError(view, request, error)
            if (request?.isForMainFrame == true) {
                Log.e(tag, "Main frame error: ${error?.description}")
                showOfflineError()
            }
        }

        override fun onReceivedSslError(view: WebView?, handler: SslErrorHandler?, error: android.net.http.SslError?) {
            Log.e(tag, "SSL error: $error")
            handler?.cancel()
            Toast.makeText(this@MainActivity, R.string.ssl_error, Toast.LENGTH_LONG).show()
        }
    }

    inner class AppWebChromeClient : WebChromeClient() {
        override fun onProgressChanged(view: WebView?, newProgress: Int) {
            super.onProgressChanged(view, newProgress)
            progressBar.progress = newProgress
        }
        override fun onConsoleMessage(consoleMessage: ConsoleMessage?): Boolean {
            Log.d(tag, "WebView: ${consoleMessage?.message()} @ ${consoleMessage?.sourceId()}:${consoleMessage?.lineNumber()}")
            return super.onConsoleMessage(consoleMessage)
        }
    }

    @Deprecated("Handled by OnBackPressedDispatcher", ReplaceWith(""))
    override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
        if (keyCode == KeyEvent.KEYCODE_BACK) {
            onBackPressedDispatcher.onBackPressed()
            return true
        }
        return super.onKeyDown(keyCode, event)
    }

    override fun onResume() { super.onResume(); webView.onResume() }
    override fun onPause() { webView.onPause(); super.onPause() }
    override fun onDestroy() { webView.destroy(); super.onDestroy() }
}
