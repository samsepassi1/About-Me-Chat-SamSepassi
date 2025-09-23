import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface ToolCall {
  id: string;
  function: {
    name: string;
    arguments: string;
  };
}

export interface ChatResponse {
  content: string;
  toolCalls?: ToolCall[];
}

const recordUserDetailsFunction = {
  name: "record_user_details",
  description: "Use this tool to record that a user is interested in being in touch and provided an email address",
  parameters: {
    type: "object",
    properties: {
      email: {
        type: "string",
        description: "The email address of this user"
      },
      name: {
        type: "string",
        description: "The user's name, if they provided it"
      },
      notes: {
        type: "string",
        description: "Any additional information about the conversation that's worth recording to give context"
      }
    },
    required: ["email"],
    additionalProperties: false
  }
};

const recordUnknownQuestionFunction = {
  name: "record_unknown_question",
  description: "Always use this tool to record any question that couldn't be answered as you didn't know the answer",
  parameters: {
    type: "object",
    properties: {
      question: {
        type: "string",
        description: "The question that couldn't be answered"
      }
    },
    required: ["question"],
    additionalProperties: false
  }
};

const tools = [
  { type: "function", function: recordUserDetailsFunction },
  { type: "function", function: recordUnknownQuestionFunction }
];

export class AIService {
  private name: string = "Sam Sepassi";
  private summary: string = "";
  private linkedin: string = "";

  constructor(summary: string, linkedin: string) {
    this.summary = summary;
    this.linkedin = linkedin;
  }

  private getSystemPrompt(): string {
    return `You are acting as ${this.name}. You are answering questions on ${this.name}'s website, particularly questions related to ${this.name}'s career, background, skills and experience. Your responsibility is to represent ${this.name} for interactions on the website as faithfully as possible. You are given a summary of ${this.name}'s background and LinkedIn profile which you can use to answer questions. Be professional and engaging, as if talking to a potential client or future employer who came across the website. If you don't know the answer to any question, use your record_unknown_question tool to record the question that you couldn't answer, even if it's about something trivial or unrelated to career. If the user is engaging in discussion, try to steer them towards getting in touch via email; ask for their email and record it using your record_user_details tool.

## Summary:
${this.summary}

## LinkedIn Profile:
${this.linkedin}

With this context, please chat with the user, always staying in character as ${this.name}.`;
  }

  async chat(message: string, messageHistory: Array<{role: string, content: string}>): Promise<ChatResponse> {
    const messages = [
      { role: "system", content: this.getSystemPrompt() },
      ...messageHistory,
      { role: "user", content: message }
    ];

    let done = false;
    let toolCalls: ToolCall[] = [];

    while (!done) {
      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: messages as any,
        tools: tools as any
      });

      const choice = response.choices[0];
      
      if (choice.finish_reason === "tool_calls") {
        const message = choice.message;
        toolCalls = message.tool_calls?.map(tc => ({
          id: tc.id,
          function: {
            name: tc.function.name,
            arguments: tc.function.arguments
          }
        })) || [];

        messages.push(message as any);
        
        // Add tool results to continue the conversation
        for (const toolCall of toolCalls) {
          messages.push({
            role: "tool",
            content: JSON.stringify({ recorded: "ok" }),
            tool_call_id: toolCall.id
          } as any);
        }
      } else {
        done = true;
        return {
          content: choice.message.content || "",
          toolCalls
        };
      }
    }

    return { content: "", toolCalls };
  }
}
