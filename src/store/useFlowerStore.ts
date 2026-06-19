import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Flower,
  FlowerBatch,
  Purchase,
  BouquetTemplate,
  Sale,
  Loss,
  FlowerStoreState,
  ReportRange,
  BatchDeduction,
} from "@/types";

const todayStr = () => new Date().toISOString().split("T")[0];

const getStartOfWeek = () => {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now);
  monday.setDate(diff);
  return monday.toISOString().split("T")[0];
};

const getStartOfMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
};

const getRangeStart = (range: ReportRange) => {
  return range === "week" ? getStartOfWeek() : getStartOfMonth();
};

const defaultFlowers: Flower[] = [
  { id: "rose", name: "玫瑰", emoji: "🌹", currentStock: 0, avgCostPrice: 0, color: "#E8B4B8", lowStockThreshold: 20 },
  { id: "lily", name: "百合", emoji: "⚜️", currentStock: 0, avgCostPrice: 0, color: "#FAEAE8", lowStockThreshold: 15 },
  { id: "carnation", name: "康乃馨", emoji: "🌷", currentStock: 0, avgCostPrice: 0, color: "#F5D5CB", lowStockThreshold: 20 },
  { id: "sunflower", name: "向日葵", emoji: "🌻", currentStock: 0, avgCostPrice: 0, color: "#E5EFDC", lowStockThreshold: 15 },
  { id: "eustoma", name: "洋桔梗", emoji: "💐", currentStock: 0, avgCostPrice: 0, color: "#CDE0C1", lowStockThreshold: 20 },
];

const defaultBouquetTemplates: BouquetTemplate[] = [
  { id: "rose-19", name: "19朵红玫瑰", description: "经典表白花束，19朵红玫瑰搭配满天星", image: "🌹🌹🌹", suggestedPrice: 299, flowers: [{ flowerId: "rose", quantity: 19 }] },
  { id: "rose-11", name: "11朵一心一意", description: "11朵红玫瑰，代表一心一意", image: "🌹❤️🌹", suggestedPrice: 188, flowers: [{ flowerId: "rose", quantity: 11 }] },
  { id: "mixed-love", name: "混搭爱恋", description: "玫瑰+百合+洋桔梗的浪漫混搭", image: "🌹⚜️💐", suggestedPrice: 358, flowers: [{ flowerId: "rose", quantity: 9 }, { flowerId: "lily", quantity: 3 }, { flowerId: "eustoma", quantity: 5 }] },
  { id: "sunshine", name: "向日葵毕业花束", description: "5朵向日葵+康乃馨，毕业季首选", image: "🌻🌷🌻", suggestedPrice: 228, flowers: [{ flowerId: "sunflower", quantity: 5 }, { flowerId: "carnation", quantity: 6 }] },
  { id: "mom-love", name: "母爱康乃馨", description: "20朵粉色康乃馨送妈妈", image: "🌷🌷🌷", suggestedPrice: 218, flowers: [{ flowerId: "carnation", quantity: 20 }] },
  { id: "eustoma-elegant", name: "优雅洋桔梗", description: "15朵洋桔梗，清新雅致", image: "💐💐💐", suggestedPrice: 168, flowers: [{ flowerId: "eustoma", quantity: 15 }] },
];

function deductFromBatches(
  batches: FlowerBatch[],
  flowerId: string,
  quantity: number
): { success: boolean; message?: string; updatedBatches: FlowerBatch[]; deductions: BatchDeduction[]; totalCost: number } {
  const flowerBatches = batches
    .filter(b => b.flowerId === flowerId && b.remainingQuantity > 0)
    .sort((a, b) => a.purchaseDate.localeCompare(b.purchaseDate) || a.id.localeCompare(b.id));

  const totalAvailable = flowerBatches.reduce((sum, b) => sum + b.remainingQuantity, 0);

  if (totalAvailable < quantity) {
    const flowerNameMap: Record<string, string> = { rose: "玫瑰", lily: "百合", carnation: "康乃馨", sunflower: "向日葵", eustoma: "洋桔梗" };
    return {
      success: false,
      message: `${flowerNameMap[flowerId] || flowerId}库存不足，需要${quantity}枝，现有${totalAvailable}枝`,
      updatedBatches: batches,
      deductions: [],
      totalCost: 0,
    };
  }

  const deductions: BatchDeduction[] = [];
  let remainingToDeduct = quantity;
  let totalCost = 0;

  const updatedBatches = batches.map(batch => {
    if (batch.flowerId !== flowerId || remainingToDeduct <= 0 || batch.remainingQuantity <= 0) {
      return batch;
    }

    const deductQty = Math.min(batch.remainingQuantity, remainingToDeduct);
    deductions.push({
      batchId: batch.id,
      quantity: deductQty,
      unitCost: batch.costPrice,
    });
    totalCost += deductQty * batch.costPrice;
    remainingToDeduct -= deductQty;

    return { ...batch, remainingQuantity: batch.remainingQuantity - deductQty };
  });

  return { success: true, updatedBatches, deductions, totalCost };
}

function recalcFlowerStats(flowers: Flower[], batches: FlowerBatch[]): Flower[] {
  return flowers.map(flower => {
    const flowerBatches = batches.filter(b => b.flowerId === flower.id);
    const totalStock = flowerBatches.reduce((sum, b) => sum + b.remainingQuantity, 0);
    const totalValue = flowerBatches.reduce((sum, b) => sum + b.remainingQuantity * b.costPrice, 0);
    const avgCost = totalStock > 0 ? totalValue / totalStock : 0;
    return {
      ...flower,
      currentStock: totalStock,
      avgCostPrice: Math.round(avgCost * 100) / 100,
    };
  });
}

export const useFlowerStore = create<FlowerStoreState>()(
  persist(
    (set, get) => ({
      flowers: defaultFlowers,
      batches: [],
      purchases: [],
      bouquetTemplates: defaultBouquetTemplates,
      sales: [],
      losses: [],

      addPurchase: (flowerId, quantity, costPrice, date) => {
        const state = get();
        const purchaseDate = date || todayStr();

        const batch: FlowerBatch = {
          id: `b-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          flowerId,
          purchaseDate,
          initialQuantity: quantity,
          remainingQuantity: quantity,
          costPrice,
        };

        const purchase: Purchase = {
          id: `p-${Date.now()}`,
          flowerId,
          quantity,
          costPrice,
          date: purchaseDate,
        };

        const newBatches = [...state.batches, batch];
        const newFlowers = recalcFlowerStats(state.flowers, newBatches);

        set({
          batches: newBatches,
          flowers: newFlowers,
          purchases: [...state.purchases, purchase],
        });
      },

      getFlowerBatches: (flowerId) => {
        return get()
          .batches.filter(b => b.flowerId === flowerId)
          .sort((a, b) => b.purchaseDate.localeCompare(a.purchaseDate));
      },

      checkBouquetStock: (bouquetId) => {
        const state = get();
        const bouquet = state.bouquetTemplates.find(b => b.id === bouquetId);
        if (!bouquet) return { enough: false, shortages: [] };

        const shortages: { name: string; needed: number; available: number }[] = [];
        let enough = true;

        for (const usage of bouquet.flowers) {
          const flower = state.flowers.find(f => f.id === usage.flowerId);
          if (!flower || flower.currentStock < usage.quantity) {
            enough = false;
            shortages.push({
              name: flower?.name || "未知花材",
              needed: usage.quantity,
              available: flower?.currentStock || 0,
            });
          }
        }

        return { enough, shortages };
      },

      calculateBouquetCost: (bouquetId) => {
        const state = get();
        const bouquet = state.bouquetTemplates.find(b => b.id === bouquetId);
        if (!bouquet) return 0;

        let totalCost = 0;
        let tempBatches = [...state.batches];

        for (const usage of bouquet.flowers) {
          const result = deductFromBatches(tempBatches, usage.flowerId, usage.quantity);
          if (!result.success) {
            return state.flowers.find(f => f.id === usage.flowerId)?.avgCostPrice
              ? bouquet.flowers.reduce((sum, u) => {
                  const f = state.flowers.find(fl => fl.id === u.flowerId);
                  return sum + (f?.avgCostPrice || 0) * u.quantity;
                }, 0)
              : 0;
          }
          tempBatches = result.updatedBatches;
          totalCost += result.totalCost;
        }

        return Math.round(totalCost * 100) / 100;
      },

      makeBouquet: (bouquetId, sellPrice) => {
        const state = get();
        const bouquet = state.bouquetTemplates.find(b => b.id === bouquetId);
        if (!bouquet) return { success: false, message: "花束不存在" };

        if (sellPrice <= 0) {
          return { success: false, message: "售价必须大于0元，请重新输入" };
        }

        const { enough, shortages } = state.checkBouquetStock(bouquetId);
        if (!enough) {
          const shortageText = shortages.map(s => `${s.name}(需${s.needed}枝，仅${s.available}枝)`).join("、");
          return { success: false, message: `库存不足：${shortageText}` };
        }

        let workingBatches = [...state.batches];
        const allDeductions: { flowerId: string; deductions: BatchDeduction[] }[] = [];
        let totalCost = 0;

        for (const usage of bouquet.flowers) {
          const result = deductFromBatches(workingBatches, usage.flowerId, usage.quantity);
          if (!result.success) {
            return { success: false, message: result.message };
          }
          workingBatches = result.updatedBatches;
          allDeductions.push({ flowerId: usage.flowerId, deductions: result.deductions });
          totalCost += result.totalCost;
        }

        const sale: Sale = {
          id: `s-${Date.now()}`,
          bouquetTemplateId: bouquetId,
          bouquetName: bouquet.name,
          sellPrice,
          costPrice: Math.round(totalCost * 100) / 100,
          date: todayStr(),
          flowersUsed: bouquet.flowers,
          batchDeductions: allDeductions,
        };

        const newFlowers = recalcFlowerStats(state.flowers, workingBatches);

        set({
          batches: workingBatches,
          flowers: newFlowers,
          sales: [...state.sales, sale],
        });

        return { success: true };
      },

      addLoss: (flowerId, quantity, note) => {
        const state = get();
        const flower = state.flowers.find(f => f.id === flowerId);
        if (!flower) return { success: false, message: "花材不存在" };

        if (quantity <= 0) {
          return { success: false, message: "损耗数量必须大于0" };
        }

        if (quantity > flower.currentStock) {
          return {
            success: false,
            message: `${flower.emoji}${flower.name}损耗数量(${quantity}枝)超过当前库存(${flower.currentStock}枝)，请核对后重新输入`,
          };
        }

        const result = deductFromBatches(state.batches, flowerId, quantity);
        if (!result.success) {
          return { success: false, message: result.message };
        }

        const loss: Loss = {
          id: `l-${Date.now()}`,
          flowerId,
          quantity,
          unitCost: result.deductions.length > 0
            ? Math.round((result.totalCost / quantity) * 100) / 100
            : flower.avgCostPrice,
          date: todayStr(),
          note,
          batchDeductions: result.deductions,
        };

        const newFlowers = recalcFlowerStats(state.flowers, result.updatedBatches);

        set({
          batches: result.updatedBatches,
          flowers: newFlowers,
          losses: [...state.losses, loss],
        });

        return { success: true };
      },

      addCustomBouquetTemplate: (template) => {
        const state = get();
        const newTemplate: BouquetTemplate = {
          ...template,
          id: `custom-${Date.now()}`,
          isCustom: true,
        };
        set({ bouquetTemplates: [...state.bouquetTemplates, newTemplate] });
      },

      deleteBouquetTemplate: (templateId) => {
        const state = get();
        set({ bouquetTemplates: state.bouquetTemplates.filter(t => t.id !== templateId) });
      },

      getTodayStats: () => {
        const state = get();
        const today = todayStr();
        const salesCount = state.sales.filter(s => s.date === today).length;
        const lossAmount = state.losses
          .filter(l => l.date === today)
          .reduce((sum, l) => sum + l.quantity * l.unitCost, 0);
        return {
          salesCount,
          lossAmount: Math.round(lossAmount * 100) / 100,
        };
      },

      getSalesData: (range) => {
        const state = get();
        const rangeStart = getRangeStart(range);
        const rangeSales = state.sales.filter(s => s.date >= rangeStart);

        const usageMap = new Map<string, number>();
        for (const sale of rangeSales) {
          for (const usage of sale.flowersUsed) {
            usageMap.set(usage.flowerId, (usageMap.get(usage.flowerId) || 0) + usage.quantity);
          }
        }

        return state.flowers
          .map(f => ({
            name: f.name,
            value: usageMap.get(f.id) || 0,
            emoji: f.emoji,
          }))
          .sort((a, b) => b.value - a.value);
      },

      getLossData: (range) => {
        const state = get();
        const rangeStart = getRangeStart(range);
        const rangeLosses = state.losses.filter(l => l.date >= rangeStart);

        const lossMap = new Map<string, { quantity: number; amount: number }>();
        for (const loss of rangeLosses) {
          const current = lossMap.get(loss.flowerId) || { quantity: 0, amount: 0 };
          lossMap.set(loss.flowerId, {
            quantity: current.quantity + loss.quantity,
            amount: current.amount + loss.quantity * loss.unitCost,
          });
        }

        return state.flowers.map(f => {
          const data = lossMap.get(f.id) || { quantity: 0, amount: 0 };
          return {
            name: f.name,
            value: Math.round(data.amount * 100) / 100,
            emoji: f.emoji,
            totalAmount: data.quantity,
          };
        }).sort((a, b) => b.value - a.value);
      },

      getProfitSummary: (range) => {
        const state = get();
        const rangeStart = getRangeStart(range);
        const rangeSales = state.sales.filter(s => s.date >= rangeStart);
        const rangeLosses = state.losses.filter(l => l.date >= rangeStart);

        const revenue = rangeSales.reduce((sum, s) => sum + s.sellPrice, 0);
        const cost = rangeSales.reduce((sum, s) => sum + s.costPrice, 0);
        const lossCost = rangeLosses.reduce((sum, l) => sum + l.quantity * l.unitCost, 0);

        return {
          revenue: Math.round(revenue * 100) / 100,
          cost: Math.round((cost + lossCost) * 100) / 100,
          profit: Math.round((revenue - cost - lossCost) * 100) / 100,
          salesCount: rangeSales.length,
        };
      },

      getTotalInventoryValue: () => {
        const state = get();
        return state.batches.reduce((sum, b) => sum + b.remainingQuantity * b.costPrice, 0);
      },

      getInsights: () => {
        const state = get();
        const insights: string[] = [];

        const weeklyData = state.getSalesData("week");
        if (weeklyData.length > 0 && weeklyData[0].value > 0) {
          insights.push(`本周热销：${weeklyData[0].emoji} ${weeklyData[0].name}卖出${weeklyData[0].value}枝，卖得最好！`);
        }

        const weeklyLoss = state.getLossData("week");
        if (weeklyLoss.length > 0 && weeklyLoss[0].value > 0) {
          insights.push(`本周损耗最多：${weeklyLoss[0].emoji} ${weeklyLoss[0].name}损耗¥${weeklyLoss[0].value}，下周建议少进点`);
        }

        const lowStockFlowers = state.flowers.filter(f => f.currentStock <= f.lowStockThreshold && f.currentStock > 0);
        if (lowStockFlowers.length > 0) {
          const names = lowStockFlowers.map(f => `${f.emoji}${f.name}(${f.currentStock}枝)`).join("、");
          insights.push(`库存偏低：${names}，大订单可能接不了哦`);
        }

        const outOfStock = state.flowers.filter(f => f.currentStock === 0);
        if (outOfStock.length > 0) {
          const names = outOfStock.map(f => `${f.emoji}${f.name}`).join("、");
          insights.push(`缺货提醒：${names}已经没货了，快进货！`);
        }

        if (insights.length === 0) {
          insights.push("一切正常！继续保持 💐");
        }

        return insights;
      },
    }),
    {
      name: "flower-shop-store-v2",
    }
  )
);
