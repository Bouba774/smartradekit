#!/usr/bin/env bash
set -euo pipefail

BRANCH="android/webview-app"
ROOT="$(pwd)"

echo "Vérification git et branche : $BRANCH"

# fetch remote
git fetch origin

# create or checkout branch
if git ls-remote --exit-code --heads origin "$BRANCH" >/dev/null 2>&1; then
  echo "Branch $BRANCH exists on remote. Checking out tracking branch."
  git checkout -B "$BRANCH" "origin/$BRANCH"
else
  echo "Remote branch $BRANCH does not exist. Creating local branch."
  git checkout -b "$BRANCH"
fi

# create directories
mkdir -p .github/workflows
mkdir -p android-app
mkdir -p android-app/app/src/main/{java/com/smarttradetracker/app/ui,res/layout,res/values,assets,res/drawable}
mkdir -p android-app/app/src/main/res/mipmap-anydpi-v26
mkdir -p android-app/app/src/main/res/mipmap-hdpi
mkdir -p android-app/app/src/main/res/mipmap-mdpi
mkdir -p android-app/app/src/main/res/mipmap-xhdpi
mkdir -p android-app/app/src/main/res/mipmap-xxhdpi
mkdir -p android-app/app/src/main/res/mipmap-xxxhdpi

echo "Création des fichiers..."

cat > .github/workflows/android-build.yml <<'EOF'
name: Android Release Build

on:
  workflow_dispatch:
  push:
    branches:
      - android/webview-app

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'

      - name: Decode keystore from secret
        if: ${{ secrets.KEYSTORE_BASE64 != '' }}
        run: |
          echo "$KEYSTORE_BASE64" | base64 --decode > keystore.jks
          echo "storeFile=keystore.jks" > keystore.properties
          echo "storePassword=${KEYSTORE_PASSWORD}" >> keystore.properties
          echo "keyAlias=${KEY_ALIAS}" >> keystore.properties
          echo "keyPassword=${KEY_PASSWORD}" >> keystore.properties
        env:
          KEYSTORE_BASE64: ${{ secrets.KEYSTORE_BASE64 }}
          KEYSTORE_PASSWORD: ${{ secrets.KEYSTORE_PASSWORD }}
          KEY_ALIAS: ${{ secrets.KEY_ALIAS }}
          KEY_PASSWORD: ${{ secrets.KEY_PASSWORD }}

      - name: Make gradlew executable
        run: chmod +x ./gradlew

      - name: Build release APK
        run: ./gradlew :app:assembleRelease --no-daemon --stacktrace

      - name: Upload APK
        uses: actions/upload-artifact@v4
        with:
          name: smarttradetracker-release-apk
          path: app/build/outputs/apk/release/*.apk
EOF

cat > android-app/build.gradle <<'EOF'
buildscript {
    repositories { google(); mavenCentral() }
    dependencies { classpath "com.android.tools.build:gradle:7.4.2" }
}

allprojects {
    repositories { google(); mavenCentral() }
}
EOF

cat > android-app/gradle.properties <<'EOF'
org.gradle.jvmargs=-Xmx1536m
android.useAndroidX=true
EOF

cat > android-app/settings.gradle <<'EOF'
rootProject.name = "smarttradetracker-android"
include ":app"
EOF

cat > android-app/app/build.gradle <<'EOF'
plugins {
    id 'com.android.application'
    id 'org.jetbrains.kotlin.android'
}

android {
    namespace 'com.smarttradetracker.app'
    compileSdk 33

    defaultConfig {
        applicationId "com.smarttradetracker.app"
        minSdk 24
        targetSdk 33
        versionCode 952
        versionName "9.5.2"
    }

    signingConfigs {
        release {
            def propsFile = rootProject.file("keystore.properties")
            if (propsFile.exists()) {
                def props = new Properties()
                props.load(new FileInputStream(propsFile))
                storeFile file(props['storeFile'])
                storePassword props['storePassword']
                keyAlias props['keyAlias']
                keyPassword props['keyPassword']
            }
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
    kotlinOptions { jvmTarget = "17" }
}

dependencies {
    implementation "androidx.core:core-ktx:1.10.1"
    implementation "androidx.appcompat:appcompat:1.6.1"
    implementation "com.google.android.material:material:1.9.0"
    implementation "androidx.webkit:webkit:1.9.0"
}
EOF

cat > android-app/app/metadata.json <<'EOF'
{
  "appName": "Smart Trade Tracker",
  "package": "com.smarttradetracker.app",
  "versionName": "9.5.2",
  "versionCode": 952,
  "minSdk": 24,
  "targetSdk": 33,
  "permissions": [
    "INTERNET",
    "ACCESS_NETWORK_STATE"
  ],
  "webEntry": "https://smarttradetracker.lovable.app",
  "whitelistHosts": [
    "smarttradetracker.app",
    "lovable.app",
    "*.supabase.co"
  ],
  "notes": "WebView app wrapping the existing Smart Trade Tracker web app. Cookies & DOM storage enabled."
}
EOF

cat > android-app/app/src/main/AndroidManifest.xml <<'EOF'
<?xml version="1.0" encoding="utf-8"?>
<manifest package="com.smarttradetracker.app"
    xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.INTERNET"/>
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>

    <application
        android:label="Smart Trade Tracker"
        android:icon="@mipmap/ic_launcher"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:allowBackup="false"
        android:theme="@style/Theme.SmartTradeTracker">
        <activity
            android:name="com.smarttradetracker.app.ui.SplashActivity"
            android:exported="true"
            android:theme="@style/Theme.Splash">
            <intent-filter>
                <action android:name="android.intent.action.MAIN"/>
                <category android:name="android.intent.category.LAUNCHER"/>
            </intent-filter>
        </activity>

        <activity
            android:name="com.smarttradetracker.app.ui.MainActivity"
            android:exported="false"
            android:configChanges="orientation|screenSize|smallestScreenSize|keyboardHidden"/>
    </application>
</manifest>
EOF

cat > android-app/app/src/main/assets/offline.html <<'EOF'
<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Offline - Smart Trade Tracker</title>
  <style>
    body{font-family:system-ui,Arial;background:#00121a;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0}
    .card{max-width:520px;padding:24px;text-align:center}
    .logo{width:96px;height:96px;margin:0 auto;background:#00f6ff;border-radius:12px}
    button{margin-top:18px;padding:10px 16px;background:#00f6ff;border:none;border-radius:8px;color:#00121a;font-weight:600}
  </style>
</head>
<body>
  <div class="card">
    <div class="logo"></div>
    <h1>Pas d'accès Internet</h1>
    <p>Vérifie ta connexion, puis appuie sur Réessayer.</p>
    <button onclick="window.location.reload()">Réessayer</button>
  </div>
</body>
</html>
EOF

cat > android-app/app/src/main/java/com/smarttradetracker/app/ui/MainActivity.kt <<'EOF'
package com.smarttradetracker.app.ui

import android.annotation.SuppressLint
import android.graphics.Bitmap
import android.net.Uri
import android.os.Bundle
import android.webkit.*
import androidx.activity.ComponentActivity
import androidx.webkit.WebViewCompat
import com.smarttradetracker.app.R

class MainActivity : ComponentActivity() {

    private lateinit var webView: WebView
    private val allowedHosts = listOf("smarttradetracker.app", "lovable.app", "supabase.co")

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.webview)

        val settings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.setSupportMultipleWindows(false)
        settings.allowFileAccess = false
        settings.allowContentAccess = false
        settings.useWideViewPort = true
        settings.loadWithOverviewMode = true
        settings.cacheMode = WebSettings.LOAD_DEFAULT
        settings.mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW

        val cookieManager = CookieManager.getInstance()
        cookieManager.setAcceptCookie(true)
        cookieManager.setAcceptThirdPartyCookies(webView, true)

        try {
            WebViewCompat.setSafeBrowsingEnabled(this, true)
        } catch (_: Exception) {}

        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest): Boolean {
                val uri: Uri? = request.url
                val host = uri?.host ?: return true
                if (allowedHosts.any { host.endsWith(it) }) return false
                return true
            }

            override fun onReceivedError(view: WebView, request: WebResourceRequest, error: WebResourceError) {
                view.loadUrl("file:///android_asset/offline.html")
            }

            override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                super.onPageStarted(view, url, favicon)
            }
        }

        webView.loadUrl("https://smarttradetracker.lovable.app")
    }

    override fun onBackPressed() {
        if (::webView.isInitialized && webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }
}
EOF

cat > android-app/app/src/main/java/com/smarttradetracker/app/ui/SplashActivity.kt <<'EOF'
package com.smarttradetracker.app.ui

import android.content.Intent
import android.os.Bundle
import android.os.Handler
import androidx.activity.ComponentActivity
import com.smarttradetracker.app.R

class SplashActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_splash)

        Handler(mainLooper).postDelayed({
            startActivity(Intent(this, MainActivity::class.java))
            finish()
        }, 900)
    }
}
EOF

cat > android-app/app/src/main/res/layout/activity_main.xml <<'EOF'
<?xml version="1.0" encoding="utf-8"?>
<FrameLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent">
    <WebView
        android:id="@+id/webview"
        android:layout_width="match_parent"
        android:layout_height="match_parent" />
</FrameLayout>
EOF

cat > android-app/app/src/main/res/layout/activity_splash.xml <<'EOF'
<?xml version="1.0" encoding="utf-8"?>
<FrameLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:background="#00F6FF"
    android:layout_width="match_parent"
    android:layout_height="match_parent">
    <ImageView
        android:layout_gravity="center"
        android:src="@drawable/app_logo"
        android:layout_width="160dp"
        android:layout_height="160dp"
        android:contentDescription="Logo" />
</FrameLayout>
EOF

cat > android-app/app/src/main/res/values/colors.xml <<'EOF'
<resources>
    <color name="neonBlue">#00F6FF</color>
    <color name="white">#FFFFFF</color>
</resources>
EOF

cat > android-app/app/src/main/res/values/styles.xml <<'EOF'
<resources>
    <style name="Theme.SmartTradeTracker" parent="Theme.MaterialComponents.DayNight.DarkActionBar">
        <item name="android:windowBackground">@color/white</item>
    </style>

    <style name="Theme.Splash" parent="Theme.SmartTradeTracker">
        <item name="android:windowBackground">@color/neonBlue</item>
    </style>
</resources>
EOF

cat > android-app/app/src/main/res/drawable/README_COPY_ICON.txt <<'EOF'
Copy the web app logo from the repository into this folder as app_logo.jpg or app_logo.png.
The original web asset is at /assets/app-logo.jpg in the repository (if present).
Do NOT commit large unoptimized images; use a 512x512 PNG for best results.
EOF

cat > android-app/README-ANDROID.md <<'EOF'
# Smart Trade Tracker — Android WebView wrapper

Branch: android/webview-app

Prerequis:
- Add these GitHub Actions secrets in the repository (Settings → Secrets → Actions):
  - KEYSTORE_BASE64 : base64 content of your keystore (.jks)
  - KEYSTORE_PASSWORD : keystore password
  - KEY_ALIAS : alias
  - KEY_PASSWORD : key password

How to build locally (optional):
- Decode your keystore base64 and create keystore.properties with storeFile path and passwords.
- Run ./gradlew :app:assembleRelease

Notes:
- The workflow decodes KEYSTORE_BASE64 on the runner and signs the APK. The keystore is never committed.
- Web entry: https://smarttradetracker.lovable.app
- Whitelist: smarttradetracker.app, lovable.app, *.supabase.co
EOF

echo "Si tu as un logo web (assets/app-logo.jpg), je vais le copier s'il existe..."
if [ -f assets/app-logo.jpg ]; then
  cp assets/app-logo.jpg android-app/app/src/main/res/drawable/app_logo.jpg
  echo "Copié assets/app-logo.jpg → android-app/app/src/main/res/drawable/app_logo.jpg"
else
  echo "Aucun assets/app-logo.jpg trouvé ; ajoute ton icône 512x512 en android-app/app/src/main/res/drawable/app_logo.png"
fi

echo "Ajout des fichiers au commit git..."
git add .github/workflows android-app

git commit -m "feat(android): add WebView Android wrapper (android/webview-app)" || echo "Rien à committer ou commit échoué."

echo "Pushing branch $BRANCH to origin..."
git push origin "$BRANCH"

echo "Push terminé. Si le workflow est correctement configuré avec les secrets, GitHub Actions doit démarrer et produire l'APK signé comme artifact 'smarttradetracker-release-apk'."
