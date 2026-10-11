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
 * Helper: Translate using Google Cloud Translation API (when API Key is available)
 */
async function translateWithGoogleCloud(text, sourceLang, targetLang, apiKey) {
  const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
  const payload = {
    q: text,
    target: targetLang,
    format: 'text'
  };
  if (sourceLang && sourceLang !== 'auto') {
    payload.source = sourceLang;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || `Google Cloud API error (${response.status})`);
  }

  const translation = data.data.translations[0];
  return {
    translatedText: translation.translatedText,
    detectedSource: translation.detectedSourceLanguage || sourceLang,
    provider: 'Google Cloud Translation'
  };
}

/**
 * Helper: Translate using Google Translate Free Web Endpoint
 */
async function translateWithGoogleFree(text, sourceLang, targetLang) {
  const sl = sourceLang === 'auto' ? 'auto' : sourceLang;
  const tl = targetLang;
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`;

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });

  if (!response.ok) {
    throw new Error(`Google Web Translation responded with status ${response.status}`);
  }

  const data = await response.json();
  // data format: [[[translated_part, original_part, ...], ...], null, detected_language]
  if (!data || !Array.isArray(data[0])) {
    throw new Error('Unexpected translation response format');
  }

  const translatedText = data[0].map(part => part[0]).filter(Boolean).join('');
  const detectedSource = data[2] || (sourceLang === 'auto' ? 'unknown' : sourceLang);

  return {
    translatedText,
    detectedSource,
    provider: 'Free Translation Engine'
  };
}

/**
 * Helper: Translate using MyMemory Free API (fallback)
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

// Endpoint: Translate
app.post('/api/translate', async (req, res) => {
  try {
    const { text, sourceLang = 'auto', targetLang, apiKey } = req.body;

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

    // Determine API Key priority: request body -> environment variable
    const effectiveApiKey = apiKey || process.env.GOOGLE_TRANSLATE_API_KEY;

    let result;
    if (effectiveApiKey) {
      try {
        result = await translateWithGoogleCloud(trimmedText, sourceLang, targetLang, effectiveApiKey);
      } catch (cloudErr) {
        console.warn('Google Cloud Translation failed with provided key:', cloudErr.message);
        // If provided key was specifically from user, return the error
        if (apiKey) {
          return res.status(401).json({
            error: `API Key error: ${cloudErr.message}. Check your Google Cloud API key.`
          });
        }
        // Fallback to free engine if server's env key failed
        console.log('Falling back to free translation engine...');
        result = await translateWithGoogleFree(trimmedText, sourceLang, targetLang);
      }
    } else {
      // Use free translation engines with fallback
      try {
        result = await translateWithGoogleFree(trimmedText, sourceLang, targetLang);
      } catch (err1) {
        console.warn('Free Google endpoint failed, trying MyMemory:', err1.message);
        try {
          result = await translateWithMyMemory(trimmedText, sourceLang, targetLang);
        } catch (err2) {
          throw new Error(`Translation services unavailable. Error: ${err1.message}`);
        }
      }
    }

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

startServer(Number(PORT));

