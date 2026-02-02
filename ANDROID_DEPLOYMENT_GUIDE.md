# Android Deployment Guide (GullyGram)

Since GullyGram is currently a **Web Application** (React + Spring Boot), you cannot directly upload it to the Play Store. You must first convert it into an **Android App**.

The best way to do this without rewriting code is using **Capacitor**. It wraps your existing React frontend into a native Android container.

---

## Prerequisites
1.  **Node.js** installed.
2.  **Android Studio** installed (required to build the APK/AAB).
3.  **Google Play Developer Account** ($25 one-time fee).

---

## Step 1: Install Capacitor in Frontend

Navigate to your frontend folder and install the necessary dependencies:

```bash
cd frontend
npm install @capacitor/core
npm install -D @capacitor/cli
```

## Step 2: Initialize Capacitor

Initialize the configuration. Name your app "GullyGram" and give it a unique package ID (e.g., `com.rupeshsingh.gullygram`).

```bash
npx cap init GullyGram com.rupeshsingh.gullygram
```

## Step 3: Add Android Platform

Install the Android platform modules:

```bash
npm install @capacitor/android
npx cap add android
```

## Step 4: Configure Build Output

Open `capacitor.config.ts` (created in Step 2) and ensure `webDir` points to your build folder (usually `dist` for Vite).

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rupeshsingh.gullygram',
  appName: 'GullyGram',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
```

## Step 5: Build the Web App

Build your React project to generate the static files in `dist`:

```bash
npm run build
```

## Step 6: Sync to Android

Copy the built web assets into the Android native project:

```bash
npx cap sync
```

## Step 7: Open in Android Studio

This command will open the `android` folder in Android Studio:

```bash
npx cap open android
```

1.  Wait for Gradle sync to finish.
2.  Connect your Android phone via USB (or use an Emulator).
3.  Click the **Run (Green Play Button)** to test the app on your phone.

## Step 8: Backend Connection (Critical) ⚠️

Your Android app allows the phone to talk to `localhost`, but `localhost` on the phone refers to the phone itself, NOT your laptop.

1.  **For Testing**: Ensure your laptop and phone are on the same Wi-Fi.
2.  Find your Laptop's IP (e.g., `192.168.1.5`).
3.  Update the `BASE_URL` in your frontend code (`src/services/api.ts` or `.env`) to point to `http://192.168.1.5:8080` instead of `localhost`.
4.  Re-run `npm run build` and `npx cap sync`.

**For Production**: You MUST deploy your Spring Boot backend to a cloud server (AWS, Heroku, Render) and use that public URL (e.g., `https://api.gullygram.com`).

---

## Step 9: Generate Signed Bundle (For Play Store)

In Android Studio:
1.  Go to **Build > Generate Signed Bundle / APK**.
2.  Select **Android App Bundle**.
3.  Create a **Key Store** (keep this file safe!).
4.  Finish the wizard to generate the `.aab` file.
5.  Upload this `.aab` file to the **Google Play Console**.

---

## Summary Command List

```bash
cd frontend
npm install @capacitor/core @capacitor/android
npm install -D @capacitor/cli
npx cap init GullyGram com.example.gullygram
npx cap add android
# .. Update base URL to laptop IP or Cloud URL ..
npm run build
npx cap sync
npx cap open android
```
