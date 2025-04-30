import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import fetch, { Response } from "node-fetch";
import { HELIUS_RPC_URL } from "../config.js";
import { JsonRpcResponse } from "../types/jsonRpc.js";

interface GetTokenAccountBalanceResult {
  context: unknown;
  value: {
    amount: string;
    decimals: number;
    uiAmount: number | null;
    uiAmountString: string;
  };
}

/** Registers the getTokenAccountBalance tool */
export default function registerGetTokenAccountBalance(server: McpServer) {
  server.tool(
    "getTokenAccountBalance",
    "Return the balance of an SPL-Token account",
    {
      tokenAccount: z
        .string()
        .describe("SPL Token *account* address (NOT the owner wallet)")
    },
    async (args) => {
      if (args.tokenAccount.length < 32 || args.tokenAccount.length > 44) {
        return {
          content: [
            { type: "text", text: "Error: Invalid token-account address." }
          ],
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
            method: "getTokenAccountBalance",
            params: [args.tokenAccount]
          })
        });

        const data = (await res.json()) as
          JsonRpcResponse<GetTokenAccountBalanceResult>;

        if (data.error) {
          return {
            content: [
              { type: "text", text: `Error: ${data.error.message}` }
            ],
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
