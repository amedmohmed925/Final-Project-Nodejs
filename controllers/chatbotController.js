const axios = require('axios');

const HF_API_KEY = process.env.HUGGING_FACE_API_KEY;
async function getChatbotResponse(userMessage) {
  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill',
      { inputs: userMessage, parameters: { max_length: 100 } },
      { headers: { Authorization: `Bearer ${HF_API_KEY}` } }
    );
    return response.data[0].generated_text;
  } catch (error) {
    console.error('Chatbot Error:', error);
    return 'Sorry, there was an error processing your request. Try again!';
  }
}

module.exports = { getChatbotResponse };