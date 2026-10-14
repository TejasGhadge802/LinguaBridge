// Application State
const state = {
  sourceLang: 'auto',
  targetLang: 'hi',
  isTranslating: false,
  isSpeaking: false,
  languages: [
    { code: 'en', name: 'English', nativeName: 'English', speechLocale: 'en-US' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', speechLocale: 'hi-IN' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी', speechLocale: 'mr-IN' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', speechLocale: 'es-ES' },
    { code: 'fr', name: 'French', nativeName: 'Français', speechLocale: 'fr-FR' },
    { code: 'de', name: 'German', nativeName: 'Deutsch', speechLocale: 'de-DE' },
    { code: 'it', name: 'Italian', nativeName: 'Italiano', speechLocale: 'it-IT' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português', speechLocale: 'pt-PT' },
    { code: 'ru', name: 'Russian', nativeName: 'Русский', speechLocale: 'ru-RU' },
    { code: 'ja', name: 'Japanese', nativeName: '日本語', speechLocale: 'ja-JP' },
    { code: 'ko', name: 'Korean', nativeName: '한국어', speechLocale: 'ko-KR' },
    { code: 'zh', name: 'Chinese (Simplified)', nativeName: '简体中文', speechLocale: 'zh-CN' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', speechLocale: 'ar-SA' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', speechLocale: 'bn-IN' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', speechLocale: 'ta-IN' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', speechLocale: 'te-IN' },
    { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', speechLocale: 'gu-IN' },
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', speechLocale: 'kn-IN' },
    { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', speechLocale: 'ml-IN' },
    { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', speechLocale: 'pa-IN' },
    { code: 'ur', name: 'Urdu', nativeName: 'اردو', speechLocale: 'ur-PK' },
    { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', speechLocale: 'nl-NL' },
    { code: 'pl', name: 'Polish', nativeName: 'Polski', speechLocale: 'pl-PL' },
    { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', speechLocale: 'tr-TR' },
    { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', speechLocale: 'vi-VN' },
    { code: 'th', name: 'Thai', nativeName: 'ไทย', speechLocale: 'th-TH' },
    { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', speechLocale: 'id-ID' }
  ]
};

// DOM Elements
const sourceText = document.getElementById('sourceText');
const targetText = document.getElementById('targetText');
const sourceLangSelect = document.getElementById('sourceLangSelect');
const targetLangSelect = document.getElementById('targetLangSelect');
const sourceQuickTabs = document.getElementById('sourceQuickTabs');
const targetQuickTabs = document.getElementById('targetQuickTabs');
const translateBtn = document.getElementById('translateBtn');
const translateBtnText = document.getElementById('translateBtnText');
const translateBtnIcon = document.getElementById('translateBtnIcon');
const swapLanguagesBtn = document.getElementById('swapLanguagesBtn');
const swapIcon = document.getElementById('swapIcon');
const copyTargetBtn = document.getElementById('copyTargetBtn');
const copyTargetLabel = document.getElementById('copyTargetLabel');
const copyTargetIcon = document.getElementById('copyTargetIcon');
const listenTargetBtn = document.getElementById('listenTargetBtn');
const listenTargetLabel = document.getElementById('listenTargetLabel');
const listenTargetIcon = document.getElementById('listenTargetIcon');
const listenSourceBtn = document.getElementById('listenSourceBtn');
const pasteBtn = document.getElementById('pasteBtn');
const clearSourceBtn = document.getElementById('clearSourceBtn');
const charCount = document.getElementById('charCount');
const targetCharCount = document.getElementById('targetCharCount');
const outputLoader = document.getElementById('outputLoader');
const providerBadge = document.getElementById('providerBadge');
const detectedLangBadge = document.getElementById('detectedLangBadge');
const detectedLangName = document.getElementById('detectedLangName');
const errorAlert = document.getElementById('errorAlert');
const errorTitle = document.getElementById('errorTitle');
const errorMessage = document.getElementById('errorMessage');
const closeAlertBtn = document.getElementById('closeAlertBtn');
const toast = document.getElementById('toastNotification');
const toastMessage = document.getElementById('toastMessage');
const toastIcon = document.getElementById('toastIcon');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const themeToggleIcon = document.getElementById('themeToggleIcon');

// Clear any old stored key
try { localStorage.removeItem('lingua_api_key'); } catch(e) {}

// --- Initialization ---
function init() {
  initTheme();
  populateLanguageSelects();
  setupEventListeners();
  syncLanguageSelections();

  // Pre-load Web Speech API voices
  if ('speechSynthesis' in window) {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }
}

// Populate dropdown selectors with supported languages
function populateLanguageSelects() {
  sourceLangSelect.innerHTML = '<option value="auto">✨ Auto Detect</option>';
  targetLangSelect.innerHTML = '';

  state.languages.forEach(lang => {
    const optSource = document.createElement('option');
    optSource.value = lang.code;
    optSource.textContent = `${lang.name} (${lang.nativeName})`;
    sourceLangSelect.appendChild(optSource);

    const optTarget = document.createElement('option');
    optTarget.value = lang.code;
    optTarget.textContent = `${lang.name} (${lang.nativeName})`;
    targetLangSelect.appendChild(optTarget);
  });

  sourceLangSelect.value = state.sourceLang;
  targetLangSelect.value = state.targetLang;
}

// Sync UI quick tabs with current language state
function syncLanguageSelections() {
  sourceLangSelect.value = state.sourceLang;
  targetLangSelect.value = state.targetLang;

  // Update Source quick tab active styling
  const sourceButtons = sourceQuickTabs.querySelectorAll('button');
  sourceButtons.forEach(btn => {
    if (btn.dataset.lang === state.sourceLang) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Update Target quick tab active styling
  const targetButtons = targetQuickTabs.querySelectorAll('button');
  targetButtons.forEach(btn => {
    if (btn.dataset.lang === state.targetLang) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  // Enable/disable swap button if source is auto
  if (state.sourceLang === 'auto') {
    swapLanguagesBtn.classList.add('opacity-50', 'cursor-not-allowed');
    swapLanguagesBtn.title = 'Cannot swap when source is set to Auto Detect';
  } else {
    swapLanguagesBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    swapLanguagesBtn.title = 'Swap languages';
  }
}

// Find language object by code
function getLanguage(code) {
  return state.languages.find(l => l.code === code) || null;
}

// --- Event Listeners Setup ---
function setupEventListeners() {
  // Source quick tabs click
  sourceQuickTabs.addEventListener('click', (e) => {
    const tab = e.target.closest('button[data-lang]');
    if (!tab) return;
    setSourceLanguage(tab.dataset.lang);
  });

  // Target quick tabs click
  targetQuickTabs.addEventListener('click', (e) => {
    const tab = e.target.closest('button[data-lang]');
    if (!tab) return;
    setTargetLanguage(tab.dataset.lang);
  });

  // Select dropdown changes
  sourceLangSelect.addEventListener('change', (e) => {
    setSourceLanguage(e.target.value);
  });

  targetLangSelect.addEventListener('change', (e) => {
    setTargetLanguage(e.target.value);
  });

  // Character counter and input handling
  sourceText.addEventListener('input', () => {
    const len = sourceText.value.length;
    charCount.textContent = len.toLocaleString();
    if (len > 5000) {
      charCount.classList.add('text-red-500', 'font-bold');
    } else {
      charCount.classList.remove('text-red-500', 'font-bold');
    }
    hideError();
  });

  // Shortcut: Ctrl+Enter / Cmd+Enter to translate
  sourceText.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleTranslation();
    }
  });

  // Translate Button click
  translateBtn.addEventListener('click', handleTranslation);

  // Swap Languages Button click
  swapLanguagesBtn.addEventListener('click', () => {
    if (state.sourceLang === 'auto') {
      showToast('Select a specific source language before swapping.', 'info');
      return;
    }
    swapIcon.classList.add('rotate-180');
    setTimeout(() => swapIcon.classList.remove('rotate-180'), 300);

    const oldSource = state.sourceLang;
    const oldTarget = state.targetLang;
    const oldSourceText = sourceText.value;
    const oldTargetText = targetText.value;

    state.sourceLang = oldTarget;
    state.targetLang = oldSource;
    syncLanguageSelections();

    if (oldTargetText) {
      sourceText.value = oldTargetText;
      charCount.textContent = oldTargetText.length.toLocaleString();
      targetText.value = oldSourceText;
      targetCharCount.textContent = oldSourceText.length.toLocaleString();
    }
  });

  // Clear Source Text Button
  clearSourceBtn.addEventListener('click', () => {
    sourceText.value = '';
    charCount.textContent = '0';
    targetText.value = '';
    targetCharCount.textContent = '0';
    detectedLangBadge.classList.add('hidden');
    hideError();
    sourceText.focus();
  });

  // Paste from clipboard button
  pasteBtn.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        sourceText.value = text;
        charCount.textContent = text.length.toLocaleString();
        hideError();
        showToast('Pasted from clipboard!', 'success');
      }
    } catch (err) {
      showToast('Could not access clipboard. Please paste manually.', 'error');
    }
  });

  // Copy Translated Text Button 📋
  copyTargetBtn.addEventListener('click', () => {
    const textToCopy = targetText.value.trim();
    if (!textToCopy) {
      showError('Nothing to copy', 'Translate some text first to copy the result.');
      return;
    }

    navigator.clipboard.writeText(textToCopy).then(() => {
      // Visual feedback on button
      copyTargetLabel.textContent = 'Copied!';
      copyTargetIcon.className = 'fa-solid fa-check text-emerald-600';

      showToast('Copied successfully! 📋', 'success');

      setTimeout(() => {
        copyTargetLabel.textContent = 'Copy';
        copyTargetIcon.className = 'fa-regular fa-copy text-indigo-600';
      }, 2500);
    }).catch(() => {
      // Fallback
      targetText.select();
      document.execCommand('copy');
      showToast('Copied successfully! 📋', 'success');
    });
  });

  // Listen Translated Text Button 🔊 (Web Speech API)
  listenTargetBtn.addEventListener('click', () => {
    const textToSpeak = targetText.value.trim();
    if (!textToSpeak) {
      showError('Nothing to read aloud', 'Translate some text first to listen to it.');
      return;
    }
    speakText(textToSpeak, state.targetLang, listenTargetBtn, listenTargetLabel, listenTargetIcon);
  });

  // Listen Source Text Button 🔊
  listenSourceBtn.addEventListener('click', () => {
    const textToSpeak = sourceText.value.trim();
    if (!textToSpeak) {
      showError('Empty input', 'Please type some text to listen.');
      return;
    }
    const langCode = state.sourceLang === 'auto' ? 'en' : state.sourceLang;
    speakText(textToSpeak, langCode, listenSourceBtn);
  });

  // Close Error Alert
  closeAlertBtn.addEventListener('click', hideError);

  // Theme Toggle Button
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
  }
}

// --- Theme Management ---
function initTheme() {
  syncThemeUI();

  // Listen to OS theme changes if user hasn't explicitly set preference
  try {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', (e) => {
      const storedTheme = localStorage.getItem('lingua_theme');
      if (!storedTheme) {
        if (e.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        syncThemeUI();
      }
    });
  } catch(e) {}
}

function syncThemeUI() {
  const isDark = document.documentElement.classList.contains('dark');
  if (themeToggleIcon) {
    if (isDark) {
      themeToggleIcon.className = 'fa-solid fa-sun text-sm sm:text-base text-amber-400 rotate-0 transition-all duration-300';
      if (themeToggleBtn) themeToggleBtn.title = 'Switch to Light Mode';
    } else {
      themeToggleIcon.className = 'fa-solid fa-moon text-sm sm:text-base text-slate-600 rotate-0 transition-all duration-300';
      if (themeToggleBtn) themeToggleBtn.title = 'Switch to Dark Mode';
    }
  }
}

function toggleTheme() {
  const isDark = document.documentElement.classList.toggle('dark');
  try {
    localStorage.setItem('lingua_theme', isDark ? 'dark' : 'light');
  } catch(e) {}
  syncThemeUI();
  showToast(isDark ? 'Dark mode enabled 🌙' : 'Light mode enabled ☀️', 'info');
}

function setSourceLanguage(langCode) {
  state.sourceLang = langCode;
  syncLanguageSelections();
  detectedLangBadge.classList.add('hidden');
}

function setTargetLanguage(langCode) {
  state.targetLang = langCode;
  syncLanguageSelections();
}

// --- Text-to-Speech via Web Speech API ---
function speakText(text, langCode, triggerBtn, labelEl = null, iconEl = null) {
  if (!('speechSynthesis' in window)) {
    showError('Text-to-Speech Unsupported', 'Your browser does not support the Web Speech API.');
    return;
  }

  // If already speaking, stop it
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    resetSpeechUI(triggerBtn, labelEl, iconEl);
    return;
  }

  const langObj = getLanguage(langCode);
  const speechLocale = langObj ? langObj.speechLocale : 'en-US';

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = speechLocale;
  utterance.rate = 0.95; // Slightly clearer rate

  // Match best voice available on user's device
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find(v => v.lang === speechLocale || v.lang.startsWith(langCode));
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  // UI speech indicators
  triggerBtn.classList.add('speaking-active');
  if (labelEl) labelEl.textContent = 'Stop';
  if (iconEl) iconEl.className = 'fa-solid fa-stop text-red-500';

  utterance.onend = () => {
    resetSpeechUI(triggerBtn, labelEl, iconEl);
  };

  utterance.onerror = (e) => {
    console.warn('Speech synthesis error:', e);
    resetSpeechUI(triggerBtn, labelEl, iconEl);
    if (e.error !== 'interrupted' && e.error !== 'canceled') {
      showToast('Speech playback failed for this voice.', 'error');
    }
  };

  window.speechSynthesis.speak(utterance);
}

function resetSpeechUI(triggerBtn, labelEl, iconEl) {
  triggerBtn.classList.remove('speaking-active');
  if (labelEl) labelEl.textContent = 'Listen';
  if (iconEl) iconEl.className = 'fa-solid fa-volume-high text-indigo-600';
}

// --- Translation Logic ---
async function handleTranslation() {
  if (state.isTranslating) return;

  const rawText = sourceText.value.trim();

  // 1. Validate empty input
  if (!rawText) {
    showError('Empty Input', 'Please enter some text in the source box to translate.');
    sourceText.focus();
    return;
  }

  // 2. Validate max characters
  if (rawText.length > 5000) {
    showError('Text Too Long', 'Please limit your input to 5,000 characters or fewer.');
    return;
  }

  // 3. Check internet connection
  if (!navigator.onLine) {
    showError('No Internet Connection', 'Please check your network connection and try again.');
    return;
  }

  hideError();
  setTranslatingState(true);

  try {
    const payload = {
      text: rawText,
      sourceLang: state.sourceLang,
      targetLang: state.targetLang
    };

    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Translation request failed (HTTP ${response.status})`);
    }

    // Set translated text
    targetText.value = data.translatedText;
    targetCharCount.textContent = data.translatedText.length.toLocaleString();

    // Show detected language badge if source was auto
    if (state.sourceLang === 'auto' && data.detectedSource) {
      const detectedLangObj = getLanguage(data.detectedSource);
      const name = detectedLangObj ? detectedLangObj.name : data.detectedSource;
      detectedLangName.textContent = name;
      detectedLangBadge.classList.remove('hidden');
    } else {
      detectedLangBadge.classList.add('hidden');
    }

    // Update provider badge
    updateProviderBadge(data.provider || 'Success');

  } catch (error) {
    console.error('Translation error:', error);
    showError(
      'Translation Failed',
      error.message || 'Unable to translate. Please check your internet connection and try again.'
    );
  } finally {
    setTranslatingState(false);
  }
}

// Update UI Loading State
function setTranslatingState(loading) {
  state.isTranslating = loading;

  if (loading) {
    translateBtn.disabled = true;
    translateBtn.classList.add('opacity-80', 'cursor-not-allowed');
    translateBtnText.textContent = 'Translating…';
    translateBtnIcon.className = 'fa-solid fa-spinner animate-spin text-base';
    outputLoader.classList.remove('hidden');
    updateProviderBadge('Translating…');
  } else {
    translateBtn.disabled = false;
    translateBtn.classList.remove('opacity-80', 'cursor-not-allowed');
    translateBtnText.textContent = 'Translate';
    translateBtnIcon.className = 'fa-solid fa-language text-base';
    outputLoader.classList.add('hidden');
  }
}

function updateProviderBadge(text) {
  providerBadge.textContent = text;
}

// --- Alerts and Toasts ---
function showError(title, msg) {
  errorTitle.textContent = title;
  errorMessage.textContent = msg;
  errorAlert.classList.remove('hidden');
  errorAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideError() {
  errorAlert.classList.add('hidden');
}

function showToast(message, type = 'success') {
  toastMessage.textContent = message;

  const iconContainer = document.getElementById('toastIconContainer');
  if (type === 'success') {
    iconContainer.className = 'w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center';
    toastIcon.className = 'fa-solid fa-check';
  } else if (type === 'error') {
    iconContainer.className = 'w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center';
    toastIcon.className = 'fa-solid fa-exclamation';
  } else {
    iconContainer.className = 'w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center';
    toastIcon.className = 'fa-solid fa-info';
  }

  toast.classList.remove('translate-y-20', 'opacity-0', 'pointer-events-none');
  toast.classList.add('translate-y-0', 'opacity-100');

  setTimeout(() => {
    toast.classList.remove('translate-y-0', 'opacity-100');
    toast.classList.add('translate-y-20', 'opacity-0', 'pointer-events-none');
  }, 3000);
}

// Run init on DOM ready
document.addEventListener('DOMContentLoaded', init);

