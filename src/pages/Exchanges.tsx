import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle, Clock, XCircle, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

type Exchange = {
  id: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  created_at: string;
  confirmed_at: string | null;
  completed_at: string | null;
  owner: {
    id: string;
    username: string;
    avatar_url: string;
    full_name: string;
  };
  exchanger: {
    id: string;
    username: string;
    avatar_url: string;
    full_name: string;
  };
  product: {
    id: string;
    title: string;
    product_images: { image_url: string }[];
  };
};

const Exchanges = () => {
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadExchanges();
  }, []);

  const loadExchanges = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("exchanges")
      .select(`
        *,
        owner:profiles!exchanges_owner_id_fkey(id, username, avatar_url, full_name),
        exchanger:profiles!exchanges_exchanger_id_fkey(id, username, avatar_url, full_name),
        product:products(id, title, product_images(image_url))
      `)
      .or(`owner_id.eq.${user.id},exchanger_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    setExchanges(data || []);
    setLoading(false);
  };

  const updateExchangeStatus = async (exchangeId: string, newStatus: "pending" | "confirmed" | "completed" | "cancelled") => {
    const { error } = await supabase
      .from("exchanges")
      .update({ status: newStatus })
      .eq("id", exchangeId);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Status updated",
        description: `Exchange status changed to ${newStatus}.`,
      });
      loadExchanges();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary";
      case "confirmed":
        return "default";
      case "completed":
        return "default";
      case "cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const activeExchanges = exchanges.filter(e => e.status === "pending" || e.status === "confirmed");
  const completedExchanges = exchanges.filter(e => e.status === "completed");
  const cancelledExchanges = exchanges.filter(e => e.status === "cancelled");

  if (loading) {
    return <div className="text-center py-12">Loading exchanges...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">My Exchanges</h1>
        <p className="text-muted-foreground">Track your item exchanges and their progress</p>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">Active ({activeExchanges.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedExchanges.length})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({cancelledExchanges.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeExchanges.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No active exchanges
            </div>
          ) : (
            activeExchanges.map((exchange) => (
              <ExchangeCard key={exchange.id} exchange={exchange} onUpdateStatus={updateExchangeStatus} />
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedExchanges.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No completed exchanges
            </div>
          ) : (
            completedExchanges.map((exchange) => (
              <ExchangeCard key={exchange.id} exchange={exchange} />
            ))
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-4">
          {cancelledExchanges.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No cancelled exchanges
            </div>
          ) : (
            cancelledExchanges.map((exchange) => (
              <ExchangeCard key={exchange.id} exchange={exchange} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

const ExchangeCard = ({ exchange, onUpdateStatus }: { exchange: Exchange; onUpdateStatus?: (exchangeId: string, newStatus: "pending" | "confirmed" | "completed" | "cancelled") => Promise<void> }) => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  if (!user) return null;

  const isOwner = user.id === exchange.owner.id;
  const otherUser = isOwner ? exchange.exchanger : exchange.owner;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />;
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary";
      case "confirmed":
        return "default";
      case "completed":
        return "default";
      case "cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };



  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <img
            src={exchange.product.product_images[0]?.image_url || "/placeholder.svg"}
            alt={exchange.product.title}
            className="w-16 h-16 rounded-lg object-cover"
          />
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold">{exchange.product.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {isOwner ? "You offered this item" : "You requested this item"}
                </p>
              </div>
              <Badge variant={getStatusColor(exchange.status) as any} className="flex items-center gap-1">
                {getStatusIcon(exchange.status)}
                {exchange.status.charAt(0).toUpperCase() + exchange.status.slice(1)}
              </Badge>
            </div>

            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={otherUser.avatar_url} />
                <AvatarFallback>
                  {otherUser.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">
                  {otherUser.full_name || otherUser.username}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(exchange.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button size="sm" variant="outline" asChild>
                <Link to={`/product/${exchange.product.id}`}>
                  View Item
                </Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link to={`/messages?user=${otherUser.id}`}>
                  <MessageCircle className="mr-1 h-3 w-3" />
                  Message
                </Link>
              </Button>
              {exchange.status === "pending" && onUpdateStatus && (
                <Button
                  size="sm"
                  onClick={() => onUpdateStatus(exchange.id, "confirmed")}
                >
                  Confirm Exchange
                </Button>
              )}
              {exchange.status === "confirmed" && onUpdateStatus && (
                <Button
                  size="sm"
                  onClick={() => onUpdateStatus(exchange.id, "completed")}
                >
                  Mark as Completed
                </Button>
              )}
              {(exchange.status === "pending" || exchange.status === "confirmed") && onUpdateStatus && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onUpdateStatus(exchange.id, "cancelled")}
                >
                  Cancel Exchange
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Exchanges;
