import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-4 transition-smooth",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <Avatar className={cn("h-8 w-8", isUser ? "bg-muted" : "gradient-primary shadow-glow")}>
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
            ? "glass"
            : "gradient-glow border border-border/50 bg-card"
        )}
      >
        <p className={cn("whitespace-pre-wrap text-sm", isUser ? "text-right" : "text-left")}>
          {message.content}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {message.timestamp.toLocaleTimeString("he-IL", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
};
