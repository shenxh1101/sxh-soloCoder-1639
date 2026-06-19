import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  Flower,
  FlowerBatch,
  Purchase,
  BouquetTemplate,
  Sale,
  Loss,
  FlowerStoreState,
  ReportRange,
  BatchDeduction,
  PurchaseSuggestion,
  BouquetSaleStat,
  PurchaseSuggestionLevel,
  BouquetRecipeSnapshot,
  WeeklyTrend,
  BouquetDetail,
  BatchUsageRecord,
  FlowerUsage,
} from "@/types";

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function getRangeStart(range: ReportRange) {
  const today = new Date();
  if (range === "week") {
    const day = today.getDay() || 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() - day + 1);
    return monday.toISOString().split("T")[0];
  } else {
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`;
  }
}

function getWeekStart(dateStr: string): string {
  const d = new Date(dateStr);
  const day = d.getDay() || 7;
  d.setDate(d.getDate() - day + 1);
  return d.toISOString().split("T")[0];
}

function deductFromBatches(
  batches: FlowerBatch[],
  flowerId: string,
  quantity: number
): {
  success: boolean;
  message?: string;
  updatedBatches: FlowerBatch[];
  deductions: BatchDeduction[];
  totalCost: number;
} {
  const flowerBatches = batches
    .filter((b) => b.flowerId === flowerId && b.remainingQuantity > 0)
    .sort((a, b) =>
      a.purchaseDate.localeCompare(b.purchaseDate) || a.id.localeCompare(b.id)
    );

  const totalAvailable = flowerBatches.reduce(
    (sum, b) => sum + b.remainingQuantity,
    0
  );
  if (totalAvailable < quantity) {
    return {
      success: false,
      message: `库存不足：剩余 ${totalAvailable} 枝，需要 ${quantity} 枝`,
      updatedBatches: batches,
      deductions: [],
      totalCost: 0,
    };
  }

  const deductions: BatchDeduction[] = [];
  let remainingNeeded = quantity;
  let totalCost = 0;

  const updatedBatches = batches.map((b) => ({ ...b }));

  for (const batch of flowerBatches) {
    if (remainingNeeded <= 0) break;
    const deductQty = Math.min(batch.remainingQuantity, remainingNeeded);
    if (deductQty > 0) {
      deductions.push({
        batchId: batch.id,
        quantity: deductQty,
        unitCost: batch.costPrice,
      });
      totalCost += deductQty * batch.costPrice;
      remainingNeeded -= deductQty;

      const idx = updatedBatches.findIndex((b) => b.id === batch.id);
      if (idx >= 0) {
        updatedBatches[idx].remainingQuantity -= deductQty;
      }
    }
  }

  return {
    success: true,
    updatedBatches,
    deductions,
    totalCost,
  };
}

function recalcFlowerStats(
  flowers: Flower[],
  batches: FlowerBatch[]
): Flower[] {
  return flowers.map((f) => {
    const myBatches = batches.filter(
      (b) => b.flowerId === f.id && b.remainingQuantity > 0
    );
    const totalQty = myBatches.reduce((sum, b) => sum + b.remainingQuantity, 0);
    const totalValue = myBatches.reduce(
      (sum, b) => sum + b.remainingQuantity * b.costPrice,
      0
    );
    return {
      ...f,
      currentStock: totalQty,
      avgCostPrice: totalQty > 0 ? totalValue / totalQty : f.avgCostPrice,
    };
  });
}

const initialFlowers: Flower[] = [
  {
    id: "rose",
    name: "玫瑰",
    emoji: "🌹",
    currentStock: 0,
    avgCostPrice: 3.5,
    color: "#FCE4EC",
    lowStockThreshold: 30,
    freshDays: 5,
  },
  {
    id: "lily",
    name: "百合",
    emoji: "🌷",
    currentStock: 0,
    avgCostPrice: 4.0,
    color: "#F3E5F5",
    lowStockThreshold: 20,
    freshDays: 7,
  },
  {
    id: "carnation",
    name: "康乃馨",
    emoji: "💐",
    currentStock: 0,
    avgCostPrice: 2.0,
    color: "#FFEBEE",
    lowStockThreshold: 40,
    freshDays: 14,
  },
  {
    id: "sunflower",
    name: "向日葵",
    emoji: "🌻",
    currentStock: 0,
    avgCostPrice: 2.5,
    color: "#FFF8E1",
    lowStockThreshold: 25,
    freshDays: 10,
  },
  {
    id: "eustoma",
    name: "洋桔梗",
    emoji: "🌸",
    currentStock: 0,
    avgCostPrice: 3.0,
    color: "#E8F5E9",
    lowStockThreshold: 20,
    freshDays: 8,
  },
];

const initialTemplates: BouquetTemplate[] = [
  {
    id: "rose-bouquet",
    name: "经典红玫瑰束",
    description: "19枝红玫瑰 + 满天星点缀，表达浓浓爱意",
    image: "🌹",
    suggestedPrice: 199,
    flowers: [
      { flowerId: "rose", quantity: 19 },
    ],
  },
  {
    id: "lily-bouquet",
    name: "香水百合花束",
    description: "6枝香水百合 + 尤加利叶，清新优雅",
    image: "🌷",
    suggestedPrice: 168,
    flowers: [
      { flowerId: "lily", quantity: 6 },
    ],
  },
  {
    id: "mixed-bouquet",
    name: "韩式混搭花束",
    description: "玫瑰5枝 + 洋桔梗3枝 + 康乃馨2枝 + 向日葵1枝，缤纷多彩",
    image: "💐",
    suggestedPrice: 228,
    flowers: [
      { flowerId: "rose", quantity: 5 },
      { flowerId: "eustoma", quantity: 3 },
      { flowerId: "carnation", quantity: 2 },
      { flowerId: "sunflower", quantity: 1 },
    ],
  },
  {
    id: "carnation-bouquet",
    name: "康乃馨花束",
    description: "20枝粉色康乃馨，送给妈妈的爱",
    image: "🌸",
    suggestedPrice: 138,
    flowers: [
      { flowerId: "carnation", quantity: 20 },
    ],
  },
];

export const useFlowerStore = create<FlowerStoreState>()(
  persist(
    (set, get) => ({
      flowers: initialFlowers,
      batches: [],
      purchases: [],
      bouquetTemplates: initialTemplates,
      recipeSnapshots: [],
      sales: [],
      losses: [],

      addPurchase: (flowerId, quantity, costPrice, date) => {
        const state = get();
        const purchaseDate = date || todayStr();
        const batchId = `batch-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

        const newBatch: FlowerBatch = {
          id: batchId,
          flowerId,
          purchaseDate,
          initialQuantity: quantity,
          remainingQuantity: quantity,
          costPrice,
        };

        const newPurchase: Purchase = {
          id: `pur-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          flowerId,
          quantity,
          costPrice,
          date: purchaseDate,
          batchId,
        };

        const newBatches = [...state.batches, newBatch];
        const newFlowers = recalcFlowerStats(state.flowers, newBatches);

        set({
          batches: newBatches,
          purchases: [...state.purchases, newPurchase],
          flowers: newFlowers,
        });
      },

      getFlowerBatches: (flowerId) => {
        return get().batches.filter(
          (b) => b.flowerId === flowerId && b.remainingQuantity > 0
        );
      },

      getBatchUsageRecords: (batchId) => {
        const state = get();
        const records: BatchUsageRecord[] = [];

        for (const sale of state.sales) {
          for (const bd of sale.batchDeductions) {
            const match = bd.deductions.find((d) => d.batchId === batchId);
            if (match) {
              records.push({
                batchId,
                date: sale.date,
                quantity: match.quantity,
                type: "sale",
                relatedId: sale.id,
              });
            }
          }
        }

        for (const loss of state.losses) {
          const match = loss.batchDeductions.find((d) => d.batchId === batchId);
          if (match) {
            records.push({
              batchId,
              date: loss.date,
              quantity: match.quantity,
              type: "loss",
              relatedId: loss.id,
            });
          }
        }

        return records.sort((a, b) => b.date.localeCompare(a.date));
      },

      getInventoryValueBreakdown: (flowerId) => {
        const state = get();
        const flower = state.flowers.find((f) => f.id === flowerId);
        const batches = state.batches
          .filter((b) => b.flowerId === flowerId && b.remainingQuantity > 0)
          .sort(
            (a, b) =>
              a.purchaseDate.localeCompare(b.purchaseDate) ||
              a.id.localeCompare(b.id)
          );

        const breakdown = batches.map((b) => ({
          batch: b,
          value: Math.round(b.remainingQuantity * b.costPrice * 100) / 100,
        }));
        const total = breakdown.reduce((sum, b) => sum + b.value, 0);

        const explanationParts = breakdown.map(
          (b) =>
            `${b.batch.purchaseDate}批 ${b.batch.remainingQuantity}枝×¥${b.batch.costPrice.toFixed(
              2
            )}=¥${b.value.toFixed(2)}`
        );
        const explanation =
          breakdown.length > 0
            ? `库存价值 = ${explanationParts.join(" + ")} = ¥${total.toFixed(2)}`
            : "暂无在库批次";

        return {
          batches: breakdown,
          total: Math.round(total * 100) / 100,
          explanation,
        };
      },

      checkBouquetStock: (bouquetId) => {
        const state = get();
        const template = state.bouquetTemplates.find(
          (t) => t.id === bouquetId
        );
        if (!template) return { enough: false, shortages: [] };

        const shortages: {
          name: string;
          needed: number;
          available: number;
        }[] = [];

        for (const usage of template.flowers) {
          const flower = state.flowers.find((f) => f.id === usage.flowerId);
          if (!flower || flower.currentStock < usage.quantity) {
            shortages.push({
              name: flower?.name || usage.flowerId,
              needed: usage.quantity,
              available: flower?.currentStock || 0,
            });
          }
        }

        return {
          enough: shortages.length === 0,
          shortages,
        };
      },

      calculateBouquetCost: (bouquetId) => {
        const state = get();
        const template = state.bouquetTemplates.find(
          (t) => t.id === bouquetId
        );
        if (!template) return 0;

        return template.flowers.reduce((sum, usage) => {
          const flower = state.flowers.find((f) => f.id === usage.flowerId);
          return sum + (flower?.avgCostPrice || 0) * usage.quantity;
        }, 0);
      },

      estimateBouquetCost: (flowers) => {
        const state = get();
        return flowers.reduce((sum, usage) => {
          const flower = state.flowers.find((f) => f.id === usage.flowerId);
          return sum + (flower?.avgCostPrice || 0) * usage.quantity;
        }, 0);
      },

      makeBouquet: (bouquetId, sellPrice) => {
        const state = get();
        const template = state.bouquetTemplates.find(
          (t) => t.id === bouquetId
        );
        if (!template)
          return { success: false, message: "花束模板不存在" };

        if (sellPrice <= 0) {
          return { success: false, message: "售价必须大于0元" };
        }

        const flowersUsed = template.flowers.map((f) => ({ ...f }));

        let currentBatches = [...state.batches];
        const allDeductions: {
          flowerId: string;
          deductions: BatchDeduction[];
        }[] = [];
        let totalCost = 0;

        for (const usage of template.flowers) {
          const result = deductFromBatches(
            currentBatches,
            usage.flowerId,
            usage.quantity
          );
          if (!result.success) {
            return result;
          }
          currentBatches = result.updatedBatches;
          totalCost += result.totalCost;
          allDeductions.push({
            flowerId: usage.flowerId,
            deductions: result.deductions,
          });
        }

        const estimatedCost = state.estimateBouquetCost(template.flowers);
        const snapshot: Omit<BouquetRecipeSnapshot, "id" | "createdAt"> = {
          templateId: template.id,
          name: template.name,
          flowers: template.flowers.map((f) => ({ ...f })),
          suggestedPrice: template.suggestedPrice,
          estimatedCost: Math.round(estimatedCost * 100) / 100,
        };

        const newSale: Sale = {
          id: `sale-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          bouquetTemplateId: bouquetId,
          bouquetName: template.name,
          sellPrice,
          costPrice: Math.round(totalCost * 100) / 100,
          date: todayStr(),
          flowersUsed,
          recipeSnapshot: snapshot,
          batchDeductions: allDeductions,
        };

        const newFlowers = recalcFlowerStats(state.flowers, currentBatches);

        set({
          batches: currentBatches,
          sales: [...state.sales, newSale],
          flowers: newFlowers,
        });

        return { success: true };
      },

      addLoss: (flowerId, quantity, note) => {
        const state = get();
        const flower = state.flowers.find((f) => f.id === flowerId);
        if (!flower)
          return { success: false, message: "花材不存在" };
        if (quantity > flower.currentStock) {
          return {
            success: false,
            message: `${flower.emoji} ${flower.name} 损耗数量（${quantity}枝）超过当前库存（${flower.currentStock}枝），请核对后再记录`,
          };
        }

        const result = deductFromBatches(
          state.batches,
          flowerId,
          quantity
        );
        if (!result.success) return result;

        const newLoss: Loss = {
          id: `loss-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          flowerId,
          quantity,
          unitCost: Math.round((result.totalCost / quantity) * 100) / 100,
          date: todayStr(),
          note,
          batchDeductions: result.deductions,
        };

        const newFlowers = recalcFlowerStats(
          state.flowers,
          result.updatedBatches
        );

        set({
          batches: result.updatedBatches,
          losses: [...state.losses, newLoss],
          flowers: newFlowers,
        });

        return { success: true };
      },

      addCustomBouquetTemplate: (template) => {
        const state = get();
        const newTemplate: BouquetTemplate = {
          ...template,
          id: `tpl-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          isCustom: true,
          recipeSnapshots: [],
        };
        set({ bouquetTemplates: [...state.bouquetTemplates, newTemplate] });
      },

      updateBouquetTemplate: (templateId, updates) => {
        const state = get();
        const template = state.bouquetTemplates.find(
          (t) => t.id === templateId
        );
        if (!template)
          return { success: false, message: "花束模板不存在" };

        const estimatedCost = state.estimateBouquetCost(
          updates.flowers || template.flowers
        );

        const snapshot: BouquetRecipeSnapshot = {
          id: `snap-${Date.now()}`,
          templateId,
          name: updates.name || template.name,
          flowers: updates.flowers || template.flowers,
          suggestedPrice:
            updates.suggestedPrice ?? template.suggestedPrice,
          estimatedCost: Math.round(estimatedCost * 100) / 100,
          createdAt: todayStr(),
        };

        const existingSnapshots = template.recipeSnapshots || [];

        const updatedTemplates = state.bouquetTemplates.map((t) =>
          t.id === templateId
            ? {
                ...t,
                ...updates,
                recipeSnapshots: [...existingSnapshots, snapshot],
              }
            : t
        );

        set({
          bouquetTemplates: updatedTemplates,
          recipeSnapshots: [...state.recipeSnapshots, snapshot],
        });

        return { success: true };
      },

      deleteBouquetTemplate: (templateId) => {
        const state = get();
        const template = state.bouquetTemplates.find(
          (t) => t.id === templateId
        );
        if (!template || !template.isCustom) return;
        set({
          bouquetTemplates: state.bouquetTemplates.filter(
            (t) => t.id !== templateId
          ),
        });
      },

      getTodayStats: () => {
        const state = get();
        const today = todayStr();
        const todaySales = state.sales.filter((s) => s.date === today);
        const todayLosses = state.losses.filter((l) => l.date === today);
        return {
          salesCount: todaySales.length,
          lossAmount: todayLosses.reduce(
            (sum, l) => sum + l.quantity * l.unitCost,
            0
          ),
        };
      },

      getSalesData: (range) => {
        const state = get();
        const rangeStart = getRangeStart(range);
        const rangeSales = state.sales.filter((s) => s.date >= rangeStart);
        const usageMap = new Map<string, number>();

        for (const sale of rangeSales) {
          for (const usage of sale.flowersUsed) {
            usageMap.set(
              usage.flowerId,
              (usageMap.get(usage.flowerId) || 0) + usage.quantity
            );
          }
        }

        return state.flowers
          .map((f) => ({
            name: f.name,
            emoji: f.emoji,
            value: usageMap.get(f.id) || 0,
          }))
          .sort((a, b) => b.value - a.value);
      },

      getLossData: (range) => {
        const state = get();
        const rangeStart = getRangeStart(range);
        const rangeLosses = state.losses.filter((l) => l.date >= rangeStart);
        const lossMap = new Map<string, { amount: number; qty: number }>();

        for (const loss of rangeLosses) {
          const existing = lossMap.get(loss.flowerId) || {
            amount: 0,
            qty: 0,
          };
          lossMap.set(loss.flowerId, {
            amount: existing.amount + loss.quantity * loss.unitCost,
            qty: existing.qty + loss.quantity,
          });
        }

        return state.flowers
          .map((f) => ({
            name: f.name,
            emoji: f.emoji,
            value: Math.round((lossMap.get(f.id)?.amount || 0) * 100) / 100,
            totalAmount: lossMap.get(f.id)?.qty || 0,
          }))
          .sort((a, b) => b.value - a.value);
      },

      getProfitSummary: (range) => {
        const state = get();
        const rangeStart = getRangeStart(range);
        const rangeSales = state.sales.filter((s) => s.date >= rangeStart);

        const revenue = rangeSales.reduce(
          (sum, s) => sum + s.sellPrice,
          0
        );
        const cost = rangeSales.reduce(
          (sum, s) => sum + s.costPrice,
          0
        );

        return {
          revenue: Math.round(revenue * 100) / 100,
          cost: Math.round(cost * 100) / 100,
          profit: Math.round((revenue - cost) * 100) / 100,
          salesCount: rangeSales.length,
        };
      },

      getTotalInventoryValue: () => {
        const state = get();
        return state.batches
          .filter((b) => b.remainingQuantity > 0)
          .reduce(
            (sum, b) => sum + b.remainingQuantity * b.costPrice,
            0
          );
      },

      getWeeklyTrends: (flowerId, weeks = 4) => {
        const state = get();
        const trends: WeeklyTrend[] = [];
        const today = new Date();

        for (let i = weeks - 1; i >= 0; i--) {
          const weekStartDate = new Date(today);
          const day = weekStartDate.getDay() || 7;
          weekStartDate.setDate(
            today.getDate() - day + 1 - i * 7
          );
          const weekStartStr = weekStartDate.toISOString().split("T")[0];
          const weekEndDate = new Date(weekStartDate);
          weekEndDate.setDate(weekStartDate.getDate() + 6);
          const weekEndStr = weekEndDate.toISOString().split("T")[0];

          const monthLabel = weekStartDate.getMonth() + 1;
          const startDay = weekStartDate.getDate();
          const endDay = weekEndDate.getDate();
          const weekLabel = `${monthLabel}月${startDay}日-${endDay}日`;

          let salesQty = 0;
          for (const sale of state.sales) {
            if (sale.date >= weekStartStr && sale.date <= weekEndStr) {
              for (const usage of sale.flowersUsed) {
                if (usage.flowerId === flowerId) {
                  salesQty += usage.quantity;
                }
              }
            }
          }

          let lossQty = 0;
          for (const loss of state.losses) {
            if (
              loss.flowerId === flowerId &&
              loss.date >= weekStartStr &&
              loss.date <= weekEndStr
            ) {
              lossQty += loss.quantity;
            }
          }

          trends.push({
            weekStart: weekStartStr,
            weekLabel,
            sales: salesQty,
            loss: lossQty,
          });
        }

        return trends;
      },

      getInsights: () => {
        const state = get();
        const insights: string[] = [];

        const weeklyData = state.getSalesData("week");
        if (weeklyData.length > 0 && weeklyData[0].value > 0) {
          insights.push(
            `本周热销：${weeklyData[0].emoji} ${weeklyData[0].name}卖出${weeklyData[0].value}枝，卖得最好！`
          );
        }

        const weeklyLoss = state.getLossData("week");
        if (weeklyLoss.length > 0 && weeklyLoss[0].value > 0) {
          insights.push(
            `本周损耗最多：${weeklyLoss[0].emoji} ${weeklyLoss[0].name}损耗¥${weeklyLoss[0].value}，下周建议少进点`
          );
        }

        const lowStockFlowers = state.flowers.filter(
          (f) =>
            f.currentStock <= f.lowStockThreshold && f.currentStock > 0
        );
        if (lowStockFlowers.length > 0) {
          const names = lowStockFlowers
            .map((f) => `${f.emoji}${f.name}(${f.currentStock}枝)`)
            .join("、");
          insights.push(`库存偏低：${names}，大订单可能接不了哦`);
        }

        const outOfStock = state.flowers.filter(
          (f) => f.currentStock === 0
        );
        if (outOfStock.length > 0) {
          const names = outOfStock
            .map((f) => `${f.emoji}${f.name}`)
            .join("、");
          insights.push(`缺货提醒：${names}已经没货了，快进货！`);
        }

        const suggestions = state.getPurchaseSuggestions();
        const trendingUp = suggestions.filter(
          (s) => s.trendHint === "up"
        );
        if (trendingUp.length > 0) {
          const names = trendingUp
            .map((f) => `${f.emoji}${f.name}`)
            .join("、");
          insights.push(`销量上升：${names}最近卖得越来越快，建议多进货`);
        }

        if (insights.length === 0) {
          insights.push("一切正常！继续保持 💐");
        }

        return insights;
      },

      getPurchaseSuggestions: () => {
        const state = get();
        const weeklySales = state.getSalesData("week");
        const weeklyLoss = state.getLossData("week");

        const salesMap = new Map<string, number>();
        weeklySales.forEach((s) => salesMap.set(s.name, s.value));

        const lossMap = new Map<
          string,
          { value: number; totalAmount: number }
        >();
        weeklyLoss.forEach((l) =>
          lossMap.set(l.name, { value: l.value, totalAmount: l.totalAmount })
        );

        const suggestions: PurchaseSuggestion[] = state.flowers.map(
          (flower) => {
            const trends = state.getWeeklyTrends(flower.id, 4);
            const weeklyUsage = salesMap.get(flower.name) || 0;
            const weeklyLossQty =
              lossMap.get(flower.name)?.totalAmount || 0;
            const weeklyTotalConsume = weeklyUsage + weeklyLossQty;
            const currentStock = flower.currentStock;

            const lastTwoWeeksSales = trends.slice(-2);
            let trendHint: "up" | "down" | "stable" = "stable";
            if (lastTwoWeeksSales.length === 2) {
              const [prev, curr] = lastTwoWeeksSales;
              const diff = curr.sales - prev.sales;
              if (prev.sales > 0 && diff / prev.sales > 0.3) {
                trendHint = "up";
              } else if (prev.sales > 0 && diff / prev.sales < -0.3) {
                trendHint = "down";
              }
            }

            let suggestedQuantity = 0;
            let level: PurchaseSuggestionLevel = "hold";
            let reason = "";

            const safeStock = flower.lowStockThreshold;
            const trendMultiplier = trendHint === "up" ? 1.5 : 1;
            const twoWeekDemand =
              Math.round(weeklyTotalConsume * 2 * trendMultiplier);
            const oneWeekDemand = Math.round(
              weeklyTotalConsume * trendMultiplier
            );

            const stockDays =
              weeklyTotalConsume > 0
                ? Math.round((currentStock / weeklyTotalConsume) * 7)
                : 999;

            if (currentStock === 0) {
              level = "urgent";
              suggestedQuantity = Math.max(twoWeekDemand, safeStock);
              reason = "已售罄，急需补货";
            } else if (stockDays <= 2) {
              level = "urgent";
              suggestedQuantity = Math.max(
                twoWeekDemand - currentStock,
                safeStock - currentStock
              );
              reason = `仅够卖${stockDays}天，建议尽快补货`;
            } else if (trendHint === "up" && stockDays < flower.freshDays) {
              level = "trending-up";
              suggestedQuantity =
                twoWeekDemand - currentStock + (weeklyTotalConsume > 0 ? Math.ceil(weeklyTotalConsume * 0.5) : 10);
              reason = `销量持续上升（本周+${((lastTwoWeeksSales[1]?.sales - lastTwoWeeksSales[0]?.sales || 0) / (lastTwoWeeksSales[0]?.sales || 1) * 100).toFixed(0)}%），建议多进点`;
            } else if (currentStock < safeStock) {
              level = "urgent";
              suggestedQuantity = Math.max(
                twoWeekDemand - currentStock,
                safeStock - currentStock
              );
              reason = "库存低于安全线，建议尽快补货";
            } else if (
              weeklyTotalConsume === 0 &&
              currentStock > safeStock
            ) {
              level = "reduce";
              suggestedQuantity = 0;
              reason = "本周没有消耗，库存充足，暂时不用进货";
            } else if (currentStock > twoWeekDemand * 1.5) {
              level = "reduce";
              suggestedQuantity = 0;
              reason = "库存超过两周用量，建议少进一点";
            } else if (
              weeklyLossQty > 0 &&
              weeklyLossQty / weeklyTotalConsume > 0.3
            ) {
              level = "reduce";
              suggestedQuantity = Math.max(
                0,
                oneWeekDemand - currentStock
              );
              reason = "损耗率较高（>30%），建议减少进货量或优化保存方式（可尝试深水醒花、冷藏）";
            } else if (currentStock < oneWeekDemand) {
              level = "suggest";
              suggestedQuantity = twoWeekDemand - currentStock;
              reason = "库存不足一周用量，建议补货";
            } else if (stockDays > flower.freshDays * 1.5 && weeklyTotalConsume > 0) {
              level = "reduce";
              suggestedQuantity = 0;
              reason = `库存可售${stockDays}天，超过保鲜期（${flower.freshDays}天），建议少进点避免损耗`;
            } else {
              level = "hold";
              suggestedQuantity = Math.max(
                0,
                twoWeekDemand - currentStock
              );
              reason = `库存可售${stockDays}天，在保鲜期内，可按需少量补货`;
            }

            suggestedQuantity = Math.max(
              0,
              Math.round(suggestedQuantity)
            );

            return {
              flowerId: flower.id,
              name: flower.name,
              emoji: flower.emoji,
              currentStock,
              weeklyUsage,
              weeklyLoss: weeklyLossQty,
              suggestedQuantity,
              level,
              reason,
              freshDays: flower.freshDays,
              trends,
              trendHint,
            };
          }
        );

        const levelOrder: Record<PurchaseSuggestionLevel, number> = {
          urgent: 0,
          "trending-up": 1,
          suggest: 2,
          reduce: 3,
          hold: 4,
        };
        return suggestions.sort(
          (a, b) => levelOrder[a.level] - levelOrder[b.level]
        );
      },

      getBouquetSalesStats: (range) => {
        const state = get();
        const rangeStart = getRangeStart(range);
        const rangeSales = state.sales.filter(
          (s) => s.date >= rangeStart
        );

        const statMap = new Map<string, BouquetSaleStat>();

        for (const sale of rangeSales) {
          const existing = statMap.get(sale.bouquetTemplateId);
          if (existing) {
            existing.salesCount += 1;
            existing.totalRevenue += sale.sellPrice;
            existing.totalCost += sale.costPrice;
            existing.totalProfit += sale.sellPrice - sale.costPrice;
          } else {
            const template = state.bouquetTemplates.find(
              (t) => t.id === sale.bouquetTemplateId
            );
            statMap.set(sale.bouquetTemplateId, {
              bouquetTemplateId: sale.bouquetTemplateId,
              bouquetName: sale.bouquetName,
              image: template?.image || "💐",
              salesCount: 1,
              totalRevenue: sale.sellPrice,
              totalCost: sale.costPrice,
              totalProfit: sale.sellPrice - sale.costPrice,
              avgProfit: 0,
              profitRate: 0,
            });
          }
        }

        return Array.from(statMap.values())
          .map((stat) => ({
            ...stat,
            totalRevenue: Math.round(stat.totalRevenue * 100) / 100,
            totalCost: Math.round(stat.totalCost * 100) / 100,
            totalProfit: Math.round(stat.totalProfit * 100) / 100,
            avgProfit:
              Math.round((stat.totalProfit / stat.salesCount) * 100) /
              100,
            profitRate:
              stat.totalRevenue > 0
                ? Math.round(
                    (stat.totalProfit / stat.totalRevenue) * 10000
                  ) / 100
                : 0,
          }))
          .sort((a, b) => b.salesCount - a.salesCount);
      },

      getSalesByBouquet: (bouquetId, range) => {
        const state = get();
        const rangeStart = getRangeStart(range);
        return state.sales
          .filter(
            (s) =>
              s.bouquetTemplateId === bouquetId && s.date >= rangeStart
          )
          .sort((a, b) => b.date.localeCompare(a.date));
      },

      getBouquetDetail: (bouquetId, range) => {
        const state = get();
        const template = state.bouquetTemplates.find(
          (t) => t.id === bouquetId
        );
        const recentSales = state.getSalesByBouquet(bouquetId, range);

        const pricePoints = recentSales.map((s) => ({
          date: s.date,
          sellPrice: s.sellPrice,
          costPrice: s.costPrice,
          profit: Math.round((s.sellPrice - s.costPrice) * 100) / 100,
        }));

        const totalSales = recentSales.length;
        const totalRevenue = recentSales.reduce(
          (sum, s) => sum + s.sellPrice,
          0
        );
        const totalCost = recentSales.reduce(
          (sum, s) => sum + s.costPrice,
          0
        );
        const totalProfit = totalRevenue - totalCost;

        const avgCost =
          totalSales > 0
            ? Math.round((totalCost / totalSales) * 100) / 100
            : 0;
        const avgSellPrice =
          totalSales > 0
            ? Math.round((totalRevenue / totalSales) * 100) / 100
            : 0;
        const avgProfit =
          totalSales > 0
            ? Math.round((totalProfit / totalSales) * 100) / 100
            : 0;
        const avgProfitRate =
          totalRevenue > 0
            ? Math.round((totalProfit / totalRevenue) * 10000) / 100
            : 0;

        const flowerUsageMap = new Map<
          string,
          { totalQty: number; totalCost: number }
        >();
        for (const sale of recentSales) {
          for (const bd of sale.batchDeductions) {
            const existing = flowerUsageMap.get(bd.flowerId) || {
              totalQty: 0,
              totalCost: 0,
            };
            for (const d of bd.deductions) {
              existing.totalQty += d.quantity;
              existing.totalCost += d.quantity * d.unitCost;
            }
            flowerUsageMap.set(bd.flowerId, existing);
          }
        }

        const topBatchFlowers = Array.from(flowerUsageMap.entries())
          .map(([flowerId, data]) => {
            const flower = state.flowers.find((f) => f.id === flowerId);
            return {
              flowerId,
              name: flower?.name || flowerId,
              emoji: flower?.emoji || "🌸",
              totalQty: data.totalQty,
              avgCost:
                data.totalQty > 0
                  ? Math.round((data.totalCost / data.totalQty) * 100) /
                    100
                  : 0,
            };
          })
          .sort((a, b) => b.totalQty - a.totalQty);

        return {
          templateId: bouquetId,
          template,
          recentSales,
          pricePoints,
          avgCost,
          avgSellPrice,
          avgProfit,
          avgProfitRate,
          totalSales,
          totalRevenue: Math.round(totalRevenue * 100) / 100,
          totalProfit: Math.round(totalProfit * 100) / 100,
          topBatchFlowers,
        };
      },
    }),
    {
      name: "flower-shop-store-v3",
    }
  )
);
