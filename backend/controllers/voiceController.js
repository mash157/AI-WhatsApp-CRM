const axios = require('axios');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';

const getAiApiKey = () => process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;

const generateAiResponse = async (prompt) => {
  const apiKey = getAiApiKey();

  const response = await axios.post(
    GROQ_API_URL,
    {
      model: DEFAULT_GROQ_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    }
  );

  return response.data?.choices?.[0]?.message?.content?.trim() || '';
};

// Process voice text
exports.processVoice = async (req, res) => {
  try {
    const { text, language = 'en', tone = 'professional' } = req.body;
    const userId = req.userId;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Send to AI API
    const aiResponse = await generateAiResponse(text);

    // Update user usage
    req.user.usage.voiceRequests += 1;
    await req.user.save();

    res.status(200).json({
      message: 'Voice request processed successfully',
      input: text,
      output: aiResponse,
      language,
      tone,
    });
  } catch (error) {
    console.error('❌ Voice Processing Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get speech synthesis (text-to-speech)
exports.synthesizeSpeech = async (req, res) => {
  try {
    const { text, language = 'en' } = req.body;

    // For production, use Google Cloud Text-to-Speech API
    // This is a placeholder for now
    res.status(200).json({
      message: 'Speech synthesized',
      text,
      audioUrl: 'https://your-audio-url.com/audio.mp3', // Placeholder
    });
  } catch (error) {
    console.error('❌ Synthesis Error:', error);
    res.status(500).json({ error: error.message });
  }
};
