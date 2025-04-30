import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

/* ── register tools ────────────────────────────── */
import registerGetBalance from "./tools/getBalance.js";
import registerGetTransaction from "./tools/getTransaction.js";
import registerGetSignaturesForAddress from "./tools/getSignaturesForAddress.js";
import registerGetAccountInfo from "./tools/getAccountInfo.js";
import registerGetTokenAccountsByOwner from "./tools/getTokenAccountsByOwner.js";
import registerGetTokenAccountBalance from "./tools/getTokenAccountBalance.js";
import registerParseTransactions from "./tools/parseTransactions.js";
import registerParseTransactionHistory from "./tools/parseTransactionHistory.js";


/* ── MCP server bootstrap ──────────────────────── */
const server = new McpServer({
  name: "solana-tools-server",
  version: "1.1.0",
  capabilities: { tools: {} }
});

/* Add tools */
registerGetBalance(server);
registerGetTransaction(server);
registerGetSignaturesForAddress(server);
registerGetAccountInfo(server);
registerGetTokenAccountsByOwner(server);
registerGetTokenAccountBalance(server);
registerParseTransactions(server);
registerParseTransactionHistory(server);



// --- replace the hello block ---------------------------------------
server.tool(
    "hello",
    "Say hello to the user",
    { name: z.string().describe("The name to greet") },
    async (args) => ({
      content: [
        { type: "text", text: `Hello, ${args.name || "World"}!` }
      ]
    })
  );
  

/* ── start over stdio ──────────────────────────── */
const transport = new StdioServerTransport();
server.connect(transport)
  .then(() => console.error("Server started!"))
  .catch((err) => {
    console.error("Error starting server:", err);
    process.exit(1);
  });
