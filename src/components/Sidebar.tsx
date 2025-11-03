import {
  MessageSquarePlus,
  Library,
  Sparkles,
  PanelLeft,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { UserMenu } from "./UserMenu";
import { useNavigate } from "react-router-dom";
import { ConversationsList } from "./ConversationsList";
import { useState } from "react";

interface SidebarProps {
  onNewChat: () => void;
  onSelectConversation: (conversationId: string) => void;
  currentConversationId?: string;
}

export const Sidebar = ({
  onNewChat,
  onSelectConversation,
  currentConversationId,
}: SidebarProps) => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{
        x: 0,
        opacity: 1,
        width: isCollapsed ? "4rem" : "16rem",
      }}
      transition={{ duration: 0.3 }}
      className="h-screen bg-sidebar-background border-r border-sidebar-border flex flex-col"
    >
      {/* Collapse Button */}
      <div className="flex justify-center py-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-7 w-7 rounded-full border border-sidebar-border bg-sidebar-background hover:bg-sidebar-accent flex items-center justify-center p-0"
        >
          <PanelLeft
            className={`h-4 w-4 transition-transform duration-200 ${
              isCollapsed ? "rotate-180" : "rotate-0"
            }`}
          />
        </Button>
      </div>

      {/* Logo */}
      <div className={`flex items-center ${isCollapsed ? "justify-center" : "px-4 gap-3"} py-2`}>
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
        {!isCollapsed && (
          <h1 className="text-2xl font-bold text-foreground">Deta</h1>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 space-y-2 overflow-hidden flex flex-col">
        <Button
          variant="ghost"
          onClick={onNewChat}
          className={`w-full ${isCollapsed ? "justify-center" : "justify-start"} gap-3 hover:bg-sidebar-accent hover:text-primary transition-smooth`}
          title="New Chat"
        >
          <MessageSquarePlus className="h-5 w-5" />
          {!isCollapsed && <span>New Chat</span>}
        </Button>

        <Button
          variant="ghost"
          className={`w-full ${isCollapsed ? "justify-center" : "justify-start"} gap-3 hover:bg-sidebar-accent hover:text-primary transition-smooth`}
          title="Library"
        >
          <Library className="h-5 w-5" />
          {!isCollapsed && <span>Library</span>}
        </Button>

        {/* Chat History Section */}
        <div className="flex-1 flex flex-col min-h-0 pt-4">
          <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-2 px-3 mb-2"}`}>
            <History className="h-4 w-4 text-muted-foreground" />
            {!isCollapsed && (
              <h3 className="text-xs font-semibold text-muted-foreground">
                Chat History
              </h3>
            )}
          </div>
          <div className="flex-1 overflow-y-auto">
            <ConversationsList
              onSelectConversation={onSelectConversation}
              currentConversationId={currentConversationId}
            />
          </div>
        </div>
      </nav>

      {/* User Menu */}
      <div className="p-4">
        {!isCollapsed ? (
          <UserMenu navigate={navigate} />
        ) : (
          <Button
            variant="outline"
            className="w-full text-xs px-2 py-1"
            onClick={() => navigate("/login")}
          >
            🔐
          </Button>
        )}
      </div>
    </motion.aside>
  );
};
