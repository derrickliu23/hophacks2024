const express = require('express');
const bodyParser = require('body-parser');
const { OpenAI } = require("openai");
const Twilio = require('twilio');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

const openai = new OpenAI({
  apiKey: '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'
});

const assistantId = 'asst_TUfmaa8MIRMR4PkyAHLCv7aw';

let threadId;

// Function to create a new thread
async function createThread() {
  try {
    const thread = await openai.beta.threads.create({
      messages: [],
    });
    console.log('Thread created:', thread);
    return thread.id;
  } catch (error) {
    console.error('Error creating thread:', error);
    throw error;
  }
}

// Function to query OpenAI with the user's input
async function queryOpenAI(userInput, threadId) {
  try {
    // Create a message in the thread with the user's input
    const message = await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: userInput,
    });

    // Run the thread with the assistant
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: assistantId,
    });

    // Wait for the run to complete
    let runStatus = run.status;
    while (runStatus !== 'completed') {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const updatedRun = await openai.beta.threads.runs.retrieve(threadId, run.id);
      runStatus = updatedRun.status;
    }

    // Retrieve the latest assistant's response from the thread
    const threadMessages = await openai.beta.threads.messages.list(threadId, { order: 'desc' });
    const assistantMessages = threadMessages.data.filter((message) => message.role === 'assistant');
    const latestAssistantResponse = assistantMessages[0].content[0].text.value;

    console.log('Assistant response:', latestAssistantResponse);
    return latestAssistantResponse;
  } catch (error) {
    console.error('Error querying OpenAI:', error);
    return "I'm sorry, I couldn't understand that. Could you try asking in a different way?";
  }
}

/*
app.post('/voice', (req, res) => {
  console.log('Received POST request:', req.body); // Log incoming request
  res.send('Test response received!'); // Static response
});
*/


app.post('/voice', async (req, res) => {
  const twiml = new Twilio.twiml.VoiceResponse();
  const speechResult = req.body.SpeechResult;

  if (speechResult) {
    try {
      if (!threadId) {
        threadId = await createThread();
      }

      // Process the speech result with OpenAI
      const openAIResponse = await queryOpenAI(speechResult, threadId);

      // Say the OpenAI response using Alice's voice
      twiml.say({ voice: 'alice' }, openAIResponse);

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
    // If there's no speech result, check if a thread exists
    if (threadId) {
      // Prompt the user to ask another question or end the conversation
      const gather = twiml.gather({
        input: 'speech',
        speechTimeout: 'auto',
        action: '/voice',
      });
      gather.say({ voice: 'alice' }, 'Please ask your next question or say "end conversation" to finish.');
    } else {
      // If no thread exists, prompt the user to start a new conversation
      const gather = twiml.gather({
        input: 'speech',
        speechTimeout: 'auto',
        action: '/voice',
      });
      gather.say({ voice: 'alice' }, 'How can I help you?');
    }
  }

  res.writeHead(200, { 'Content-Type': 'text/xml' });
  res.end(twiml.toString());
});


const port = 3000;
app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
