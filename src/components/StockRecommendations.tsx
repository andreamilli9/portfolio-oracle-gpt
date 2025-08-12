import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Plus, ExternalLink, Newspaper } from "lucide-react";

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
  onAddStock: (symbol: string) => void;
}

export const StockRecommendations = ({ recommendations, onAddStock }: StockRecommendationsProps) => {
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
    <Card className="bg-gradient-card shadow-card border-border/50 animate-slide-in">
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-success" />
          <h3 className="text-lg font-semibold text-foreground">AI Stock Recommendations</h3>
        </div>

        <div className="space-y-4">
          {recommendations.length === 0 ? (
            <div className="text-center py-8">
              <Newspaper className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No recommendations available</p>
              <p className="text-sm text-muted-foreground mt-1">Check back later for AI-powered stock suggestions</p>
            </div>
          ) : (
            recommendations.map((stock) => (
              <div
                key={stock.symbol}
                className="p-4 rounded-lg bg-secondary/20 border border-border/30 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-foreground">{stock.symbol}</h4>
                      <Badge variant={getConfidenceVariant(stock.confidence)} className="text-xs">
                        {stock.confidence}% confidence
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
                    <p className="font-medium text-foreground">${stock.currentPrice.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Target Price</p>
                    <p className="font-medium text-success">${stock.targetPrice.toFixed(2)}</p>
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
  );
};