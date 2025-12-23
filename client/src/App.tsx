import { useState, useRef, useEffect } from "react";
import { sendMessage, fetchHistory, type Message } from "./api"; // Message yahan se aa raha hai

// NOTE: Yahan se duplicate 'interface Message' hata diya hai

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false); 
  const [sessionId, setSessionId] = useState<string | null>(localStorage.getItem("sessionId"));

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (sessionId) {
      setIsLoading(true);
      fetchHistory(sessionId)
        .then((history) => {
          setMessages(history);
        })
        .catch((err) => console.error("History load failed", err))
        .finally(() => setIsLoading(false));
    }
  }, [sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]); // isOpen add kiya taki open hote hi scroll ho

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now(), text: input, sender: "user" };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const data = await sendMessage(userMsg.text, sessionId);
      
      if (!sessionId && data.sessionId) {
        setSessionId(data.sessionId);
        localStorage.setItem("sessionId", data.sessionId);
      }

      const aiMsg: Message = { id: Date.now() + 1, text: data.reply, sender: "ai" };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
      alert("Error: Backend is not running!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center h-screen bg-gray-50">
      
      {/* Page Content (Optional) */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-800">Welcome to SpurStore</h1>
        <p className="text-gray-500">Click the blue button below to chat with us!</p>
      </div>

      {/* --- CHAT WIDGET START --- */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[350px] h-[500px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-gray-200 z-40">
          
          {/* Header */}
          <div className="bg-indigo-600 p-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">
                🤖
              </div>
              <div>
                <h3 className="font-semibold text-sm">Spur Support</h3>
                <p className="text-xs text-indigo-200">Online</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:text-gray-200">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 mt-10 text-xs">
                Hey! How can I help you with shipping or returns?
              </div>
            )}
            
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm whitespace-pre-wrap shadow-sm ${
                  msg.sender === "user" ? "bg-indigo-600 text-white rounded-br-none" : "bg-white text-gray-800 rounded-bl-none border"
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 px-4 py-2 rounded-full text-xs text-gray-500 animate-pulse">Typing...</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-white border-t">
            <div className="relative flex items-center gap-2">
              <input
                type="text"
                className="w-full border border-gray-300 rounded-full pl-4 pr-10 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="absolute right-1 p-1.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>

        </div>
      )}
      {/* --- CHAT WIDGET END --- */}


      {/* --- FLOATING BUTTON (Z-50 Ensure kiya hai) --- */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 z-50 focus:outline-none focus:ring-4 focus:ring-indigo-300"
      >
        {isOpen ? (
          // Chevron Down Icon (Close)
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        ) : (
          // Chat Bubble Icon (Open)
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
        )}
      </button>

    </div>
  );
}

export default App;