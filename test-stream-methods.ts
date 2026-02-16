import { streamText } from "ai";
import { getModel } from "./src/lib/llm/provider";

async function testStreamMethods() {
  const result = streamText({
    model: getModel(),
    prompt: "Say hello",
  });

  console.log("Available methods on streamText result:");
  console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(result)));

  // Check for specific methods
  const methods = [
    'toTextStreamResponse',
    'toDataStreamResponse',
    'toAIStreamResponse',
    'toResponse',
  ];

  methods.forEach(method => {
    console.log(`${method}: ${typeof (result as any)[method]}`);
  });
}

testStreamMethods();
