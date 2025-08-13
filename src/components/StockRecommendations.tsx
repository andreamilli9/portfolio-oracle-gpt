import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Plus, ExternalLink, Newspaper, AlertTriangle, RefreshCw } from "lucide-react";
import { convertToEur, formatEurCurrency, StockError, createStockError } from "@/services/stockApi";
import { RecommendationFilters } from "./RecommendationFilters";
import { useToast } from "@/hooks/use-toast";

interface StockRecommendation {
  symbol: string;
  name: string;
  currentPrice: number;
  targetPrice: number;
  upside: number;
  confidence: number;
  reason: string;
  newsImpact: "positive" | "negative" | "neutral";
}

interface StockRecommendationsProps {
  recommendations: StockRecommendation[];
  onAddStock: (symbol: string) => Promise<void>;
  onFiltersChange: (filters: { maxPrice?: number }) => void;
  onApplyFilters: () => void;
  loading?: boolean;
  error?: StockError | null;
  onRetry?: () => void;
}

export const StockRecommendations = ({ 
  recommendations, 
  onAddStock, 
  onFiltersChange, 
  onApplyFilters,
  loading = false,
  error = null,
  onRetry
}: StockRecommendationsProps) => {
  const [eurRecommendations, setEurRecommendations] = useState<Array<any & { eurCurrentPrice: number; eurTargetPrice: number; usdCurrentPrice: number; usdTargetPrice: number }> | null>(null);
  const [conversionError, setConversionError] = useState<StockError | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const convertRecommendations = async () => {
      if (!recommendations || recommendations.length === 0) {
        setEurRecommendations([]);
        return;
      }

      try {
        setConversionError(null);
        const convertedRecs = await Promise.all(
          recommendations.map(async (rec) => {
            const [eurCurrentPrice, eurTargetPrice] = await Promise.all([
              convertToEur(rec.currentPrice),
              convertToEur(rec.targetPrice)
            ]);
            
            return {
              ...rec,
              eurCurrentPrice,
              eurTargetPrice,
              usdCurrentPrice: rec.currentPrice,
              usdTargetPrice: rec.targetPrice
            };
          })
        );
        
        setEurRecommendations(convertedRecs);
      } catch (error) {
        console.error("Error converting recommendations to EUR:", error);
        const stockError = createStockError(error, 'currency conversion');
        setConversionError(stockError);
        
        // Fallback to USD values only
        setEurRecommendations(recommendations.map(rec => ({
          ...rec,
          eurCurrentPrice: rec.currentPrice,
          eurTargetPrice: rec.targetPrice,
          usdCurrentPrice: rec.currentPrice,
          usdTargetPrice: rec.targetPrice
        })));
        
        toast({
          title: "Currency conversion issue",
          description: stockError.solution,
          variant: "destructive",
        });
      }
    };
    
    convertRecommendations();
  }, [recommendations]);
  const getNewsImpactColor = (impact: string) => {
    switch (impact) {
      case "positive":
        return "text-success";
      case "negative":
        return "text-danger";
      default:
        return "text-muted-foreground";
    }
  };

  const getConfidenceVariant = (confidence: number) => {
    if (confidence >= 80) return "success";
    if (confidence >= 60) return "warning";
    return "secondary";
  };

  return (
    <div className="space-y-4">
      <RecommendationFilters 
        onFiltersChange={onFiltersChange}
        onApplyFilters={onApplyFilters}
        loading={loading}
      />
      
      <Card className="bg-gradient-card shadow-card border-border/50 animate-slide-in">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-success" />
              <h3 className="text-lg font-semibold text-foreground">AI Stock Recommendations</h3>
            </div>
            {(error || conversionError) && onRetry && (
              <Button variant="outline" size="sm" onClick={onRetry}>
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            )}
          </div>

          {/* Error Display */}
          {(error || conversionError) && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-destructive">
                    {error?.message || conversionError?.message || "Failed to load recommendations"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {error?.solution || conversionError?.solution || "Please try again or check your connection"}
                  </p>
                  {((error?.canRetry || conversionError?.canRetry) && onRetry) && (
                    <Button variant="outline" size="sm" onClick={onRetry} className="mt-2">
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Try Again
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading AI recommendations...</p>
            </div>
          ) : eurRecommendations === null ? (
            <div className="text-center py-8 text-muted-foreground">
              Preparing recommendations...
            </div>
          ) : eurRecommendations.length === 0 && !error ? (
            <div className="text-center py-8">
              <Newspaper className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No recommendations match your filters</p>
              <p className="text-sm text-muted-foreground mt-1">Try adjusting your maximum price filter or check back later</p>
            </div>
          ) : (
            eurRecommendations.map((stock) => (
              <div
                key={stock.symbol}
                className="p-4 rounded-lg bg-secondary/20 border border-border/30 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-foreground">{stock.symbol}</h4>
                      <Badge variant={getConfidenceVariant(stock.confidence)} className="text-xs">
                        {stock.confidence.toFixed(0)}% confidence
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{stock.name}</p>
                  </div>
                  
                  <Button
                    size="sm"
                    onClick={() => onAddStock(stock.symbol)}
                    className="bg-gradient-success hover:shadow-success transition-all duration-300"
                  >
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Current Price</p>
                    <p className="font-medium text-foreground">{formatEurCurrency(stock.eurCurrentPrice)}</p>
                    <p className="text-xs text-muted-foreground">${stock.usdCurrentPrice.toFixed(2)} USD</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Target Price</p>
                    <p className="font-medium text-success">{formatEurCurrency(stock.eurTargetPrice)}</p>
                    <p className="text-xs text-muted-foreground">${stock.usdTargetPrice.toFixed(2)} USD</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Upside:</span>
                    <span className="font-medium text-success">+{stock.upside.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Newspaper className="h-4 w-4 text-muted-foreground" />
                    <span className={`text-sm font-medium ${getNewsImpactColor(stock.newsImpact)}`}>
                      {stock.newsImpact} sentiment
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/30">
                  <p className="text-xs text-muted-foreground leading-relaxed">{stock.reason}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
    </div>
  );
};