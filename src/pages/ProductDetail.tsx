import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { MapPin, Calendar, Heart, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [hasExpressedInterest, setHasExpressedInterest] = useState(false);
  const [interestMessage, setInterestMessage] = useState("");

  useEffect(() => {
    loadProduct();
    loadCurrentUser();
  }, [id]);

  const loadCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
      checkInterest(user.id);
    }
  };

  const checkInterest = async (userId: string) => {
    const { data } = await supabase
      .from("interests")
      .select("*")
      .eq("product_id", id)
      .eq("user_id", userId)
      .single();
    setHasExpressedInterest(!!data);
  };

  const loadProduct = async () => {
    const { data } = await supabase
      .from("products")
      .select(
        `
        *,
        categories(name),
        profiles(id, username, avatar_url, full_name, location),
        product_images(image_url, display_order)
      `
      )
      .eq("id", id)
      .single();

    setProduct(data);
    setLoading(false);
  };

  const handleExpressInterest = async () => {
    if (!currentUserId) {
      navigate("/auth");
      return;
    }

    const { error } = await supabase.from("interests").insert({
      product_id: id,
      user_id: currentUserId,
      message: interestMessage,
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Interest expressed!",
        description: "The owner will be notified. You can now message them.",
      });
      setHasExpressedInterest(true);
      
      // Create initial message
      if (interestMessage) {
        await supabase.from("messages").insert({
          sender_id: currentUserId,
          recipient_id: product.user_id,
          product_id: id,
          content: interestMessage,
        });
      }
    }
  };

  const handleMessage = () => {
    navigate(`/messages?user=${product.profiles.id}`);
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!product) {
    return <div className="text-center py-12">Product not found</div>;
  }

  const images = product.product_images?.sort((a: any, b: any) => a.display_order - b.display_order) || [];
  const isOwnProduct = currentUserId === product.user_id;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          {images.length > 0 ? (
            <Carousel className="w-full">
              <CarouselContent>
                {images.map((img: any, index: number) => (
                  <CarouselItem key={index}>
                    <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                      <img
                        src={img.image_url}
                        alt={`${product.title} - ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {images.length > 1 && (
                <>
                  <CarouselPrevious />
                  <CarouselNext />
                </>
              )}
            </Carousel>
          ) : (
            <div className="aspect-square rounded-lg bg-muted flex items-center justify-center">
              <p className="text-muted-foreground">No images available</p>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-3xl font-bold">{product.title}</h1>
              <Badge variant="secondary" className="capitalize">
                {product.condition}
              </Badge>
            </div>
            <p className="text-muted-foreground">{product.categories.name}</p>
          </div>

          <p className="text-lg">{product.description}</p>

          {product.desired_exchange && (
            <div>
              <h3 className="font-semibold mb-2">Looking to exchange for:</h3>
              <p className="text-muted-foreground">{product.desired_exchange}</p>
            </div>
          )}

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {product.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {product.location}
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(product.created_at).toLocaleDateString()}
            </div>
          </div>

          {/* Seller Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <img
                  src={product.profiles.avatar_url || "/placeholder.svg"}
                  alt={product.profiles.username}
                  className="h-12 w-12 rounded-full"
                />
                <div>
                  <p className="font-semibold">
                    {product.profiles.full_name || product.profiles.username}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    @{product.profiles.username}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          {!isOwnProduct && (
            <div className="space-y-4">
              {!hasExpressedInterest ? (
                <>
                  <div className="space-y-2">
                    <Label>Message (optional)</Label>
                    <Textarea
                      placeholder="Tell the owner why you're interested..."
                      value={interestMessage}
                      onChange={(e) => setInterestMessage(e.target.value)}
                    />
                  </div>
                  <Button
                    size="lg"
                    className="w-full bg-gradient-primary"
                    onClick={handleExpressInterest}
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    Express Interest
                  </Button>
                </>
              ) : (
                <Button size="lg" className="w-full" onClick={handleMessage}>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
              )}
            </div>
          )}

          {isOwnProduct && (
            <div className="space-y-2">
              <Button
                size="lg"
                className="w-full"
                onClick={() => navigate(`/edit-listing/${id}`)}
              >
                Edit Listing
              </Button>
              <p className="text-sm text-center text-muted-foreground">
                This is your listing
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
