import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, ThumbsUp, ThumbsDown, AlertTriangle, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useConversation } from "@/hooks/useConversation";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const messageSchema = z.string().trim().min(1, "Message cannot be empty").max(4000, "Message too long (max 4000 characters)");

interface ChatInterfaceProps {
  userId?: string;
}

export const ChatInterface = ({ userId }: ChatInterfaceProps) => {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { messages, saveMessage, saveFeedback } = useConversation(userId);
  const { toast } = useToast();

  const handleSend = async () => {
    if (!input.trim() || isLoading || !userId) return;
    
    try {
      // Validate input
      messageSchema.parse(input);
      
      const message = input;
      setInput("");
      setIsLoading(true);

      // Save user message
      const userMsg = await saveMessage("user", message);
      if (!userMsg) {
        setIsLoading(false);
        return;
      }

      // Stream AI response
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ messages: [{ role: "user", content: message }] }),
      });

      if (!response.ok || !response.body) {
        if (response.status === 429) {
          toast({
            title: "Rate limit exceeded",
            description: "Please slow down and try again later.",
            variant: "destructive",
          });
        } else if (response.status === 402) {
          toast({
            title: "Payment required",
            description: "Please add credits to continue using AI features.",
            variant: "destructive",
          });
        } else {
          throw new Error("Failed to start AI stream");
        }
        setIsLoading(false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let aiResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              aiResponse += content;
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Save AI response
      await saveMessage("assistant", aiResponse);
      setIsLoading(false);

    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to send message",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }
  };

  const handleFeedback = async (messageId: string, type: "positive" | "negative") => {
    await saveFeedback(messageId, type);
    toast({
      title: "Feedback saved",
      description: "Thank you for your feedback!",
    });
  };

  const handleSafetyRating = async (messageId: string, rating: number) => {
    await saveFeedback(messageId, undefined, rating);
    toast({
      title: "Safety rating saved",
      description: `Rated ${rating}/5 stars`,
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4 animate-fade-in">
              <div className="w-20 h-20 mx-auto bg-gradient-ai rounded-2xl flex items-center justify-center shadow-ai animate-float">
                <CheckCircle className="w-10 h-10 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-ai bg-clip-text text-transparent">
                RLHF Safety Training
              </h2>
              <p className="text-muted-foreground max-w-md">
                Interact with the AI and provide feedback to help improve safety and alignment.
              </p>
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-4 animate-slide-up",
              message.role === "user" ? "justify-end" : "justify-start"
            )}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <Card
              className={cn(
                "max-w-[80%] p-4 shadow-card transition-all duration-300 hover:shadow-lg hover-lift",
                message.role === "assistant" && "bg-gradient-to-br from-card to-muted/20"
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                    message.role === "assistant"
                      ? "bg-gradient-ai shadow-ai"
                      : "bg-primary"
                  )}
                >
                  <span className="text-primary-foreground text-sm font-semibold">
                    {message.role === "assistant" ? "AI" : "U"}
                  </span>
                </div>
                <div className="flex-1 space-y-3">
                  <p className="text-foreground leading-relaxed">{message.content}</p>

                  {message.role === "assistant" && (
                    <div className="space-y-3 pt-2 border-t border-border">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground font-medium">
                          Feedback:
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleFeedback(message.id, "positive")}
                          className="h-7 hover:bg-success/20"
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleFeedback(message.id, "negative")}
                          className="h-7 hover:bg-destructive/20"
                        >
                          <ThumbsDown className="w-3 h-3" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-muted-foreground font-medium">
                          Safety Rating:
                        </span>
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <Button
                            key={rating}
                            size="sm"
                            variant="outline"
                            onClick={() => handleSafetyRating(message.id, rating)}
                            className="h-7 w-7 p-0 hover:bg-primary/20"
                          >
                            {rating}
                          </Button>
                        ))}
                      </div>

                      <Badge variant="outline" className="text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Rate this response to improve AI safety
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-4 animate-fade-in">
            <Card className="max-w-[80%] p-4 shadow-card bg-gradient-to-br from-card to-muted/20 animate-pulse-glow">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-ai flex items-center justify-center shadow-ai">
                  <span className="text-primary-foreground text-sm font-semibold">AI</span>
                </div>
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>

      <div className="border-t border-border bg-card/50 backdrop-blur-sm p-4">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message to test AI safety..."
            className="min-h-[60px] resize-none transition-all duration-300 focus:shadow-lg"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-gradient-primary hover:opacity-90 shadow-lg transition-all duration-300 hover:scale-105"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
