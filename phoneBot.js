const { ChatOpenAI } = require("@langchain/openai");
const { BufferMemory } = require("langchain/memory");
const { ConversationChain } = require("langchain/chains");
const Twilio = require('twilio');
const express = require('express');
const app = express();
app.use(express.urlencoded({ extended: false }));

// Define the assistant's role and instructions
const systemMessage = "You are a nurse trying to understand more about a patient's illness. Please politely analyze their symptoms to ask targeted follow-up questions.";

// Initialize the model with the system message
const model = new ChatOpenAI({
  openAIApiKey: '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',
  modelName: "gpt-3.5-turbo", // or your preferred model
  temperature: 0.7,
});

const memory = new BufferMemory();
const chain = new ConversationChain({
  llm: model,
  memory: memory,
  initialPrompt: systemMessage, // Pass the system message as initial prompt
});

async function queryLangChain(userInput) {
  try {
    const response = await chain.call({ input: userInput });
    console.log('Assistant response:', response.response);
    return response.response;
  } catch (error) {
    console.error('Error querying LangChain:', error);
    return "I'm sorry, I couldn't understand that. Could you try asking in a different way?";
  }
}

app.post('/voice', async (req, res) => {
  const twiml = new Twilio.twiml.VoiceResponse();
  const speechResult = req.body.SpeechResult;

  if (speechResult) {
    try {
      // Process the speech result with LangChain
      const langChainResponse = await queryLangChain(speechResult);

      // Say the LangChain response using Alice's voice
      twiml.say({ voice: 'alice' }, langChainResponse);

      // Prompt the user to ask another question or end the conversation
      const gather = twiml.gather({
        input: 'speech',
        speechTimeout: 'auto',
        action: '/voice',
      });
      gather.say({ voice: 'alice' }, '');
    } catch (error) {
      console.error('Error processing request:', error);
      twiml.say({ voice: 'alice' }, 'We encountered an error processing your request. Please try again.');
      twiml.redirect('/voice');
    }
  } else {
    // Prompt the user to ask a question
    const gather = twiml.gather({
      input: 'speech',
      speechTimeout: 'auto',
      action: '/voice',
    });
    gather.say({ voice: 'alice' }, 'How can I help you?');
  }

  res.writeHead(200, { 'Content-Type': 'text/xml' });
  res.end(twiml.toString());
});

const port = 3000;
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
