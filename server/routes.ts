
import { Hono } from "hono";
import { storage } from "./storage";

const app = new Hono();

// Stock endpoints
app.get("/api/stocks", async (c) => {
  try {
    const stocks = await storage.getStocks();
    return c.json(stocks);
  } catch (error) {
    return c.json({ error: "Failed to fetch stocks" }, 500);
  }
});

app.post("/api/stocks", async (c) => {
  try {
    const { symbol, name } = await c.req.json();
    
    if (!symbol || !name) {
      return c.json({ error: "Symbol and name are required" }, 400);
    }

    // Check if stock already exists
    const existing = await storage.getStock(symbol);
    if (existing && existing.isActive) {
      return c.json({ error: "Stock already exists" }, 409);
    }

    const stock = await storage.addStock({
      symbol: symbol.toUpperCase(),
      name,
      userId: undefined // Single user for now
    });

    return c.json(stock);
  } catch (error) {
    return c.json({ error: "Failed to add stock" }, 500);
  }
});

app.delete("/api/stocks/:symbol", async (c) => {
  try {
    const symbol = c.req.param("symbol");
    await storage.removeStock(symbol);
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: "Failed to remove stock" }, 500);
  }
});

export default app;
