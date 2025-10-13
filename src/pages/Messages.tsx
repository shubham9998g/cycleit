import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Send, MessageCircle } from "lucide-react";

type Conversation = {
  id: string;
  other_user: {
    id: string;
    username: string;
    avatar_url: string;
    full_name: string;
  };
  last_message: {
    content: string;
    created_at: string;
    sender_id: string;
  };
  unread_count: number;
  product_id?: string;
};

type Message = {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  recipient_id: string;
};

const Messages = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.other_user.id);
    }
  }, [selectedConversation]);

  const loadConversations = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get all messages for the user
    const { data: messages } = await supabase
      .from("messages")
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(id, username, avatar_url, full_name),
        recipient:profiles!messages_recipient_id_fkey(id, username, avatar_url, full_name)
      `)
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (!messages) return;

    // Group by conversation (other user)
    const conversationMap = new Map<string, Conversation>();

    messages.forEach((msg: any) => {
      const otherUser = msg.sender_id === user.id ? msg.recipient : msg.sender;
      const key = otherUser.id;

      if (!conversationMap.has(key)) {
        conversationMap.set(key, {
          id: key,
          other_user: otherUser,
          last_message: {
            content: msg.content,
            created_at: msg.created_at,
            sender_id: msg.sender_id,
          },
          unread_count: msg.recipient_id === user.id && !msg.is_read ? 1 : 0,
          product_id: msg.product_id,
        });
      } else {
        const conv = conversationMap.get(key)!;
        if (new Date(msg.created_at) > new Date(conv.last_message.created_at)) {
          conv.last_message = {
            content: msg.content,
            created_at: msg.created_at,
            sender_id: msg.sender_id,
          };
          conv.product_id = msg.product_id;
        }
        if (msg.recipient_id === user.id && !msg.is_read) {
          conv.unread_count++;
        }
      }
    });

    setConversations(Array.from(conversationMap.values()));
    setLoading(false);
  };

  const loadMessages = async (otherUserId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // First, mark messages as read
    await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("sender_id", otherUserId)
      .eq("recipient_id", user.id)
      .eq("is_read", false);

    // Then load messages
    const { data } = await supabase
      .from("messages")
      .select("*")
      .or(`and(sender_id.eq.${user.id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${user.id})`)
      .order("created_at", { ascending: true });

    setMessages(data || []);

    // Refresh conversations to update unread counts
    loadConversations();
  };

  const sendMessage = async () => {
    if (!selectedConversation || !newMessage.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("messages").insert({
      sender_id: user.id,
      recipient_id: selectedConversation.other_user.id,
      content: newMessage.trim(),
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setNewMessage("");
      loadMessages(selectedConversation.other_user.id);
      loadConversations();
    }
  };

  const createExchange = async (productId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get product details
    const { data: product } = await supabase
      .from("products")
      .select("user_id")
      .eq("id", productId)
      .single();

    if (!product) return;

    const ownerId = product.user_id;
    const exchangerId = user.id;

    // Check if exchange already exists
    const { data: existingExchange } = await supabase
      .from("exchanges")
      .select("id")
      .eq("product_id", productId)
      .or(`and(owner_id.eq.${ownerId},exchanger_id.eq.${exchangerId}),and(owner_id.eq.${exchangerId},exchanger_id.eq.${ownerId})`)
      .single();

    if (existingExchange) {
      toast({
        title: "Exchange already exists",
        description: "An exchange for this product is already in progress.",
      });
      return;
    }

    // Create exchange
    const { error } = await supabase.from("exchanges").insert({
      product_id: productId,
      owner_id: ownerId,
      exchanger_id: exchangerId,
      status: "pending",
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Exchange created!",
        description: "The exchange has been initiated. Check your exchanges page.",
      });
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading messages...</div>;
  }

  return (
    <div className="grid md:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
      {/* Conversations List */}
      <div className="md:col-span-1">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              {conversations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="mx-auto h-12 w-12 mb-2" />
                  <p>No conversations yet</p>
                </div>
              ) : (
                <div className="space-y-2 p-4">
                  {conversations.map((conv) => (
                    <div
                      key={conv.id}
                      className={`p-3 rounded-lg cursor-pointer hover:bg-muted ${
                        selectedConversation?.id === conv.id ? "bg-muted" : ""
                      }`}
                      onClick={() => setSelectedConversation(conv)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={conv.other_user.avatar_url} />
                          <AvatarFallback>
                            {conv.other_user.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {conv.other_user.full_name || conv.other_user.username}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {conv.last_message.content}
                          </p>
                        </div>
                        {conv.unread_count > 0 && (
                          <div className="bg-primary text-primary-foreground rounded-full px-2 py-1 text-xs">
                            {conv.unread_count}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Messages */}
      <div className="md:col-span-2">
        <Card className="h-full flex flex-col">
          {selectedConversation ? (
            <>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={selectedConversation.other_user.avatar_url} />
                    <AvatarFallback>
                      {selectedConversation.other_user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {selectedConversation.other_user.full_name || selectedConversation.other_user.username}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0">
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender_id === selectedConversation.other_user.id ? "justify-start" : "justify-end"}`}
                      >
                        <div
                          className={`max-w-[70%] p-3 rounded-lg ${
                            msg.sender_id === selectedConversation.other_user.id
                              ? "bg-muted"
                              : "bg-primary text-primary-foreground"
                          }`}
                        >
                          <p>{msg.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(msg.created_at).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    />
                    <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                    {selectedConversation.product_id && (
                      <Button
                        variant="outline"
                        onClick={() => createExchange(selectedConversation.product_id!)}
                      >
                        Create Exchange
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageCircle className="mx-auto h-12 w-12 mb-2" />
                <p>Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Messages;
