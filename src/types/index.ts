export interface Flower {
  id: string;
  name: string;
  emoji: string;
  currentStock: number;
  avgCostPrice: number;
  color: string;
  lowStockThreshold: number;
  freshDays: number;
}

export interface Supplier {
  id: string;
  name: string;
  contact?: string;
}

export interface FlowerUsage {
  flowerId: string;
  quantity: number;
}

export interface BouquetRecipeSnapshot {
  id: string;
  templateId: string;
  name: string;
  flowers: FlowerUsage[];
  suggestedPrice: number;
  estimatedCost: number;
  createdAt: string;
}

export interface WeeklyTrend {
  weekStart: string;
  weekLabel: string;
  sales: number;
  loss: number;
}

export interface BouquetPricePoint {
  date: string;
  sellPrice: number;
  costPrice: number;
  profit: number;
}

export interface BouquetDetail {
  templateId: string;
  template: BouquetTemplate | undefined;
  recentSales: Sale[];
  pricePoints: BouquetPricePoint[];
  avgCost: number;
  avgSellPrice: number;
  avgProfit: number;
  avgProfitRate: number;
  totalSales: number;
  totalRevenue: number;
  totalProfit: number;
  topBatchFlowers: { flowerId: string; name: string; emoji: string; totalQty: number; avgCost: number }[];
}

export interface FlowerBatch {
  id: string;
  flowerId: string;
  purchaseDate: string;
  initialQuantity: number;
  remainingQuantity: number;
  costPrice: number;
  supplierId?: string;
}

export interface BatchUsageRecord {
  batchId: string;
  date: string;
  quantity: number;
  type: "sale" | "loss";
  relatedId: string;
  relatedName?: string;
}

export interface BatchLedgerEntry {
  date: string;
  type: "in" | "out-sale" | "out-loss";
  quantity: number;
  balance: number;
  note?: string;
  relatedId?: string;
}

export interface Purchase {
  id: string;
  flowerId: string;
  quantity: number;
  costPrice: number;
  date: string;
  batchId: string;
  supplierId?: string;
}

export interface OrderPlanItem {
  flowerId: string;
  quantity: number;
  unitPrice: number;
  selected: boolean;
}

export interface BouquetTemplate {
  id: string;
  name: string;
  description: string;
  image: string;
  suggestedPrice: number;
  flowers: FlowerUsage[];
  isCustom?: boolean;
  recipeSnapshots?: BouquetRecipeSnapshot[];
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
  recipeSnapshot?: Omit<BouquetRecipeSnapshot, "id" | "createdAt">;
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

export type PurchaseSuggestionLevel = "urgent" | "suggest" | "hold" | "reduce" | "trending-up";

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
  freshDays: number;
  trends: WeeklyTrend[];
  trendHint?: "up" | "down" | "stable";
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

export interface SupplierStat {
  supplierId: string | null;
  supplierName: string;
  totalPurchases: number;
  totalAmount: number;
  flowers: { flowerId: string; name: string; emoji: string; totalQty: number; avgPrice: number; totalAmount: number }[];
  lossQty: number;
  lossRate: number;
}

export interface FlowerStoreState {
  flowers: Flower[];
  batches: FlowerBatch[];
  purchases: Purchase[];
  suppliers: Supplier[];
  bouquetTemplates: BouquetTemplate[];
  recipeSnapshots: BouquetRecipeSnapshot[];
  sales: Sale[];
  losses: Loss[];
  orderPlan: OrderPlanItem[];

  addPurchase: (flowerId: string, quantity: number, costPrice: number, date?: string, supplierId?: string) => void;
  addSupplier: (name: string, contact?: string) => string;
  getFlowerBatches: (flowerId: string, includeEmpty?: boolean) => FlowerBatch[];
  getBatchUsageRecords: (batchId: string) => BatchUsageRecord[];
  getBatchLedger: (batchId: string) => BatchLedgerEntry[];
  getInventoryValueBreakdown: (flowerId: string) => { batches: { batch: FlowerBatch; value: number }[]; total: number; explanation: string };
  checkBouquetStock: (bouquetId: string) => { enough: boolean; shortages: { name: string; needed: number; available: number }[] };
  calculateBouquetCost: (bouquetId: string) => number;
  estimateBouquetCost: (flowers: FlowerUsage[]) => number;
  makeBouquet: (bouquetId: string, sellPrice: number) => { success: boolean; message?: string };
  addLoss: (flowerId: string, quantity: number, note?: string) => { success: boolean; message?: string };
  addCustomBouquetTemplate: (template: Omit<BouquetTemplate, "id" | "isCustom">) => void;
  updateBouquetTemplate: (templateId: string, updates: Partial<BouquetTemplate>) => { success: boolean; message?: string };
  deleteBouquetTemplate: (templateId: string) => void;

  getTodayStats: () => { salesCount: number; lossAmount: number };
  getSalesData: (range: ReportRange) => { name: string; value: number; emoji: string }[];
  getLossData: (range: ReportRange) => { name: string; value: number; emoji: string; totalAmount: number }[];
  getProfitSummary: (range: ReportRange) => { revenue: number; cost: number; profit: number; salesCount: number };
  getTotalInventoryValue: () => number;
  getInsights: () => string[];

  getPurchaseSuggestions: () => PurchaseSuggestion[];
  getWeeklyTrends: (flowerId: string, weeks?: number) => WeeklyTrend[];
  getBouquetSalesStats: (range: ReportRange) => BouquetSaleStat[];
  getSalesByBouquet: (bouquetId: string, range: ReportRange) => Sale[];
  getBouquetDetail: (bouquetId: string, range: ReportRange) => BouquetDetail;
  getSupplierStats: (range: ReportRange) => SupplierStat[];

  setOrderPlanItem: (flowerId: string, quantity: number, selected: boolean) => void;
  clearOrderPlanItem: (flowerId: string) => void;
  clearOrderPlan: () => void;
  getOrderPlanSummary: () => { items: (OrderPlanItem & { name: string; emoji: string; totalPrice: number; sellableDays: number })[]; totalAmount: number };
}
