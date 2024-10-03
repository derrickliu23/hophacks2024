const express = require('express');
const { ChatOpenAI } = require("@langchain/openai");
const { ChatPromptTemplate } = require("@langchain/core/prompts");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const { OpenAIEmbeddings } = require("@langchain/openai");
const { MemoryVectorStore } = require("langchain/vectorstores/memory");
const Twilio = require('twilio');
const fs = require('fs');
const pdf = require('pdf-parse');
const admin = require('firebase-admin');

process.env.OPENAI_API_KEY = ''
const model = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: "gpt-4-turbo",
  temperature: 0.7,
});

// Initialize Firebase
const serviceAccount = require("C:/Users/benja/Downloads/symptomsync-firebase-adminsdk-fugzi-f6bff711a8.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://symptomsync.firebaseio.com"
});

// Check Firebase connection
admin.firestore().collection('connection_test').add({
  timestamp: admin.firestore.FieldValue.serverTimestamp()
}).then(() => {
  console.log('Successfully connected to Firebase!');
}).catch((error) => {
  console.error('Failed to connect to Firebase:', error);
  process.exit(1);  // Exit the application if we can't connect to Firebase
});

const db = admin.firestore();

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
  conversationHistory: '',
  phoneNumber: ''
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

function isValidNumber(value) {
  return !isNaN(value) && Number.isInteger(Number(value));
}

async function interpretSexAtBirth(userInput) {
  const prompt = `
    Based on the following input, take a best guess to determine if the person is indicating 'male' or 'female' as their sex at birth. Think about whether the word they inputted sounds more like male or female when pronounced.
    If the input really unclear and you have no way of guessing, respond with 'unclear'.
    
    Input: "${userInput}"
    
    Respond with only one word: 'male', 'female', or 'unclear'.
  `;

  try {
    const response = await model.call([
      { role: "system", content: "You are an AI assistant interpreting patient inputs." },
      { role: "user", content: prompt }
    ]);

    const interpretation = response.content.trim().toLowerCase();
    return ['male', 'female'].includes(interpretation) ? interpretation : 'unclear';
  } catch (error) {
    console.error('Error interpreting sex at birth:', error);
    return 'unclear';
  }
}

function getQuestionForInvalidInput(stage) {
  switch (stage) {
    case 'age':
      return "I'm sorry, but the age you provided is not valid. Please provide your age as a number.";
    case 'id':
      return "I'm sorry, but the ID you provided is not valid. Please provide your ID as a number.";
    case 'sexAtBirth':
      return "I'm sorry, but I couldn't determine your sex at birth from that response. Could you please specify either 'male' or 'female'?";
    default:
      return "I'm sorry, but the information you provided is not valid. Could you please try again?";
  }
}

async function handleUserInput(userInput) {
  console.log('Handling user input:', userInput);

  // Check if the current stage requires validation
  if (conversationState.stage === 'age' || conversationState.stage === 'id') {
    if (!isValidNumber(userInput)) {
      const retryQuestion = getQuestionForInvalidInput(conversationState.stage);
      conversationState.conversationHistory += "\nPatient: " + userInput + "\nAI: " + retryQuestion;
      return retryQuestion;
    }
  } else if (conversationState.stage === 'sexAtBirth') {
    const interpretedSex = await interpretSexAtBirth(userInput);
    if (interpretedSex === 'unclear') {
      const retryQuestion = getQuestionForInvalidInput('sexAtBirth');
      conversationState.conversationHistory += "\nPatient: " + userInput + "\nAI: " + retryQuestion;
      return retryQuestion;
    }
    userInput = interpretedSex; // Use the interpreted sex for updating the conversation state
  }

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

  const newPatient = {
    name: conversationState.patientData.name,
    age: age,
    idNumber: conversationState.patientData.id,
    sexAtBirth: conversationState.patientData.sexAtBirth,
    personalInfo: {
      age: age,
      ID: conversationState.patientData.id,
      contact: conversationState.phoneNumber
    },
    symptoms: conversationState.patientData.symptoms,
    transcript: conversationState.conversationHistory.split('\n'),
    summary: summary,
    isUrgent: false
  };

  try {
    await db.collection('patients').add(newPatient);
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
  
  // Capture the caller's phone number
  const callerPhoneNumber = req.body.From;
  
  if (!speechResult) {
    // Initial greeting
    // Store the phone number in the conversation state
    conversationState.phoneNumber = callerPhoneNumber;
    console.log('Caller phone number:', callerPhoneNumber);
    
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