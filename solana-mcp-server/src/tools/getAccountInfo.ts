import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import fetch, { Response } from "node-fetch";
import { HELIUS_RPC_URL } from "../config.js";
import { JsonRpcResponse } from "../types/jsonRpc.js";

/** We don’t need the full shape – keep it loose */
interface GetAccountInfoResult { context: unknown; value: unknown; }

export default function registerGetAccountInfo(server: McpServer) {
  server.tool(
    "getAccountInfo",
    "Fetch full account info for a given pubkey",
    {
      address: z.string().describe("Account public key"),
      encoding: z
        .enum(["base58", "base64", "base64+zstd", "jsonParsed"])
        .optional()
        .describe("Optional data encoding, default base58")
    },
    async (args) => {
      if (args.address.length < 32 || args.address.length > 44) {
        return {
          content: [{ type: "text", text: "Error: Invalid address length." }],
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
            method: "getAccountInfo",
            params: [
              args.address,
              { encoding: args.encoding ?? "base58" }
            ]
          })
        });

        const data = await res.json() as
          JsonRpcResponse<GetAccountInfoResult>;

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
              text: "```json\n" + JSON.stringify(data.result, null, 2) + "\n```"
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
