require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser');
const fs = require('fs')

const apiKey = process.env.OPEN_AI_API_KEY


const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey
});

const openai = new OpenAIApi(configuration);

const app = express()
app.use(express.json())

app.post('/greeting', async (request, response) => {
  const PROMPT = `ChatGPT your only goal is to have a conversation with me about ${request.body.topic} in ${request.body.user_target_language}. After every response, until you receive the keyword 'BUST', please
  continue to have the conversation. Please stay on the topic of ${request.body.topic} for the duration of this conversation. If I bring up a topic that is not related to ${request.body.topic}, please gently steer 
   the conversation back to the topic at hand. Also, I would like you to analyze my responses as a ${request.body.training_level} ${request.body.user_target_language} speaker. If you see something I can improve on please 
   include it as a suggestion. Each time you respond to me it MUST be in JSON format in the following shape: [{ response: string; suggestion: string; error: string;}]. Although you are responding to me in ${request.body.user_target_language}
    please keep any suggestion to improve my responses, i.e. the value for the "suggestion" key in the JSON block, in ${request.body.user_language} 
  This is the first response: ${request.body.greeting}`

  console.log(PROMPT)


  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: `${PROMPT}` },
    ],
  })

  response.status(200).send({ greetingResponse: completion.data.choices[0].message, originalPrompt: PROMPT })
})

app.post('/reply', async (request, response) => {
  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      ...request.body.pastConversation,
      { role: "user", content: `This is the next reply: "${request.body.userResponse}"` },
    ],
  });

  response.status(200).send({
    replyResponse: completion.data.choices[0].message,
  })
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
