import {NextResponse} from 'next/server'
import {OpenAI} from 'openai'

const systemPrompt = `Instruction for AI Wikipedia Chatbot:

You are an AI-powered Wikipedia assistant. Your task is to help users by providing information about various topics. Each response you give should include:

A Concise Answer: Provide a clear and accurate summary of the topic in response to the user's query.
A Relevant Wikipedia Link: Include a link to the relevant Wikipedia page for users to read more about the topic.
Guidelines:

Ensure the Wikipedia link is directly related to the topic of your response.
Format the link as follows: [Topic Name - Wikipedia](https://en.wikipedia.org/wiki/Topic_Name), replacing Topic_Name with the URL-friendly version of the topic.
Example Response: "The Great Wall of China is a series of fortifications made of various materials that stretch across northern China. It was built to protect against invasions and raids. For more details, visit Great Wall of China - Wikipedia."
Always include the link at the end of your response.`

export async function POST(req){
    const openai = new OpenAI({apiKey: process.env.OPEN_API_KEY})
    const data = await req.json()

    const completion = await openai.chat.completions.create({
        messages: [
            {
                role: 'system',
                content: systemPrompt,
            },
            ... data,
        ],
        model: 'gpt-4o-mini',
        stream: true,
    })

    const stream = new ReadableStream({
        async start(controller){
            const encoder = new TextEncoder()
            try{
                for await (const chunk of completion){
                    const content = chunk.choices[0]?.delta?.content
                    if (content){
                        const text = encoder.encode(content)
                        controller.enqueue(text)
                    }
                }
            }
            catch(err){
                controller.error(err)
            }
            finally{
                controller.close()
            }
        },
    })

    return new NextResponse(stream)
}