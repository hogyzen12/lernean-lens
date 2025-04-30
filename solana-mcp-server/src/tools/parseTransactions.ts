import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import fetch from "node-fetch";
import { HELIUS_API_KEY } from "../config.js";
import { JsonRpcResponse } from "../types/jsonRpc.js";

/** Registers the parseTransactions (POST /v0/transactions) tool */
export default function registerParseTransactions(server: McpServer) {
  server.tool(
    "parseTransactions",
    "Enrich up to 100 Solana transaction signatures",
    {
      transactions: z
        .array(z.string())
        .min(1)
        .max(100)
        .describe("Array of transaction signatures (max 100)"),
      commitment: z
        .enum(["finalized", "confirmed"])
        .optional()
        .describe("Optional commitment level, defaults to finalized")
    },
    async (args) => {
      const url =
        `https://api.helius.xyz/v0/transactions` +
        `?api-key=${HELIUS_API_KEY}` +
        (args.commitment ? `&commitment=${args.commitment}` : "");

      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transactions: args.transactions })
        });

        /** API returns an *array* on success, or an error object */
        const data = (await res.json()) as JsonRpcResponse<unknown> | unknown;

        if (Array.isArray(data)) {
          return {
            content: [
              { type: "text", text: "```json\n" + JSON.stringify(data, null, 2) + "\n```" }
            ]
          };
        } else if ((data as any)?.error) {
          return {
            content: [
              { type: "text", text: `Error: ${(data as any).error}` }
            ],
            isError: true
          };
        } else {
          return {
            content: [
              { type: "text", text: "Unexpected response:\n```json\n" +
                JSON.stringify(data, null, 2) + "\n```" }
            ],
            isError: true
          };
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        return { content: [{ type: "text", text: msg }], isError: true };
      }
    }
  );
}
