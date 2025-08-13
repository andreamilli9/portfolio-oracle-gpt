import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { StockCard } from "@/components/StockCard";
import { AddStockForm } from "@/components/AddStockForm";
import { ForecastCard } from "@/components/ForecastCard";
import { StockRecommendations } from "@/components/StockRecommendations";
import { PortfolioOverview } from "@/components/PortfolioOverview";
import { StockApiService, StockData, ForecastData, StockError, createStockError } from "@/services/stockApi";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, Sparkles, RefreshCw } from "lucide-react";

interface StockWithAnalysis extends StockData {
  recommendation?: "BUY" | "SELL" | "HOLD";
  forecast?: ForecastData[];
  aiInsight?: string;
}

const Index = () => {
  const [stocks, setStocks] = useState<StockWithAnalysis[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [recommendationError, setRecommendationError] = useState<StockError | null>(null);
  const [selectedStock, setSelectedStock] = useState<StockWithAnalysis | null>(null);
  const [recommendationFilters, setRecommendationFilters] = useState<{ maxPrice?: number }>({});
  const { toast } = useToast();

  // Calculate portfolio totals
  const portfolioData = {
    totalValue: stocks.reduce((sum, stock) => sum + stock.price * 100, 0), // Assuming 100 shares each
    totalChange: stocks.reduce((sum, stock) => sum + stock.change * 100, 0),
    totalChangePercent: stocks.length > 0 
      ? (stocks.reduce((sum, stock) => sum + stock.changePercent, 0) / stocks.length)
      : 0,
    stockCount: stocks.length
  };

  const addStock = async (symbol: string) => {
    try {
      setLoading(true);
      
      // Check if stock already exists
      if (stocks.find(s => s.symbol === symbol)) {
        toast({
          title: "Stock already added",
          description: `${symbol} is already in your portfolio`,
          variant: "destructive",
        });
        return;
      }

      const stockData = await StockApiService.getStock(symbol);
      const news = await StockApiService.getStockNews(symbol);
      const analysis = await StockApiService.analyzeStock(symbol, news);
      const forecast = await StockApiService.getForecast(symbol, stockData.price);
      
      const stockWithAnalysis: StockWithAnalysis = {
        ...stockData,
        recommendation: analysis.recommendation,
        forecast,
        aiInsight: analysis.insight
      };
      
      setStocks(prev => [...prev, stockWithAnalysis]);
    } catch (error) {
      console.error("Error adding stock:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeStock = (symbol: string) => {
    setStocks(prev => prev.filter(stock => stock.symbol !== symbol));
    if (selectedStock?.symbol === symbol) {
      setSelectedStock(null);
    }
    toast({
      title: "Stock removed",
      description: `${symbol} has been removed from your portfolio`,
    });
  };

  const refreshData = async () => {
    if (stocks.length === 0) return;
    
    setLoading(true);
    try {
      const symbols = stocks.map(s => s.symbol);
      const updatedStocks = await Promise.all(
        symbols.map(async (symbol) => {
          const stockData = await StockApiService.getStock(symbol);
          const existingStock = stocks.find(s => s.symbol === symbol);
          return {
            ...stockData,
            recommendation: existingStock?.recommendation,
            forecast: existingStock?.forecast,
            aiInsight: existingStock?.aiInsight
          };
        })
      );
      setStocks(updatedStocks);
      toast({
        title: "Data refreshed",
        description: "Stock prices have been updated",
      });
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: "Unable to refresh stock data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadRecommendations = async () => {
    setLoading(true);
    setRecommendationError(null);
    
    try {
      // Convert maxPrice to USD if set (API expects USD)
      let maxPriceUsd = recommendationFilters.maxPrice;
      if (maxPriceUsd) {
        // Rough conversion EUR to USD (should use actual exchange rate)
        maxPriceUsd = maxPriceUsd / 0.85;
      }
      
      const recs = await StockApiService.getRecommendations(maxPriceUsd);
      setRecommendations(recs);
      
      if (recs.length > 0) {
        toast({
          title: "Recommendations updated",
          description: `Found ${recs.length} stocks matching your criteria`,
        });
      } else {
        toast({
          title: "No recommendations found",
          description: "Try adjusting your filters or check back later",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error loading recommendations:", error);
      const stockError = createStockError(error, 'loading recommendations');
      setRecommendationError(stockError);
      
      toast({
        title: stockError.message,
        description: stockError.solution,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-primary">
                <TrendingUp className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">StockIQ Dashboard</h1>
                <p className="text-sm text-muted-foreground">AI-Powered Investment Management</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button 
                variant="outline" 
                onClick={refreshData}
                disabled={loading || stocks.length === 0}
                className="border-border/50 hover:bg-accent/50"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button 
                onClick={loadRecommendations}
                className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Get AI Insights
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {/* Portfolio Overview */}
        {stocks.length > 0 && <PortfolioOverview portfolio={portfolioData} />}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Portfolio & Add Stock */}
          <div className="lg:col-span-2 space-y-8">
            {/* Add Stock Form */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">Add to Portfolio</h2>
              <AddStockForm onAddStock={addStock} />
            </div>

            {/* Stock Portfolio */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">Your Portfolio</h2>
              {stocks.length === 0 ? (
                <div className="text-center py-12 bg-gradient-card rounded-lg border border-border/50">
                  <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No stocks in portfolio</h3>
                  <p className="text-muted-foreground">Add your first stock to get started with AI-powered analysis</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {stocks.map((stock) => (
                    <div key={stock.symbol} onClick={() => setSelectedStock(stock)} className="cursor-pointer">
                      <StockCard
                        symbol={stock.symbol}
                        name={stock.name}
                        price={stock.price}
                        change={stock.change}
                        changePercent={stock.changePercent}
                        recommendation={stock.recommendation}
                        onRemove={() => removeStock(stock.symbol)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Forecast & Recommendations */}
          <div className="space-y-8">
            {/* Stock Forecast */}
            {selectedStock && selectedStock.forecast && (
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  {selectedStock.symbol} Forecast
                </h2>
                <ForecastCard 
                  currentPrice={selectedStock.price}
                  forecasts={selectedStock.forecast}
                  aiInsight={selectedStock.aiInsight}
                />
              </div>
            )}

            {/* AI Recommendations */}
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">AI Recommendations</h2>
              <StockRecommendations 
                recommendations={recommendations}
                onAddStock={addStock}
                onFiltersChange={setRecommendationFilters}
                onApplyFilters={loadRecommendations}
                loading={loading}
                error={recommendationError}
                onRetry={loadRecommendations}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
