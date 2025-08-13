import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, X, MoreVertical } from "lucide-react";
import { convertToEur, formatEurCurrency } from "@/services/stockApi";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface StockCardProps {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  recommendation?: "BUY" | "SELL" | "HOLD";
  onRemove?: () => void;
}

export const StockCard = ({
  symbol,
  name,
  price,
  change,
  changePercent,
  recommendation,
  onRemove,
}: StockCardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [eurPrice, setEurPrice] = useState<number | null>(null);
  const [eurChange, setEurChange] = useState<number | null>(null);

  useEffect(() => {
    const convertPrices = async () => {
      try {
        const [convertedPrice, convertedChange] = await Promise.all([
          convertToEur(price),
          convertToEur(change)
        ]);
        setEurPrice(convertedPrice);
        setEurChange(convertedChange);
      } catch (error) {
        console.error("Error converting to EUR:", error);
        setEurPrice(price);
        setEurChange(change);
      }
    };
    
    convertPrices();
  }, [price, change]);

  const isPositive = change >= 0;
  const isNeutral = change === 0;

  const TrendIcon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown;

  const getRecommendationVariant = () => {
    switch (recommendation) {
      case "BUY":
        return "success";
      case "SELL":
        return "danger";
      case "HOLD":
        return "warning";
      default:
        return "secondary";
    }
  };

  return (
    <Card className="group relative overflow-hidden bg-gradient-card shadow-card border-border/50 hover:shadow-glow transition-all duration-300 hover:scale-[1.02] animate-slide-in">
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-foreground">{symbol}</h3>
            <p className="text-sm text-muted-foreground truncate max-w-32">{name}</p>
          </div>
          
          <div className="flex items-center gap-2">
            {recommendation && (
              <Badge variant={getRecommendationVariant()} className="text-xs font-medium">
                {recommendation}
              </Badge>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onRemove} className="text-danger">
                  <X className="h-4 w-4 mr-2" />
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Price and Change */}
        <div className="space-y-3">
          {/* EUR Price (Primary) */}
          <div className="text-2xl font-bold text-foreground">
            {eurPrice !== null ? formatEurCurrency(eurPrice) : "Loading..."}
          </div>
          
          {/* USD Price (Secondary) */}
          <div className="text-lg text-muted-foreground">
            ${price.toFixed(2)} USD
          </div>
          
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1 text-sm font-medium ${
                isPositive
                  ? "text-success"
                  : isNeutral
                  ? "text-muted-foreground"
                  : "text-danger"
              }`}
            >
              <TrendIcon className="h-4 w-4" />
              <div className="flex flex-col gap-1">
                <span>
                  {eurChange !== null 
                    ? `${isPositive ? "+" : ""}${formatEurCurrency(eurChange)} EUR`
                    : "Loading..."
                  }
                </span>
                <span className="text-xs">
                  ${isPositive ? "+" : ""}{change.toFixed(2)} USD ({isPositive ? "+" : ""}{changePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center">
            <div className="animate-pulse-glow">
              <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};