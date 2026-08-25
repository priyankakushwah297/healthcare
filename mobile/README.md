# 📱 Healthcare EHR Mobile App (React Native • Android & iOS)

A modern, cross-platform **React Native & Expo** mobile application for the Healthcare Management & Electronic Health Record (EHR) System.

---

## 🌟 Key Portals & Features Included

1. **👤 Patient Portal**:
   - Multi-mode Consultation Booking (**In-Clinic, Tele-Health, Homecare**).
   - Real-time Doctor Availability & Fee schedules.
   - Digital Prescriptions (Rx) with active dosage, instructions & dietary advice.
   - Diagnostic Lab Reports download & EHR timeline review.

2. **👨‍⚕️ Doctor Desk (Rx Generator)**:
   - Today's Live Patient Queue with token management.
   - Patient Medical History & EHR inspection.
   - Digital Prescription Writer with drug dosages, frequency (TDS/BD), and lifestyle recommendations.

3. **👩‍💼 Receptionist & Admissions Desk**:
   - Instant OPD Walk-in Patient Registration.
   - Live Token generation and department routing.
   - Inpatient bed occupancy summary.

4. **🔬 Lab Technician Portal**:
   - Pathology & Radiology Diagnostic test queue.
   - Test result entry, normal range comparison, and abnormal test flagging.
   - Cloud PDF report publishing directly to patient EHR.

5. **🛡️ Hospital Super Admin**:
   - **Live 350+ Bed Telemetry** (Occupied vs. Available General & Smart ICU beds).
   - Staff roster credentialing & hospital operational analytics.
   - 24/7 Emergency response & ambulance dispatch tracking.

---

## 🚀 How to Run the App on Physical Phone (Android & iOS)

### Step 1: Install Expo Go App on your Phone
- **Android**: Download **Expo Go** from Google Play Store.
- **iPhone (iOS)**: Download **Expo Go** from Apple App Store.

### Step 2: Start the Development Server
Open terminal in the `mobile/` directory and run:
```bash
cd mobile
npm start
```

### Step 3: Scan QR Code
- On **Android**: Open **Expo Go** app and tap **"Scan QR code"**.
- On **iPhone**: Open the default **Camera app** and scan the QR code displayed in the terminal.
- The app will instantly load on your phone! 🎉

---

## 📦 How to Build Standalone Android APK (`.apk`)

You can generate a direct, installable **`.apk`** file for Android using EAS Build (Expo Cloud Services):

```bash
cd mobile

# Step 1: Install EAS CLI (if not already installed)
npm install -g eas-cli

# Step 2: Log in to free Expo account
npx eas login

# Step 3: Trigger Android APK Build
npx eas build -p android --profile preview
```
Once the build completes (usually 3-5 minutes), EAS will provide a direct download link for the **`.apk`** file that you can install on any Android phone.

---

## 🍎 How to Build for iOS

```bash
cd mobile
npx eas build -p ios --profile preview
```

---

## 📂 Project Architecture

```
mobile/
├── assets/                  # App icon, splash screen & branding
├── src/
│   ├── api/                 # Mock & REST API connector
│   ├── context/             # AuthContext (Role-based state management)
│   ├── navigation/          # React Navigation (Bottom Tabs & Stack)
│   ├── screens/             # 5 Role screens + Home landing screen
│   └── types/               # TypeScript interfaces (EHR, Rx, Lab, Hospital)
├── app.json                 # Expo project configuration
├── eas.json                 # EAS APK & iOS build profiles
└── package.json             # React Native dependencies
```
