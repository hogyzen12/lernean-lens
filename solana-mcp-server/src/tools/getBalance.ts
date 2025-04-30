import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import fetch, { Response } from "node-fetch";
import { HELIUS_RPC_URL } from "../config.js";
import { JsonRpcResponse } from "../types/jsonRpc.js";

interface GetBalanceResult { value: number; }

export default function registerGetBalance(server: McpServer) {
  server.tool(
    "getBalance",
    "Get the SOL balance of a wallet address",
    { address: z.string().describe("The Solana wallet address") },
    async (args) => {
      if (args.address.length < 32 || args.address.length > 44) {
        return {
          content: [{ type: "text", text: "Error: Invalid wallet address." }],
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
            method: "getBalance",
            params: [args.address]
          })
        });

        const data = await res.json() as JsonRpcResponse<GetBalanceResult>;

        if (data.error) {
          return {
            content: [{ type: "text", text: `Error: ${data.error.message}` }],
            isError: true
          };
        }
        const lamports = data.result!.value;
        const sol = lamports / 1_000_000_000;

        return {
          content: [
            { type: "text",
              text: `Wallet ${args.address} has ${sol.toFixed(9)} SOL (${lamports} lamports)` }
          ]
        };
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        return { content: [{ type: "text", text: msg }], isError: true };
      }
    }
  );
}
