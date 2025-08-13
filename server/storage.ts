
import { users, stocks, type User, type InsertUser, type Stock, type InsertStock } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Stock operations
  getStocks(userId?: number): Promise<Stock[]>;
  addStock(stock: InsertStock): Promise<Stock>;
  removeStock(symbol: string, userId?: number): Promise<void>;
  getStock(symbol: string, userId?: number): Promise<Stock | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getStocks(userId?: number): Promise<Stock[]> {
    if (userId) {
      return await db.select().from(stocks).where(eq(stocks.userId, userId));
    }
    // For now, get all stocks (single-user mode)
    return await db.select().from(stocks).where(eq(stocks.isActive, true));
  }

  async addStock(stock: InsertStock): Promise<Stock> {
    const result = await db.insert(stocks).values(stock).returning();
    return result[0];
  }

  async removeStock(symbol: string, userId?: number): Promise<void> {
    if (userId) {
      await db.update(stocks).set({ isActive: false }).where(eq(stocks.symbol, symbol.toUpperCase()));
    } else {
      await db.update(stocks).set({ isActive: false }).where(eq(stocks.symbol, symbol.toUpperCase()));
    }
  }

  async getStock(symbol: string, userId?: number): Promise<Stock | undefined> {
    const result = await db.select().from(stocks)
      .where(eq(stocks.symbol, symbol.toUpperCase()))
      .limit(1);
    return result[0];
  }
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private stocks: Map<string, Stock>;
  currentId: number;
  currentStockId: number;

  constructor() {
    this.users = new Map();
    this.stocks = new Map();
    this.currentId = 1;
    this.currentStockId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getStocks(userId?: number): Promise<Stock[]> {
    return Array.from(this.stocks.values()).filter(stock => stock.isActive);
  }

  async addStock(stock: InsertStock): Promise<Stock> {
    const newStock: Stock = {
      ...stock,
      id: this.currentStockId++,
      addedAt: new Date(),
      isActive: true
    };
    this.stocks.set(stock.symbol.toUpperCase(), newStock);
    return newStock;
  }

  async removeStock(symbol: string, userId?: number): Promise<void> {
    const stock = this.stocks.get(symbol.toUpperCase());
    if (stock) {
      stock.isActive = false;
    }
  }

  async getStock(symbol: string, userId?: number): Promise<Stock | undefined> {
    return this.stocks.get(symbol.toUpperCase());
  }
}

// Use database storage if DATABASE_URL is available, otherwise fall back to memory storage
export const storage = process.env.DATABASE_URL ? new DatabaseStorage() : new MemStorage();
