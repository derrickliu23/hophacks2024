const express = require('express');
const { ChatOpenAI } = require("@langchain/openai");
const { BufferMemory } = require("langchain/memory");
const { ConversationChain } = require("langchain/chains");
const { ChatPromptTemplate } = require("@langchain/core/prompts");
const Twilio = require('twilio');

const app = express();
app.use(express.urlencoded({ extended: false }));

// Define the assistant's role and instructions
const systemMessage = "You are an experienced nurse conducting a patient assessment over a call. Ask targeted questions about the patient's symptoms, medical history, and current condition. Your goal is to gather comprehensive information to assist in diagnosis and treatment planning. Limit your responses to 2-3 sentences. Once you have gathered all relevant information, please offer to hang up the call.";

// Initialize the model with the system message
const model = new ChatOpenAI({
  openAIApiKey: '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',
  modelName: "gpt-4-turbo",
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
    console.log('Patient input:', userInput); // Log the patient's input
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

<<<<<<< HEAD
      // Say the LangChain response using Joanne's voice
      twiml.say({ voice: 'Polly.Joanne-Neural', language: 'en-US' }, langChainResponse);
=======
      // Say the LangChain response using Alice's voice
      twiml.say({ voice: 'alice' }, langChainResponse);
>>>>>>> 339f1176c5b5e7dde26cfdc26e21f460a12e73a3

      // Prompt the user to continue the conversation
      const gather = twiml.gather({
        input: 'speech',
        speechTimeout: 'auto',
        action: '/voice',
      });
<<<<<<< HEAD
<<<<<<< HEAD
      gather.say({ voice: 'Polly.Joanne-Neural', language: 'en-US' }, "Please tell me more or ask any questions you may have.");
    } catch (error) {
      console.error('Error processing request:', error);
      twiml.say({ voice: 'Polly.Joanne-Neural', language: 'en-US' }, 'I apologize, but we encountered an issue. Let\'s start over. How can I assist you today?');
=======
      gather.say({ voice: 'alice' }, "Please tell me more or ask any questions you may have.");
=======
      gather.say({ voice: 'alice' });
>>>>>>> 78c51d2f2a2029da6822d60870fc379e5d52c9f7
    } catch (error) {
      console.error('Error processing request:', error);
      twiml.say({ voice: 'alice' }, 'I apologize, but we encountered an issue. Let\'s start over. How can I assist you today?');
>>>>>>> 339f1176c5b5e7dde26cfdc26e21f460a12e73a3
      twiml.redirect('/voice');
    }
  } else {
    // Initial prompt to start the conversation
    const gather = twiml.gather({
      input: 'speech',
      speechTimeout: 'auto',
      action: '/voice',
    });
<<<<<<< HEAD
    gather.say({ voice: 'Polly.Joanne-Neural', language: 'en-US' }, 'Hello, I\'m your nurse for today. How can I assist you? Please describe any symptoms or concerns you\'re experiencing.');
=======
    gather.say({ voice: 'alice' }, 'Hello, I\'m your nurse for today. How can I assist you? Please describe any symptoms or concerns you\'re experiencing.');
>>>>>>> 339f1176c5b5e7dde26cfdc26e21f460a12e73a3
  }

  res.writeHead(200, { 'Content-Type': 'text/xml' });
  res.end(twiml.toString());
});

// Add this new endpoint to handle status callbacks
app.post('/call-status', (req, res) => {
  const callSid = req.body.CallSid;
  const callStatus = req.body.CallStatus;

  console.log(`Call ${callSid} ended with status: ${callStatus}`);

  // Perform cleanup operations
  if (callStatus === 'completed' || callStatus === 'failed' || callStatus === 'busy' || callStatus === 'no-answer') {
    // Clear the conversation memory for this call
    clearConversationMemory(callSid);

    // Optionally, log the call details or save the conversation
    logCallDetails(callSid, callStatus);
  }

  res.sendStatus(200);
});

function clearConversationMemory(callSid) {
  // Implement logic to clear the memory for the specific call
  // This might involve maintaining a map of CallSid to memory instances
  console.log(`Clearing conversation memory for call ${callSid}`);
  // Example: memory.clear(); // Modify this as needed based on your implementation
}

function logCallDetails(callSid, callStatus) {
  // Implement logic to log call details or save the conversation
  console.log(`Logging details for call ${callSid} with final status ${callStatus}`);
  // Example: Save to a database or logging service
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
