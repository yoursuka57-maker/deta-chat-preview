import { MessageSquarePlus, Library, History, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export const Sidebar = () => {
  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-64 h-screen bg-sidebar-background border-r border-sidebar-border flex flex-col"
    >
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="relative"
        >
          <Sparkles className="h-8 w-8 text-primary" />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-primary/20 rounded-full blur-xl"
          />
        </motion.div>
        <h1 className="text-2xl font-bold text-foreground">Deta</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-2">
        <Button
          variant="ghost"
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

        <div className="pt-4">
          <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
            <History className="h-4 w-4" />
            <span>Chat History</span>
          </div>
        </div>
      </nav>

      {/* Sign In Button */}
      <div className="p-4">
        <div className="text-center text-sm text-muted-foreground mb-3">
          Sign In or up to open the feature
        </div>
        <Button className="w-full gradient-primary shadow-glow hover:shadow-neon transition-smooth">
          Sign Up / Sign In
        </Button>
      </div>
    </motion.aside>
  );
};
