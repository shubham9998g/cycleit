import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Repeat, Shield, MessageCircle, CheckCircle } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <Repeat className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                CycleIt
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/auth">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/auth?tab=signup">
                <Button className="bg-gradient-primary hover:opacity-90">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Exchange Items,
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  {" "}Build Community
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Turn your unused items into treasures for others. Join CycleIt and start exchanging with people in your community today.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/auth?tab=signup">
                  <Button size="lg" className="bg-gradient-primary hover:opacity-90">
                    Start Exchanging
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/browse">
                  <Button size="lg" variant="outline">
                    Browse Items
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <img
                src={heroImage}
                alt="Community exchanging items"
                className="rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How CycleIt Works</h2>
            <p className="text-xl text-muted-foreground">
              Simple, secure, and sustainable exchanging
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Repeat className="h-8 w-8" />}
              title="List Your Items"
              description="Upload photos and details of items you want to exchange"
            />
            <FeatureCard
              icon={<MessageCircle className="h-8 w-8" />}
              title="Connect & Chat"
              description="Message interested parties and negotiate exchange terms"
            />
            <FeatureCard
              icon={<Shield className="h-8 w-8" />}
              title="Safe Exchange"
              description="Meet in safe locations or arrange secure handoffs"
            />
            <FeatureCard
              icon={<CheckCircle className="h-8 w-8" />}
              title="Confirm Trade"
              description="Both parties confirm the successful exchange"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-primary rounded-3xl p-12 text-center text-primary-foreground">
            <h2 className="text-4xl font-bold mb-4">Ready to Start Exchanging?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of users already exchanging items in your community
            </p>
            <Link to="/auth?tab=signup">
              <Button size="lg" variant="secondary">
                Create Free Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Repeat className="h-6 w-6 text-primary" />
              <span className="font-bold">CycleIt</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 CycleIt. Building sustainable communities through exchange.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="bg-card p-6 rounded-xl border hover:shadow-lg transition-shadow">
    <div className="text-primary mb-4">{icon}</div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

export default Landing;
