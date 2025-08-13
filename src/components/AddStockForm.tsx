import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Search, AlertTriangle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { searchStocks, StockError, createStockError } from "@/services/stockApi";

interface AddStockFormProps {
  onAddStock: (symbol: string) => Promise<void>;
}

export const AddStockForm = ({ onAddStock }: AddStockFormProps) => {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [currentError, setCurrentError] = useState<StockError | null>(null);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setCurrentError(null);
    
    try {
      const results = await searchStocks(query.trim());
      setSearchResults(results);
      
      if (results.length === 0) {
        toast({
          title: "No results found",
          description: "Try searching with a different company name or stock symbol",
          variant: "destructive",
        });
      }
    } catch (error) {
      const stockError = createStockError(error, 'stock search');
      setCurrentError(stockError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStock = async (symbol: string) => {
    setIsLoading(true);
    setCurrentError(null);
    
    try {
      await onAddStock(symbol);
      setQuery("");
      setSearchResults([]);
      toast({
        title: "Success",
        description: `${symbol} added to your portfolio`,
      });
    } catch (error) {
      const stockError = createStockError(error, 'adding stock');
      setCurrentError(stockError);
      
      toast({
        title: stockError.message,
        description: stockError.solution,
        variant: "destructive",
        action: stockError.canRetry ? (
          <Button variant="outline" size="sm" onClick={() => handleAddStock(symbol)}>
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry
          </Button>
        ) : undefined,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      toast({
        title: "Search required",
        description: "Please enter a company name or stock symbol",
        variant: "destructive",
      });
      return;
    }

    await handleSearch();
  };

  return (
    <Card className="bg-gradient-card shadow-card border-border/50 animate-slide-in">
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="query" className="text-sm font-medium text-foreground">
              Search Stocks
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="query"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Apple, Microsoft, TSLA, Google"
                className="pl-10 bg-secondary/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
                disabled={isLoading}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Search by company name or stock symbol across global markets
            </p>
          </div>
          
          <Button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                Searching...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Search Stocks
              </div>
            )}
          </Button>
        </form>

        {/* Error Display */}
        {currentError && (
          <div className="mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-destructive">{currentError.message}</p>
                <p className="text-xs text-muted-foreground">{currentError.solution}</p>
                {currentError.canRetry && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleSearch}
                    className="mt-2"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Try Again
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mt-4 space-y-2">
            <Label className="text-sm font-medium text-foreground">Search Results</Label>
            <div className="space-y-2">
              {searchResults.map((symbol) => (
                <div 
                  key={symbol}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 border border-border/30"
                >
                  <span className="font-medium text-foreground">{symbol}</span>
                  <Button
                    size="sm"
                    onClick={() => handleAddStock(symbol)}
                    disabled={isLoading}
                    className="bg-gradient-success hover:shadow-success"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};