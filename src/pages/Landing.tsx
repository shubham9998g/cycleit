import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Repeat, Shield, MessageCircle, CheckCircle } from "lucide-react";
import heroImage from "@/assets/hero-image.webp";
import { motion } from "framer-motion";
import { useState } from "react";
import { Menu, X, Facebook, Twitter, Instagram } from "lucide-react";

const Landing = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation (Upgraded) */}
      <nav className="sticky top-0 left-0 z-30 w-full border-b bg-background/80 backdrop-blur shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Repeat className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">CycleIt</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <Link className="hover:text-primary transition-colors font-medium" to="/">Home</Link>
            <Link className="hover:text-primary transition-colors font-medium" to="/browse">Browse</Link>
            <Link className="hover:text-primary transition-colors font-medium" to="/#about">About</Link>
            <Link className="hover:text-primary transition-colors font-medium" to="/#contact">Contact</Link>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/auth">
              <Button variant="ghost" className="hidden md:inline-flex">Sign In</Button>
            </Link>
            <Link to="/auth?tab=signup">
              <Button className="bg-gradient-primary hover:opacity-90 hidden md:inline-flex">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            {/* Mobile hamburger */}
            <button
              className="md:hidden ml-2 p-2 rounded-full bg-muted border border-border"
              onClick={() => setMobileOpen(o => !o)}
              aria-label="Open menu"
            >
              {mobileOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
        {/* Mobile nav menu */}
        {mobileOpen && (
          <div className="md:hidden absolute w-full left-0 bg-background border-t shadow animate-fade-in-down z-40">
            <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
              <Link className="font-medium py-2" to="/">Home</Link>
              <Link className="font-medium py-2" to="/browse">Browse</Link>
              <Link className="font-medium py-2" to="/#about">About</Link>
              <Link className="font-medium py-2" to="/#contact">Contact</Link>
              <Link className="font-medium py-2" to="/auth">Sign In</Link>
              <Link className="font-medium py-2" to="/auth?tab=signup">Get Started</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Decorative Blobs */}
        <div className="absolute -top-28 -left-32 w-96 h-96 bg-gradient-to-tr from-primary/40 to-purple-500/20 rounded-full blur-2xl opacity-60 z-0 animate-float-slow" />
        <div className="absolute top-1/3 right-0 w-72 h-72 bg-gradient-to-tl from-secondary/40 to-blue-400/30 rounded-full blur-3xl opacity-60 z-0 animate-float-md" />
        <div className="absolute inset-0 bg-gradient-hero opacity-10" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              {/* Animated headline */}
              <motion.h1
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: -80, opacity: 1 }}
                transition={{ duration: 0.75, ease: "easeOut" }}
                className="text-5xl md:text-6xl font-black mb-6 tracking-tight leading-tight"
              >
                Exchange Items,<br />
                <span className="bg-gradient-primary bg-clip-text text-transparent">
                  Build Community
                </span>
              </motion.h1>
              {/* Animated subtext */}
              <motion.p
                initial={{ y: 0, opacity: 0 }}
                animate={{ y: -60, opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.6 }}
                className="text-xl text-muted-foreground mb-8"
              >
                Turn your unused items into treasures for others. Join CycleIt and start exchanging with people in your community today.
              </motion.p>
              {/* Call to action buttons */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7, duration: 0.3 }}
                className="flex flex-wrap gap-4"
              >
                <Link to="/auth?tab=signup">
                  <Button size="lg" className="bg-gradient-primary hover:brightness-110 shadow-md hover:scale-105 transition-transform">
                    Start Exchanging
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/browse">
                  <Button size="lg" variant="outline" className="hover:scale-105 transition-transform">
                    Browse Items
                  </Button>
                </Link>
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 150 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25, duration: 0.8, type: "spring", stiffness: 70 }}
              className="relative"
            >
              {/* Hero image with glow */}
              <div className="absolute -top-10 -right-10 w-33 h-33 bg-gradient-to-br from-primary/30 via-blue-300/20 to-transparent opacity-70 z-0" />
              <img
                src={heroImage}
                alt="Community exchanging items"
                className="rounded-3xl relative z-10"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4 tracking-tight">How CycleIt Works</h2>
            <p className="text-xl text-muted-foreground">
              Simple, secure, and sustainable exchanging
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Repeat className="h-8 w-8" />}
              title="List Your Items"
              description="Upload photos and details of items you want to exchange"
              step={1}
            />
            <FeatureCard
              icon={<MessageCircle className="h-8 w-8" />}
              title="Connect & Chat"
              description="Message interested parties and negotiate exchange terms"
              step={2}
            />
            <FeatureCard
              icon={<Shield className="h-8 w-8" />}
              title="Safe Exchange"
              description="Meet in safe locations or arrange secure handoffs"
              step={3}
            />
            <FeatureCard
              icon={<CheckCircle className="h-8 w-8" />}
              title="Confirm Trade"
              description="Both parties confirm the successful exchange"
              step={4}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-br from-primary/90 to-blue-600 rounded-3xl p-12 text-center text-primary-foreground shadow-xl relative overflow-hidden"
          >
            {/* CTA floating shapes */}
            <div className="absolute top-0 left-0 w-52 h-44 bg-blue-500/30 rounded-full blur-2xl opacity-50 -z-1 animate-float-md" />
            <h2 className="text-4xl font-black mb-4">Ready to Start Exchanging?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of users already exchanging items in your community
            </p>
            <Link to="/auth?tab=signup">
              <Button size="lg" variant="secondary" className="text-xl shadow-md hover:scale-105 transition-transform">
                Create Free Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer (Upgrade) */}
      <footer className="border-t py-10 bg-background/90 backdrop-blur mt-8">
        <div className="container mx-auto px-4 flex flex-col lg:flex-row justify-between items-center gap-6 lg:gap-2">
          <div className="flex items-center gap-2">
            <Repeat className="h-7 w-7 text-primary" />
            <span className="font-bold text-lg">CycleIt</span>
          </div>
          {/* Removed navbar links here */}
          <div className="flex items-center gap-4">
            {/* Placeholder: Add actual URLs for your socials */}
            <a href="#" aria-label="Facebook" className="hover:text-primary"><Facebook /></a>
            <a href="#" aria-label="Twitter" className="hover:text-primary"><Twitter /></a>
            <a href="#" aria-label="Instagram" className="hover:text-primary"><Instagram /></a>
          </div>
        </div>
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground mt-5">
          © 2025 CycleIt. Building sustainable communities through exchange.
        </div>
      </footer>
    </div>
  );
};

// Enhanced FeatureCard with icon backgrounds and step number
const FeatureCard = ({ icon, title, description, step }: { icon: React.ReactNode; title: string; description: string; step: number }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="group bg-white/60 lg:bg-card/90 p-7 rounded-xl border hover:shadow-2xl transition-shadow cursor-pointer flex flex-col items-center text-center"
  >
    <div className="relative mb-4">
      <div className="bg-gradient-to-br from-primary/30 to-blue-400/20 rounded-full p-4 mb-2 inline-block group-hover:shadow-lg transition-shadow">
        <span className="text-primary">{icon}</span>
      </div>
      <span className="absolute -top-3 -right-3 bg-primary text-primary-foreground rounded-full px-2 py-px text-xs font-bold shadow-lg">Step {step}</span>
    </div>
    <h3 className="text-xl font-semibold mb-1">{title}</h3>
    <p className="text-muted-foreground text-base">{description}</p>
  </motion.div>
);

export default Landing;
