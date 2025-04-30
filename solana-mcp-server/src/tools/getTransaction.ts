import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import fetch, { Response } from "node-fetch";
import { HELIUS_RPC_URL } from "../config.js";
import { JsonRpcResponse } from "../types/jsonRpc.js";

/** We only type the top level we actually use; inner parts stay `unknown` */
interface GetTransactionResult {
  slot: number;
  transaction: unknown;
  meta: unknown;
}

export default function registerGetTransaction(server: McpServer) {
  server.tool(
    "getTransaction",
    "Get full details of a confirmed transaction",
    { signature: z.string().describe("Base-58 transaction signature") },
    async (args) => {
      if (args.signature.length < 32 || args.signature.length > 88) {
        return {
          content: [{ type: "text", text: "Error: Invalid signature length." }],
          isError: true
        };
      }

      try {
        const res: Response = await fetch(HELIUS_RPC_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: "1",
            method: "getTransaction",
            params: [args.signature, "json"]
          })
        });

        const data = await res.json() as JsonRpcResponse<GetTransactionResult>;

        if (data.error) {
          return {
            content: [{ type: "text", text: `Error: ${data.error.message}` }],
            isError: true
          };
        }

        return {
          content: [
            {
              type: "text",
              text:
                "```json\n" +
                JSON.stringify(data.result, null, 2) +
                "\n```"
            }
          ]
        };
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        return { content: [{ type: "text", text: msg }], isError: true };
      }
    }
  );
}
