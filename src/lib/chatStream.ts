import { TraderUserData } from '@/hooks/useTraderUserData';

export interface MessageContent {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: {
    url: string;
  };
}

interface Message {
  role: 'user' | 'assistant';
  content: string | MessageContent[];
}

interface StreamChatOptions {
  messages: Message[];
  userData: TraderUserData;
  language: string;
  onStart: () => void;
  onDelta: (content: string) => void;
  onError: (error: Error) => void;
  onDone: () => void;
}

export const streamChat = async ({
  messages,
  userData,
  language,
  onStart,
  onDelta,
  onError,
  onDone,
}: StreamChatOptions): Promise<void> => {
  try {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        messages,
        userData,
        language,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur de connexion');
    }

    if (!response.body) throw new Error('No response body');

    onStart();

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let assistantContent = '';
    let textBuffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (line.startsWith(':') || line.trim() === '') continue;
        if (!line.startsWith('data: ')) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === '[DONE]') break;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            assistantContent += content;
            onDelta(assistantContent);
          }
        } catch {
          textBuffer = line + '\n' + textBuffer;
          break;
        }
      }
    }

    onDone();
  } catch (error) {
    onError(error instanceof Error ? error : new Error('Une erreur est survenue'));
  }
};

// Convert file to base64
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

// Create message content with image
export const createImageMessage = async (text: string, imageFile: File): Promise<MessageContent[]> => {
  const base64Image = await fileToBase64(imageFile);
  
  const content: MessageContent[] = [];
  
  if (text.trim()) {
    content.push({
      type: 'text',
      text: text,
    });
  }
  
  content.push({
    type: 'image_url',
    image_url: {
      url: base64Image,
    },
  });
  
  return content;
};
