import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from "lucide-react";
import { convertToEur, formatEurCurrency } from "@/services/stockApi";

interface PortfolioData {
  totalValue: number;
  totalChange: number;
  totalChangePercent: number;
  stockCount: number;
}

interface PortfolioOverviewProps {
  portfolio: PortfolioData;
}

export const PortfolioOverview = ({ portfolio }: PortfolioOverviewProps) => {
  const [eurTotalValue, setEurTotalValue] = useState<number | null>(null);
  const [eurTotalChange, setEurTotalChange] = useState<number | null>(null);

  useEffect(() => {
    const convertValues = async () => {
      try {
        const [convertedValue, convertedChange] = await Promise.all([
          convertToEur(portfolio.totalValue),
          convertToEur(portfolio.totalChange)
        ]);
        setEurTotalValue(convertedValue);
        setEurTotalChange(convertedChange);
      } catch (error) {
        console.error("Error converting portfolio to EUR:", error);
        setEurTotalValue(portfolio.totalValue);
        setEurTotalChange(portfolio.totalChange);
      }
    };
    
    convertValues();
  }, [portfolio.totalValue, portfolio.totalChange]);
  const isPositive = portfolio.totalChange >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Total Portfolio Value */}
      <Card className="bg-gradient-card shadow-card border-border/50 animate-slide-in">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/20">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Value</p>
              <p className="text-2xl font-bold text-foreground">
                {eurTotalValue !== null ? formatEurCurrency(eurTotalValue) : "Loading..."}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Total Change */}
      <Card className="bg-gradient-card shadow-card border-border/50 animate-slide-in">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-lg ${isPositive ? 'bg-success/20' : 'bg-danger/20'}`}>
              <TrendIcon className={`h-5 w-5 ${isPositive ? 'text-success' : 'text-danger'}`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Today's Change</p>
              <div className="flex items-center gap-2">
                <p className={`text-2xl font-bold ${isPositive ? 'text-success' : 'text-danger'}`}>
                  {eurTotalChange !== null 
                    ? `${isPositive ? '+' : ''}${formatEurCurrency(eurTotalChange)}`
                    : "Loading..."
                  }
                </p>
                <span className={`text-sm font-medium ${isPositive ? 'text-success' : 'text-danger'}`}>
                  ({isPositive ? '+' : ''}{portfolio.totalChangePercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Stock Count */}
      <Card className="bg-gradient-card shadow-card border-border/50 animate-slide-in">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-accent/20">
              <BarChart3 className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Holdings</p>
              <p className="text-2xl font-bold text-foreground">
                {portfolio.stockCount} {portfolio.stockCount === 1 ? 'Stock' : 'Stocks'}
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};