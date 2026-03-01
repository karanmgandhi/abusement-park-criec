"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "@/lib/hooks";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  user: { id: string; name: string; image: string | null };
}

export function Chat({ groupId }: { groupId: string | null }) {
  const { data: session } = useSession();
  const { messages, mutate } = useChat(groupId);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!groupId) return null;

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || sending) return;

    setSending(true);
    try {
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId, content: input.trim() }),
      });
      setInput("");
      mutate();
    } finally {
      setSending(false);
    }
  }

  return (
    <Card className="flex h-[400px] flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageCircle className="h-5 w-5 text-cyan-500" />
          Trash Talk
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col overflow-hidden px-3 pb-3">
        <ScrollArea className="flex-1 pr-2" ref={scrollRef}>
          <div className="space-y-3 p-1">
            {messages.map((msg: Message) => {
              const isMe = msg.user.id === session?.user?.id;
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${isMe ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      isMe
                        ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-primary/20 text-primary"
                    }`}
                  >
                    {msg.user.name[0]?.toUpperCase()}
                  </div>
                  <div
                    className={`max-w-[75%] rounded-lg px-3 py-1.5 ${
                      isMe
                        ? "bg-emerald-500/10 text-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {!isMe && (
                      <div className="mb-0.5 text-[10px] font-medium text-muted-foreground">
                        {msg.user.name}
                      </div>
                    )}
                    <div className="text-sm">{msg.content}</div>
                    <div className="mt-0.5 text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(msg.createdAt), {
                        addSuffix: true,
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
            {messages.length === 0 && (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No messages yet. Start the trash talk! 🏏
              </div>
            )}
          </div>
        </ScrollArea>

        <form onSubmit={sendMessage} className="mt-2 flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Talk trash..."
            className="flex-1"
            maxLength={500}
          />
          <Button type="submit" size="icon" disabled={sending || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
