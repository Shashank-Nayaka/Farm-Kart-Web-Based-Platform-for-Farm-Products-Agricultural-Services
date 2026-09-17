"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function AIChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I’m your FarmKart AI assistant. How can I help?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim()) return;

    const userMsg = { role: "user", content: input };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      if (!res.ok) throw new Error("API error");

      const data = await res.json();

      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: data.reply || "Sorry, I couldn’t respond.",
        },
      ]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: "⚠️ AI service not connected yet.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button
        className="fixed bottom-6 right-6 rounded-full shadow-lg z-50"
        onClick={() => setOpen(!open)}
      >
        💬 AI Help
      </Button>

      {open && (
        <Card className="fixed bottom-20 right-6 w-80 h-[420px] flex flex-col shadow-2xl z-50">
          <CardHeader className="py-3">
            <CardTitle className="text-base">FarmKart Assistant</CardTitle>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto space-y-2 text-sm">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`p-2 rounded-lg max-w-[85%] ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground ml-auto"
                    : "bg-muted"
                }`}
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="text-xs text-muted-foreground">
                AI typing…
              </div>
            )}
          </CardContent>

          <div className="p-2 border-t flex gap-2">
            <Input
              placeholder="Ask something..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <Button onClick={sendMessage} disabled={loading}>
              Send
            </Button>
          </div>
        </Card>
      )}
    </>
  );
}