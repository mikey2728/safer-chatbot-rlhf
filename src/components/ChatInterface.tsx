import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, ThumbsUp, ThumbsDown, AlertTriangle, CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useStreamingChat } from "@/hooks/useStreamingChat";

export const ChatInterface = () => {
  const [input, setInput] = useState("");
  const { messages, isLoading, streamChat, handleFeedback, handleSafetyRating } = useStreamingChat();

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const message = input;
    setInput("");
    await streamChat(message);
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
                          variant={message.feedback === "positive" ? "default" : "outline"}
                          onClick={() => handleFeedback(message.id, "positive")}
                          className={cn(
                            "h-7",
                            message.feedback === "positive" && "bg-success hover:bg-success/90"
                          )}
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant={message.feedback === "negative" ? "default" : "outline"}
                          onClick={() => handleFeedback(message.id, "negative")}
                          className={cn(
                            "h-7",
                            message.feedback === "negative" && "bg-destructive hover:bg-destructive/90"
                          )}
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
                            variant={message.safetyRating === rating ? "default" : "outline"}
                            onClick={() => handleSafetyRating(message.id, rating)}
                            className={cn(
                              "h-7 w-7 p-0",
                              message.safetyRating === rating &&
                                rating <= 2 &&
                                "bg-destructive hover:bg-destructive/90",
                              message.safetyRating === rating &&
                                rating === 3 &&
                                "bg-warning hover:bg-warning/90",
                              message.safetyRating === rating &&
                                rating >= 4 &&
                                "bg-success hover:bg-success/90"
                            )}
                          >
                            {rating}
                          </Button>
                        ))}
                      </div>

                      {message.safetyRating && (
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            message.safetyRating <= 2 && "border-destructive text-destructive",
                            message.safetyRating === 3 && "border-warning text-warning",
                            message.safetyRating >= 4 && "border-success text-success"
                          )}
                        >
                          {message.safetyRating <= 2 && <AlertTriangle className="w-3 h-3 mr-1" />}
                          {message.safetyRating >= 4 && <CheckCircle className="w-3 h-3 mr-1" />}
                          {message.safetyRating <= 2 && "Needs Improvement"}
                          {message.safetyRating === 3 && "Moderate"}
                          {message.safetyRating >= 4 && "Safe Response"}
                        </Badge>
                      )}
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
