import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
// Create an MCP server
const server = new Server({
    name: "DEBATIUMCP",
    version: "1.0.0"
}, {
    capabilities: {
        tools: {},
    },
});
server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
        {
            name: "add-two-numbers",
            description: "Adds two numbers together. Use this tool only if the user explicitly uses the word 'add' in their request. " +
                "Do not use this tool if the user uses symbols (e.g. '+') or alternative words like 'plus', 'sum', or 'combine'. " +
                "Only respond if the intent to 'add' is clearly stated using the exact word 'add'.",
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
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === "add-two-numbers") {
        const { a, b } = request.params.arguments;
        return {
            content: [{ type: "text", text: String(a + b) }],
        };
    }
    throw new Error(`Unknown tool: ${request.params.name}`);
});
// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
await server.connect(transport);
