import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface AIConversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface AIMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  image_url: string | null;
  created_at: string;
}

export const useAIConversations = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all conversations
  const fetchConversations = useCallback(async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('ai_conversations')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (!error && data) {
      setConversations(data as AIConversation[]);
    }
  }, [user]);

  // Fetch messages for a specific conversation
  const fetchMessages = useCallback(async (conversationId: string) => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('ai_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setMessages(data as AIMessage[]);
    }
    setIsLoading(false);
  }, []);

  // Create new conversation
  const createConversation = useCallback(async (title?: string): Promise<string | null> => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('ai_conversations')
      .insert({
        user_id: user.id,
        title: title || 'Nouvelle conversation'
      })
      .select()
      .single();

    if (!error && data) {
      const newConversation = data as AIConversation;
      setConversations(prev => [newConversation, ...prev]);
      setCurrentConversationId(newConversation.id);
      setMessages([]);
      return newConversation.id;
    }
    return null;
  }, [user]);

  // Add message to current conversation
  const addMessage = useCallback(async (
    role: 'user' | 'assistant',
    content: string,
    imageUrl?: string | null
  ): Promise<AIMessage | null> => {
    if (!currentConversationId) return null;

    const { data, error } = await supabase
      .from('ai_messages')
      .insert({
        conversation_id: currentConversationId,
        role,
        content,
        image_url: imageUrl || null
      })
      .select()
      .single();

    if (!error && data) {
      const newMessage = data as AIMessage;
      setMessages(prev => [...prev, newMessage]);
      
      // Update conversation title if it's the first user message
      if (role === 'user' && messages.length === 0) {
        const title = content.slice(0, 50) + (content.length > 50 ? '...' : '');
        await supabase
          .from('ai_conversations')
          .update({ title, updated_at: new Date().toISOString() })
          .eq('id', currentConversationId);
        
        setConversations(prev => 
          prev.map(c => c.id === currentConversationId ? { ...c, title } : c)
        );
      } else {
        // Just update the timestamp
        await supabase
          .from('ai_conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', currentConversationId);
      }
      
      return newMessage;
    }
    return null;
  }, [currentConversationId, messages.length]);

  // Update the last assistant message (for streaming)
  const updateLastAssistantMessage = useCallback(async (content: string) => {
    if (!currentConversationId) return;

    // Find the last assistant message
    const lastAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant');
    if (lastAssistantMessage) {
      await supabase
        .from('ai_messages')
        .update({ content })
        .eq('id', lastAssistantMessage.id);
    }
  }, [currentConversationId, messages]);

  // Select a conversation
  const selectConversation = useCallback(async (conversationId: string) => {
    setCurrentConversationId(conversationId);
    await fetchMessages(conversationId);
  }, [fetchMessages]);

  // Delete a conversation
  const deleteConversation = useCallback(async (conversationId: string) => {
    const { error } = await supabase
      .from('ai_conversations')
      .delete()
      .eq('id', conversationId);

    if (!error) {
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      if (currentConversationId === conversationId) {
        setCurrentConversationId(null);
        setMessages([]);
      }
    }
  }, [currentConversationId]);

  // Start new conversation
  const startNewConversation = useCallback(() => {
    setCurrentConversationId(null);
    setMessages([]);
  }, []);

  // Load conversations on mount
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return {
    conversations,
    currentConversationId,
    messages,
    isLoading,
    createConversation,
    addMessage,
    updateLastAssistantMessage,
    selectConversation,
    deleteConversation,
    startNewConversation,
    setMessages,
    fetchConversations
  };
};
