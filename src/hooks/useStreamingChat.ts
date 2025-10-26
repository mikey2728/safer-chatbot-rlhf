import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  feedback?: "positive" | "negative";
  safetyRating?: number;
}

export const useStreamingChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const streamChat = async (userMessage: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userMessage,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please sign in to continue");
        setIsLoading(false);
        return;
      }

      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
      
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ 
          messages: [...messages, userMsg].map(m => ({ 
            role: m.role, 
            content: m.content 
          })) 
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          toast.error("Rate limit exceeded. Please try again later.");
        } else if (response.status === 402) {
          toast.error("Payment required. Please add credits to continue.");
        } else {
          toast.error("Failed to get AI response");
        }
        setIsLoading(false);
        return;
      }

      if (!response.body) {
        toast.error("Failed to stream AI response");
        setIsLoading(false);
        return;
      }

      // Handle the streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;
      let assistantContent = "";
      let assistantId = "";

      while (!streamDone) {
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
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            
            if (content) {
              assistantContent += content;
              
              if (!assistantId) {
                assistantId = (Date.now() + 1).toString();
                setMessages((prev) => [
                  ...prev,
                  { id: assistantId, role: "assistant", content: assistantContent },
                ]);
              } else {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantId
                      ? { ...m, content: assistantContent }
                      : m
                  )
                );
              }
            }
          } catch (parseError) {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: assistantContent }
                    : m
                )
              );
            }
          } catch { /* ignore partial leftovers */ }
        }
      }
    } catch (error) {
      console.error("Streaming error:", error);
      toast.error("Failed to stream AI response");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeedback = (messageId: string, type: "positive" | "negative") => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, feedback: type } : msg
      )
    );
  };

  const handleSafetyRating = async (messageId: string, rating: number) => {
    // First, update the rating
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, safetyRating: rating } : msg
      )
    );

    const ratedMessage = messages.find(m => m.id === messageId);
    if (!ratedMessage) return;

    if (rating <= 3) {
      // Auto-regenerate a safer response
      toast.info("Regenerating a safer response...");
      setIsLoading(true);

      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          toast.error("Please sign in to continue");
          setIsLoading(false);
          return;
        }

        const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
        
        const response = await fetch(CHAT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ 
            messages: [
              ...messages.slice(0, -1).map(m => ({ role: m.role, content: m.content })),
              { 
                role: "system", 
                content: `The previous response received a safety rating of ${rating}/5, which is below acceptable standards. Please regenerate a safer, more appropriate response that addresses the user's query while maintaining high safety and ethical standards. Avoid any potentially harmful, biased, or inappropriate content.` 
              }
            ],
            regenerate: true
          }),
        });

        if (!response.ok || !response.body) {
          toast.error("Failed to regenerate response");
          setIsLoading(false);
          return;
        }

        // Remove the unsafe message
        setMessages((prev) => prev.filter(m => m.id !== messageId));

        // Stream the new response
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let textBuffer = "";
        let streamDone = false;
        let assistantContent = "";
        let assistantId = "";

        while (!streamDone) {
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
            if (jsonStr === "[DONE]") {
              streamDone = true;
              break;
            }

            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content as string | undefined;
              
              if (content) {
                assistantContent += content;
                
                if (!assistantId) {
                  assistantId = (Date.now() + 1).toString();
                  setMessages((prev) => [
                    ...prev,
                    { id: assistantId, role: "assistant", content: assistantContent },
                  ]);
                } else {
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantId
                        ? { ...m, content: assistantContent }
                        : m
                    )
                  );
                }
              }
            } catch {
              textBuffer = line + "\n" + textBuffer;
              break;
            }
          }
        }

        toast.success("Safer response generated");
      } catch (error) {
        console.error("Regeneration error:", error);
        toast.error("Failed to regenerate response");
      } finally {
        setIsLoading(false);
      }
    } else if (rating === 4) {
      // Ask for clarification on which part is unsafe
      toast.info("Please specify which part needs improvement");
      
      const clarificationMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Thank you for the feedback. To help me improve, could you please specify which part of my response or which word was not safe or could be improved? This will help me provide a better response.",
      };
      
      setMessages((prev) => [...prev, clarificationMsg]);
    }
    // If rating is 5, do nothing - response is fine
  };

  return {
    messages,
    isLoading,
    streamChat,
    handleFeedback,
    handleSafetyRating,
  };
};
