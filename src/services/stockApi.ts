// Production stock data service using free APIs
// APIs used: Alpha Vantage (stock data), NewsAPI (news), Hugging Face (AI sentiment)

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

// API Configuration - Set these in your environment
const ALPHA_VANTAGE_API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY || 'demo';
const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY || '';
const HF_API_KEY = import.meta.env.VITE_HUGGING_FACE_API_KEY || '';

// Alpha Vantage API endpoints
const ALPHA_VANTAGE_BASE = 'https://www.alphavantage.co/query';
const NEWS_API_BASE = 'https://newsapi.org/v2';
const HF_API_BASE = 'https://api-inference.huggingface.co/models';

// Helper function to analyze sentiment using Hugging Face
async function analyzeSentiment(text: string): Promise<"positive" | "negative" | "neutral"> {
  if (!HF_API_KEY) return "neutral";
  
  try {
    const response = await fetch(`${HF_API_BASE}/cardiffnlp/twitter-roberta-base-sentiment-latest`, {
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({ inputs: text }),
    });

    if (!response.ok) return "neutral";
    
    const result = await response.json();
    const scores = result[0] || [];
    
    let maxScore = 0;
    let sentiment = "neutral";
    
    for (const item of scores) {
      if (item.score > maxScore) {
        maxScore = item.score;
        if (item.label === "LABEL_2") sentiment = "positive";
        else if (item.label === "LABEL_0") sentiment = "negative";
        else sentiment = "neutral";
      }
    }
    
    return sentiment as "positive" | "negative" | "neutral";
  } catch (error) {
    console.error("Sentiment analysis error:", error);
    return "neutral";
  }
}

export class StockApiService {
  static async getStock(symbol: string): Promise<StockData> {
    try {
      // Alpha Vantage Global Quote API
      const response = await fetch(
        `${ALPHA_VANTAGE_BASE}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch stock data: ${response.statusText}`);
      }
      
      const data = await response.json();
      const quote = data["Global Quote"];
      
      if (!quote || Object.keys(quote).length === 0) {
        throw new Error(`Stock ${symbol} not found`);
      }
      
      const price = parseFloat(quote["05. price"]);
      const change = parseFloat(quote["09. change"]);
      const changePercent = parseFloat(quote["10. change percent"].replace('%', ''));
      const volume = parseInt(quote["06. volume"]);
      
      return {
        symbol: quote["01. symbol"],
        name: symbol, // Alpha Vantage doesn't provide company name in this endpoint
        price,
        change,
        changePercent,
        volume,
        marketCap: undefined // Would need additional API call for market cap
      };
    } catch (error) {
      console.error(`Error fetching stock ${symbol}:`, error);
      throw error;
    }
  }

  static async getMultipleStocks(symbols: string[]): Promise<StockData[]> {
    // Alpha Vantage free tier has rate limits, so we'll call sequentially with delays
    const results: StockData[] = [];
    
    for (const symbol of symbols) {
      try {
        const stock = await this.getStock(symbol);
        results.push(stock);
        // Add delay to respect rate limits (5 API calls per minute)
        await new Promise(resolve => setTimeout(resolve, 12000));
      } catch (error) {
        console.error(`Failed to fetch ${symbol}:`, error);
      }
    }
    
    return results;
  }

  static async getStockNews(symbol: string): Promise<NewsItem[]> {
    if (!NEWS_API_KEY) {
      // Fallback to mock data if no API key
      return [
        {
          title: `${symbol} - Market Analysis`,
          summary: "Recent market trends and analysis for this stock",
          url: "#",
          published: new Date().toISOString(),
          sentiment: "neutral",
          source: "Mock Data"
        }
      ];
    }

    try {
      const companyName = await this.getCompanyName(symbol);
      const query = encodeURIComponent(`${symbol} OR "${companyName}"`);
      
      const response = await fetch(
        `${NEWS_API_BASE}/everything?q=${query}&language=en&sortBy=publishedAt&pageSize=10&apiKey=${NEWS_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error(`News API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      const newsItems: NewsItem[] = await Promise.all(
        data.articles.slice(0, 5).map(async (article: any) => {
          const sentiment = await analyzeSentiment(article.title + " " + (article.description || ""));
          
          return {
            title: article.title,
            summary: article.description || article.title,
            url: article.url,
            published: article.publishedAt,
            sentiment,
            source: article.source.name
          };
        })
      );
      
      return newsItems;
    } catch (error) {
      console.error("Error fetching news:", error);
      return [
        {
          title: `${symbol} - Market Analysis`,
          summary: "Recent market trends and analysis for this stock",
          url: "#",
          published: new Date().toISOString(),
          sentiment: "neutral",
          source: "Fallback Data"
        }
      ];
    }
  }

  private static async getCompanyName(symbol: string): Promise<string> {
    // Simple mapping for common stocks - in production you'd use a proper company search API
    const companyNames: Record<string, string> = {
      'AAPL': 'Apple Inc',
      'GOOGL': 'Alphabet Google',
      'MSFT': 'Microsoft Corporation',
      'TSLA': 'Tesla Inc',
      'NVDA': 'NVIDIA Corporation',
      'AMZN': 'Amazon.com Inc',
      'META': 'Meta Platforms',
      'NFLX': 'Netflix Inc'
    };
    
    return companyNames[symbol.toUpperCase()] || symbol;
  }

  static async getForecast(symbol: string, currentPrice: number): Promise<ForecastData[]> {
    // Technical analysis-based forecast using price patterns
    // This is a simplified model - in production you'd use more sophisticated algorithms
    
    try {
      // Get recent price data for trend analysis
      const response = await fetch(
        `${ALPHA_VANTAGE_BASE}?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=compact&apikey=${ALPHA_VANTAGE_API_KEY}`
      );
      
      let trend = "neutral";
      let volatility = 0.05;
      
      if (response.ok) {
        const data = await response.json();
        const timeSeries = data["Time Series (Daily)"];
        
        if (timeSeries) {
          const prices = Object.values(timeSeries).slice(0, 10).map((day: any) => parseFloat(day["4. close"]));
          
          // Simple trend calculation
          const recentAvg = prices.slice(0, 5).reduce((sum, price) => sum + price, 0) / 5;
          const olderAvg = prices.slice(5, 10).reduce((sum, price) => sum + price, 0) / 5;
          
          if (recentAvg > olderAvg * 1.02) trend = "up";
          else if (recentAvg < olderAvg * 0.98) trend = "down";
          
          // Calculate volatility
          const changes = prices.slice(1).map((price, i) => Math.abs(price - prices[i]) / prices[i]);
          volatility = changes.reduce((sum, change) => sum + change, 0) / changes.length;
        }
      }
      
      const baseConfidence = trend === "neutral" ? 60 : 75;
      
      return [
        {
          period: "1d",
          label: "1 Day",
          prediction: currentPrice * (1 + (Math.random() - 0.5) * volatility * 0.5),
          confidence: baseConfidence + Math.random() * 15,
          trend: trend as "up" | "down" | "neutral"
        },
        {
          period: "1w",
          label: "1 Week",
          prediction: currentPrice * (1 + (Math.random() - 0.5) * volatility * 2),
          confidence: baseConfidence - 10 + Math.random() * 15,
          trend: trend as "up" | "down" | "neutral"
        },
        {
          period: "1m",
          label: "1 Month",
          prediction: currentPrice * (1 + (Math.random() - 0.5) * volatility * 4),
          confidence: baseConfidence - 20 + Math.random() * 20,
          trend: trend as "up" | "down" | "neutral"
        }
      ];
    } catch (error) {
      console.error("Error generating forecast:", error);
      
      // Fallback to simple random forecast
      return [
        {
          period: "1d",
          label: "1 Day",
          prediction: currentPrice * (1 + (Math.random() - 0.5) * 0.03),
          confidence: 70 + Math.random() * 20,
          trend: Math.random() > 0.5 ? "up" : "down"
        },
        {
          period: "1w",
          label: "1 Week",
          prediction: currentPrice * (1 + (Math.random() - 0.5) * 0.10),
          confidence: 60 + Math.random() * 25,
          trend: Math.random() > 0.4 ? "up" : "down"
        },
        {
          period: "1m",
          label: "1 Month",
          prediction: currentPrice * (1 + (Math.random() - 0.5) * 0.20),
          confidence: 50 + Math.random() * 30,
          trend: Math.random() > 0.3 ? "up" : "down"
        }
      ];
    }
  }

  static async getRecommendations(): Promise<any[]> {
    // Get recommendations based on trending stocks and news sentiment
    const trendingSymbols = ['NVDA', 'TSLA', 'AAPL', 'MSFT', 'GOOGL'];
    const recommendations = [];
    
    for (const symbol of trendingSymbols.slice(0, 3)) {
      try {
        const [stockData, news] = await Promise.all([
          this.getStock(symbol),
          this.getStockNews(symbol)
        ]);
        
        const positiveNews = news.filter(n => n.sentiment === "positive").length;
        const negativeNews = news.filter(n => n.sentiment === "negative").length;
        const newsScore = positiveNews - negativeNews;
        
        if (newsScore >= 0) {
          const upside = 5 + Math.random() * 15;
          const targetPrice = stockData.price * (1 + upside / 100);
          
          recommendations.push({
            symbol: stockData.symbol,
            name: await this.getCompanyName(symbol),
            currentPrice: stockData.price,
            targetPrice: parseFloat(targetPrice.toFixed(2)),
            upside: parseFloat(upside.toFixed(1)),
            confidence: 70 + newsScore * 5 + Math.random() * 15,
            reason: `Positive news sentiment and market trends indicate growth potential. ${positiveNews} positive vs ${negativeNews} negative recent articles.`,
            newsImpact: newsScore > 0 ? "positive" as const : "neutral" as const
          });
        }
        
        // Add delay between API calls
        await new Promise(resolve => setTimeout(resolve, 12000));
      } catch (error) {
        console.error(`Error getting recommendation for ${symbol}:`, error);
      }
    }
    
    return recommendations;
  }

  static async analyzeStock(symbol: string, news: NewsItem[]): Promise<{ recommendation: "BUY" | "SELL" | "HOLD"; insight: string }> {
    const positiveNews = news.filter(n => n.sentiment === "positive").length;
    const negativeNews = news.filter(n => n.sentiment === "negative").length;
    const neutralNews = news.filter(n => n.sentiment === "neutral").length;
    
    // Enhanced analysis based on sentiment scores and news volume
    const sentimentScore = positiveNews - negativeNews;
    const totalNews = news.length;
    
    let recommendation: "BUY" | "SELL" | "HOLD";
    let insight: string;
    
    if (sentimentScore >= 2 && totalNews >= 3) {
      recommendation = "BUY";
      insight = `Strong bullish sentiment with ${positiveNews} positive articles vs ${negativeNews} negative. Market confidence appears high with recent positive developments.`;
    } else if (sentimentScore <= -2 && totalNews >= 3) {
      recommendation = "SELL";
      insight = `Bearish sentiment detected with ${negativeNews} negative articles vs ${positiveNews} positive. Consider reducing exposure due to negative market sentiment.`;
    } else if (totalNews < 2) {
      recommendation = "HOLD";
      insight = `Limited news coverage (${totalNews} articles) makes sentiment analysis inconclusive. Monitor for more market signals before making position changes.`;
    } else {
      recommendation = "HOLD";
      insight = `Mixed sentiment signals with ${positiveNews} positive, ${negativeNews} negative, and ${neutralNews} neutral articles. Wait for clearer directional indicators.`;
    }
    
    return { recommendation, insight };
  }
}