import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, MessageCircle, Repeat, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const [stats, setStats] = useState({
    myListings: 0,
    unreadMessages: 0,
    activeExchanges: 0,
    completedExchanges: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [products, messages, exchanges] = await Promise.all([
      supabase.from("products").select("*", { count: "exact" }).eq("user_id", user.id),
      supabase
        .from("messages")
        .select("*", { count: "exact" })
        .eq("recipient_id", user.id)
        .eq("is_read", false),
      supabase
        .from("exchanges")
        .select("*")
        .or(`owner_id.eq.${user.id},exchanger_id.eq.${user.id}`),
    ]);

    const activeExchanges = exchanges.data?.filter(
      (e) => e.status === "pending" || e.status === "confirmed"
    ).length || 0;
    const completedExchanges = exchanges.data?.filter((e) => e.status === "completed").length || 0;

    setStats({
      myListings: products.count || 0,
      unreadMessages: messages.count || 0,
      activeExchanges,
      completedExchanges,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening with your exchanges.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="My Listings"
          value={stats.myListings}
          icon={<Package className="h-4 w-4" />}
          link="/my-listings"
        />
        <StatCard
          title="Unread Messages"
          value={stats.unreadMessages}
          icon={<MessageCircle className="h-4 w-4" />}
          link="/messages"
        />
        <StatCard
          title="Active Exchanges"
          value={stats.activeExchanges}
          icon={<Repeat className="h-4 w-4" />}
          link="/exchanges"
        />
        <StatCard
          title="Completed"
          value={stats.completedExchanges}
          icon={<TrendingUp className="h-4 w-4" />}
          link="/exchanges"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link to="/create-listing">
              <Button className="w-full">Create New Listing</Button>
            </Link>
            <Link to="/browse">
              <Button variant="outline" className="w-full">
                Browse Items
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>1. Create your first listing with photos</p>
            <p>2. Browse items you're interested in</p>
            <p>3. Express interest and start chatting</p>
            <p>4. Arrange a safe exchange location</p>
            <p>5. Confirm the exchange when complete</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const StatCard = ({
  title,
  value,
  icon,
  link,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  link: string;
}) => (
  <Link to={link}>
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  </Link>
);

export default Dashboard;
