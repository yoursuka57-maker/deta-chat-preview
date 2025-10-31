import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Sparkles } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { streamChat } from "@/lib/streamChat";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  images?: string[];
  isTyping?: boolean;
}

export const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "שלום! אני Deta, עוזר AI חכם. איך אוכל לעזור לך היום?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    // Detect if user wants to generate an image
    const imageKeywords = ["צור תמונה", "תמונה של", "הראה לי תמונה", "generate image", "create image"];
    const generateImage = imageKeywords.some(keyword => currentInput.includes(keyword));

    let assistantContent = "";
    const assistantImages: string[] = [];
    
    const upsertAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantContent, images: assistantImages, isTyping: true } : m
          );
        }
        return [
          ...prev,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: assistantContent,
            timestamp: new Date(),
            images: assistantImages,
            isTyping: true,
          },
        ];
      });
    };

    try {
      await streamChat({
        messages: messages
          .concat(userMessage)
          .map((m) => ({ role: m.role, content: m.content })),
        model: "LPT-3.5",
        generateImage,
        onDelta: (chunk) => upsertAssistant(chunk),
        onImage: (imageUrl) => {
          assistantImages.push(imageUrl);
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last?.role === "assistant") {
              return prev.map((m, i) =>
                i === prev.length - 1 ? { ...m, images: [...assistantImages] } : m
              );
            }
            return prev;
          });
        },
        onDone: () => {
          setIsLoading(false);
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last?.role === "assistant") {
              return prev.map((m, i) =>
                i === prev.length - 1 ? { ...m, isTyping: false } : m
              );
            }
            return prev;
          });
        },
        onError: (error) => {
          toast.error(error);
          setIsLoading(false);
          setMessages((prev) => prev.slice(0, -1));
        },
      });
    } catch (error) {
      toast.error("שגיאה בשליחת ההודעה");
      setIsLoading(false);
      setMessages((prev) => prev.slice(0, -1));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="glass sticky top-0 z-10 border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-glow">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Deta Chat</h1>
            <p className="text-sm text-muted-foreground">עוזר AI חכם</p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4">
        <div className="mx-auto max-w-3xl space-y-6 py-8">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="flex gap-1">
                <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]"></div>
                <div className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]"></div>
                <div className="h-2 w-2 animate-bounce rounded-full bg-primary"></div>
              </div>
              <span className="text-sm">Deta חושב...</span>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="glass border-t px-4 py-6">
        <div className="mx-auto max-w-3xl">
          <div className="relative flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="כתוב הודעה..."
              className="pr-12 text-right"
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="gradient-primary shadow-glow transition-smooth hover:shadow-lg"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Deta יכול לעשות טעויות. כדאי לבדוק מידע חשוב.
          </p>
        </div>
      </div>
    </div>
  );
};
