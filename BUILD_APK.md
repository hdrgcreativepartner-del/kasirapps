# Build Android APK

## Prerequisites
- Node.js terinstall
- Android SDK terinstall
- Java Development Kit (JDK 11+) terinstall
- Android Studio (optional, tapi recommended)

## Step 1: Install Dependencies
```bash
npm install
```

## Step 2: Build Web App
```bash
npm run build
```

## Step 3: Add Android Platform
```bash
npx cap add android
```

## Step 4: Sync Files ke Android
```bash
npx cap sync android
```

## Step 5: Build APK

### Option A: Menggunakan Android Studio (Recommended)
```bash
npx cap open android
```
Kemudian di Android Studio:
- Click **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
- Tunggu sampai selesai
- APK ada di: `android/app/build/outputs/apk/debug/app-debug.apk`

### Option B: Menggunakan Command Line
```bash
cd android
./gradlew assembleDebug
```

APK akan ada di: `android/app/build/outputs/apk/debug/app-debug.apk`

## Step 6: Test APK
```bash
# Connect Android device or open emulator
npx cap run android
```

## Troubleshooting

### Error: "ANDROID_HOME not set"
```bash
# Windows
set ANDROID_HOME=C:\Users\YourName\AppData\Local\Android\Sdk

# macOS/Linux
export ANDROID_HOME=~/Android/Sdk
```

### Error: "Java not found"
- Install JDK 11 atau lebih tinggi
- Set JAVA_HOME ke folder JDK installation

### Build Gradle Error
```bash
# Clean build
cd android
./gradlew clean
./gradlew assembleDebug
```

---

**Kapan APK siap untuk Production?**
- Debug APK: Untuk testing
- Release APK: Untuk upload ke Google Play Store (perlu signing dengan keystore)
