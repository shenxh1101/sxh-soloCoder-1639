export interface Flower {
  id: string;
  name: string;
  emoji: string;
  currentStock: number;
  avgCostPrice: number;
  color: string;
  lowStockThreshold: number;
}

export interface FlowerUsage {
  flowerId: string;
  quantity: number;
}

export interface Purchase {
  id: string;
  flowerId: string;
  quantity: number;
  costPrice: number;
  date: string;
}

export interface BouquetTemplate {
  id: string;
  name: string;
  description: string;
  image: string;
  suggestedPrice: number;
  flowers: FlowerUsage[];
}

export interface Sale {
  id: string;
  bouquetTemplateId: string;
  bouquetName: string;
  sellPrice: number;
  costPrice: number;
  date: string;
  flowersUsed: FlowerUsage[];
}

export interface Loss {
  id: string;
  flowerId: string;
  quantity: number;
  unitCost: number;
  date: string;
  note?: string;
}

export interface FlowerStoreState {
  flowers: Flower[];
  purchases: Purchase[];
  bouquetTemplates: BouquetTemplate[];
  sales: Sale[];
  losses: Loss[];

  addPurchase: (flowerId: string, quantity: number, costPrice: number) => void;
  checkBouquetStock: (bouquetId: string) => { enough: boolean; shortages: { name: string; needed: number; available: number }[] };
  calculateBouquetCost: (bouquetId: string) => number;
  makeBouquet: (bouquetId: string, sellPrice: number) => { success: boolean; message?: string };
  addLoss: (flowerId: string, quantity: number, note?: string) => void;
  getTodayStats: () => { salesCount: number; lossAmount: number };
  getWeeklySalesData: () => { name: string; value: number; emoji: string }[];
  getMonthlyLossData: () => { name: string; value: number; emoji: string; totalAmount: number }[];
  getTotalInventoryValue: () => number;
  getInsights: () => string[];
}
