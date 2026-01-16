import React from 'react';
import { cn } from '@/lib/utils';

interface AIMessageFormatterProps {
  text: string;
  className?: string;
}

// Format AI response to be clean and structured like ChatGPT
const AIMessageFormatter: React.FC<AIMessageFormatterProps> = ({ text, className }) => {
  // Clean and format the text
  const formatText = (rawText: string): React.ReactNode[] => {
    const lines = rawText.split('\n');
    const elements: React.ReactNode[] = [];
    let listItems: string[] = [];
    let listType: 'numbered' | 'bullet' | null = null;
    let currentIndex = 0;

    const flushList = () => {
      if (listItems.length > 0) {
        if (listType === 'numbered') {
          elements.push(
            <ol key={`list-${currentIndex}`} className="list-decimal list-inside space-y-1 my-2 ml-1">
              {listItems.map((item, i) => (
                <li key={i} className="text-sm leading-relaxed">
                  {formatInlineText(item)}
                </li>
              ))}
            </ol>
          );
        } else {
          elements.push(
            <ul key={`list-${currentIndex}`} className="space-y-1 my-2 ml-1">
              {listItems.map((item, i) => (
                <li key={i} className="text-sm leading-relaxed flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>{formatInlineText(item)}</span>
                </li>
              ))}
            </ul>
          );
        }
        listItems = [];
        listType = null;
        currentIndex++;
      }
    };

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Empty line - flush any pending list and add spacing
      if (!trimmedLine) {
        flushList();
        continue;
      }

      // Check for numbered list (1. 2. etc.)
      const numberedMatch = trimmedLine.match(/^(\d+)\.\s*\*{0,2}(.+?)\*{0,2}$/);
      if (numberedMatch) {
        if (listType !== 'numbered') {
          flushList();
          listType = 'numbered';
        }
        listItems.push(cleanMarkdown(numberedMatch[2] || trimmedLine.substring(trimmedLine.indexOf('.') + 1).trim()));
        continue;
      }

      // Check for bullet points (- or * or •)
      const bulletMatch = trimmedLine.match(/^[-*•]\s*\*{0,2}(.+?)\*{0,2}$/);
      if (bulletMatch) {
        if (listType !== 'bullet') {
          flushList();
          listType = 'bullet';
        }
        listItems.push(cleanMarkdown(bulletMatch[1]));
        continue;
      }

      // Regular paragraph
      flushList();
      const cleanedLine = cleanMarkdown(trimmedLine);
      
      // Check if it's a section header (line ending with :)
      if (cleanedLine.endsWith(':') && cleanedLine.length < 60) {
        elements.push(
          <p key={`header-${currentIndex}`} className="font-semibold text-sm mt-3 mb-1 text-foreground">
            {formatInlineText(cleanedLine)}
          </p>
        );
      } else {
        elements.push(
          <p key={`p-${currentIndex}`} className="text-sm leading-relaxed my-1">
            {formatInlineText(cleanedLine)}
          </p>
        );
      }
      currentIndex++;
    }

    flushList();
    return elements;
  };

  // Clean markdown symbols from text
  const cleanMarkdown = (text: string): string => {
    return text
      // Remove bold/italic markers (**, *, ***, __)
      .replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1')
      .replace(/_{1,2}([^_]+)_{1,2}/g, '$1')
      // Remove code backticks
      .replace(/`([^`]+)`/g, '$1')
      // Remove headers (#)
      .replace(/^#{1,6}\s+/gm, '')
      // Clean up extra spaces
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Format inline text (emojis, emphasis via color)
  const formatInlineText = (text: string): React.ReactNode => {
    // Already cleaned, just return as text
    return text;
  };

  return (
    <div className={cn("ai-message-content", className)}>
      {formatText(text)}
    </div>
  );
};

export default AIMessageFormatter;
