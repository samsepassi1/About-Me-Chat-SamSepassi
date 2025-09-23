import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import WelcomeCard from "./welcome-card";

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hi! I'm Sam's AI assistant. I can answer questions about his cybersecurity experience, skills, certifications, and career background. What would you like to know?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [sessionId] = useState(() => crypto.randomUUID());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const messageHistory = messages
        .filter(m => m.sender === 'user' || m.sender === 'ai')
        .map(m => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.content
        }));

      const response = await apiRequest("POST", "/api/chat", {
        message,
        sessionId,
        messageHistory
      });
      return response.json();
    },
    onSuccess: (data) => {
      const aiMessage: Message = {
        id: crypto.randomUUID(),
        content: data.response,
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    const message = inputValue.trim();
    if (!message || chatMutation.isPending) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      content: message,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    chatMutation.mutate(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 96) + 'px';
  };

  const handleSuggestedMessage = (message: string) => {
    setInputValue(message);
    setTimeout(() => handleSendMessage(), 100);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      <WelcomeCard onSuggestedMessage={handleSuggestedMessage} />
      
      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        {/* Chat Messages Container */}
        <div className="chat-container overflow-y-auto scrollbar-thin p-4" style={{ height: 'calc(100vh - 160px)', minHeight: '400px' }}>
          {messages.map((message) => (
            <div key={message.id} className={`flex items-start space-x-3 mb-4 message-bubble ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              {message.sender === 'ai' && (
                <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-robot text-white text-sm"></i>
                </div>
              )}
              
              <div className="flex-1">
                <div className={`rounded-lg p-3 max-w-md ${
                  message.sender === 'user' 
                    ? 'bg-primary text-primary-foreground ml-auto' 
                    : 'bg-muted'
                }`}>
                  <p className={`text-sm ${message.sender === 'user' ? 'text-primary-foreground' : 'text-foreground'}`}>
                    {message.content}
                  </p>
                </div>
                {message.sender === 'ai' && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatTime(message.timestamp)}
                  </div>
                )}
              </div>

              {message.sender === 'user' && (
                <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-user text-muted-foreground text-sm"></i>
                </div>
              )}
            </div>
          ))}

          {chatMutation.isPending && (
            <div className="flex items-start space-x-3 mb-4">
              <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                <i className="fas fa-robot text-white text-sm"></i>
              </div>
              <div className="flex-1">
                <div className="bg-muted rounded-lg p-3 max-w-md">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full typing-indicator"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full typing-indicator" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full typing-indicator" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="border-t border-border p-4">
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <textarea 
                ref={textareaRef}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask about Sam's experience, skills, or background..."
                className="w-full px-4 py-3 border border-input rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                rows={1}
                disabled={chatMutation.isPending}
                data-testid="input-message"
              />
            </div>
            <button 
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || chatMutation.isPending}
              className="bg-primary text-primary-foreground px-4 py-3 rounded-lg hover:bg-primary/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="button-send"
            >
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            <i className="fas fa-info-circle mr-1"></i>
            Powered by OpenAI GPT-5 • Press Shift+Enter for new line
          </div>
        </div>
      </div>
    </div>
  );
}
