import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Clock, Brain } from "lucide-react";
import { convertToEur, formatEurCurrency } from "@/services/stockApi";

interface ForecastData {
  period: "1d" | "1w" | "1m";
  label: string;
  prediction: number;
  confidence: number;
  trend: "up" | "down" | "neutral";
  reasoning?: string;
}

interface ForecastCardProps {
  currentPrice: number;
  forecasts: ForecastData[];
  aiInsight?: string;
}

export const ForecastCard = ({ currentPrice, forecasts, aiInsight }: ForecastCardProps) => {
  const [eurCurrentPrice, setEurCurrentPrice] = useState<number | null>(null);
  const [eurForecasts, setEurForecasts] = useState<Array<ForecastData & { eurPrediction: number; usdPrediction: number }> | null>(null);

  useEffect(() => {
    const convertPrices = async () => {
      try {
        const [convertedCurrentPrice, ...convertedForecasts] = await Promise.all([
          convertToEur(currentPrice),
          ...forecasts.map(f => convertToEur(f.prediction))
        ]);
        
        setEurCurrentPrice(convertedCurrentPrice);
        setEurForecasts(forecasts.map((forecast, index) => ({
          ...forecast,
          eurPrediction: convertedForecasts[index],
          usdPrediction: forecast.prediction
        })));
      } catch (error) {
        console.error("Error converting forecast to EUR:", error);
        // Fallback to USD values
        setEurCurrentPrice(currentPrice);
        setEurForecasts(forecasts.map(f => ({ ...f, eurPrediction: f.prediction, usdPrediction: f.prediction })));
      }
    };
    
    convertPrices();
  }, [currentPrice, forecasts]);
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-success" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-danger" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-success";
    if (confidence >= 60) return "text-warning";
    return "text-danger";
  };

  return (
    <Card className="bg-gradient-card shadow-card border-border/50 animate-slide-in">
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">AI Price Forecast</h3>
        </div>

        <div className="space-y-4">
          {eurForecasts?.map((forecast) => {
            const change = forecast.eurPrediction - (eurCurrentPrice || 0);
            const changePercent = (change / (eurCurrentPrice || 1)) * 100;
            
            return (
              <div
                key={forecast.period}
                className="flex items-center justify-between p-4 rounded-lg bg-secondary/20 border border-border/30"
              >
                <div className="flex items-center gap-3">
                  {getTrendIcon(forecast.trend)}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{forecast.label}</p>
                    <p className="text-xs text-muted-foreground">
                      Confidence: <span className={getConfidenceColor(forecast.confidence)}>{forecast.confidence.toFixed(0)}%</span>
                    </p>
                    {forecast.reasoning && (
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {forecast.reasoning}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">
                      {formatEurCurrency(forecast.eurPrediction)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ${forecast.usdPrediction.toFixed(2)} USD
                    </p>
                    <p className={`text-xs ${change >= 0 ? "text-success" : "text-danger"}`}>
                      {change >= 0 ? "+" : ""}{formatEurCurrency(change)} ({changePercent.toFixed(1)}%)
                    </p>
                  </div>
                </div>
              </div>
            );
          }) || (
            <div className="text-center py-4 text-muted-foreground">
              Loading forecasts...
            </div>
          )}
        </div>

        {aiInsight && (
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-start gap-3">
              <Brain className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground mb-1">AI Insight</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{aiInsight}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};