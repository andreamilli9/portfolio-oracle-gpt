import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Filter, DollarSign } from "lucide-react";
import { formatEurCurrency } from "@/services/stockApi";

interface RecommendationFiltersProps {
  onFiltersChange: (filters: { maxPrice?: number }) => void;
  onApplyFilters: () => void;
  loading?: boolean;
}

export const RecommendationFilters = ({ 
  onFiltersChange, 
  onApplyFilters, 
  loading = false
}: RecommendationFiltersProps) => {
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [useMaxPrice, setUseMaxPrice] = useState(false);

  const handleMaxPriceChange = (value: number[]) => {
    const newMaxPrice = value[0];
    setMaxPrice(newMaxPrice);
    onFiltersChange({ 
      maxPrice: useMaxPrice ? newMaxPrice : undefined 
    });
  };

  const handleToggleMaxPrice = () => {
    const newUseMaxPrice = !useMaxPrice;
    setUseMaxPrice(newUseMaxPrice);
    onFiltersChange({ 
      maxPrice: newUseMaxPrice ? maxPrice : undefined 
    });
  };

  return (
    <Card className="bg-gradient-card shadow-card border-border/50 mb-4">
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-semibold text-foreground">Filter Recommendations</h4>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm text-foreground">Maximum Price per Stock</Label>
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleMaxPrice}
              className={useMaxPrice ? "bg-primary/10 border-primary/30" : ""}
            >
              {useMaxPrice ? "Enabled" : "Disabled"}
            </Button>
          </div>

          {useMaxPrice && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  Max: {formatEurCurrency(maxPrice)}
                </span>
              </div>
              
              <Slider
                value={[maxPrice]}
                onValueChange={handleMaxPriceChange}
                max={2000}
                min={10}
                step={10}
                className="w-full"
              />
              
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>€10</span>
                <span>€2,000</span>
              </div>
            </div>
          )}

          <Button
            onClick={onApplyFilters}
            disabled={loading}
            className="w-full bg-gradient-primary hover:shadow-glow transition-all duration-300"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                Applying Filters...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Filter className="h-3 w-3" />
                Apply Filters
              </div>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};