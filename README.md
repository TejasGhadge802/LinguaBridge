# 🌐 LinguaBridge - Modern Language Translation Tool

A clean, responsive, high-performance Language Translation Tool built with **HTML5**, **Tailwind CSS**, and **JavaScript**, powered by a lightweight **Node.js & Express** backend.

🚀 **Live Demo:** [https://lingua-bridge-sigma.vercel.app/](https://lingua-bridge-sigma.vercel.app/)

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

10. **100% Free & Unlimited**:
    - Works completely out-of-the-box using high-speed multi-engine translation.
    - Zero API keys, zero signup, and zero credit card required.

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
├── api/
│   └── index.js         # Vercel serverless function entrypoint
├── public/
│   ├── favicon.svg      # Custom SVG vector favicon
│   ├── index.html       # Responsive Tailwind CSS layout & UI elements
│   ├── style.css        # Custom styles, animations, scrollbars, and speech waves
│   └── app.js           # Client-side state, Speech & Clipboard APIs, event handling
├── server.js            # Express backend with high-speed multi-engine translation
├── vercel.json          # Vercel serverless rewrite configuration
├── package.json         # Project metadata and dependencies
├── .gitignore           # Git ignore configuration
└── README.md            # Documentation
```

