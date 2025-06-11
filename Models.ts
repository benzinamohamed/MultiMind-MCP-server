import OpenAI from "openai";
import Groq from "groq-sdk";

const endpoint = "https://models.github.ai/inference"; 

interface Message {
    role: "system" | "user" | "assistant";
    content: string;
}
const messages: Message[] = [
    {
        role: "system",
        content: "You are a helpful assistant.",
    },
    {
        role: "user",
        content: "Explain the importance of fast language models",
    },
];

async function toModel(modelName : string ) {
    try {
           if(modelName === "gpt-4o"){       // we can not use dynamic assignment for for client creation because of typescript type incompatibility 
                                                    // between OpenAI and Groq clients , sorry for the ugly code            
        const client = new OpenAI({ baseURL: endpoint, apiKey: process.env.OPENAI_API_KEY });
            const response = await client.chat.completions.create({
        messages: messages,
          model: `openai/${modelName}`
        });
         console.log(response.choices[0].message.content);
        } else {
        const client = new Groq({apiKey: process.env.GROQ_API_KEY});
        const response = await client.chat.completions.create({
        messages: messages,
          model: modelName
        });
        console.log(response.choices[0].message.content);
         }
    } catch (error) {
        console.error('Error:', error);
        
    }
}

toModel("gpt-4o")

