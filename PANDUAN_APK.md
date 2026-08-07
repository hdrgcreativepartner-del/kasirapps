# 📱 Panduan Lengkap: Dari Website ke APK Android

**Cara mengubah aplikasi web menjadi APK yang bisa diinstall di Android menggunakan Capacitor & Android Studio.**

---

## 🎯 Konsep Dasar

```
Website GitHub Pages 
https://hdrgcreativepartner-del.github.io/kasirapps/
        ↓
Local Project (React + Capacitor)
        ↓
Android Native Project
        ↓
APK File (Aplikasi Android)
```

**Capacitor** = Framework yang mengubah web app jadi native app.

---

## 📋 Yang Perlu Diinstall (Prerequisites)

### 1. **Node.js & npm**
- Download: https://nodejs.org/ (pilih LTS)
- Versi min: **v16**
- Cek:
  ```bash
  node --version
  npm --version
  ```

### 2. **Java Development Kit (JDK) 11+**
- Download: https://www.oracle.com/java/technologies/downloads/
- Cek:
  ```bash
  java -version
  ```

### 3. **Android Studio**
- Download: https://developer.android.com/studio
- Size: ~900MB
- Install dengan pilihan:
  - ✅ Android SDK
  - ✅ Android Emulator
  - ✅ Gradle

### 4. **Git** (Optional)
- Download: https://git-scm.com/

---

## 🚀 Step by Step

### **STEP 1: Download Project**

**Option A: Via Git (Recommended)**
```bash
git clone https://github.com/hdrgcreativepartner-del/kasirapps.git
cd kasirapps
```

**Option B: Download ZIP**
- Buka: https://github.com/hdrgcreativepartner-del/kasirapps
- Click **Code** → **Download ZIP**
- Extract, buka folder

---

### **STEP 2: Install Dependencies**

Di folder `kasirapps`, buka Terminal/Command Prompt:

```bash
npm install
```

**Tunggu 5-10 menit** sampai semua library download.

---

### **STEP 3: Build Web App**

```bash
npm run build
```

Ini membuat folder `dist/` - hasil build aplikasi.

---

### **STEP 4: Setup Environment (Windows)**

**Buka Command Prompt** dan jalankan:

```bash
# Set Android SDK
setx ANDROID_HOME "%USERPROFILE%\AppData\Local\Android\Sdk"

# Set Java (sesuaikan versi JDK Anda)
setx JAVA_HOME "C:\Program Files\Java\jdk-11.0.13"
```

**Untuk Mac/Linux:**
```bash
export ANDROID_HOME=$HOME/Library/Android/Sdk
export JAVA_HOME=$(/usr/libexec/java_home)
```

**Restart Terminal setelah ini!**

---

### **STEP 5: Add Android Platform**

```bash
npx cap add android
```

Ini create folder `android/` dengan native Android project.

---

### **STEP 6: Sync ke Android**

```bash
npx cap sync android
```

Sync kode web ke Android project.

---

### **STEP 7: Buka di Android Studio**

**Option A: Via Command**
```bash
npx cap open android
```

**Option B: Manual**
1. Buka Android Studio
2. **File** → **Open**
3. Pilih folder: `kasirapps/android`
4. Click **Open**

Tunggu Android Studio indexing files (1-3 menit).

---

### **STEP 8: Build APK di Android Studio**

#### **Cara 1: Via Build Menu** (Recommended)

1. Click menu **Build**
2. Pilih **Build Bundle(s) / APK(s)**
3. Pilih **Build APK(s)**
4. **Tunggu** sampai notif "Build Successful" muncul ✅
5. Time: 5-15 menit (tergantung PC)

#### **Cara 2: Via Terminal Android Studio**

1. Buka Terminal di Android Studio (view bawah)
2. Jalankan:
   ```bash
   cd android
   ./gradlew assembleDebug
   ```
3. Tunggu sampai selesai

---

### **STEP 9: Cari APK File**

Setelah build selesai, APK ada di:

```
kasirapps/android/app/build/outputs/apk/debug/app-debug.apk
```

**Ukuran**: ~30-50 MB

---

## 📱 Test APK

### **Option A: Di Emulator (Virtual Device)**

1. Di Android Studio: Click **AVD Manager** (kiri atas)
2. Click **Play** pada device
3. Tunggu emulator loading
4. Click **Run** → **Run 'app'**
5. Aplikasi install & jalan otomatis

### **Option B: Di Android Phone**

1. **Enable Developer Mode:**
   - Settings → About Phone
   - Tap "Build Number" **7 kali**
   - Kembali ke Settings → Developer Options
   - Enable **USB Debugging**

2. **Connect phone ke PC via USB cable**

3. Di Android Studio:
   - Click **Run** → **Run 'app'**
   - Select device Anda
   - Aplikasi install & jalan

### **Option C: Install Manual**

1. Copy file `app-debug.apk` ke phone (USB/WhatsApp)
2. Tap file untuk install
3. Jika minta "Allow unknown source": Izinkan
4. Buka aplikasi dari app drawer

---

## 🔧 Troubleshooting

### ❌ "ANDROID_HOME not set"

```bash
# Cek apakah sudah set
echo %ANDROID_HOME%

# Jika kosong, set ulang:
setx ANDROID_HOME "%USERPROFILE%\AppData\Local\Android\Sdk"

# Restart Terminal!
```

---

### ❌ "Java not found" atau "JAVA_HOME error"

```bash
# Cek lokasi Java
where java

# Set JAVA_HOME sesuai output:
setx JAVA_HOME "C:\Program Files\Java\jdk-11.0.13"
```

---

### ❌ "Gradle build failed"

```bash
# Clean & rebuild
cd android
./gradlew clean
./gradlew assembleDebug
```

---

### ❌ APK Crash saat dibuka

1. Check **Logcat** di Android Studio (view bawah)
2. Cari **Error** messages
3. Fix code di `src/` folder
4. Rebuild ulang

---

## 🔄 Update Code

Setiap kali edit code:

```bash
# 1. Edit file (src/App.tsx, src/components/*, dll)

# 2. Build web
npm run build

# 3. Sync ke Android
npx cap sync android

# 4. Build APK baru di Android Studio
# (Build → Build APK(s))
```

---

## 📦 Release APK (Untuk Play Store)

Jika mau upload ke Google Play Store:

```bash
cd android
./gradlew assembleRelease
```

APK: `android/app/build/outputs/apk/release/app-release-unsigned.apk`

**Catatan**: Perlu di-sign dengan keystore sebelum upload.

---

## 📚 Referensi

- [Capacitor Docs](https://capacitorjs.com/docs)
- [Android Studio Guide](https://developer.android.com/studio/intro)
- [Gradle Docs](https://gradle.org/)

---

## ✅ Checklist

- [ ] Node.js terinstall
- [ ] Android Studio terinstall
- [ ] JDK 11+ terinstall
- [ ] Project di-clone
- [ ] `npm install` selesai
- [ ] `npm run build` selesai
- [ ] Android Platform di-add
- [ ] APK berhasil di-build
- [ ] Bisa diinstall di device/emulator

**Jika semua ✅ → Selamat! APK siap pakai! 🎉**

---

## 💬 Ada Masalah?

- Baca Troubleshooting di atas
- Cek Logcat untuk error messages
- Tanya di: hdrg.creativepartner@gmail.com

---

**Good luck! Happy coding! 🚀**
