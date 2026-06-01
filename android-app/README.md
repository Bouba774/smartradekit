# PipsKit - Application Android

Application Android native WebView pour PipsKit avec notifications push Firebase.

## Prérequis

- **Java JDK 17** ou supérieur
- **Android Studio** (optionnel, pour le développement)
- **Android SDK** avec API level 34
- **Compte Firebase** pour les notifications push

## Configuration initiale

### 1. Générer le Gradle Wrapper

Avant la première compilation, vous devez générer le fichier `gradle-wrapper.jar` :

```bash
cd android-app

# Option 1: Si Gradle est installé globalement
gradle wrapper

# Option 2: Télécharger manuellement
# Téléchargez gradle-wrapper.jar depuis:
# https://github.com/gradle/gradle/raw/v8.4.0/gradle/wrapper/gradle-wrapper.jar
# Et placez-le dans: gradle/wrapper/gradle-wrapper.jar
```

### 2. Configurer Firebase

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Créez un nouveau projet ou utilisez un existant
3. Ajoutez une application Android avec le package: `com.smartradekit.lovable.app`
4. Téléchargez le fichier `google-services.json`
5. Remplacez le fichier `app/google-services.json.template` par votre `google-services.json`

```bash
# Renommer le fichier
mv app/google-services.json.template app/google-services.json
# Puis remplacez les valeurs YOUR_* par vos vraies valeurs Firebase
```

## Compilation

### Debug APK

```bash
cd android-app
chmod +x gradlew
./gradlew assembleDebug
```

L'APK sera généré dans: `app/build/outputs/apk/debug/app-debug.apk`

### Release APK

```bash
./gradlew assembleRelease
```

L'APK sera généré dans: `app/build/outputs/apk/release/app-release-unsigned.apk`

## Structure du projet

```
android-app/
├── gradlew                 # Script Gradle pour Unix/macOS
├── gradlew.bat             # Script Gradle pour Windows
├── gradle/
│   └── wrapper/
│       └── gradle-wrapper.properties
├── settings.gradle         # Configuration du projet
├── build.gradle            # Build script racine
├── app/
│   ├── build.gradle        # Build script de l'application
│   ├── google-services.json # Configuration Firebase
│   ├── proguard-rules.pro  # Règles ProGuard
│   └── src/main/
│       ├── AndroidManifest.xml
│       ├── java/com/smarttradetracker/app/
│       │   ├── MainActivity.kt
│       │   ├── SplashActivity.kt
│       │   ├── SmartTradeTrackerApp.kt
│       │   └── services/
│       │       └── FCMService.kt
│       └── res/
│           ├── layout/
│           ├── values/
│           ├── drawable/
│           ├── xml/
│           └── mipmap-*/
└── README.md
```

## Fonctionnalités

### Notifications Push (FCM)

L'application supporte trois types de notifications :

1. **Alertes de Trade** - Notifications pour les signaux de trading
2. **Alertes de Prix** - Notifications lorsque les prix atteignent vos seuils
3. **Actualités** - News et analyses de marché

#### Format des messages FCM

```json
{
  "to": "FCM_TOKEN",
  "data": {
    "type": "trade_alert",
    "asset": "EUR/USD",
    "action": "BUY",
    "price": "1.0850"
  },
  "notification": {
    "title": "Alerte Trade",
    "body": "Signal d'achat sur EUR/USD"
  }
}
```

### Canaux de notification

- `smart_trade_tracker_notifications` - Canal principal
- `price_alerts` - Alertes de prix (haute priorité)
- `news_alerts` - Actualités (priorité normale)

## Personnalisation de l'icône

Les icônes sont générées pour toutes les densités :
- `mipmap-mdpi` (48x48)
- `mipmap-hdpi` (72x72)
- `mipmap-xhdpi` (96x96)
- `mipmap-xxhdpi` (144x144)
- `mipmap-xxxhdpi` (192x192)

Pour remplacer les icônes :
1. Utilisez [Android Asset Studio](https://romannurik.github.io/AndroidAssetStudio/icons-launcher.html)
2. Remplacez les fichiers dans les dossiers `mipmap-*`

## Sécurité

L'application inclut :
- ✅ HTTPS uniquement (pas de cleartext)
- ✅ Validation des certificats SSL
- ✅ Whitelist des domaines autorisés
- ✅ Protection contre les injections JavaScript
- ✅ Configuration réseau sécurisée
- ✅ Notifications chiffrées via FCM

## Envoi de notifications depuis le backend

Pour envoyer des notifications push depuis votre serveur :

```typescript
// Exemple avec Supabase Edge Function
const message = {
  to: userFcmToken,
  notification: {
    title: "🚨 Alerte Trade",
    body: "Signal d'achat détecté sur EUR/USD"
  },
  data: {
    type: "trade_alert",
    asset: "EUR/USD",
    action: "BUY"
  }
};

await fetch('https://fcm.googleapis.com/fcm/send', {
  method: 'POST',
  headers: {
    'Authorization': `key=${FIREBASE_SERVER_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(message)
});
```

## Support

URL de l'application: https://smarttradetracker.lovable.app
