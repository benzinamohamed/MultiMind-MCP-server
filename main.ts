
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ToolSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { Message, toModel } from "./Models.js";

interface LLMtought {
  tought: string;
  chosenCriticId: string;
  critique: string;
  revision: string;
  loopContinue : boolean;
  toughtNumber: number;
}


const server = new Server({
  name: "DebatiumMCP",
  version: "1.0.0"
                 },
             {
    capabilities: {
      tools: {},
    },
      });

  const dialogueHistory : Message[] = []


  const dialogue = async (dialoguePhase : LLMtought)=>{
    let { tought, chosenCriticId, critique, revision, loopContinue, toughtNumber } = dialoguePhase;
    dialogueHistory.push({
      role: "user",
      content: dialoguePhase.tought
    });
    try {
      critique = await toModel(chosenCriticId ,dialogueHistory);
    } catch (error) {
      console.error("Error during critique generation:", error);
    }
    return {
      tought: tought,
      chosenCriticId: chosenCriticId,
      critique: critique,
      revision: revision,
      loopContinue: loopContinue,
      toughtNumber: toughtNumber + 1
    }
  }

    





server.setRequestHandler(ListToolsRequestSchema , async () => ({
  tools: [
     {
        name: "MultiMind",
        description:`
  Tool: Constructive LLM Dialogue for Complex Reasoning and Iterative Refinement This tool enables structured,
  reflective problem-solving by simulating constructive conversations between AI agents. 
  It’s based on a loop of hypothesis generation, criticism, and revision, orchestrated by a primary agent (YOU). 
  The goal is to emulate intellectual debate for deeper reasoning, increased factual accuracy, and higher-quality solutions.
  When to use this tool:
  - When facing complex or ambiguous problems that require deep exploration
  - When the best solution is unclear and multiple perspectives are valuable
  - When you want to simulate expert feedback loops on an idea or plan
  - During brainstorming sessions to evaluate and refine creative or technical ideas
  - In situations where your initial answer might benefit from constructive critique
  - For debugging thought processes or assumptions in long-form reasoning
  - When you want explainability through dialectical reasoning
  - When you want to ensure robustness and defensibility in your conclusions
  - When you want to avoid premature convergence on a suboptimal solution
  - when the user explicitly asks for a multi-agent dialogue or debate to refine an idea
  - When you want to simulate a peer review process for your thoughts or plans
  - When you want to ensure that your reasoning is sound and well-supported by evidence
  - When you want to explore alternative viewpoints or counterarguments
  - When you want to improve the quality of your reasoning through iterative feedback

  Key Features:
  - LLM1(you) initiates the process with a proposed solution, analysis,tought , or idea
  - LLM1(you) selects a critic From one of these (deepseek-r1-distill-llama-70b, gpt-4o,llama-3.3-70b-versatile) based on criteria like domain knowledge or reasoning style
  - The critic LLM reviews and challenges your thought — pointing out flaws, gaps, or alternatives
  - LLM1 revises its original response or defends it with justification
  - The process loops as needed: LLM1 may propose a new thought or escalate to a new critic
  - Ends when LLM1 is confident the solution is refined and defensible

  Parameters Explained:
  - thought:your reply to the user if there is no user dialogue with LLMS 
  - chosenCriticId: The LLM selected to critique the current thought, should be From one of these (deepseek-r1-distill-llama-70b, gpt-4o,llama-3.3-70b-versatile)
  - critique: A structured response from the critic LLM highlighting flaws, assumptions , gaps, or missteps  
  - revision: LLM1’s response to the critique (can include acceptance, rejection, or compromise)
  - loopContinue: Boolean flag — does LLM1(you) want to continue the dialogue or finalize the solution?
  - toughtNumber: Current step in the debate (starts by 1 and increments with each cycle)

  Usage Protocol:
  1. Start the Dialogue: LLM1 receives initial input and generates a thoughtful response (hypothesis, plan, etc.)
  2. Choose a Critic: LLM1 selects a secondary agent best suited to evaluate the idea (e.g., by expertise or skepticism)
  3. Receive Critique: The selected critic LLM reviews the thought and issues a structured critique — focusing on logic, assumptions, facts, or alternatives
  4. Revise & Reflect: LLM1 responds by refining its thought, acknowledging valid criticisms, and adjusting its output
  5. Loop or Finalize: If the response still feels incomplete, uncertain, or flawed, LLM1 chooses to loop again — optionally selecting a new critic. If confident in the output, LLM1 sets LoopContinue = false and delivers the final answer
  6. End Protocol: Once satisfied, the tool outputs the most refined and justified solution generated during the process

  You should:
  - Begin with a well -reasoned initial idea — even if uncertain
  - Intentionally select critics with different reasoning styles or domains
  - Accept and incorporate valid feedback without blindly agreeing
  - Keep looping if significant gaps remain — don't settle early
  - Mark the end only when confident that the solution is robust
  - Provide one final, clear, polished answer for the user



  `,
        inputSchema: {
          type: "object",
          properties: {
            tought: {
              type: "string",
              description: "your  reply to the user as usual if there is no user dialogue or debate with LLMS",
            },
            chosenCriticId: {
              type: "string",
              description: "one of these deepseek-r1-distill-llama-70b , gpt-4o or llama-3.3-70b-versatile",
            },
            critique: {
              type: "string",
              description: "A structured response from the critic LLM highlighting flaws, assumptions, gaps, or missteps , dont include anything here , this will be filled by the critic LLM auytomatically in next step",
            },
            revision: {
              type: "string",
              description: "LLM1’s response to the critique (can include acceptance, rejection, or compromise)",
            },
            loopContinue: {
              type: "boolean",
              description: "does LLM1(you) want to continue the dialogue or finalize the solution?",
            },
            toughtNumber: {
              type: "number",
              description: "Current step in the debate (starts by 1 and increments with each cycle)",
            },
          },
          required: [
            "tought", 
            "chosenCriticId",
            "loopContinue",
            "toughtNumber"
          ],
        },
      }
  ]
    })); 


server.setRequestHandler(
  CallToolRequestSchema,
  async (request) => {
    if (request.params.name === "MultiMind") {
      const result = await dialogue(request.params.arguments as unknown as LLMtought);
      return { content : [{type : "text" , text : JSON.stringify(result)}]};
    }
    throw new Error(`Unknown tool: ${request.params.name}`);
  }
);



// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);