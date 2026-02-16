import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";

const providers = {
  anthropic,
  openai,
  google,
} as const;

type ProviderKey = keyof typeof providers;

export function getModel() {
  const providerKey = (process.env.LLM_PROVIDER || "anthropic") as ProviderKey;
  const modelId = process.env.LLM_MODEL || "claude-sonnet-4-20250514";
  const provider = providers[providerKey];

  if (!provider) {
    throw new Error(
      `Unknown LLM provider: ${providerKey}. Valid: ${Object.keys(providers).join(", ")}`
    );
  }

  return provider(modelId);
}
