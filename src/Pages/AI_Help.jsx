import { useState, useRef, useEffect } from "react";
import { Button } from "../Components/ui/button";
import { Input } from "../Components/ui/input";
import { Card } from "../Components/ui/card";
import { Bot, User, Send, Loader2, Sparkles, RefreshCcw, ArrowLeft, Home } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { getAiResponse } from "../services/operations/authApi";
import { Link, useNavigate } from "react-router-dom";

const AiChat = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      role: "bot",
      content: "Hello! I am the MediCare AI Assistant. I can help you with symptoms, appointments, or hospital info. How can I help today?"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const aiText = await getAiResponse(userMessage.content);
      const botMessage = { role: "bot", content: aiText };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("AI CHAT ERROR:", error);
      // >>> UPDATED: Show specific backend error message in chat <<<
      const errorMessage = error.response?.data?.message || error.message || "Sorry, I am unable to process your request right now.";
      setMessages((prev) => [...prev, { role: "bot", content: errorMessage }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Changed bg to a full gradient for a more "tech" feel
    <div className="flex flex-col h-screen bg-slate-50 font-sans overflow-hidden">
      
      {/* --- CUSTOM COMPACT HEADER (Replaces Navbar) --- */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="text-slate-500 hover:text-teal-600">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-slate-800 text-lg leading-tight">MediCare AI</h1>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Online
              </p>
            </div>
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="flex gap-2">
           <Button variant="outline" size="sm" asChild className="hidden sm:flex">
             <Link to="/find-doctor">Book Appointment</Link>
           </Button>
           <Button variant="ghost" size="icon" asChild>
             <Link to="/"><Home className="w-5 h-5 text-slate-500" /></Link>
           </Button>
        </div>
      </header>

      {/* --- CHAT AREA --- */}
      <main className="flex-1 flex flex-col max-w-5xl mx-auto w-full p-4 h-full overflow-hidden">
        <Card className="flex-1 flex flex-col overflow-hidden border-0 shadow-xl bg-white rounded-2xl ring-1 ring-slate-100">
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex items-start gap-3 sm:gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                  msg.role === "user" ? "bg-teal-600" : "bg-white border border-slate-200"
                }`}>
                  {msg.role === "user" ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-teal-600" />}
                </div>

                <div className={`p-3 sm:p-4 rounded-2xl max-w-[85%] text-sm sm:text-base shadow-sm ${
                  msg.role === "user" 
                    ? "bg-teal-600 text-white rounded-tr-none" 
                    : "bg-white border border-slate-100 text-slate-700 rounded-tl-none"
                }`}>
                  {msg.role === "bot" ? (
                     <div className="prose prose-sm max-w-none text-slate-700 dark:text-slate-300">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                     </div>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-teal-600" />
                </div>
                <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white border-t border-slate-100">
            <form onSubmit={handleSend} className="relative flex items-center gap-2 max-w-4xl mx-auto">
              <Input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about symptoms, doctors, or services..."
                className="h-12 pl-5 pr-24 rounded-full border-slate-200 bg-slate-50 focus:bg-white focus:ring-teal-500 shadow-sm"
                disabled={loading}
              />
              <div className="absolute right-1.5 flex gap-1">
                {messages.length > 2 && (
                  <Button 
                    type="button" variant="ghost" size="icon" 
                    className="h-9 w-9 text-slate-400 hover:text-slate-600 rounded-full"
                    onClick={() => setMessages([messages[0]])}
                    title="Clear Chat"
                  >
                    <RefreshCcw className="w-4 h-4" />
                  </Button>
                )}
                <Button 
                  type="submit" size="icon"
                  disabled={loading || !input.trim()}
                  className="h-9 w-9 rounded-full bg-teal-600 hover:bg-teal-700 text-white shadow-md transition-all"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default AiChat;