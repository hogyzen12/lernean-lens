import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import fetch, { Response } from "node-fetch";
import { HELIUS_RPC_URL } from "../config.js";
import { JsonRpcResponse } from "../types/jsonRpc.js";

type GetTokenAccountsByOwnerResult = {
  context: unknown;
  value: unknown;
};

export default function registerGetTokenAccountsByOwner(server: McpServer) {
  server.tool(
    "getTokenAccountsByOwner",
    "List SPL-token accounts owned by a wallet",
    {
      owner: z.string().describe("Owner wallet address"),
      /** programId filter is optional – defaults to the SPL Token program */
      programId: z.string().optional()
        .describe("Optional SPL ProgramId to filter by (default = Tokenkeg…)"),
      encoding: z
        .enum(["jsonParsed", "base58", "base64", "base64+zstd"])
        .optional()
        .describe("Optional encoding, default jsonParsed")
    },
    async (args) => {
      if (args.owner.length < 32 || args.owner.length > 44) {
        return {
          content: [{ type: "text", text: "Error: Invalid owner address." }],
          isError: true
        };
      }

      const programId =
        args.programId ?? "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";

      try {
        const res: Response = await fetch(HELIUS_RPC_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: "1",
            method: "getTokenAccountsByOwner",
            params: [
              args.owner,
              { programId },
              { encoding: args.encoding ?? "jsonParsed" }
            ]
          })
        });

        const data = await res.json() as
          JsonRpcResponse<GetTokenAccountsByOwnerResult>;

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
