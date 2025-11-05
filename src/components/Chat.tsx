import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Zap, Send, Sparkles, Paperclip, Mic, X } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { streamChat } from "@/lib/streamChat";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "./Sidebar";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  images?: string[];
  isTyping?: boolean;
  sources?: Array<{ title: string; link: string; snippet: string }>;
}

export const Chat = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState("LPT-3.5");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [detaStatus, setDetaStatus] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check auth
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) createNewConversation();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) createNewConversation();
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const createNewConversation = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("conversations")
        .insert([{ user_id: user.id, title: "New Conversation" }])
        .select()
        .single();
      if (error) throw error;
      setCurrentConversationId(data.id);
      setMessages([]);
    } catch (error: any) {
      toast.error("Failed to create conversation");
    }
  };

  const loadConversation = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });
      if (error) throw error;

      const loadedMessages: Message[] = data.map((msg) => ({
        id: msg.id,
        role: msg.role as "user" | "assistant",
        content: msg.content,
        timestamp: new Date(msg.created_at),
        images: msg.image_url ? [msg.image_url] : undefined,
      }));

      setMessages(loadedMessages);
      setCurrentConversationId(conversationId);
    } catch (error: any) {
      toast.error("Failed to load conversation");
    }
  };

  const saveMessage = async (message: Message) => {
    if (!currentConversationId) return;
    try {
      await supabase.from("messages").insert([
        {
          conversation_id: currentConversationId,
          role: message.role,
          content: message.content,
          image_url: message.images?.[0] || null,
        },
      ]);

      // Update conversation title if it's the first user message
      if (message.role === "user" && messages.length === 0) {
        const title = message.content.slice(0, 50);
        await supabase
          .from("conversations")
          .update({ title })
          .eq("id", currentConversationId);
      }
    } catch (error: any) {
      console.error("Failed to save message:", error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !user) return;
    
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("chat-images")
          .upload(fileName, file);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from("chat-images").getPublicUrl(fileName);
        return data.publicUrl;
      });
      
      const urls = await Promise.all(uploadPromises);
      setUploadedImages(prev => [...prev, ...urls]);
      toast.success(`${urls.length} תמונות הועלו בהצלחה!`);
    } catch (error: any) {
      toast.error("Failed to upload images");
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && uploadedImages.length === 0) || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input || "Check these images",
      timestamp: new Date(),
      images: uploadedImages.length > 0 ? uploadedImages : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    await saveMessage(userMessage);

    const currentInput = input;
    setInput("");
    setUploadedImages([]);
    setIsLoading(true);
    setDetaStatus("Deta Response...");

    // Detect what Deta is doing
    const imageKeywords = ["צור תמונה", "תמונה של", "הראה לי תמונה", "generate image", "create image"];
    const generateImage = imageKeywords.some((keyword) => currentInput.includes(keyword));
    const codeKeywords = ["כתוב קוד", "תכנת", "צור פונקציה", "write code", "create function", "program"];
    const searchKeywords = ["חפש", "מה זה", "מצא", "search", "find", "what is"];
    const isCode = codeKeywords.some((keyword) => currentInput.toLowerCase().includes(keyword));
    const isSearch = searchKeywords.some((keyword) => currentInput.toLowerCase().includes(keyword));
    
    if (generateImage) setDetaStatus("Deta Generating Image...");
    else if (isCode) setDetaStatus("Deta Coding...");
    else if (isSearch) setDetaStatus("Deta Searching...");

    let assistantContent = "";
    const assistantImages: string[] = [];
    let assistantSources: Array<{ title: string; link: string; snippet: string }> = [];

    const upsertAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) =>
            i === prev.length - 1
              ? { ...m, content: assistantContent, images: assistantImages, sources: assistantSources }
              : m
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
            sources: assistantSources,
          },
        ];
      });
    };

    try {
      await streamChat({
        messages: messages.concat(userMessage).map((m) => ({ role: m.role, content: m.content })),
        model: selectedModel,
        generateImage,
        onDelta: (chunk) => upsertAssistant(chunk),
        onImage: (imageUrl) => {
          assistantImages.push(imageUrl);
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last?.role === "assistant") {
              return prev.map((m, i) => (i === prev.length - 1 ? { ...m, images: [...assistantImages] } : m));
            }
            return prev;
          });
        },
        onSources: (sources) => {
          assistantSources = sources;
          setMessages((prev) => {
            const last = prev[prev.length - 1];
            if (last?.role === "assistant") {
              return prev.map((m, i) => (i === prev.length - 1 ? { ...m, sources: sources } : m));
            }
            return prev;
          });
        },
        onDone: async () => {
          setIsLoading(false);
          setDetaStatus(null);
          const assistantMessage: Message = {
            id: Date.now().toString(),
            role: "assistant",
            content: assistantContent,
            timestamp: new Date(),
            images: assistantImages.length > 0 ? assistantImages : undefined,
            sources: assistantSources.length > 0 ? assistantSources : undefined,
          };
          await saveMessage(assistantMessage);
        },
        onError: (error) => {
          toast.error(error);
          setIsLoading(false);
          setDetaStatus(null);
          setMessages((prev) => prev.slice(0, -1));
        },
      });
    } catch (error) {
      toast.error("שגיאה בשליחת ההודעה");
      setIsLoading(false);
      setDetaStatus(null);
      setMessages((prev) => prev.slice(0, -1));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className="flex h-screen bg-gradient-to-b from-black to-purple-900">
      <Sidebar
        onNewChat={createNewConversation}
        onSelectConversation={loadConversation}
        currentConversationId={currentConversationId || undefined}
      />
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <motion.header
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="glass border-b border-border/50 px-6 py-4"
        >
          <div className="flex items-center justify-between max-w-5xl mx-auto">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex items-center gap-2"
            >
              <Zap className="h-5 w-5 text-primary" />
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="w-[140px] glow-border bg-card/50">
                  <SelectValue placeholder="Model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LPT-1">LPT-1 ⚙️</SelectItem>
                  <SelectItem value="LPT-1.5">LPT-1.5 ⚡</SelectItem>
                  <SelectItem value="LPT-2">LPT-2 🧠</SelectItem>
                  <SelectItem value="LPT-2.5">LPT-2.5 💬</SelectItem>
                  <SelectItem value="LPT-3">LPT-3 🌐</SelectItem>
                  <SelectItem value="LPT-3.5">LPT-3.5 🚀</SelectItem>
                </SelectContent>
              </Select>
            </motion.div>
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="h-2 w-2 rounded-full bg-primary shadow-neon"
            />
          </div>
        </motion.header>

        {/* Messages Area */}
        <ScrollArea className="flex-1 px-4">
          <div className="mx-auto max-w-4xl py-8">
            <AnimatePresence mode="popLayout">
              {isEmpty ? (
                <motion.div
                  key="welcome"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col items-center justify-center min-h-[60vh] text-center"
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="mb-8"
                  >
                    <Sparkles className="h-20 w-20 text-primary shadow-neon" />
                  </motion.div>
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent"
                  >
                    Where should we begin?
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-muted-foreground max-w-xl"
                  >
                    Powered by LiskCell's LPT Engine - Advanced AI for creative, intelligent conversations
                  </motion.p>
                </motion.div>
              ) : (
                <div className="space-y-6">
                  {messages.map((message, index) => (
                    <ChatMessage key={message.id} message={message} index={index} />
                  ))}
                </div>
              )}
            </AnimatePresence>

            {isLoading && detaStatus && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="flex items-center gap-2"
              >
                <motion.div 
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360],
                    opacity: [0.5, 1, 0.5] 
                  }} 
                  transition={{ duration: 2, repeat: Infinity }} 
                  className="h-2 w-2 rounded-full bg-gradient-to-r from-primary to-primary-glow shadow-neon" 
                />
                <span className="text-sm text-muted-foreground">{detaStatus}</span>
              </motion.div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }} className="glass border-t border-border/50 px-4 py-6">
          <div className="mx-auto max-w-4xl">
            {uploadedImages.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {uploadedImages.map((img, idx) => (
                  <div key={idx} className="relative inline-block">
                    <img src={img} alt={`Upload preview ${idx + 1}`} className="h-20 w-20 object-cover rounded-xl glass glow-border" />
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => setUploadedImages(prev => prev.filter((_, i) => i !== idx))} 
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive hover:bg-destructive/80"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <div className="relative flex items-center gap-3 p-3 rounded-2xl glass glow-border shadow-neon">
              <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
              <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} className="hover:bg-primary/20 hover:text-primary transition-smooth" title="העלה תמונות">
                <Paperclip className="h-5 w-5" />
              </Button>
              <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={handleKeyPress} placeholder="Ask Anything..." className="flex-1 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0" disabled={isLoading} />
              <Button variant="ghost" size="icon" className="hover:bg-primary/20 hover:text-primary transition-smooth" disabled title="קלט קולי בקרוב">
                <Mic className="h-5 w-5" />
              </Button>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button onClick={handleSend} disabled={(!input.trim() && uploadedImages.length === 0) || isLoading} size="icon" className="gradient-primary shadow-neon transition-smooth hover:shadow-glow">
                  <Send className="h-4 w-4" />
                </Button>
              </motion.div>
            </div>
            <p className="mt-3 text-center text-xs text-muted-foreground">Deta · Powered by LiskCell · LPT Engine</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
