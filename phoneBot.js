const express = require('express');
const mongoose = require('mongoose');
const { ChatOpenAI } = require("@langchain/openai");
const { ChatPromptTemplate } = require("@langchain/core/prompts");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const { OpenAIEmbeddings } = require("@langchain/openai");
const { MemoryVectorStore } = require("langchain/vectorstores/memory");
const Twilio = require('twilio');
const fs = require('fs');
const pdf = require('pdf-parse');

process.env.OPENAI_API_KEY = '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';

const model = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: "gpt-4-turbo",
  temperature: 0.7,
});

mongoose.connect('mongodb://localhost:27017/medicalApp', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

const Patient = require('./backend/models/patient');

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
  
  vectorStore = await MemoryVectorStore.fromTexts(splits, splits, embeddings);
  return vectorStore;
}

const stages = [
  'name',
  'age',
  'id',
  'sexAtBirth',
  'symptoms',
  'medical_history',
  'lifestyle',
  'family_history',
  'current_medications',
  'conclusion'
];

let conversationState = {
  stage: stages[0],
  patientData: {},
  discussedTopics: new Set(),
  questionCount: 0,
  conversationHistory: ''
};

const defaultQuestions = {
  name: "What is your name?",
  age: "What is your age?",
  id: "What is your ID number?",
  sexAtBirth: "What is your sex at birth?",
  symptoms: "Please describe your main symptoms."
};

const systemMessage = `You are an AI medical assistant conducting a patient assessment. 
Current conversation stage: {stage}
Patient data so far: {patientData}
Topics discussed: {discussedTopics}

Use this information to ask appropriate questions. Ask one question at a time and avoid repeating topics.
If you encounter concerning or sensitive information, acknowledge it appropriately and redirect to relevant medical questions.`;

const prompt = ChatPromptTemplate.fromMessages([
  ["system", systemMessage],
  ["human", "{input}"],
  ["ai", "{history}"]
]);

async function handleUserInput(userInput) {
  console.log('Handling user input:', userInput);

  updateConversationState(userInput);

  if (conversationState.stage === 'conclusion') {
    return concludeConversation();
  }

  const nextQuestion = getNextQuestion();
  
  if (nextQuestion) {
    conversationState.conversationHistory += "\nPatient: " + userInput + "\nAI: " + nextQuestion;
    return nextQuestion;
  }

  // If we've asked all default questions, proceed with AI-generated questions
  const messages = [
    { role: "system", content: systemMessage.replace('{stage}', conversationState.stage)
                               .replace('{patientData}', JSON.stringify(conversationState.patientData))
                               .replace('{discussedTopics}', Array.from(conversationState.discussedTopics).join(',')) },
    { role: "human", content: conversationState.conversationHistory + "\nPatient: " + userInput }
  ];

  try {
    const response = await model.call(messages);
    conversationState.conversationHistory += "\nPatient: " + userInput + "\nAI: " + response.content;
    conversationState.questionCount++;
    return processResponse(response.content);
  } catch (error) {
    console.error('Error calling ChatOpenAI model:', error);
    return "I'm sorry, but I encountered an error processing your request. Could you please repeat that?";
  }
}


function updateConversationState(userInput) {
  console.log('Updating conversation state with:', userInput);
  
  conversationState.patientData[conversationState.stage] = userInput;
  conversationState.discussedTopics.add(conversationState.stage);
  
  const currentStageIndex = stages.indexOf(conversationState.stage);
  if (currentStageIndex < stages.length - 1) {
    conversationState.stage = stages[currentStageIndex + 1];
  } else {
    conversationState.stage = 'conclusion';
  }
}

function getNextQuestion() {
  if (conversationState.stage in defaultQuestions) {
    return defaultQuestions[conversationState.stage];
  }
  return null;
}

async function concludeConversation() {
  const summary = await extractSummary(conversationState.conversationHistory);

  // Validate and sanitize the patient data
  const age = parseInt(conversationState.patientData.age, 10);
  if (isNaN(age)) {
    console.error('Invalid age provided:', conversationState.patientData.age);
    return "There was an issue with the provided age. Please restart the conversation.";
  }

  const newPatient = new Patient({
    name: conversationState.patientData.name,
    age: age,
    idNumber: conversationState.patientData.id,
    sexAtBirth: conversationState.patientData.sexAtBirth,
    personalInfo: {
      age: age,
      ID: conversationState.patientData.id,
      contact: 'N/A'
    },
    symptoms: conversationState.patientData.symptoms,
    transcript: conversationState.conversationHistory.split('\n'),
    summary: summary,
    isUrgent: false
  });

  try {
    await newPatient.save();
    console.log('Patient data saved:', newPatient);
    return "Thank you for your time. I have gathered enough information for now. Is there anything else you'd like to add before we conclude? If not, please hang up.";
  } catch (error) {
    console.error('Error saving patient data:', error);
    return "An error occurred while saving your data. Please try again later.";
  }
}

async function extractSummary(conversationHistory) {
  const prompt = `
    Based on the following conversation history, extract and summarize the main symptoms mentioned by the patient. 

    Conversation History:
    ${conversationHistory}

    Summary of Symptoms:
  `;

  try {
    const response = await model.call([
      { role: "system", content: "You are an AI medical assistant." },
      { role: "user", content: prompt }
    ]);

    const summary = response.content.trim();
    return summary;
  } catch (error) {
    console.error('Error extracting summary:', error);
    return 'Unable to generate summary at this time.';
  }
}

function processResponse(responseContent) {
  // Customize this function as needed to handle different responses
  return responseContent;
}

app.post('/voice', async (req, res) => {
  console.log('Request body:', req.body);
  const twiml = new Twilio.twiml.VoiceResponse();
  const speechResult = req.body.SpeechResult;

  if (!speechResult) {
    // Initial greeting
    twiml.say({ voice: 'alice', language: 'en-US' }, defaultQuestions.name);
    twiml.gather({
      input: 'speech',
      speechTimeout: 'auto',
      action: '/voice',
    });
  } else {
    try {
      const aiResponse = await handleUserInput(speechResult);
      twiml.say({ voice: 'alice', language: 'en-US' }, aiResponse);

      if (conversationState.stage === 'conclusion') {
        // Wait for user response before hanging up
        const gather = twiml.gather({
          input: 'speech',
          speechTimeout: 'auto',
          action: '/voice',
        });
        gather.say({ voice: 'alice', language: 'en-US' }, 'Is there anything else you would like to discuss before we end the call?');
      } else {
        const gather = twiml.gather({
          input: 'speech',
          speechTimeout: 'auto',
          action: '/voice',
        });
        gather.say({ voice: 'alice', language: 'en-US' }, 'Please continue.');
      }
    } catch (error) {
      console.error('Error processing request:', error);
      twiml.say({ voice: 'alice', language: 'en-US' }, 'I apologize, but we encountered an issue. Let\'s start over. ' + defaultQuestions.name);
      twiml.redirect('/voice');
    }
  }

  res.writeHead(200, { 'Content-Type': 'text/xml' });
  res.end(twiml.toString());
});

app.post('/call-status', async (req, res) => {
  console.log('Call status update received:', req.body);
  const callSid = req.body.CallSid;
  const callStatus = req.body.CallStatus;
  console.log(`Call ${callSid} ended with status: ${callStatus}`);
  
  if (callStatus === 'completed') {
    console.log(`Call ${callSid} has been completed.`);
    // Handle post-call activities here, if any
  } else if (callStatus === 'busy' || callStatus === 'failed') {
    console.log(`Call ${callSid} was not successful.`);
    // Handle busy/failed call scenarios here
  }

  res.sendStatus(200);
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

// Start processing the medical textbook when the server starts
processMedicalTextbook().catch(err => console.error('Error processing medical textbook:', err));

