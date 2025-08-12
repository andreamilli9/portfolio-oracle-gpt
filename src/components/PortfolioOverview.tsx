import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from "lucide-react";

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
  const isPositive = portfolio.totalChange >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

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
                {formatCurrency(portfolio.totalValue)}
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
                  {isPositive ? '+' : ''}{formatCurrency(portfolio.totalChange)}
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