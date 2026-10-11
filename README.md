# 🌐 LinguaBridge - Modern Language Translation Tool

A clean, responsive, high-performance Language Translation Tool built with **HTML5**, **Tailwind CSS**, and **JavaScript**, powered by a lightweight **Node.js & Express** backend.

---

## ✨ Features

1. **Clean, Responsive UI**:
   - Modern glassmorphic design styled with Tailwind CSS.
   - Dual-panel layout for Source and Target text, seamlessly adapting to desktop and mobile displays.

2. **Source Language Selection & Auto-Detection**:
   - Select from 25+ global and Indian languages (English, Hindi, Marathi, Spanish, French, German, Japanese, and more).
   - ✨ **Auto-Detect** mode automatically identifies the input language and displays a detected badge.

3. **Target Language Selection**:
   - Quick language tabs for rapid switching + searchable full dropdown selector.

4. **Translate Button & Loading State**:
   - One-click translation with animated spinner and `Translating…` progress indicator.
   - Keyboard shortcut support: Press <kbd>Ctrl + Enter</kbd> or <kbd>Cmd + Enter</kbd> to translate instantly.

5. **Display Translated Text**:
   - Dedicated output panel with live character counters.

6. **Error Handling**:
   - Inline alert for empty input warnings.
   - Offline detection (`navigator.onLine`) with informative notices.
   - Network failure and invalid API key notifications.

7. **📋 Copy Button**:
   - Copy translated text to clipboard using the modern Clipboard API.
   - Visual feedback on button + smooth floating toast notification: **"Copied successfully! 📋"**.

8. **🔊 Listen Button (Text-to-Speech)**:
   - Built with the browser's native **Web Speech API** (`SpeechSynthesisUtterance`).
   - Automatically matches speech locale code (e.g., `hi-IN` for Hindi, `mr-IN` for Marathi, `en-US` for English, `es-ES` for Spanish) and selects the best installed voice.
   - Dynamic play/stop toggle with audio wave animation.
   - Bonus: Listen to both original source and translated text!

9. **Language Swapping & Text Clear**:
   - Smooth 180° animated swap button to reverse source and target languages and text.
   - Quick clear button to wipe text and reset states.

10. **Dual Translation Engine Support**:
    - **Zero-Config Free Engine**: Works out-of-the-box without requiring any credentials or paid billing.
    - **Google Cloud Translation API**: Optionally provide your Google Cloud Translation API key via `.env` or directly through the in-app **API Settings** modal.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Application
```bash
npm start
```
The server will start at: **http://localhost:3000**

### 3. Open in Browser
Open `http://localhost:3000` in Google Chrome, Microsoft Edge, Brave, or Firefox.

---

## 🛠️ Project Structure

```
Language Translation Tool/
├── public/
│   ├── index.html       # Responsive Tailwind CSS layout & UI elements
│   ├── style.css        # Custom styles, animations, scrollbars, and speech waves
│   └── app.js           # Client-side state, Speech & Clipboard APIs, event handling
├── server.js            # Express backend with translation endpoints & API proxying
├── package.json         # Project metadata and dependencies
├── .env.example         # Environment variables template
└── README.md            # Documentation
```

---

## 🔑 Optional Google Cloud API Key Configuration

If you wish to use an official Google Cloud Translation API key:
- **Option A (In-app)**: Click the **API Settings** button in the header, paste your key, and click **Save Preferences**.
- **Option B (Environment file)**: Create a `.env` file from `.env.example`:
  ```env
  PORT=3000
  GOOGLE_TRANSLATE_API_KEY=your_google_cloud_api_key_here
  ```

