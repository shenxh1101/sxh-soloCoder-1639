import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Flower, Purchase, BouquetTemplate, Sale, Loss, FlowerStoreState } from "@/types";

const todayStr = () => new Date().toISOString().split("T")[0];

const getStartOfWeek = () => {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(now.setDate(diff)).toISOString().split("T")[0];
};

const getStartOfMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
};

const defaultFlowers: Flower[] = [
  { id: "rose", name: "玫瑰", emoji: "🌹", currentStock: 0, avgCostPrice: 0, color: "#E8B4B8", lowStockThreshold: 20 },
  { id: "lily", name: "百合", emoji: "⚜️", currentStock: 0, avgCostPrice: 0, color: "#FAEAE8", lowStockThreshold: 15 },
  { id: "carnation", name: "康乃馨", emoji: "🌷", currentStock: 0, avgCostPrice: 0, color: "#F5D5CB", lowStockThreshold: 20 },
  { id: "sunflower", name: "向日葵", emoji: "🌻", currentStock: 0, avgCostPrice: 0, color: "#E5EFDC", lowStockThreshold: 15 },
  { id: "eustoma", name: "洋桔梗", emoji: "💐", currentStock: 0, avgCostPrice: 0, color: "#CDE0C1", lowStockThreshold: 20 },
];

const defaultBouquetTemplates: BouquetTemplate[] = [
  {
    id: "rose-19",
    name: "19朵红玫瑰",
    description: "经典表白花束，19朵红玫瑰搭配满天星",
    image: "🌹🌹🌹",
    suggestedPrice: 299,
    flowers: [
      { flowerId: "rose", quantity: 19 },
    ],
  },
  {
    id: "rose-11",
    name: "11朵一心一意",
    description: "11朵红玫瑰，代表一心一意",
    image: "🌹❤️🌹",
    suggestedPrice: 188,
    flowers: [
      { flowerId: "rose", quantity: 11 },
    ],
  },
  {
    id: "mixed-love",
    name: "混搭爱恋",
    description: "玫瑰+百合+洋桔梗的浪漫混搭",
    image: "🌹⚜️💐",
    suggestedPrice: 358,
    flowers: [
      { flowerId: "rose", quantity: 9 },
      { flowerId: "lily", quantity: 3 },
      { flowerId: "eustoma", quantity: 5 },
    ],
  },
  {
    id: "sunshine",
    name: "向日葵毕业花束",
    description: "5朵向日葵+康乃馨，毕业季首选",
    image: "🌻🌷🌻",
    suggestedPrice: 228,
    flowers: [
      { flowerId: "sunflower", quantity: 5 },
      { flowerId: "carnation", quantity: 6 },
    ],
  },
  {
    id: "mom-love",
    name: "母爱康乃馨",
    description: "20朵粉色康乃馨送妈妈",
    image: "🌷🌷🌷",
    suggestedPrice: 218,
    flowers: [
      { flowerId: "carnation", quantity: 20 },
    ],
  },
  {
    id: "eustoma-elegant",
    name: "优雅洋桔梗",
    description: "15朵洋桔梗，清新雅致",
    image: "💐💐💐",
    suggestedPrice: 168,
    flowers: [
      { flowerId: "eustoma", quantity: 15 },
    ],
  },
];

export const useFlowerStore = create<FlowerStoreState>()(
  persist(
    (set, get) => ({
      flowers: defaultFlowers,
      purchases: [],
      bouquetTemplates: defaultBouquetTemplates,
      sales: [],
      losses: [],

      addPurchase: (flowerId, quantity, costPrice) => {
        const state = get();
        const flower = state.flowers.find(f => f.id === flowerId);
        if (!flower) return;

        const newTotalStock = flower.currentStock + quantity;
        const newTotalCost = flower.avgCostPrice * flower.currentStock + costPrice * quantity;
        const newAvgCost = newTotalStock > 0 ? newTotalCost / newTotalStock : 0;

        const purchase: Purchase = {
          id: `p-${Date.now()}`,
          flowerId,
          quantity,
          costPrice,
          date: todayStr(),
        };

        set({
          flowers: state.flowers.map(f =>
            f.id === flowerId
              ? { ...f, currentStock: newTotalStock, avgCostPrice: Math.round(newAvgCost * 100) / 100 }
              : f
          ),
          purchases: [...state.purchases, purchase],
        });
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

        return bouquet.flowers.reduce((total, usage) => {
          const flower = state.flowers.find(f => f.id === usage.flowerId);
          return total + (flower?.avgCostPrice || 0) * usage.quantity;
        }, 0);
      },

      makeBouquet: (bouquetId, sellPrice) => {
        const state = get();
        const bouquet = state.bouquetTemplates.find(b => b.id === bouquetId);
        if (!bouquet) return { success: false, message: "花束不存在" };

        const { enough, shortages } = state.checkBouquetStock(bouquetId);
        if (!enough) {
          const shortageText = shortages.map(s => `${s.name}(需${s.needed}枝，仅${s.available}枝)`).join("、");
          return { success: false, message: `库存不足：${shortageText}` };
        }

        const costPrice = state.calculateBouquetCost(bouquetId);
        const sale: Sale = {
          id: `s-${Date.now()}`,
          bouquetTemplateId: bouquetId,
          bouquetName: bouquet.name,
          sellPrice,
          costPrice: Math.round(costPrice * 100) / 100,
          date: todayStr(),
          flowersUsed: bouquet.flowers,
        };

        const newFlowers = state.flowers.map(f => {
          const usage = bouquet.flowers.find(u => u.flowerId === f.id);
          if (usage) {
            return { ...f, currentStock: f.currentStock - usage.quantity };
          }
          return f;
        });

        set({
          flowers: newFlowers,
          sales: [...state.sales, sale],
        });

        return { success: true };
      },

      addLoss: (flowerId, quantity, note) => {
        const state = get();
        const flower = state.flowers.find(f => f.id === flowerId);
        if (!flower) return;

        const actualQuantity = Math.min(quantity, flower.currentStock);

        const loss: Loss = {
          id: `l-${Date.now()}`,
          flowerId,
          quantity: actualQuantity,
          unitCost: flower.avgCostPrice,
          date: todayStr(),
          note,
        };

        set({
          flowers: state.flowers.map(f =>
            f.id === flowerId
              ? { ...f, currentStock: f.currentStock - actualQuantity }
              : f
          ),
          losses: [...state.losses, loss],
        });
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

      getWeeklySalesData: () => {
        const state = get();
        const startOfWeek = getStartOfWeek();
        const weekSales = state.sales.filter(s => s.date >= startOfWeek);

        const usageMap = new Map<string, number>();
        for (const sale of weekSales) {
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

      getMonthlyLossData: () => {
        const state = get();
        const startOfMonth = getStartOfMonth();
        const monthLosses = state.losses.filter(l => l.date >= startOfMonth);

        const lossMap = new Map<string, { quantity: number; amount: number }>();
        for (const loss of monthLosses) {
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
        });
      },

      getTotalInventoryValue: () => {
        const state = get();
        return state.flowers.reduce((sum, f) => sum + f.currentStock * f.avgCostPrice, 0);
      },

      getInsights: () => {
        const state = get();
        const insights: string[] = [];

        const weeklyData = state.getWeeklySalesData();
        if (weeklyData.length > 0 && weeklyData[0].value > 0) {
          insights.push(`本周热销：${weeklyData[0].emoji} ${weeklyData[0].name}卖出${weeklyData[0].value}枝，卖得最好！`);
        }

        const lossData = state.getMonthlyLossData();
        const sortedLoss = [...lossData].sort((a, b) => b.value - a.value);
        if (sortedLoss.length > 0 && sortedLoss[0].value > 0) {
          insights.push(`损耗预警：${sortedLoss[0].emoji} ${sortedLoss[0].name}本月损耗¥${sortedLoss[0].value}，建议下次少进点~`);
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
      name: "flower-shop-store",
    }
  )
);
