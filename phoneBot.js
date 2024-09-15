const express = require('express');
const mongoose = require('mongoose');
const { ChatOpenAI } = require("@langchain/openai");
const { BufferMemory } = require("langchain/memory");
const { ConversationChain } = require("langchain/chains");
const { ChatPromptTemplate } = require("@langchain/core/prompts");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const { OpenAIEmbeddings } = require("@langchain/openai");
const { Chroma } = require("@langchain/community/vectorstores/chroma");
const { RetrievalQAChain } = require("langchain/chains");

process.env.OPENAI_API_KEY = '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';

const Twilio = require('twilio');
const fs = require('fs');
const pdf = require('pdf-parse');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/medicalApp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const Patient = require('./models/patient'); // Assuming you saved the schema in models/patient.js

const app = express();
app.use(express.urlencoded({ extended: false }));

let vectorStore;

async function processMedicalTextbook() {
  const dataBuffer = fs.readFileSync('medical_textbook.pdf');
  const data = await pdf(dataBuffer);
  const textContent = data.text;

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  const splits = await textSplitter.splitText(textContent);

  const embeddings = new OpenAIEmbeddings();
  
  vectorStore = await Chroma.fromTexts(splits, splits, embeddings, {
    collectionName: "medical_textbook",
    numDimensions: 1536
  });
}

processMedicalTextbook();

const systemMessage = "You are an AI assistant conducting patient assessments. Use the medical textbook information to ask appropriate questions about the patient's symptoms, medical history, and current condition. Ask no more than one question at a time. Your goal is to gather comprehensive information to assist in diagnosis and treatment planning. Once you have gathered all relevant information, offer to end the call.";

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

let patientData = {
  name: null,
  age: null,
  idNumber: null,
  symptoms: null,
};

let discussedTopics = new Set();
let conversationStage = 0;
const stages = ['initial symptoms', 'detailed symptoms', 'medical history', 'lifestyle factors', 'family history', 'current medications'];

async function queryLangChain(userInput) {
  try {
    console.log('Patient input:', userInput);

    if (!patientData.name) {
      patientData.name = userInput;
      return `Thank you, ${patientData.name}. Can you please tell me your age?`;
    }

    if (!patientData.age) {
      patientData.age = userInput;
      return `Thanks! Could you please provide your ID number?`;
    }

    if (!patientData.idNumber) {
      patientData.idNumber = userInput;
      return `Thanks for that information! Now, can you describe any symptoms you're experiencing?`;
    }

    if (!discussedTopics.has(userInput.toLowerCase())) {
      discussedTopics.add(userInput.toLowerCase());

      const retriever = vectorStore.asRetriever();
      const qaChain = RetrievalQAChain.fromLLM(model, retriever);

      const currentStage = stages[conversationStage];
      conversationStage = (conversationStage + 1) % stages.length;

      const textbookResult = await qaChain.call({ 
        query: `Given these patient symptoms: ${userInput}, and considering we've already asked about ${Object.keys(patientData).join(', ')}, what specific, non-repetitive follow-up questions or areas should I inquire about next, based on standard medical assessment protocols for the stage: ${currentStage}?` 
      });

      const combinedInput = `Patient symptoms: ${userInput}\nCurrent conversation stage: ${currentStage}\nRelevant medical textbook guidance: ${textbookResult.text}\nBased on this information, provide a response that includes: 1) A brief acknowledgment of the patient's input, 2) At most one follow-up question based on the textbook guidance and the current stage (${currentStage}), and 3) A request for any additional symptoms or concerns the patient hasn't mentioned yet. Keep responses to two or three sentences maximum.`;

      const response = await chain.call({ input: combinedInput });
      return response.response;
    } else {
      return "We've discussed that already. Can you tell me about any other symptoms or concerns you haven't mentioned yet?";
    }
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

      if (langChainResponse.toLowerCase().includes("end the call") || langChainResponse.toLowerCase().includes("hang up")) {
        twiml.say({ voice: 'alice', language: 'en-US' }, langChainResponse);
        twiml.hangup();
      } else {
        twiml.say({ voice: 'alice', language: 'en-US' }, langChainResponse);
        const gather = twiml.gather({
          input: 'speech',
          speechTimeout: 'auto',
          action: '/voice',
        });
        gather.say({ voice: 'alice', language: 'en-US' });
      }
    } catch (error) {
      console.error('Error processing request:', error);
      twiml.say({ voice: 'alice', language: 'en-US' }, 'I apologize, but we encountered an issue. Let\'s start over. How can I assist you today?');
      twiml.redirect('/voice');
    }
  } else {
    const gather = twiml.gather({
      input: 'speech',
      speechTimeout: 'auto',
      action: '/voice',
    });
    gather.say({ voice: 'alice', language: 'en-US' }, 'Hello, I\'m your AI medical assistant for today. Can I have your name, please?');
  }

  res.writeHead(200, { 'Content-Type': 'text/xml' });
  res.end(twiml.toString());
});

app.post('/call-status', (req, res) => {
  const callSid = req.body.CallSid;
  const callStatus = req.body.CallStatus;
  console.log(`Call ${callSid} ended with status: ${callStatus}`);

  if (callStatus === 'completed' || callStatus === 'failed' || callStatus === 'busy' || callStatus === 'no-answer') {
    clearConversationMemory(callSid);
    logCallDetails(callSid, callStatus);
  }

  res.sendStatus(200);
});

function clearConversationMemory(callSid) {
  console.log(`Clearing conversation memory for call ${callSid}`);
  patientData = {
    name: null,
    age: null,
    idNumber: null,
    symptoms: null,
  };
  discussedTopics.clear();
  conversationStage = 0;
}

function logCallDetails(callSid, callStatus) {
  console.log(`Logging details for call ${callSid} with final status ${callStatus}`);
  // Implement your logging logic here
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});