const express = require('express');
const { ChatOpenAI } = require("@langchain/openai");
const { BufferMemory } = require("langchain/memory");
const { ConversationChain } = require("langchain/chains");
const { ChatPromptTemplate } = require("@langchain/core/prompts");
const Twilio = require('twilio');

const app = express();
app.use(express.urlencoded({ extended: false }));

// Define the assistant's role and instructions
const systemMessage = "Ask targeted questions about the patient's symptoms, medical history, and current condition. Your goal is to gather comprehensive information to assist in diagnosis and treatment planning. Limit your responses to 2-3 sentences. Once you have gathered all relevant information, offer to hang up the call.";

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

// Track patient data for the conversation
let patientData = {
  name: null,
  age: null,
  idNumber: null,
  symptoms: null,
  loopCount: 0 // Track potential loops
};

async function queryLangChain(userInput) {
  try {
    console.log('Patient input:', userInput);

    // Check if we already have collected the patient's name
    if (!patientData.name) {
      patientData.name = userInput;
      return `Thank you. Can you please tell me your age?`;
    }

    // Check if we already have collected the patient's age
    if (!patientData.age) {
      patientData.age = userInput;
      return `Thanks! Could you please provide your ID number?`;
    }

    // Check if we already have collected the patient's ID number
    if (!patientData.idNumber) {
      patientData.idNumber = userInput;
      return `Thanks for that information! Now, can you describe any symptoms you're experiencing?`;
    }

    // After collecting name, age, and ID number, move on to symptoms
    if (!patientData.symptoms) {
      patientData.symptoms = userInput;
      return `Thank you for sharing your symptoms. Let's continue. How long have you been experiencing these symptoms?`;
    }

    // Check if the conversation is looping
    if (userInput.toLowerCase().includes(patientData.symptoms.toLowerCase())) {
      patientData.loopCount++;
    }

    // End the call if a loop is detected (e.g., repeated symptoms question)
    if (patientData.loopCount >= 2) {
      return `It seems we have covered everything. Thank you for your time. I will now hang up. Have a great day!`;
    }

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
      const langChainResponse = await queryLangChain(speechResult);

      // If the assistant indicates that the call should end
      if (langChainResponse.includes("I will now hang up")) {
        twiml.say({ voice: 'alice' }, langChainResponse);
        twiml.hangup(); // Hang up the call politely
      } else {
        // Continue the conversation
        twiml.say({ voice: 'alice' }, langChainResponse);

        const gather = twiml.gather({
          input: 'speech',
          speechTimeout: 'auto',
          action: '/voice',
        });
        gather.say({ voice: 'alice' });
      }
    } catch (error) {
      console.error('Error processing request:', error);
      twiml.say({ voice: 'alice' }, 'I apologize, but we encountered an issue. Let\'s start over. How can I assist you today?');
      twiml.redirect('/voice');
    }
  } else {
    const gather = twiml.gather({
      input: 'speech',
      speechTimeout: 'auto',
      action: '/voice',
    });
    gather.say({ voice: 'alice' }, 'Hello, I\'m your nurse for today. Can I have your name, please?');
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
    clearConversationMemory(callSid);

    logCallDetails(callSid, callStatus);
  }

  res.sendStatus(200);
});

function clearConversationMemory(callSid) {
  console.log(`Clearing conversation memory for call ${callSid}`);
}

function logCallDetails(callSid, callStatus) {
  console.log(`Logging details for call ${callSid} with final status ${callStatus}`);
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
