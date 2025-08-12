import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddStockFormProps {
  onAddStock: (symbol: string) => void;
}

export const AddStockForm = ({ onAddStock }: AddStockFormProps) => {
  const [symbol, setSymbol] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!symbol.trim()) {
      toast({
        title: "Error",
        description: "Please enter a stock symbol",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await onAddStock(symbol.toUpperCase().trim());
      setSymbol("");
      toast({
        title: "Success",
        description: `${symbol.toUpperCase()} added to your portfolio`,
      });
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to add stock. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-gradient-card shadow-card border-border/50 animate-slide-in">
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="symbol" className="text-sm font-medium text-foreground">
              Stock Symbol
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="symbol"
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                placeholder="e.g. AAPL, GOOGL, TSLA"
                className="pl-10 bg-secondary/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                disabled={isLoading}
              />
            </div>
          </div>
          
          <Button
            type="submit"
            disabled={isLoading || !symbol.trim()}
            className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                Adding...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add to Portfolio
              </div>
            )}
          </Button>
        </form>
      </div>
    </Card>
  );
};