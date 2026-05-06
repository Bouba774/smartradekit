# Capacitor Assets — Source

Ce dossier contient **la source unique** des icônes et splash screens de Smart Trade Kit.

## Fichiers

- `icon.png` — 1024×1024, fond `#0a1929` (icône d'application)
- `icon-foreground.png` — 1024×1024 transparent (foreground icône adaptative Android)
- `splash.png` — 2732×2732 (splash plein écran)
- `splash-dark.png` — 2732×2732 (splash mode sombre)

## Génération

Exécuter localement ou via GitHub Actions :

```bash
npm install --save-dev @capacitor/assets
npx @capacitor/assets generate --android \
  --iconBackgroundColor "#0a1929" \
  --iconBackgroundColorDark "#0a1929" \
  --splashBackgroundColor "#0a1929" \
  --splashBackgroundColorDark "#0a1929"
npx cap sync android
```

Cela régénère automatiquement :
- `android/app/src/main/res/mipmap-*` (toutes densités)
- `android/app/src/main/res/mipmap-anydpi-v26/ic_launcher*.xml` (icône adaptative)
- splash screens dans `android/app/src/main/res/drawable-*`

⚠️ Ne jamais éditer les fichiers générés manuellement — modifier la source dans `/resources` puis régénérer.
