import { generateText } from "ai";
import { getModel } from "./src/lib/llm/provider";

async function testLLM() {
  console.log("🧪 Testing LLM Provider Setup...\n");

  try {
    console.log("📋 Config:");
    console.log(`  Provider: ${process.env.LLM_PROVIDER || "anthropic"}`);
    console.log(`  Model: ${process.env.LLM_MODEL || "claude-sonnet-4-20250514"}`);
    console.log(`  API Key: ${process.env.ANTHROPIC_API_KEY ? "✅ Set" : "❌ Missing"}\n`);

    console.log("🔄 Calling Claude API...");
    const { text } = await generateText({
      model: getModel(),
      prompt: "Say 'Hello from Claude!' in exactly 3 words.",
    });

    console.log("\n✅ Success! Claude responded:");
    console.log(`  Response: "${text}"\n`);

    console.log("✅ Your LLM setup is working correctly!");
    console.log("The issue is likely in the chat endpoint or client-side code.\n");

  } catch (error) {
    console.error("\n❌ LLM Test Failed:");
    if (error instanceof Error) {
      console.error(`  Error: ${error.message}`);
      if (error.message.includes("API key")) {
        console.error("\n💡 Fix: Check your ANTHROPIC_API_KEY in .env.local");
      }
    } else {
      console.error(error);
    }
    console.log();
    process.exit(1);
  }
}

testLLM();
