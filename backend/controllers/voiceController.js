const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Process voice text
exports.processVoice = async (req, res) => {
  try {
    const { text, language = 'en', tone = 'professional' } = req.body;
    const userId = req.userId;

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Send to Gemini API
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(text);
    const aiResponse = result.response.text();

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
