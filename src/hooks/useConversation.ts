import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export const useConversation = (userId: string | undefined) => {
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const { toast } = useToast();

  // Create or get latest conversation
  useEffect(() => {
    if (!userId) return;

    const getOrCreateConversation = async () => {
      // Try to get the latest conversation
      const { data: conversations, error: fetchError } = await supabase
        .from('conversations')
        .select('id')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .limit(1);

      if (fetchError) {
        console.error('Error fetching conversation:', fetchError);
        return;
      }

      if (conversations && conversations.length > 0) {
        setConversationId(conversations[0].id);
      } else {
        // Create new conversation
        const { data: newConv, error: createError } = await supabase
          .from('conversations')
          .insert({ user_id: userId, title: 'New Conversation' })
          .select()
          .single();

        if (createError) {
          console.error('Error creating conversation:', createError);
          toast({
            title: "Error",
            description: "Failed to create conversation",
            variant: "destructive",
          });
        } else {
          setConversationId(newConv.id);
        }
      }
    };

    getOrCreateConversation();
  }, [userId, toast]);

  // Load messages for conversation
  useEffect(() => {
    if (!conversationId) return;

    const loadMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading messages:', error);
      } else {
        setMessages((data || []).map(msg => ({
          id: msg.id,
          role: msg.role as "user" | "assistant",
          content: msg.content,
          created_at: msg.created_at
        })));
      }
    };

    loadMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  const saveMessage = async (role: "user" | "assistant", content: string) => {
    if (!conversationId) return null;

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role,
        content,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving message:', error);
      toast({
        title: "Error",
        description: "Failed to save message",
        variant: "destructive",
      });
      return null;
    }

    return data;
  };

  const saveFeedback = async (
    messageId: string,
    feedbackType?: "positive" | "negative",
    safetyRating?: number,
    notes?: string
  ) => {
    if (!userId) return;

    const { error } = await supabase
      .from('feedback')
      .upsert({
        message_id: messageId,
        user_id: userId,
        feedback_type: feedbackType,
        safety_rating: safetyRating,
        notes,
      }, {
        onConflict: 'message_id,user_id',
      });

    if (error) {
      console.error('Error saving feedback:', error);
      toast({
        title: "Error",
        description: "Failed to save feedback",
        variant: "destructive",
      });
    }
  };

  return {
    conversationId,
    messages,
    saveMessage,
    saveFeedback,
  };
};