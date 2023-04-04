const venom = require('venom-bot');

const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
  apiKey: process.env.apiKeyOpenAI,
});
const openai = new OpenAIApi(configuration);

const express = require('express')
const server = express()
const PORT = process.env.PORT || 3030
const history = [];

//Creating client 
venom.create({
  session: 'Mateo',
  multidevice: true
}).then((client) => start(client)).catch((erro) => {
  console.log(erro);
});

server.listen(PORT, () => {
  console.log('server listen at ${PORT}')
})

async function start(client) {
  console.log("ChatMIND is started!")
  try {
    client.onMessage(async (message) => {
      try {
        const response = await getResponse(message.body); //waiting for response to be resolved
        client.sendText(message.from, response); //sending response to user

        console.log('Result: ', response.data);
      } catch (error) {
        console.error('Error getting response: ', error);
      }
    });
  } catch(erro) {
    console.log("Error on event message: ", erro)
  }
}
function getResponse(message) {

  const user_input = message;

  const messages = [];

  //Get messages from history and push it on messages
  for (const [input_text, completion_text] of history) {
      messages.push({ role: "user", content: input_text });
      messages.push({ role: "assistant", content: completion_text });
  }

  messages.push({ role: "user", content: user_input }); //push new message to array

  //return new promise with the openai request finished in resolve case
  return new Promise((resolve, reject) => {

    const completion = openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: messages,
      }).then((completion) => {

        const completion_text = completion.data.choices[0].message.content;
        history.push([user_input, completion_text]);
        resolve(completion_text)
        
      }).catch((error) => {
        reject(error)
      })

    })
}