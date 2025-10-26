import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, GitCompare, BarChart3, Shield } from "lucide-react";
import { ChatInterface } from "@/components/ChatInterface";
import { ComparisonMode } from "@/components/ComparisonMode";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";
import { ThemeToggle } from "@/components/ThemeToggle";

const Index = () => {
  const [activeTab, setActiveTab] = useState("chat");

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50 animate-fade-in">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-ai flex items-center justify-center shadow-ai animate-float">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-ai bg-clip-text text-transparent">
                  RLHF Safety Platform
                </h1>
                <p className="text-xs text-muted-foreground">
                  Reinforcement Learning from Human Feedback
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 animate-slide-up">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-[calc(100vh-140px)]">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-6 glass-effect">
            <TabsTrigger value="chat" className="gap-2 transition-all duration-300">
              <MessageSquare className="w-4 h-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="compare" className="gap-2 transition-all duration-300">
              <GitCompare className="w-4 h-4" />
              Compare
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2 transition-all duration-300">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="h-full mt-0">
            <div className="h-full rounded-xl border border-border bg-card shadow-card overflow-hidden animate-scale-in">
              <ChatInterface />
            </div>
          </TabsContent>

          <TabsContent value="compare" className="h-full mt-0">
            <div className="h-full rounded-xl border border-border bg-card shadow-card overflow-auto animate-scale-in">
              <ComparisonMode />
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="h-full mt-0">
            <div className="h-full rounded-xl border border-border bg-card shadow-card overflow-auto animate-scale-in">
              <AnalyticsDashboard />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
