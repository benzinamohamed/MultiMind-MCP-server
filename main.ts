
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ToolSchema,
} from "@modelcontextprotocol/sdk/types.js";

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

server.setRequestHandler(ListToolsRequestSchema , async () => ({
  tools: [
     {
        name: "MultiMind",
        description:
         `
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

  Key Features:
  - LLM1(you) initiates the process with a proposed solution, analysis,tought , or idea
  - LLM1(you) selects a critic From one of these (LLM2, LLM3, etc.) based on criteria like domain knowledge or reasoning style
  - The critic LLM reviews and challenges the initial thought — pointing out flaws, gaps, or alternatives
  - LLM1 revises its original response or defends it with justification
  - The process loops as needed: LLM1 may propose a new thought or escalate to a new critic
  - Ends when LLM1 is confident the solution is refined and defensible

  Parameters Explained:
  - initial_input: The user’s original question or challenge
  - thought: Current proposal, hypothesis, plan, or explanation by LLM1
  - chosen_critic: The LLM selected to critique the current thought
  - critique: A structured response highlighting flaws, assumptions, or improvements
  - revision: LLM1’s response to the critique (can include acceptance, rejection, or compromise)
  - loop_continue: Boolean flag — does LLM1 want to continue the dialogue or finalize the solution?
  - round_number: Current step in the debate (increments with each cycle)
  - solution_ready: Boolean indicating whether LLM1 believes the final answer is reached
  - final_answer: If solution_ready is true, this is the clean output to return

  Usage Protocol:
  1. Start the Dialogue: LLM1 receives initial_input and generates a thoughtful response (hypothesis, plan, etc.)
  2. Choose a Critic: LLM1 selects a secondary agent best suited to evaluate the idea (e.g., by expertise or skepticism)
  3. Receive Critique: The selected critic LLM reviews the thought and issues a structured critique — focusing on logic, assumptions, facts, or alternatives
  4. Revise & Reflect: LLM1 responds by refining its thought, acknowledging valid criticisms, and adjusting its output
  5. Loop or Finalize: If the response still feels incomplete, uncertain, or flawed, LLM1 chooses to loop again — optionally selecting a new critic. If confident in the output, LLM1 sets solution_ready = true and delivers the final answer
  6. End Protocol: Once satisfied, the tool outputs the most refined and justified solution generated during the process

  You should:
  - Begin with a well -reasoned initial idea — even if uncertain
  - Intentionally select critics with different reasoning styles or domains
  - Accept and incorporate valid feedback without blindly agreeing
  - Keep looping if significant gaps remain — don't settle early
  - Mark the end only when confident that the solution is robust
  - Provide one final, clear, polished answer for the user

  Example Use Cases:
  - Designing an architecture for a scalable mobile app
  - Evaluating the ethical dimensions of deploying surveillance tech
  - Debugging an AI algorithm with multiple failure points
  - Planning a community  -based entrepreneurship initiative
  - Creating a startup pitch with both technical and business feasibility
`,
        inputSchema: {
          type: "object",
          properties: {
            a: { type: "number", description: "The first number" },
            b: { type: "number", description: "The second number" },
          },
        },
      }
  ]
    })); 


server.setRequestHandler(
  CallToolRequestSchema,
  async (request) => {
    if (request.params.name === "add-two-numbers") {
      const { a , b } = request.params.arguments as {a : number, b: number};
      return {
        content: [{ type: "text", text: String(a + b) }],
      };
    }
    throw new Error(`Unknown tool: ${request.params.name}`);
  }
);



// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);