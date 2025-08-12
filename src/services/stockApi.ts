// Mock stock data service - Replace with real APIs in production
// For free APIs, consider: Alpha Vantage, Finnhub, IEX Cloud (free tier)

export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  marketCap?: string;
}

export interface NewsItem {
  title: string;
  summary: string;
  url: string;
  published: string;
  sentiment: "positive" | "negative" | "neutral";
  source: string;
}

export interface ForecastData {
  period: "1d" | "1w" | "1m";
  label: string;
  prediction: number;
  confidence: number;
  trend: "up" | "down" | "neutral";
}

// Mock data - replace with real API calls
const mockStocks: Record<string, StockData> = {
  AAPL: {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 185.64,
    change: 2.31,
    changePercent: 1.26,
    volume: 45123456,
    marketCap: "$2.9T"
  },
  GOOGL: {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    price: 142.87,
    change: -1.23,
    changePercent: -0.85,
    volume: 23456789,
    marketCap: "$1.8T"
  },
  TSLA: {
    symbol: "TSLA",
    name: "Tesla, Inc.",
    price: 238.45,
    change: 12.67,
    changePercent: 5.61,
    volume: 67890123,
    marketCap: "$758B"
  },
  MSFT: {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    price: 378.85,
    change: -2.15,
    changePercent: -0.56,
    volume: 19876543,
    marketCap: "$2.8T"
  },
  NVDA: {
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    price: 891.14,
    change: 45.23,
    changePercent: 5.35,
    volume: 89012345,
    marketCap: "$2.2T"
  }
};

export class StockApiService {
  static async getStock(symbol: string): Promise<StockData> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const stock = mockStocks[symbol.toUpperCase()];
    if (!stock) {
      throw new Error(`Stock ${symbol} not found`);
    }
    
    // Add some random variation to simulate real-time data
    const variation = (Math.random() - 0.5) * 0.1;
    return {
      ...stock,
      price: stock.price * (1 + variation),
      change: stock.change * (1 + variation),
      changePercent: stock.changePercent * (1 + variation)
    };
  }

  static async getMultipleStocks(symbols: string[]): Promise<StockData[]> {
    const promises = symbols.map(symbol => this.getStock(symbol));
    return Promise.all(promises);
  }

  static async getStockNews(symbol: string): Promise<NewsItem[]> {
    // Mock news data
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return [
      {
        title: `${symbol} reports strong quarterly earnings`,
        summary: "Company exceeds analyst expectations with strong revenue growth",
        url: "#",
        published: new Date().toISOString(),
        sentiment: "positive",
        source: "Financial Times"
      },
      {
        title: `${symbol} announces new strategic partnership`,
        summary: "Strategic alliance expected to drive future growth",
        url: "#",
        published: new Date(Date.now() - 86400000).toISOString(),
        sentiment: "positive",
        source: "Reuters"
      }
    ];
  }

  static async getForecast(symbol: string, currentPrice: number): Promise<ForecastData[]> {
    // Mock AI forecast - replace with real AI service
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const baseVariation = Math.random() * 0.1;
    
    return [
      {
        period: "1d",
        label: "1 Day",
        prediction: currentPrice * (1 + (Math.random() - 0.5) * 0.05),
        confidence: 75 + Math.random() * 20,
        trend: Math.random() > 0.5 ? "up" : "down"
      },
      {
        period: "1w",
        label: "1 Week",
        prediction: currentPrice * (1 + (Math.random() - 0.5) * 0.15),
        confidence: 65 + Math.random() * 25,
        trend: Math.random() > 0.4 ? "up" : "down"
      },
      {
        period: "1m",
        label: "1 Month",
        prediction: currentPrice * (1 + (Math.random() - 0.5) * 0.25),
        confidence: 50 + Math.random() * 30,
        trend: Math.random() > 0.3 ? "up" : "down"
      }
    ];
  }

  static async getRecommendations(): Promise<any[]> {
    // Mock recommendations based on news sentiment and AI analysis
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const recommendations = [
      {
        symbol: "NVDA",
        name: "NVIDIA Corporation",
        currentPrice: 891.14,
        targetPrice: 950.00,
        upside: 6.6,
        confidence: 85,
        reason: "Strong AI demand and datacenter growth. Recent partnerships indicate sustained growth trajectory.",
        newsImpact: "positive" as const
      },
      {
        symbol: "AMZN",
        name: "Amazon.com Inc.",
        currentPrice: 145.32,
        targetPrice: 165.00,
        upside: 13.5,
        confidence: 78,
        reason: "AWS growth accelerating and retail margins improving. Cloud infrastructure demand remains strong.",
        newsImpact: "positive" as const
      }
    ];
    
    return recommendations;
  }

  static async analyzeStock(symbol: string, news: NewsItem[]): Promise<{ recommendation: "BUY" | "SELL" | "HOLD"; insight: string }> {
    // Mock AI analysis
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const positiveNews = news.filter(n => n.sentiment === "positive").length;
    const negativeNews = news.filter(n => n.sentiment === "negative").length;
    
    if (positiveNews > negativeNews) {
      return {
        recommendation: "BUY",
        insight: "Recent news sentiment is predominantly positive with strong fundamentals and growth prospects."
      };
    } else if (negativeNews > positiveNews) {
      return {
        recommendation: "SELL",
        insight: "Negative news sentiment indicates potential headwinds and risk factors to consider."
      };
    } else {
      return {
        recommendation: "HOLD",
        insight: "Mixed signals from recent news. Monitor for clearer trends before making position changes."
      };
    }
  }
}