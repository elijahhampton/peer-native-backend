require('dotenv').config()
const fs = require('fs')

const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.OPEN_AI_API_KEY
});


const openai = new OpenAIApi(configuration);

const express = require('express')
const app = express()

app.get('/', async (request, response) => {

  const resp = await openai.createTranscription(
    fs.createReadStream("french_girl.mp3"),
    "whisper-1"
  );

  console.log("VIDEO TEXT: ")
  console.log(resp.data)

  const PROMPT = "You are a 26 year old male from New York, New York and you are an expert in the English language including the Bronx accent. You should analyze any text received as if the speaker is a B2 level according to the Common European Framework of Reference for Languages. Can you provide a list of word replacements that the speaker can use to sound more like she was born in the Bronx in New York? Provide this in the form of a list with reasons why the word replacements sound more like someone born in the Bronx? Can you analyze the use of the language and suggest how it can adapted to sound more formal? (Provide this in the form of a list with reasons why the suggestion sounds more formal."

  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: `${PROMPT}` },
      { role: "system", content: `${resp.data}` }
    ],
  });

  console.log('ANALISIS')
  console.log(completion.data.choices[0].message);

  response.json(completion.data.choices[0].message)



})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
