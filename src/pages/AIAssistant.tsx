import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { 
  Send, Bot, User, Loader2, Sparkles, 
  ImagePlus, XCircle, History, Plus, Trash2, ChevronLeft,
  FileText, Music, Video, File, Search, X
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTrades } from '@/hooks/useTrades';
import { useTraderUserData } from '@/hooks/useTraderUserData';
import { useAIConversations } from '@/hooks/useAIConversations';
import { useAuth } from '@/contexts/AuthContext';
import { streamChat, fileToBase64, MessageContent } from '@/lib/chatStream';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import AIMessageFormatter from '@/components/AIMessageFormatter';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string | MessageContent[];
  fileName?: string;
  fileType?: string;
}

// Supported file types
const SUPPORTED_FILE_TYPES = {
  images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/webm'],
  video: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
  documents: ['application/pdf', 'application/json', 'text/csv', 'text/plain', 'application/xml'],
};

const getAllSupportedTypes = () => [
  ...SUPPORTED_FILE_TYPES.images,
  ...SUPPORTED_FILE_TYPES.audio,
  ...SUPPORTED_FILE_TYPES.video,
  ...SUPPORTED_FILE_TYPES.documents,
];

const getFileIcon = (fileType: string) => {
  if (SUPPORTED_FILE_TYPES.images.includes(fileType)) return ImagePlus;
  if (SUPPORTED_FILE_TYPES.audio.includes(fileType)) return Music;
  if (SUPPORTED_FILE_TYPES.video.includes(fileType)) return Video;
  if (SUPPORTED_FILE_TYPES.documents.includes(fileType)) return FileText;
  return File;
};

const AIAssistant: React.FC = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { trades } = useTrades();
  const userData = useTraderUserData(trades);
  const {
    conversations,
    currentConversationId,
    messages: savedMessages,
    createConversation,
    addMessage,
    selectConversation,
    deleteConversation,
    startNewConversation
  } = useAIConversations();

  const [showHistory, setShowHistory] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter conversations based on search query
  const filteredConversations = conversations.filter(conv => 
    conv.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sync saved messages to local state when conversation changes
  useEffect(() => {
    const converted: ChatMessage[] = savedMessages.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.image_url 
        ? [
            { type: 'image_url' as const, image_url: { url: msg.image_url } },
            { type: 'text' as const, text: msg.content }
          ]
        : msg.content
    }));
    setLocalMessages(converted);
  }, [savedMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [localMessages]);

  useEffect(() => {
    if (inputRef.current && !showHistory) {
      inputRef.current.focus();
    }
    if (searchInputRef.current && showHistory) {
      searchInputRef.current.focus();
    }
  }, [showHistory]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const supportedTypes = getAllSupportedTypes();
    if (!supportedTypes.includes(file.type)) {
      console.error('Unsupported file type:', file.type);
      return;
    }

    setSelectedFile(file);
    
    // Create preview for images
    if (SUPPORTED_FILE_TYPES.images.includes(file.type)) {
      const preview = await fileToBase64(file);
      setFilePreview(preview);
    } else {
      setFilePreview(null);
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const createFileMessage = async (text: string, file: File): Promise<{ content: MessageContent[], fileUrl: string }> => {
    const base64Data = await fileToBase64(file);
    
    const content: MessageContent[] = [];
    
    if (text.trim()) {
      content.push({
        type: 'text',
        text: text,
      });
    }
    
    // For images, use image_url format
    if (SUPPORTED_FILE_TYPES.images.includes(file.type)) {
      content.push({
        type: 'image_url',
        image_url: {
          url: base64Data,
        },
      });
    } else {
      // For other files, add description
      content.push({
        type: 'text',
        text: `[Fichier joint: ${file.name} (${file.type})]`,
      });
    }
    
    return { content, fileUrl: base64Data };
  };

  const handleStreamChat = async (userMessage: string, file?: File | null) => {
    if (!user) return;

    let conversationId = currentConversationId;
    
    if (!conversationId) {
      conversationId = await createConversation();
      if (!conversationId) return;
    }

    let messageContent: string | MessageContent[];
    let fileUrl: string | null = null;
    
    if (file) {
      const result = await createFileMessage(userMessage, file);
      messageContent = result.content;
      fileUrl = result.fileUrl;
    } else {
      messageContent = userMessage;
    }
    
    const newMessages: ChatMessage[] = [...localMessages, { 
      role: 'user', 
      content: messageContent,
      fileName: file?.name,
      fileType: file?.type
    }];
    setLocalMessages(newMessages);
    setIsLoading(true);
    clearSelectedFile();

    await addMessage('user', userMessage, fileUrl);

    let assistantContent = '';

    await streamChat({
      messages: newMessages,
      userData,
      language,
      onStart: () => {
        setLocalMessages(prev => [...prev, { role: 'assistant', content: '' }]);
      },
      onDelta: (content) => {
        assistantContent = content;
        setLocalMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content };
          return updated;
        });
      },
      onError: (error) => {
        const errorMsg = `❌ ${error.message}`;
        setLocalMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: errorMsg };
          return updated;
        });
        addMessage('assistant', errorMsg);
      },
      onDone: () => {
        setIsLoading(false);
        if (assistantContent) {
          addMessage('assistant', assistantContent);
        }
      },
    });
  };

  const handleSend = () => {
    if ((!input.trim() && !selectedFile) || isLoading) return;
    const message = input.trim() || (selectedFile ? `Analyse ce fichier: ${selectedFile.name}` : '');
    setInput('');
    handleStreamChat(message, selectedFile);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getMessageText = (content: string | MessageContent[]): string => {
    if (typeof content === 'string') return content;
    const textContent = content.find(c => c.type === 'text');
    return textContent?.text || '';
  };

  const getMessageImage = (content: string | MessageContent[]): string | null => {
    if (typeof content === 'string') return null;
    const imageContent = content.find(c => c.type === 'image_url');
    return imageContent?.image_url?.url || null;
  };

  const handleNewConversation = () => {
    startNewConversation();
    setLocalMessages([]);
    setShowHistory(false);
    setSearchQuery('');
  };

  const handleSelectConversation = async (convId: string) => {
    await selectConversation(convId);
    setShowHistory(false);
    setSearchQuery('');
  };

  const handleDeleteConversation = async (e: React.MouseEvent, convId: string) => {
    e.stopPropagation();
    await deleteConversation(convId);
  };

  const suggestions = [
    t('chat.suggestions.analyzeStats'),
    t('chat.suggestions.dailyTips'),
    t('chat.suggestions.bestSetup'),
  ];

  const dateLocale = language === 'fr' ? fr : enUS;
  const FileIcon = selectedFile ? getFileIcon(selectedFile.type) : File;

  // Helper function to highlight matching text in search results
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() ? (
            <span key={i} className="bg-primary/30 text-primary-foreground rounded px-0.5">
              {part}
            </span>
          ) : (
            part
          )
        )}
      </>
    );
  };

  return (
    <div className="flex flex-col h-full bg-background px-3 sm:px-6">
      {/* Header */}
      <div className="bg-gradient-primary p-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          {showHistory && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowHistory(false)}
              className="text-primary-foreground hover:bg-white/20 -ml-2"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          )}
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-primary-foreground text-sm">
              {showHistory ? t('chat.history') || 'Historique' : 'Smart Trade Kit AI'}
            </h3>
            <p className="text-primary-foreground/70 text-xs">
              {showHistory 
                ? `${conversations.length} conversation${conversations.length > 1 ? 's' : ''}`
                : 'Expert Trading & Application'
              }
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {!showHistory && user && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNewConversation}
                className="text-primary-foreground hover:bg-white/20"
                title="Nouvelle conversation"
              >
                <Plus className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowHistory(true)}
                className="text-primary-foreground hover:bg-white/20"
                title="Historique"
              >
                <History className="w-5 h-5" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      {showHistory ? (
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Search Bar */}
          <div className="p-4 border-b border-border shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une conversation..."
                className="pl-9 pr-9"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {searchQuery && (
              <p className="text-xs text-muted-foreground mt-2">
                {filteredConversations.length} résultat{filteredConversations.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          <ScrollArea className="flex-1 p-4">
            {filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                {searchQuery ? (
                  <>
                    <Search className="w-12 h-12 text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground text-sm">
                      Aucun résultat pour "{searchQuery}"
                    </p>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => setSearchQuery('')}
                      className="mt-2 text-primary"
                    >
                      Effacer la recherche
                    </Button>
                  </>
                ) : (
                  <>
                    <History className="w-12 h-12 text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground text-sm">
                      Aucune conversation
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredConversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv.id)}
                    className={cn(
                      "p-3 rounded-lg cursor-pointer transition-all group",
                      "hover:bg-primary/10 border border-transparent hover:border-primary/20",
                      currentConversationId === conv.id && "bg-primary/10 border-primary/30"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground truncate">
                          {searchQuery ? (
                            // Highlight matching text
                            highlightText(conv.title, searchQuery)
                          ) : (
                            conv.title
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(conv.updated_at), 'PPp', { locale: dateLocale })}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => handleDeleteConversation(e, conv.id)}
                        className="opacity-0 group-hover:opacity-100 h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      ) : (
        <>
          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            {localMessages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <Bot className="w-8 h-8 text-primary" />
                </div>
                <h4 className="font-display font-semibold text-foreground mb-2">
                  {t('chat.greeting')}
                </h4>
                <p className="text-sm text-muted-foreground mb-2">
                  {t('chat.intro')}
                </p>
                <p className="text-xs text-muted-foreground/80 mb-4">
                  💡 Je supporte: Images, PDF, Audio, Vidéo, JSON, CSV...
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {suggestions.map((suggestion) => (
                    <Button
                      key={suggestion}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => {
                        setInput(suggestion);
                        handleStreamChat(suggestion);
                      }}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {localMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "flex gap-2",
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        <Bot className="w-4 h-4 text-primary" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-4 py-3",
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-secondary text-foreground rounded-bl-md'
                      )}
                    >
                      {/* Show image if present */}
                      {getMessageImage(msg.content) && (
                        <img 
                          src={getMessageImage(msg.content)!} 
                          alt="Uploaded" 
                          className="max-w-full rounded-lg mb-2 max-h-40 object-cover"
                        />
                      )}
                      {/* Show file indicator */}
                      {msg.fileName && !getMessageImage(msg.content) && (
                        <div className="flex items-center gap-2 mb-2 text-xs opacity-80">
                          <File className="w-4 h-4" />
                          <span className="truncate">{msg.fileName}</span>
                        </div>
                      )}
                      {/* Show formatted text */}
                      {msg.role === 'assistant' ? (
                        <AIMessageFormatter 
                          text={typeof msg.content === 'string' ? msg.content : getMessageText(msg.content)}
                        />
                      ) : (
                        <p className="text-sm">
                          {(typeof msg.content === 'string' ? msg.content : getMessageText(msg.content)) || (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          )}
                        </p>
                      )}
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && localMessages[localMessages.length - 1]?.role === 'user' && (
                  <div className="flex gap-2 justify-start">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                    <div className="bg-secondary rounded-2xl rounded-bl-md px-4 py-3">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* File Preview */}
          {selectedFile && (
            <div className="px-4 py-2 border-t border-border bg-background/50 shrink-0">
              <div className="relative inline-flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
                {filePreview ? (
                  <img 
                    src={filePreview} 
                    alt="Preview" 
                    className="max-h-16 rounded-lg border border-border"
                  />
                ) : (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileIcon className="w-5 h-5" />
                    <span className="truncate max-w-[200px]">{selectedFile.name}</span>
                  </div>
                )}
                <button
                  onClick={clearSelectedFile}
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-border bg-background shrink-0">
            <div className="flex gap-2">
              <input
                type="file"
                accept={getAllSupportedTypes().join(',')}
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="shrink-0"
                title="Joindre un fichier (Image, PDF, Audio, Vidéo, JSON, CSV)"
              >
                <ImagePlus className="w-4 h-4" />
              </Button>
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={selectedFile ? "Décris ce que tu veux analyser..." : t('chat.placeholder')}
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleSend}
                disabled={(!input.trim() && !selectedFile) || isLoading}
                size="icon"
                className="bg-gradient-primary hover:opacity-90"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AIAssistant;
