import { DashboardLayout } from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, Search, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  category: string;
  image: string;
  inStock: boolean;
  stockCount: number;
}

const products: Product[] = [
  {
    id: "1",
    name: "CAT6 Ethernet Cable 100m",
    sku: "CBL-CAT6-100",
    price: 89.99,
    category: "Cables",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop",
    inStock: true,
    stockCount: 150,
  },
  {
    id: "2",
    name: "RJ45 Connectors (100 pack)",
    sku: "CON-RJ45-100",
    price: 24.99,
    category: "Connectors",
    image: "https://images.unsplash.com/photo-1601524909162-ae8725290836?w=300&h=300&fit=crop",
    inStock: true,
    stockCount: 500,
  },
  {
    id: "3",
    name: "Insulated Work Gloves (L)",
    sku: "SAF-GLOVES-L",
    price: 18.99,
    category: "Safety",
    image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=300&h=300&fit=crop",
    inStock: true,
    stockCount: 200,
  },
  {
    id: "4",
    name: "Professional Crimping Tool",
    sku: "TOOL-CRIMP-01",
    price: 45.99,
    category: "Tools",
    image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=300&h=300&fit=crop",
    inStock: true,
    stockCount: 75,
  },
  {
    id: "5",
    name: "Cable Tester Pro",
    sku: "TOOL-TESTER-01",
    price: 79.99,
    category: "Tools",
    image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=300&h=300&fit=crop",
    inStock: true,
    stockCount: 45,
  },
  {
    id: "6",
    name: "Network Switch 24-Port",
    sku: "NET-SW24-01",
    price: 684.53,
    category: "Networking",
    image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=300&h=300&fit=crop",
    inStock: true,
    stockCount: 20,
  },
  {
    id: "7",
    name: "Safety Glasses Clear",
    sku: "SAF-GLASS-01",
    price: 12.99,
    category: "Safety",
    image: "https://images.unsplash.com/photo-1574482620811-1aa16ffe3c82?w=300&h=300&fit=crop",
    inStock: true,
    stockCount: 300,
  },
  {
    id: "8",
    name: "Cable Ties (1000 pack)",
    sku: "ACC-TIES-1000",
    price: 29.99,
    category: "Accessories",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=300&fit=crop",
    inStock: false,
    stockCount: 0,
  },
];

const categories = ["All", "Cables", "Connectors", "Tools", "Safety", "Networking", "Accessories"];

export default function Catalog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddToCart = (product: Product) => {
    toast.success(`Added ${product.name} to cart`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Product Catalog</h1>
            <p className="text-muted-foreground mt-1">
              Browse and order from our complete product range.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products by name or SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-4 gap-4">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-square bg-muted relative overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {!product.inStock && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Badge variant="secondary" className="bg-white text-foreground">
                      Out of Stock
                    </Badge>
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div>
                    <h3 className="font-semibold text-foreground line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{product.sku}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-bold text-foreground">
                      ${product.price.toFixed(2)}
                    </p>
                    {product.inStock && (
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-0">
                        {product.stockCount} in stock
                      </Badge>
                    )}
                  </div>
                  <Button
                    className="w-full gap-2"
                    disabled={!product.inStock}
                    onClick={() => handleAddToCart(product)}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No products found matching your criteria.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
