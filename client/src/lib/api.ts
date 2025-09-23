import { apiRequest } from "./queryClient";

export interface ChatMessage {
  message: string;
  sessionId: string;
  messageHistory?: Array<{role: string, content: string}>;
}

export interface ContactFormData {
  name?: string;
  email: string;
  message?: string;
}

export const chatApi = {
  sendMessage: async (data: ChatMessage) => {
    const response = await apiRequest("POST", "/api/chat", data);
    return response.json();
  },
  
  getChatHistory: async (sessionId: string) => {
    const response = await apiRequest("GET", `/api/chat/${sessionId}`);
    return response.json();
  }
};

export const contactApi = {
  submit: async (data: ContactFormData) => {
    const response = await apiRequest("POST", "/api/contact", data);
    return response.json();
  }
};
