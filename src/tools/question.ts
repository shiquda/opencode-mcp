/**
 * Question tools — handle OpenCode "question" tool prompts (QuickPick-style).
 *
 * OpenCode exposes HTTP endpoints:
 *   GET  /question/                 -> list pending question requests
 *   POST /question/:requestID/reply -> reply with answers
 *   POST /question/:requestID/reject
 */

import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { OpenCodeClient } from "../client.js";
import { toolResult, toolError, directoryParam } from "../helpers.js";

// Minimal schemas (avoid importing SDK types; keep MCP server self-contained)
const QuestionOption = z.object({
  label: z.string(),
  value: z.string().optional(),
});

const QuestionInfo = z.object({
  question: z.string(),
  options: z.array(QuestionOption).optional(),
  multiple: z.boolean().optional(),
  custom: z.boolean().optional(),
  // There may be other fields; allow passthrough for forward compatibility
}).passthrough();

const QuestionRequest = z.object({
  id: z.string(),
  sessionID: z.string().optional(),
  questions: z.array(QuestionInfo),
  // There may be other fields; allow passthrough for forward compatibility
}).passthrough();

export function registerQuestionTools(server: McpServer, client: OpenCodeClient) {
  server.tool(
    "opencode_question_list",
    "List pending OpenCode question requests (TUI QuickPick-style prompts). Use this when a session is blocked waiting for user selection.",
    {
      directory: directoryParam,
    },
    async ({ directory }) => {
      try {
        const data = await client.get("/question", undefined, directory);
        // data is expected to be an array
        const parsed = z.array(QuestionRequest).safeParse(data);
        if (!parsed.success) {
          // best-effort: return raw JSON
          return toolResult(JSON.stringify(data, null, 2));
        }
        return toolResult(JSON.stringify(parsed.data, null, 2));
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.tool(
    "opencode_question_reply",
    "Reply to a pending question request with answers. answers is an array aligned with questions; each entry is an array of selected strings.",
    {
      requestID: z.string().describe("Question request ID"),
      answers: z
        .array(z.array(z.string()))
        .describe("Answers aligned with questions. Example: [[\"Option A\"], [\"foo\", \"bar\"]]"),
      directory: directoryParam,
    },
    async ({ requestID, answers, directory }) => {
      try {
        await client.post(`/question/${requestID}/reply`, { answers }, { directory });
        return toolResult("Question replied.");
      } catch (e) {
        return toolError(e);
      }
    },
  );

  server.tool(
    "opencode_question_reject",
    "Reject a pending question request.",
    {
      requestID: z.string().describe("Question request ID"),
      directory: directoryParam,
    },
    async ({ requestID, directory }) => {
      try {
        await client.post(`/question/${requestID}/reject`, undefined, { directory });
        return toolResult("Question rejected.");
      } catch (e) {
        return toolError(e);
      }
    },
  );
}
