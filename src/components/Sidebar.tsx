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
      className="h-screen min-w-[4rem] max-w-[16rem] bg-sidebar-background border-r border-sidebar-border flex flex-col"
    >
      {/* Header with Logo and Collapse Button */}
      <div className="flex items-center px-4 py-4 gap-3">
        {/* Logo Icon with Animation */}
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

        {/* Logo Text */}
        {!isCollapsed && (
          <h1 className="text-2xl font-bold text-foreground">Deta</h1>
        )}

        {/* Collapse Button next to logo */}
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

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-2 overflow-hidden flex flex-col">
        <Button
          variant="ghost"
          onClick={onNewChat}
          className={`w-full ${
            isCollapsed ? "justify-center px-2" : "justify-start"
          } gap-3 hover:bg-sidebar-accent hover:text-primary transition-smooth`}
          title="New Chat"
        >
          <MessageSquarePlus className="h-5 w-5" />
          {!isCollapsed && <span>New Chat</span>}
        </Button>

        {!isCollapsed && (
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 hover:bg-sidebar-accent hover:text-primary transition-smooth"
          >
            <Library className="h-5 w-5" />
            <span>Library</span>
          </Button>
        )}

        {/* Chat History Section */}
        {!isCollapsed ? (
          <div className="flex-1 flex flex-col min-h-0 pt-4">
            <div className="flex items-center gap-2 px-3 mb-2">
              <History className="h-3.5 w-3.5 text-muted-foreground" />
              <h3 className="text-xs font-semibold text-muted-foreground">
                Chat History
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto">
              <ConversationsList
                onSelectConversation={onSelectConversation}
                currentConversationId={currentConversationId}
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center pt-8">
            <History className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
      </nav>

      {/* User Menu */}
      {!isCollapsed && (
        <div className="p-4">
          <UserMenu navigate={navigate} />
        </div>
      )}
    </motion.aside>
  );
};Left    <PanelLeft className={`h-4 w-4 transition-transform duration-200 ${isCollapsed ? 'rotate-180' : 'rotate-0'}`} />
      </Button>

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
        {!isCollapsed && <h1 className="text-2xl font-bold text-foreground">Deta</h1>}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-2 overflow-hidden flex flex-col">
        <Button
          variant="ghost"
          onClick={onNewChat}
          className={`w-full ${isCollapsed ? 'justify-center px-2' : 'justify-start'} gap-3 hover:bg-sidebar-accent hover:text-primary transition-smooth`}
          title="New Chat"
        >
          <MessageSquarePlus className="h-5 w-5" />
          {!isCollapsed && <span>New Chat</span>}
        </Button>

        {!isCollapsed && (
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 hover:bg-sidebar-accent hover:text-primary transition-smooth"
          >
            <Library className="h-5 w-5" />
            <span>Library</span>
          </Button>
        )}

        {/* Chat History Section */}
        {!isCollapsed ? (
          <div className="flex-1 flex flex-col min-h-0 pt-4">
            <div className="flex items-center gap-2 px-3 mb-2">
              <History className="h-3.5 w-3.5 text-muted-foreground" />
              <h3 className="text-xs font-semibold text-muted-foreground">Chat History</h3>
            </div>
            <div className="flex-1 overflow-y-auto">
              <ConversationsList 
                onSelectConversation={onSelectConversation}
                currentConversationId={currentConversationId}
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center pt-8">
            <History className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
      </nav>

      {/* User Menu or Auth Button */}
      {!isCollapsed && (
        <div className="p-4">
          <UserMenu navigate={navigate} />
        </div>
      )}
    </motion.aside>
  );
};
