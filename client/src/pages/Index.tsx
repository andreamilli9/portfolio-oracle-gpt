import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { StockCard } from "@/components/StockCard";
import { AddStockForm } from "@/components/AddStockForm";
import { ForecastCard } from "@/components/ForecastCard";
import { StockRecommendations } from "@/components/StockRecommendations";
import { PortfolioOverview } from "@/components/PortfolioOverview";
import { StockApiService, StockData, ForecastData, StockError, createStockError, setDebugLogger } from "@/services/stockApi";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, Sparkles, RefreshCw } from "lucide-react";
import { DebugPanel, addLog } from "@/components/DebugPanel";

// Database storage functions
const getStoredStocks = async (): Promise<string[]> => {
  try {
    const response = await fetch('/api/stocks');
    if (response.ok) {
      const stocks = await response.json();
      return stocks.map(stock => stock.symbol);
    }
    return [];
  } catch (error) {
    console.error('Error fetching stored stocks:', error);
    return [];
  }
};

const addStockToStorage = async (symbol: string, name: string) => {
  try {
    const response = await fetch('/api/stocks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ symbol: symbol.toUpperCase(), name }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add stock to database');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error adding stock to database:', error);
    throw error;
  }
};

const removeStockFromStorage = async (symbol: string) => {
  try {
    const response = await fetch(`/api/stocks/${symbol}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to remove stock from database');
    }
  } catch (error) {
    console.error('Error removing stock from database:', error);
    throw error;
  }
};


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

  // Initialize debug logger and load stored stocks
  useEffect(() => {
    setDebugLogger(addLog);
    // Load stored stocks on page load
    loadStoredStocks();
  }, []);

  const loadStoredStocks = async () => {
    try {
      const storedSymbols = await getStoredStocks();
      if (storedSymbols.length > 0) {
        setLoading(true);
        const fetchedStocks: StockWithAnalysis[] = [];
        
        for (const symbol of storedSymbols) {
          try {
            const stockData = await StockApiService.getStock(symbol);
            fetchedStocks.push({ 
              ...stockData, 
              recommendation: undefined, 
              forecast: undefined, 
              aiInsight: undefined 
            });
          } catch (error) {
            console.error(`Error loading stock ${symbol}:`, error);
            addLog("error", `Failed to load stock ${symbol}`, { symbol, error: error.message }, "Portfolio");
          }
        }
        
        setStocks(fetchedStocks);
        addLog("info", `Loaded ${fetchedStocks.length} stocks from database`, { count: fetchedStocks.length }, "Portfolio");
        toast({
          title: "Portfolio Loaded",
          description: `${fetchedStocks.length} stocks loaded from database`,
        });
      }
    } catch (error) {
      console.error('Error loading stored stocks:', error);
      addLog("error", "Failed to load stocks from database", { error: error.message }, "Portfolio");
      toast({
        title: "Error Loading Stocks",
        description: "Failed to load your saved stocks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
      if (stocks.find(s => s.symbol === symbol.toUpperCase())) { // Case-insensitive check
        addLog("warning", `Stock ${symbol} already in portfolio`, { symbol }, "Portfolio");
        toast({
          title: "Stock already added",
          description: `${symbol} is already in your portfolio`,
          variant: "destructive",
        });
        return;
      }

      addLog("info", `Adding stock ${symbol} to portfolio`, { symbol }, "Portfolio");
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
      // Store in database with company name
      await addStockToStorage(stockData.symbol, stockData.name);
      addLog("info", `Successfully added ${symbol}`, { symbol, price: stockData.price }, "Portfolio");
      toast({
        title: "Stock added successfully",
        description: `${stockData.symbol} has been saved to your portfolio`,
      });
    } catch (error) {
      console.error("Error adding stock:", error);
      const stockError = createStockError(error, 'adding stock');
      setRecommendationError(stockError); // Re-using this state for general errors as well for now
      addLog("error", `Failed to add stock ${symbol}`, { symbol, error: error.message }, "Portfolio");
      toast({
        title: stockError.message,
        description: stockError.solution,
        variant: "destructive",
      });
      throw error; // Re-throw to potentially be caught by higher level handlers if needed
    } finally {
      setLoading(false);
    }
  };

  const removeStock = async (symbol: string) => {
    setStocks(prev => prev.filter(stock => stock.symbol !== symbol));
    
    try {
      await removeStockFromStorage(symbol);
      addLog("info", `Removed stock ${symbol} from database`, { symbol }, "Portfolio");
      
      if (selectedStock?.symbol === symbol) {
        setSelectedStock(null);
      }
      
      toast({
        title: "Stock removed",
        description: `${symbol} has been removed from your portfolio`,
      });
    } catch (error) {
      addLog("error", `Failed to remove ${symbol} from database`, { symbol, error: error.message }, "Portfolio");
      toast({
        title: "Error removing stock",
        description: `Failed to remove ${symbol} from database`,
        variant: "destructive",
      });
    }
  };

  const refreshData = async () => {
    if (stocks.length === 0) return;

    setLoading(true);
    addLog("info", "Refreshing stock data", { count: stocks.length }, "Portfolio");
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
      addLog("info", "Stock data refreshed successfully", null, "Portfolio");
      toast({
        title: "Data refreshed",
        description: "Stock prices have been updated",
      });
    } catch (error) {
      console.error("Error refreshing data:", error);
      addLog("error", "Failed to refresh stock data", { error: error.message }, "Portfolio");
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
    addLog("info", "Loading stock recommendations", { filters: recommendationFilters }, "Recommendations");

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
        addLog("info", `Found ${recs.length} recommendations`, { count: recs.length }, "Recommendations");
        toast({
          title: "Recommendations updated",
          description: `Found ${recs.length} stocks matching your criteria`,
        });
      } else {
        addLog("info", "No recommendations found", { filters: recommendationFilters }, "Recommendations");
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

      addLog("error", `Failed to load recommendations`, { error: error.message }, "Recommendations");
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
      <DebugPanel />
    </div>
  );
};

export default Index;