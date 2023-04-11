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
  const PROMPT = process.env.PROMPT + ` "${request.body.greeting}"`

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
