import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { MarkdownContent } from "./MarkdownContent";
import { useState, useEffect } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  images?: string[];
  isTyping?: boolean;
}

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === "user";
  const [displayedContent, setDisplayedContent] = useState("");
  const [isTypingEffect, setIsTypingEffect] = useState(message.isTyping && !isUser);

  useEffect(() => {
    if (!isUser && message.isTyping) {
      setIsTypingEffect(true);
      setDisplayedContent("");
      let index = 0;
      const interval = setInterval(() => {
        setDisplayedContent(message.content.slice(0, index));
        index++;
        if (index > message.content.length) {
          clearInterval(interval);
          setIsTypingEffect(false);
        }
      }, 10);
      return () => clearInterval(interval);
    } else {
      setDisplayedContent(message.content);
    }
  }, [message.content, message.isTyping, isUser]);

  return (
    <div
      className={cn(
        "flex gap-4 transition-smooth animate-in fade-in slide-in-from-bottom-4 duration-500",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <Avatar className={cn("h-8 w-8 shrink-0", isUser ? "bg-muted" : "gradient-primary shadow-glow animate-pulse")}>
        <AvatarFallback>
          {isUser ? (
            <User className="h-4 w-4" />
          ) : (
            <Bot className="h-4 w-4 text-primary-foreground" />
          )}
        </AvatarFallback>
      </Avatar>

      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 transition-smooth",
          isUser
            ? "bg-muted/30 border border-muted"
            : "bg-card/50 border border-primary/20 shadow-lg shadow-primary/5"
        )}
      >
        <div className={cn("text-sm prose prose-invert max-w-none", isUser ? "text-right" : "text-left")}>
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <>
              <MarkdownContent content={displayedContent} />
              {isTypingEffect && (
                <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" />
              )}
            </>
          )}
        </div>
        
        {message.images && message.images.length > 0 && (
          <div className="mt-3 space-y-2">
            {message.images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`Generated ${idx + 1}`}
                className="rounded-lg max-w-full animate-in fade-in zoom-in duration-700 shadow-xl"
              />
            ))}
          </div>
        )}
        
        <p className="mt-2 text-xs text-muted-foreground">
          {message.timestamp.toLocaleTimeString("he-IL", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
};
