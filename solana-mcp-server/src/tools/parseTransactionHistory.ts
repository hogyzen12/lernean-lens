import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import fetch from "node-fetch";
import { HELIUS_API_KEY } from "../config.js";

/** Registers the parseTransactionHistory (GET /v0/addresses/{address}/transactions) tool */
export default function registerParseTransactionHistory(server: McpServer) {
  server.tool(
    "parseTransactionHistory",
    "Get enriched tx history for an address",
    {
      address: z.string().describe("Wallet or program address"),
      before: z.string().optional().describe("Paginate: start *before* this signature"),
      until:  z.string().optional().describe("Stop at this signature (inclusive)"),
      commitment: z
        .enum(["finalized", "confirmed"])
        .optional()
        .describe("Commitment level (default finalized)"),
      source: z.string().optional().describe("Filter by transaction source"),
      type: z.string().optional().describe("Filter by transaction type"),
      limit: z.number().int().min(1).max(100).optional()
        .describe("Max # of txs to return (1–100, default 100)")
    },
    async (args) => {
      const search = new URLSearchParams({ "api-key": HELIUS_API_KEY });

      if (args.before)      search.append("before", args.before);
      if (args.until)       search.append("until", args.until);
      if (args.commitment)  search.append("commitment", args.commitment);
      if (args.source)      search.append("source", args.source);
      if (args.type)        search.append("type", args.type);
      if (args.limit)       search.append("limit", String(args.limit));

      const url =
        `https://api.helius.xyz/v0/addresses/${args.address}/transactions?` +
        search.toString();

      try {
        const res = await fetch(url);
        const data = await res.json();               // array on success

        if (Array.isArray(data)) {
          return {
            content: [
              { type: "text", text: "```json\n" + JSON.stringify(data, null, 2) + "\n```" }
            ]
          };
        }
        return {
          content: [
            { type: "text", text: "Unexpected response:\n```json\n" +
              JSON.stringify(data, null, 2) + "\n```" }
          ],
          isError: true
        };
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        return { content: [{ type: "text", text: msg }], isError: true };
      }
    }
  );
}
