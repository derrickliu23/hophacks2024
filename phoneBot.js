const { ChatOpenAI } = require("@langchain/openai");
const { BufferMemory } = require("langchain/memory");
const { ConversationChain } = require("langchain/chains");
const { ChatPromptTemplate } = require("@langchain/core/prompts");
const Twilio = require('twilio');
const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: false }));

// Define the assistant's role and instructions
const systemMessage = "You are an experienced nurse conducting a patient assessment. Ask targeted questions about the patient's symptoms, medical history, and current condition. Be empathetic, professional, and thorough in your inquiries. Your goal is to gather comprehensive information to assist in diagnosis and treatment planning. Limit your responses to 2-3 sentences.";

// Initialize the model with the system message
const model = new ChatOpenAI({
  openAIApiKey: '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',
  modelName: "gpt-3.5-turbo",
  temperature: 0.7,
});

const memory = new BufferMemory({
  returnMessages: true,
  memoryKey: "history",
  inputKey: "input"
});
const prompt = ChatPromptTemplate.fromMessages([
  ["system", systemMessage],
  ["human", "{input}"],
  ["ai", "{history}"]
]);

const chain = new ConversationChain({
  llm: model,
  memory: memory,
  prompt: prompt
});

async function queryLangChain(userInput) {
  try {
    const response = await chain.call({ 
      input: userInput
    });
    console.log('Assistant response:', response.response);
    return response.response;
  } catch (error) {
    console.error('Error querying LangChain:', error);
    return "I apologize, but I didn't quite understand. Could you please describe your symptoms or concerns again?";
  }
}

app.post('/voice', async (req, res) => {
  const twiml = new Twilio.twiml.VoiceResponse();
  const speechResult = req.body.SpeechResult;

  if (speechResult) {
    try {
      // Process the speech result with LangChain
      const langChainResponse = await queryLangChain(speechResult);

      // Say the LangChain response using Joanne's voice
      twiml.say({ voice: 'Polly.Joanne-Neural', language: 'en-US' }, langChainResponse);

      // Prompt the user to continue the conversation
      const gather = twiml.gather({
        input: 'speech',
        speechTimeout: 'auto',
        action: '/voice',
      });
      gather.say({ voice: 'Polly.Joanne-Neural', language: 'en-US' }, "Please tell me more or ask any questions you may have.");
    } catch (error) {
      console.error('Error processing request:', error);
      twiml.say({ voice: 'Polly.Joanne-Neural', language: 'en-US' }, 'I apologize, but we encountered an issue. Let\'s start over. How can I assist you today?');
      twiml.redirect('/voice');
    }
  } else {
    // Initial prompt to start the conversation
    const gather = twiml.gather({
      input: 'speech',
      speechTimeout: 'auto',
      action: '/voice',
    });
    gather.say({ voice: 'Polly.Joanne-Neural', language: 'en-US' }, 'Hello, I\'m your nurse for today. How can I assist you? Please describe any symptoms or concerns you\'re experiencing.');
  }

  res.writeHead(200, { 'Content-Type': 'text/xml' });
  res.end(twiml.toString());
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});