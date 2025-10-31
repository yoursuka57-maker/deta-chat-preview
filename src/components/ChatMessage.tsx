import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { MarkdownContent } from "./MarkdownContent";

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

  return (
    <div
      className={cn(
        "flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <Avatar className={cn("h-8 w-8 shrink-0", isUser ? "bg-muted" : "gradient-primary")}>
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
          "max-w-[80%] rounded-2xl px-4 py-3",
          isUser
            ? "bg-muted/30 border border-muted"
            : "bg-card/50 border border-border"
        )}
      >
        <div className={cn("text-sm prose prose-invert max-w-none", isUser ? "text-right" : "text-left")}>
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <MarkdownContent content={message.content} />
          )}
        </div>
        
        {message.images && message.images.length > 0 && (
          <div className="mt-3 space-y-2">
            {message.images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`Generated ${idx + 1}`}
                className="rounded-lg max-w-full animate-in fade-in duration-300"
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
