import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, X } from "lucide-react";

const CreateListing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const { data } = await supabase.from("categories").select("*").order("name");
    setCategories(data || []);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages = [...images, ...files].slice(0, 5);
    setImages(newImages);

    const urls = newImages.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newUrls = previewUrls.filter((_, i) => i !== index);
    setImages(newImages);
    setPreviewUrls(newUrls);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create a listing",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Create product
    const { data: product, error: productError } = await supabase
      .from("products")
      .insert({
        user_id: user.id,
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        category_id: formData.get("category") as string,
        condition: formData.get("condition") as any,
        desired_exchange: formData.get("desired_exchange") as string,
        location: formData.get("location") as string,
      } as any)
      .select()
      .single();

    if (productError) {
      toast({
        title: "Error creating listing",
        description: productError.message,
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Upload images
    if (images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}/${product.id}/${Date.now()}-${i}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(fileName, file);

        if (uploadError) {
          console.error("Error uploading image:", uploadError);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from("product-images")
          .getPublicUrl(fileName);

        await supabase.from("product_images").insert({
          product_id: product.id,
          image_url: publicUrl,
          display_order: i,
        });
      }
    }

    toast({
      title: "Listing created!",
      description: "Your item is now available for exchange.",
    });
    navigate("/my-listings");
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create New Listing</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" name="title" required placeholder="What are you exchanging?" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                required
                placeholder="Describe your item in detail..."
                rows={4}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Select name="category" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition">Condition *</Label>
                <Select name="condition" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="like-new">Like New</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="acceptable">Acceptable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="desired_exchange">What are you looking for?</Label>
              <Input
                id="desired_exchange"
                name="desired_exchange"
                placeholder="e.g., Books, electronics, sports equipment..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" name="location" placeholder="City or neighborhood" />
            </div>

            <div className="space-y-2">
              <Label>Images (up to 3)</Label>
              <div className="grid grid-cols-5 gap-2">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative aspect-square">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {images.length < 3 && (
                  <label className="aspect-square border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  </label>
                )}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Create Listing"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateListing;
