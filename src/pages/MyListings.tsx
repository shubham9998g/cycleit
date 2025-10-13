import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash2, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Product = {
  id: string;
  title: string;
  description: string;
  condition: string;
  is_active: boolean;
  created_at: string;
  categories: { name: string };
  product_images: { image_url: string }[];
};

const MyListings = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("products")
      .select(
        `
        *,
        categories(name),
        product_images(image_url)
      `
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setProducts(data || []);
    setLoading(false);
  };

  const handleDelete = async (productId: string) => {
    const { error } = await supabase.from("products").delete().eq("id", productId);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Listing deleted",
        description: "Your listing has been removed.",
      });
      loadProducts();
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading your listings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Listings</h1>
          <p className="text-muted-foreground">Manage your exchange listings</p>
        </div>
        <Link to="/create-listing">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Listing
          </Button>
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">You haven't created any listings yet.</p>
          <Link to="/create-listing">
            <Button>Create Your First Listing</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              <div className="aspect-square overflow-hidden bg-muted">
                <img
                  src={product.product_images[0]?.image_url || "/placeholder.svg"}
                  alt={product.title}
                  className="h-full w-full object-cover"
                />
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold line-clamp-1">{product.title}</h3>
                  <Badge variant={product.is_active ? "default" : "secondary"}>
                    {product.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {product.description}
                </p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <Link to={`/edit-listing/${product.id}`}>
                      <Edit className="mr-1 h-3 w-3" />
                      Edit
                    </Link>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive">
                        <Trash2 className="mr-1 h-3 w-3" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Listing</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this listing? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(product.id)}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyListings;
