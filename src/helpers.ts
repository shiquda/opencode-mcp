/**
 * Smart response formatting helpers.
 *
 * Instead of dumping raw JSON to the LLM, these helpers extract the
 * meaningful content from OpenCode API responses so the LLM can reason
 * about them efficiently.
 */

import { z } from "zod";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Shared Zod parameter for project directory targeting.
 * When provided, sent as the x-opencode-directory header so the
 * OpenCode server scopes the request to that project.
 */
export const directoryParam = z
  .string()
  .optional()
  .describe(
    "Absolute path to the project directory. " +
      "When provided, the request targets that project. " +
      "If omitted, the OpenCode server uses its own working directory.",
  );

/**
 * Extract a human-readable summary from a message response.
 * Pulls text content from parts, summarizes tool calls, etc.
 * Accepts any shape — casts internally for safety.
 */
export function formatMessageResponse(response: unknown): string {
  const r = response as any;
  const sections: string[] = [];

  // Omit verbose message header for cleaner output; the caller (opencode_ask etc.)
  // already provides session context.  Keep a minimal role tag only when it adds info.

  if (r?.parts && Array.isArray(r.parts)) {
    for (const part of r.parts) {
      switch (part.type) {
        case "text":
          sections.push(part.text ?? part.content ?? "");
          break;
        case "tool-invocation":
        case "tool-result":
          sections.push(
            `[Tool: ${part.toolName ?? "unknown"}] ${part.error ? `ERROR: ${part.error}` : typeof part.output === "string" ? part.output : JSON.stringify(part.output ?? part.input, null, 2)}`,
          );
          break;
        case "step-start":
        case "step-finish":
          // Internal lifecycle events — omit from user-facing output.
          // Optionally surface cost/token info from step-finish.
          if (part.type === "step-finish" && (part.cost != null || part.tokens)) {
            const meta: string[] = [];
            if (part.cost != null) meta.push(`cost: $${Number(part.cost).toFixed(4)}`);
            if (part.tokens) {
              const t = part.tokens;
              const tokParts: string[] = [];
              if (t.input) tokParts.push(`${t.input} in`);
              if (t.output) tokParts.push(`${t.output} out`);
              if (t.reasoning) tokParts.push(`${t.reasoning} reasoning`);
              if (tokParts.length > 0) meta.push(`tokens: ${tokParts.join(", ")}`);
            }
            if (meta.length > 0) sections.push(`_${meta.join(" | ")}_`);
          }
          break;
        default:
          // Skip unknown internal part types to keep output clean
          if (part.text || part.content) {
            sections.push(part.text ?? part.content);
          }
          // Only dump JSON for truly unknown parts that have meaningful data
          else if (part.type && !["source"].includes(part.type)) {
            sections.push(
              `[${part.type}] ${JSON.stringify(part, null, 2)}`,
            );
          }
      }
    }
  }

  return sections.join("\n\n");
}

/**
 * Format a list of messages, extracting text content from each.
 */
export function formatMessageList(
  messages: unknown[],
): string {
  if (!messages || messages.length === 0) return "No messages found.";

  return messages
    .map((raw, i) => {
      const msg = raw as any;
      const role = msg?.info?.role ?? "unknown";
      const id = msg?.info?.id ?? "?";
      const parts = Array.isArray(msg?.parts) ? msg.parts : [];
      const textParts = parts
        .filter((p: any) => p.type === "text")
        .map((p: any) => p.text ?? p.content ?? "")
        .join("");
      const toolParts = parts.filter(
        (p: any) => p.type === "tool-invocation" || p.type === "tool-result",
      );

      let summary = `--- Message ${i + 1} [${role}] (${id}) ---\n`;
      if (textParts) summary += textParts;
      if (toolParts.length > 0) {
        summary += `\n[${toolParts.length} tool call(s)]`;
      }
      return summary;
    })
    .join("\n\n");
}

/**
 * Format a diff response into a readable summary.
 */
export function formatDiffResponse(diffs: unknown[]): string {
  if (!diffs || diffs.length === 0) return "No changes found.";

  return diffs
    .map((d: unknown) => {
      const diff = d as Record<string, unknown>;
      const path = diff.path ?? diff.file ?? "unknown";
      const status = diff.status ?? diff.type ?? "";
      const additions =
        typeof diff.additions === "number" ? `+${diff.additions}` : "";
      const deletions =
        typeof diff.deletions === "number" ? `-${diff.deletions}` : "";
      const stats = [additions, deletions].filter(Boolean).join(" ");
      let line = `${status} ${path}`;
      if (stats) line += ` (${stats})`;
      if (typeof diff.diff === "string") {
        line += `\n${diff.diff}`;
      }
      return line;
    })
    .join("\n");
}

/**
 * Format session objects for LLM-friendly display.
 */
export function formatSessionList(
  sessions: unknown[],
): string {
  if (!sessions || sessions.length === 0) return "No sessions found.";

  return sessions
    .map((raw) => {
      const s = raw as any;
      const id = s?.id ?? "?";
      const title = s?.title ?? "(untitled)";
      const createdAt = s?.createdAt ?? "";
      const parentID = s?.parentID ? ` (child of ${s.parentID})` : "";
      return `- ${title} [${id}]${parentID}${createdAt ? ` created ${createdAt}` : ""}`;
    })
    .join("\n");
}

/**
 * Generic safe JSON stringify with truncation for very large responses.
 */
export function safeStringify(
  value: unknown,
  maxLength: number = 50000,
): string {
  const json = JSON.stringify(value, null, 2);
  if (json.length <= maxLength) return json;
  return (
    json.slice(0, maxLength) +
    `\n\n... [truncated, ${json.length - maxLength} more characters]`
  );
}

/**
 * Analyze an AI message response for signs of failure:
 *  - Completely empty (null/undefined)
 *  - Has parts but no text content (provider returned nothing)
 *  - Contains error indicators in parts
 *
 * Returns a diagnostic object with `isEmpty`, `hasError`, and `warning` text.
 */
export function analyzeMessageResponse(response: unknown): {
  isEmpty: boolean;
  hasError: boolean;
  warning: string | null;
} {
  if (response === null || response === undefined) {
    return {
      isEmpty: true,
      hasError: false,
      warning:
        "The AI returned an empty response. This usually means the provider " +
        "is not configured or the API key is missing/invalid. " +
        "Use `opencode_setup` to check provider status, or " +
        "`opencode_auth_set` to configure an API key.",
    };
  }

  const r = response as any;
  const parts = Array.isArray(r?.parts) ? r.parts : [];

  // Check for error parts
  const errorParts = parts.filter(
    (p: any) =>
      p.error ||
      (p.type === "tool-result" && p.error) ||
      (typeof p.text === "string" && /\b(error|unauthorized|forbidden|invalid.?key)\b/i.test(p.text)),
  );
  if (errorParts.length > 0) {
    const firstError =
      errorParts[0].error ??
      errorParts[0].text ??
      JSON.stringify(errorParts[0]);
    return {
      isEmpty: false,
      hasError: true,
      warning:
        `The response contains an error: ${typeof firstError === "string" ? firstError : JSON.stringify(firstError)}. ` +
        "This may indicate an authentication issue. " +
        "Use `opencode_auth_set` to verify your API key.",
    };
  }

  // Check if there's any actual text content
  const textContent = parts
    .filter((p: any) => p.type === "text")
    .map((p: any) => (p.text ?? p.content ?? "").trim())
    .join("");

  if (parts.length === 0 || textContent === "") {
    return {
      isEmpty: true,
      hasError: false,
      warning:
        "The AI returned a response with no text content. This usually means " +
        "the provider API key is missing or the model is unavailable. " +
        "Try a different provider/model, or use `opencode_auth_set` to configure credentials.",
    };
  }

  return { isEmpty: false, hasError: false, warning: null };
}

/**
 * Detect if a string value looks like an API key or secret token,
 * regardless of the key name it's stored under.
 */
const SECRET_VALUE_PREFIXES = /^(?:sk-|tvly-|ctx7sk-|pplx-|hf_|ghp_|gho_|ghu_|ghs_|ghr_|xoxb-|xoxp-|xapp-|whsec_|rk-|pk_live_|sk_live_|sk_test_|pk_test_|FLWSECK_|access_|bearer\s)/i;
const LONG_HEX_OR_BASE64 = /^[A-Za-z0-9+/=_-]{32,}$/;

function looksLikeSecret(val: string): boolean {
  if (val.length < 16) return false;
  if (SECRET_VALUE_PREFIXES.test(val)) return true;
  // Long alphanumeric strings without spaces (probable tokens)
  if (LONG_HEX_OR_BASE64.test(val) && !val.includes(" ")) return true;
  return false;
}

/**
 * Redact query-parameter values in a URL string that look like secrets.
 */
function redactUrlSecrets(url: string): string {
  try {
    const parsed = new URL(url);
    let changed = false;
    const sensitiveParamPattern = /(?:key|token|secret|password|credential|auth)/i;
    for (const [name, val] of parsed.searchParams.entries()) {
      if ((sensitiveParamPattern.test(name) && val.length > 8) || looksLikeSecret(val)) {
        parsed.searchParams.set(name, val.slice(0, 4) + "***REDACTED***");
        changed = true;
      }
    }
    return changed ? parsed.toString() : url;
  } catch {
    return url;
  }
}

/**
 * Redact values that look like API keys, tokens, or secrets.
 * Replaces the value with the first 4 characters + "***REDACTED***".
 * Works recursively on objects and arrays.
 *
 * Three layers of detection:
 * 1. Key-name based: key names matching sensitive patterns (KEY, TOKEN, SECRET, etc.)
 * 2. Value-based: string values matching known API key prefixes or long hex/base64 tokens
 * 3. URL-based: query parameters in URL strings that contain secrets
 */
export function redactSecrets(value: unknown): unknown {
  if (value === null || value === undefined) return value;

  if (typeof value === "string") return value;

  if (Array.isArray(value)) {
    return value.map((item) => {
      // Redact string items in arrays that look like secrets (e.g. command args)
      if (typeof item === "string" && looksLikeSecret(item)) {
        return item.slice(0, 4) + "***REDACTED***";
      }
      return redactSecrets(item);
    });
  }

  if (typeof value === "object") {
    const result: Record<string, unknown> = {};
    const sensitiveKeyPattern = /(?:key|token|secret|password|credential|api_key|apikey|auth)/i;
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (typeof v === "string") {
        if (v.length > 8 && sensitiveKeyPattern.test(k)) {
          // Layer 1: key-name match
          result[k] = v.slice(0, 4) + "***REDACTED***";
        } else if (looksLikeSecret(v)) {
          // Layer 2: value looks like a secret
          result[k] = v.slice(0, 4) + "***REDACTED***";
        } else if (v.includes("://") && v.includes("?")) {
          // Layer 3: URL with query params — redact secret params
          result[k] = redactUrlSecrets(v);
        } else {
          result[k] = v;
        }
      } else if (typeof v === "object" && v !== null) {
        result[k] = redactSecrets(v);
      } else {
        result[k] = v;
      }
    }
    return result;
  }

  return value;
}

/**
 * Determine whether a provider object from the OpenCode API is truly configured
 * (i.e. has usable credentials), as opposed to being a built-in default.
 *
 * Detection layers:
 *  - source "env" / "config" / "api" → always configured
 *  - source "custom" with a non-empty apiKey → configured
 *  - source "custom" for "anthropic" with extra option keys (OAuth sets headers) → configured
 *  - Everything else → not configured
 */
export function isProviderConfigured(p: Record<string, unknown>): boolean {
  const source = p.source as string | undefined;
  if (source === "env" || source === "config" || source === "api") return true;
  if (source === "custom") {
    const opts = p.options as Record<string, unknown> | undefined;
    if (typeof opts?.apiKey === "string" && opts.apiKey !== "") return true;
    // Anthropic heuristic: OAuth sets headers but no apiKey
    if (p.id === "anthropic" && opts && Object.keys(opts).some((k) => k !== "apiKey")) return true;
  }
  return false;
}

/**
 * Standard tool response builder.
 */
export function toolResult(text: string, isError = false) {
  return {
    content: [{ type: "text" as const, text }],
    ...(isError ? { isError: true } : {}),
  };
}

export function toolError(e: unknown) {
  const msg = e instanceof Error ? e.message : String(e);
  return toolResult(`Error: ${msg}`, true);
}

export function toolJson(value: unknown) {
  return toolResult(safeStringify(value));
}
