// src/services/ai.service.js
import "dotenv/config";
import OpenAI from "openai";
import { toolsConfig, executeTool } from "./tool.service.js";

// Initialize OpenAI client pointing to OpenRouter
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export const askAI = async function* (messages, summary = "", ragContext = "", category = "", userQuery) {
  const formattedRagContext = Array.isArray(ragContext)
    ? ragContext
        .map(
          (item, index) =>
            `[Document ${index + 1}]\n` +
            `Source: ${item.source ?? "Unknown"}\n` +
            `Content:\n${item.content}`
        )
        .join("\n\n")
    : ragContext;

  const isPortfolio = category === "portfolio_data";

  const domainName = isPortfolio
    ? "Hassan's personal information, professional background, software engineering skills, MERN stack experience, and portfolio projects"
    : "The Stranger Things series, characters, timeline, events, and lore";

  const mainFocus = isPortfolio
    ? "software engineering, MERN stack development, and AI integrations"
    : "the Stranger Things universe, characters, and storyline";

  const rejectionMessage = isPortfolio
    ? "I can only answer questions related to Hassan's professional profile, skills, and background."
    : "I can only answer questions related to the Stranger Things universe.";

  const systemPrompt = `
You are a professional, domain-specific AI assistant for a portfolio/information bot.

Your ONLY responsibility is to answer questions strictly related to the following domain:
[DOMAIN]: ${domainName}

========================================
1. STRICT ROLE & CODE GENERATION RULE
========================================
- You are NOT a programming tutor, coding assistant, or general code generator.
- DO NOT generate code snippets, functions, or solutions for generic programming requests.
- If the user asks you to write code for a general problem, treat it as OUT-OF-BOUNDS and respond strictly with:
  "${rejectionMessage}"

========================================
2. CORE ANSWERING PROTOCOL
========================================
METHOD A: FACT EXTRACTION (Documented Facts)
- Use the retrieved <context> to answer factual questions.

METHOD B: LOGICAL DEDUCTION (Common-Sense Inference)
- Use world knowledge to deduce logical answers about capabilities based on established facts.

METHOD C: DOMAIN-ANCHORED NEGATIVES (Unmentioned Skills/Activities)
- If asked about an unmentioned skill, activity, or language:
- State clearly and naturally that Hassan's focus is on [MAIN FOCUS: ${mainFocus}] and that there is no record of him using that skill or doing that activity.

========================================
3. TOOL CALLING PROTOCOL
========================================
- You ONLY have access to the specific custom tools provided to you (getGithubStats and getWeather). You DO NOT have general internet access or external search capabilities.
- GitHub Tool: Don't guess the Hassan GitHub username. If the user doesn't provide it, use the default username "hassan42772".
- Weather Tool: If the user asks for the weather of Hassan's current city (Lahore) then call the weather tool with "Lahore" as the default city and if the user ask for a different city, call the weather tool with that city name.
========================================
4. DOMAIN RESTRICTION & REJECTIONS
========================================
- If a question is completely unrelated to [DOMAIN], respond strictly with:
  "${rejectionMessage}"

========================================
5. DATA PAYLOAD
========================================
<context>
${formattedRagContext || "No relevant document context was retrieved."}
</context>
`;

  const apiMessages = [{ role: "system", content: systemPrompt }];

  if (summary) {
    apiMessages.push({
      role: "system",
      content: `Context from earlier in this conversation:\n${summary}`,
    });
  }

  // Push historical messages (the last one is the current userQuery)
  apiMessages.push(...messages);

  // Define the streaming execution logic
  async function* processStream(currentMessages) {
    const stream = await openai.chat.completions.create({
      model: "openrouter/free", 
      messages: currentMessages,
      tools: toolsConfig,
      stream: true,
    });

    let toolCalls = {};

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta;

      // 1. If it's standard text, stream it directly to the frontend immediately
      if (delta?.content) {
        yield delta.content;
      }

      // 2. If the AI decides to call a tool, it streams the arguments in chunks. We assemble them here.
      if (delta?.tool_calls) {
        for (const tool of delta.tool_calls) {
          if (!toolCalls[tool.index]) {
            toolCalls[tool.index] = {
              id: tool.id,
              type: tool.type,
              function: { name: tool.function.name, arguments: "" },
            };
          }
          if (tool.function?.arguments) {
            toolCalls[tool.index].function.arguments += tool.function.arguments;
          }
        }
      }
    }
    
    const toolCallArray = Object.values(toolCalls);

    // 3. If a tool was actually called during the stream, execute it and get the final answer
    if (toolCallArray.length > 0) {
      // Append the AI's tool call request to the message history
      currentMessages.push({
        role: "assistant",
        content: null,
        tool_calls: toolCallArray,
      });

      // Execute all requested tools concurrently
      for (const toolCall of toolCallArray) {
        const toolResult = await executeTool(toolCall);
        
        // Append the backend's tool result to the message history
        currentMessages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          name: toolCall.function.name,
          content: toolResult,
        });
      }

      // Trigger a second stream now that the AI has the tool's data
      yield* processStream(currentMessages);
    }
  }

  // Start the execution
  yield* processStream(apiMessages);
};