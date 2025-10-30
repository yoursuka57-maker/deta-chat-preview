import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, MessageSquare, Zap, Shield } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.1),rgba(255,255,255,0))]" />
      
      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-20">
        <div className="mx-auto max-w-4xl text-center">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-secondary shadow-glow animate-pulse">
              <Sparkles className="h-10 w-10 text-primary-foreground" />
            </div>
          </div>

          {/* Hero text */}
          <h1 className="mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-6xl font-bold text-transparent">
            Deta Chat
          </h1>
          <p className="mb-4 text-2xl font-semibold text-foreground">
            עוזר AI חכם ומתקדם
          </p>
          <p className="mb-12 text-lg text-muted-foreground">
            שיחות טבעיות עם בינה מלאכותית מתקדמת. קבל תשובות מדויקות, רעיונות יצירתיים ועזרה בכל נושא.
          </p>

          {/* CTA Button */}
          <Button
            onClick={() => navigate("/chat")}
            size="lg"
            className="gradient-primary shadow-glow transition-smooth hover:scale-105 hover:shadow-xl text-lg px-8 py-6"
          >
            <MessageSquare className="ml-2 h-5 w-5" />
            התחל שיחה עכשיו
          </Button>

          {/* Features */}
          <div className="mt-20 grid gap-8 md:grid-cols-3">
            <div className="glass rounded-2xl p-6 transition-smooth hover:scale-105">
              <div className="mb-4 flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary">
                  <Zap className="h-6 w-6 text-primary-foreground" />
                </div>
              </div>
              <h3 className="mb-2 text-xl font-semibold">מהיר וחכם</h3>
              <p className="text-muted-foreground">
                תשובות מיידיות ומדויקות לכל שאלה
              </p>
            </div>

            <div className="glass rounded-2xl p-6 transition-smooth hover:scale-105">
              <div className="mb-4 flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary">
                  <MessageSquare className="h-6 w-6 text-primary-foreground" />
                </div>
              </div>
              <h3 className="mb-2 text-xl font-semibold">היסטוריית שיחות</h3>
              <p className="text-muted-foreground">
                כל השיחות שלך נשמרות ונגישות תמיד
              </p>
            </div>

            <div className="glass rounded-2xl p-6 transition-smooth hover:scale-105">
              <div className="mb-4 flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary">
                  <Shield className="h-6 w-6 text-primary-foreground" />
                </div>
              </div>
              <h3 className="mb-2 text-xl font-semibold">מאובטח ופרטי</h3>
              <p className="text-muted-foreground">
                המידע שלך מוגן ומאובטח
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
