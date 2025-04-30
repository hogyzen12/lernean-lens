import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import fetch, { Response } from "node-fetch";
import { HELIUS_RPC_URL } from "../config.js";
import { JsonRpcResponse } from "../types/jsonRpc.js";

type GetSignaturesForAddressResult = Array<{
  signature: string;
  slot: number;
  err: null | unknown;
  memo: null | string;
  blockTime: number | null;
  confirmationStatus: string;
}>;

export default function registerGetSignaturesForAddress(server: McpServer) {
  server.tool(
    "getSignaturesForAddress",
    "List recent confirmed signatures for a wallet or program id",
    { address: z.string().describe("The account or program id to query") },
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
            method: "getSignaturesForAddress",
            params: [args.address]
          })
        });

        const data = await res.json() as
          JsonRpcResponse<GetSignaturesForAddressResult>;

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
