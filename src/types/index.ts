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

export interface FlowerBatch {
  id: string;
  flowerId: string;
  purchaseDate: string;
  initialQuantity: number;
  remainingQuantity: number;
  costPrice: number;
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
  isCustom?: boolean;
}

export interface BatchDeduction {
  batchId: string;
  quantity: number;
  unitCost: number;
}

export interface Sale {
  id: string;
  bouquetTemplateId: string;
  bouquetName: string;
  sellPrice: number;
  costPrice: number;
  date: string;
  flowersUsed: FlowerUsage[];
  batchDeductions: { flowerId: string; deductions: BatchDeduction[] }[];
}

export interface Loss {
  id: string;
  flowerId: string;
  quantity: number;
  unitCost: number;
  date: string;
  note?: string;
  batchDeductions: BatchDeduction[];
}

export type ReportRange = "week" | "month";

export type PurchaseSuggestionLevel = "urgent" | "suggest" | "hold" | "reduce";

export interface PurchaseSuggestion {
  flowerId: string;
  name: string;
  emoji: string;
  currentStock: number;
  weeklyUsage: number;
  weeklyLoss: number;
  suggestedQuantity: number;
  level: PurchaseSuggestionLevel;
  reason: string;
}

export interface BouquetSaleStat {
  bouquetTemplateId: string;
  bouquetName: string;
  image: string;
  salesCount: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  avgProfit: number;
  profitRate: number;
}

export interface FlowerStoreState {
  flowers: Flower[];
  batches: FlowerBatch[];
  purchases: Purchase[];
  bouquetTemplates: BouquetTemplate[];
  sales: Sale[];
  losses: Loss[];

  addPurchase: (flowerId: string, quantity: number, costPrice: number, date?: string) => void;
  getFlowerBatches: (flowerId: string) => FlowerBatch[];
  checkBouquetStock: (bouquetId: string) => { enough: boolean; shortages: { name: string; needed: number; available: number }[] };
  calculateBouquetCost: (bouquetId: string) => number;
  makeBouquet: (bouquetId: string, sellPrice: number) => { success: boolean; message?: string };
  addLoss: (flowerId: string, quantity: number, note?: string) => { success: boolean; message?: string };
  addCustomBouquetTemplate: (template: Omit<BouquetTemplate, "id" | "isCustom">) => void;
  deleteBouquetTemplate: (templateId: string) => void;

  getTodayStats: () => { salesCount: number; lossAmount: number };
  getSalesData: (range: ReportRange) => { name: string; value: number; emoji: string }[];
  getLossData: (range: ReportRange) => { name: string; value: number; emoji: string; totalAmount: number }[];
  getProfitSummary: (range: ReportRange) => { revenue: number; cost: number; profit: number; salesCount: number };
  getTotalInventoryValue: () => number;
  getInsights: () => string[];

  getPurchaseSuggestions: () => PurchaseSuggestion[];
  getBouquetSalesStats: (range: ReportRange) => BouquetSaleStat[];
  getSalesByBouquet: (bouquetId: string, range: ReportRange) => Sale[];
}
