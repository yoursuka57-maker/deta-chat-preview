import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { MarkdownContent } from "./MarkdownContent";
import { motion } from "framer-motion";

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
  index?: number;
}

export const ChatMessage = ({ message, index = 0 }: ChatMessageProps) => {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={cn(
        "flex gap-4",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <motion.div
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.2 }}
      >
        <Avatar className={cn(
          "h-10 w-10 shrink-0 border-2",
          isUser 
            ? "bg-card border-muted" 
            : "gradient-primary border-primary shadow-neon"
        )}>
          <AvatarFallback>
            {isUser ? (
              <User className="h-5 w-5" />
            ) : (
              <Bot className="h-5 w-5 text-primary-foreground" />
            )}
          </AvatarFallback>
        </Avatar>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: isUser ? 20 : -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className={cn(
          "max-w-[80%] rounded-2xl px-5 py-4 transition-smooth",
          isUser
            ? "bg-card/60 border border-muted/50 glow-border"
            : "bg-card/40 border border-primary/30 glow-border shadow-glow"
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
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 space-y-3"
          >
            {message.images.map((img, idx) => (
              <motion.img
                key={idx}
                src={img}
                alt={`Generated ${idx + 1}`}
                initial={{ opacity: 0, filter: "blur(10px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                transition={{ duration: 0.6 }}
                className="rounded-xl max-w-full border border-primary/30 shadow-glow"
              />
            ))}
          </motion.div>
        )}
        
        <p className="mt-3 text-xs text-muted-foreground/70">
          {message.timestamp.toLocaleTimeString("he-IL", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </motion.div>
    </motion.div>
  );
};
