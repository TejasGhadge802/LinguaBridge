const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Supported languages with display names and Web Speech API BCP-47 locale tags
const SUPPORTED_LANGUAGES = [
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
];

// Endpoint: Supported Languages list
app.get('/api/languages', (req, res) => {
  res.json({ languages: SUPPORTED_LANGUAGES });
});


/**
 * Helper 1: Google Chrome Client Endpoint (Most reliable, zero 429 rate limits)
 */
async function translateWithGoogleChromeClient(text, sourceLang, targetLang) {
  const sl = sourceLang === 'auto' ? 'auto' : sourceLang;
  const tl = targetLang;
  const url = `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=${sl}&tl=${tl}&q=${encodeURIComponent(text)}`;

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept': '*/*',
      'Referer': 'https://translate.google.com/'
    }
  });

  if (!response.ok) {
    throw new Error(`Google Chrome Client responded with status ${response.status}`);
  }

  const data = await response.json();
  let translatedText = '';
  let detectedSource = sourceLang;

  if (Array.isArray(data)) {
    if (Array.isArray(data[0])) {
      translatedText = data[0][0];
      if (data[0][1]) detectedSource = data[0][1];
    } else if (typeof data[0] === 'string') {
      translatedText = data[0];
    }
  }

  if (!translatedText) {
    throw new Error('Could not parse translation result from Chrome client');
  }

  return {
    translatedText,
    detectedSource: detectedSource === 'auto' ? 'unknown' : detectedSource,
    provider: 'Google Free Engine (High Speed)'
  };
}

/**
 * Helper 2: Google GTX Web Endpoint (Secondary)
 */
async function translateWithGoogleGTX(text, sourceLang, targetLang) {
  const sl = sourceLang === 'auto' ? 'auto' : sourceLang;
  const tl = targetLang;
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`;

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'Accept': '*/*',
      'Referer': 'https://translate.google.com/'
    }
  });

  if (!response.ok) {
    throw new Error(`Google GTX responded with status ${response.status}`);
  }

  const data = await response.json();
  if (!data || !Array.isArray(data[0])) {
    throw new Error('Unexpected translation response format from GTX');
  }

  const translatedText = data[0].map(part => part[0]).filter(Boolean).join('');
  const detectedSource = data[2] || (sourceLang === 'auto' ? 'unknown' : sourceLang);

  return {
    translatedText,
    detectedSource,
    provider: 'Google Web Engine'
  };
}

/**
 * Helper 3: MyMemory Free API (Tertiary fallback)
 */
async function translateWithMyMemory(text, sourceLang, targetLang) {
  const sl = sourceLang === 'auto' ? 'autodetect' : sourceLang;
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sl}|${targetLang}`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.responseStatus !== 200 && data.responseStatus !== '200') {
    throw new Error(data.responseDetails || 'MyMemory translation service failed');
  }

  return {
    translatedText: data.responseData.translatedText,
    detectedSource: data.responseData.detectedLanguage || sourceLang,
    provider: 'MyMemory API'
  };
}

/**
 * Robust Multi-Engine Free Translator Orchestrator
 */
async function translateFreeMultiEngine(text, sourceLang, targetLang) {
  const errors = [];

  // Try 1: Google Chrome Client (Most stable, avoids 429)
  try {
    return await translateWithGoogleChromeClient(text, sourceLang, targetLang);
  } catch (err1) {
    console.warn('Chrome Client failed:', err1.message);
    errors.push(err1.message);
  }

  // Try 2: Google GTX
  try {
    return await translateWithGoogleGTX(text, sourceLang, targetLang);
  } catch (err2) {
    console.warn('Google GTX failed:', err2.message);
    errors.push(err2.message);
  }

  // Try 3: MyMemory
  try {
    return await translateWithMyMemory(text, sourceLang, targetLang);
  } catch (err3) {
    console.warn('MyMemory failed:', err3.message);
    errors.push(err3.message);
  }

  throw new Error(`Translation services temporarily unavailable (${errors.join(', ')}). Please try again in a few moments.`);
}

// Endpoint: Translate (100% Free & Unlimited)
app.post('/api/translate', async (req, res) => {
  try {
    const { text, sourceLang = 'auto', targetLang } = req.body;

    // Validate inputs
    if (!text || typeof text !== 'string' || text.trim() === '') {
      return res.status(400).json({ error: 'Please enter text to translate.' });
    }

    if (!targetLang || typeof targetLang !== 'string') {
      return res.status(400).json({ error: 'Target language is required.' });
    }

    const trimmedText = text.trim();
    if (trimmedText.length > 5000) {
      return res.status(400).json({ error: 'Text exceeds maximum limit of 5,000 characters.' });
    }

    // Translate using multi-engine free translator
    const result = await translateFreeMultiEngine(trimmedText, sourceLang, targetLang);

    return res.json({
      success: true,
      translatedText: result.translatedText,
      detectedSource: result.detectedSource,
      provider: result.provider
    });

  } catch (error) {
    console.error('Translation error:', error);
    return res.status(500).json({
      error: error.message || 'Translation failed due to a server or network error. Please try again.'
    });
  }
});

// Start the server with automatic port fallback if in use
function startServer(port) {
  const server = app.listen(port, () => {
    console.log(`\n🚀 Language Translation Tool server running at: http://localhost:${port}\n`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`⚠️ Port ${port} is already in use. Retrying on port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });
}

if (process.env.NODE_ENV !== 'production' || require.main === module) {
  startServer(Number(PORT));
}

module.exports = app;

