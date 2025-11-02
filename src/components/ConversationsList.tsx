import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface ConversationsListProps {
  onSelectConversation: (conversationId: string) => void;
  currentConversationId?: string;
}

export const ConversationsList = ({
  onSelectConversation,
  currentConversationId,
}: ConversationsListProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      setConversations(data || []);
    } catch (error: any) {
      console.error("Failed to load chat history:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { error } = await supabase
        .from("conversations")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      setConversations(conversations.filter((c) => c.id !== id));
      toast.success("Conversation deleted");
      
      if (currentConversationId === id) {
        window.location.reload();
      }
    } catch (error: any) {
      toast.error("Failed to delete conversation");
    }
  };

  if (loading) {
    return (
      <div className="text-center text-muted-foreground py-4 text-xs">
        Loading...
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-4 text-xs px-3">
        No conversations yet
      </div>
    );
  }

  return (
    <div className="space-y-1 px-2">
      {conversations.map((conversation) => (
        <motion.div
          key={conversation.id}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className={`group rounded-lg p-2 cursor-pointer hover:bg-sidebar-accent transition-smooth ${
            currentConversationId === conversation.id
              ? "bg-sidebar-accent"
              : ""
          }`}
          onClick={() => onSelectConversation(conversation.id)}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-2 flex-1 min-w-0">
              <MessageSquare className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">
                  {conversation.title || "New Conversation"}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {format(new Date(conversation.updated_at), "MMM d")}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => deleteConversation(conversation.id, e)}
              className="opacity-0 group-hover:opacity-100 h-6 w-6 hover:bg-destructive/10 hover:text-destructive shrink-0"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
