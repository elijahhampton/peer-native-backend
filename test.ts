//@ts-nocheck
const axios = require('axios')

const TEST_ENDPOINT = 'http://localhost:3001'
const API_GREETING = `${TEST_ENDPOINT}/greeting`
const REPLY_GREETING = `${TEST_ENDPOINT}/reply`

const commonAxiosConfig = {
    method: "POST",
    headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
    }
}

const userResponses = [
    "Actually, I want to help improve politics.",
    "Thank you for speaking with me about politics. What do you think about the democrats?",
    "Okay. What do you think about local government?"
]

interface IGPTResponse {
    suggestion: string;
    response: string;
    error?: string;
}

//@ts-ignore
const conversation = []
const chatGPTConversationCache = []

const PROMPT = process.env.PROMPT + ` "Politics have largely destroyed this country".`
async function main() {
    chatGPTConversationCache.push({ role: 'system', content: PROMPT })

    //send greeting
    axios(`${API_GREETING}`, {   
        ...commonAxiosConfig,
        data: JSON.stringify({ greeting: "Politics have largely destroyed this country." + "\"" }),
    }).then(async (axiosResponse) => {
        const { greetingResponse: { role, content }, originalPrompt } = axiosResponse.data

        const parsedContent = JSON.parse(content)[0]
        const { response, suggestion } = parsedContent

        let error = ""
        if (parsedContent?.error) {
            error = parsedContent.error
        }

        //@ts-ignore
        conversation.push({ role, response, suggestion, error })
        chatGPTConversationCache.push({ role: 'assistant', content })


        for (let i = 0; i < 3; i++) {
            const userResponse = userResponses[i]
            const axiosResponse = await axios(`${REPLY_GREETING}`, {
                ...commonAxiosConfig,
                data: JSON.stringify({
                    userResponse,
                    pastConversation: chatGPTConversationCache
                })
            })

            //thinking...

            //process reply
            const replyResponse = axiosResponse.data.replyResponse
            console.log(replyResponse.content)
            const newContent = String(replyResponse.content).replace(".", "");
            const newRole = replyResponse.role

            //add old convo cache
            chatGPTConversationCache.push({ role: 'user', content: userResponse })
            chatGPTConversationCache.push({ role: newRole, content: newContent })

            let newError = ""
            if (newContent[0]?.error) {
                newError = newContent[0].error
            }

            //add to convo
            conversation.push({ role: 'user', response: userResponse })
            conversation.push({ role: 'system', response: JSON.parse(newContent)[0]?.response, suggestion: JSON.parse(newContent)[0]?.suggestion, error: newError })
        }

        console.log('Conversation Array: ')
        console.log(conversation)

        console.log('Conversation Cache: ')
        console.log(chatGPTConversationCache)
    })
}

main()