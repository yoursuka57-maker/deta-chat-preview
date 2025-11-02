import { MessageSquarePlus, Library, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { UserMenu } from "./UserMenu";
import { useNavigate } from "react-router-dom";
import { ConversationsList } from "./ConversationsList";

interface SidebarProps {
  onShowHistory: () => void;
  onNewChat: () => void;
  onSelectConversation: (conversationId: string) => void;
  currentConversationId?: string;
}

export const Sidebar = ({ onShowHistory, onNewChat, onSelectConversation, currentConversationId }: SidebarProps) => {
  const navigate = useNavigate();

  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-64 h-screen bg-sidebar-background border-r border-sidebar-border flex flex-col"
    >
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <motion.div className="relative">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-primary/20 rounded-full blur-xl"
          />
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="h-8 w-8 text-primary relative z-10" />
          </motion.div>
        </motion.div>
        <h1 className="text-2xl font-bold text-foreground">Deta</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-2 overflow-hidden flex flex-col">
        <Button
          variant="ghost"
          onClick={onNewChat}
          className="w-full justify-start gap-3 hover:bg-sidebar-accent hover:text-primary transition-smooth"
        >
          <MessageSquarePlus className="h-5 w-5" />
          <span>New Chat</span>
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-start gap-3 hover:bg-sidebar-accent hover:text-primary transition-smooth"
        >
          <Library className="h-5 w-5" />
          <span>Library</span>
        </Button>

        {/* Chat History Section */}
        <div className="flex-1 flex flex-col min-h-0 pt-4">
          <h3 className="text-xs font-semibold text-muted-foreground px-3 mb-2">CHAT HISTORY</h3>
          <div className="flex-1 overflow-y-auto">
            <ConversationsList 
              onSelectConversation={onSelectConversation}
              currentConversationId={currentConversationId}
            />
          </div>
        </div>
      </nav>

      {/* User Menu or Auth Button */}
      <div className="p-4">
        <UserMenu onShowHistory={onShowHistory} navigate={navigate} />
      </div>
    </motion.aside>
  );
};
