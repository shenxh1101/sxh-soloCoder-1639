import { useMemo, useState, useEffect } from "react";
import {
  ShoppingCart,
  AlertTriangle,
  TrendingDown,
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Package,
  Sparkles,
  TrendingUp,
  Flower2,
  CheckSquare,
  Square,
  X,
  Trash2,
  ClipboardList,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { useFlowerStore } from "@/store/useFlowerStore";
import type { PurchaseSuggestionLevel } from "@/types";
import Button from "@/components/Button";

const levelConfig: Record<
  PurchaseSuggestionLevel,
  {
    label: string;
    color: string;
    bg: string;
    border: string;
    icon: typeof AlertTriangle;
  }
> = {
  urgent: {
    label: "急需补货",
    color: "text-red-600",
    bg: "bg-red-50",
    border: "border-red-200",
    icon: AlertTriangle,
  },
  "trending-up": {
    label: "销量上升",
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-200",
    icon: TrendingUp,
  },
  suggest: {
    label: "建议补货",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: ShoppingCart,
  },
  hold: {
    label: "按需补货",
    color: "text-leaf-600",
    bg: "bg-leaf-50",
    border: "border-leaf-200",
    icon: CheckCircle,
  },
  reduce: {
    label: "减少进货",
    color: "text-rose-500",
    bg: "bg-rose-50",
    border: "border-rose-200",
    icon: TrendingDown,
  },
};

export default function PurchaseSuggestion() {
  const {
    getPurchaseSuggestions,
    flowers,
    addPurchase,
    getTotalInventoryValue,
    orderPlan,
    setOrderPlanItem,
    clearOrderPlanItem,
    clearOrderPlan,
    getOrderPlanSummary,
    suppliers,
  } = useFlowerStore();

  const suggestions = getPurchaseSuggestions();
  const [expandedFlowerId, setExpandedFlowerId] = useState<string | null>(null);
  const [quickAddQty, setQuickAddQty] = useState<Record<string, string>>({});
  const [quickAddPrice, setQuickAddPrice] = useState<Record<string, string>>({});
  const [quickAddSupplier, setQuickAddSupplier] = useState<
    Record<string, string>
  >({});

  const [planQty, setPlanQty] = useState<Record<string, string>>({});
  const [isPlanPanelOpen, setIsPlanPanelOpen] = useState(true);

  useEffect(() => {
    const initial: Record<string, string> = {};
    suggestions.forEach((s) => {
      const planItem = orderPlan.find((p) => p.flowerId === s.flowerId);
      if (planItem) {
        initial[s.flowerId] = String(planItem.quantity);
      } else if (s.suggestedQuantity > 0) {
        initial[s.flowerId] = String(s.suggestedQuantity);
      }
    });
    setPlanQty(initial);
  }, [suggestions.length, orderPlan.length]);

  const totalSuggestedValue = useMemo(() => {
    return suggestions.reduce((sum, s) => {
      const flower = flowers.find((f) => f.id === s.flowerId);
      return sum + s.suggestedQuantity * (flower?.avgCostPrice || 0);
    }, 0);
  }, [suggestions, flowers]);

  const totalValue = getTotalInventoryValue();
  const urgentCount = suggestions.filter((s) => s.level === "urgent").length;
  const planSummary = getOrderPlanSummary();

  const toggleExpand = (flowerId: string) => {
    setExpandedFlowerId(expandedFlowerId === flowerId ? null : flowerId);
  };

  const isSelected = (flowerId: string) => {
    return orderPlan.some((p) => p.flowerId === flowerId && p.selected);
  };

  const handleToggleSelect = (flowerId: string) => {
    const flower = flowers.find((f) => f.id === flowerId);
    const current = isSelected(flowerId);
    const qty = parseInt(planQty[flowerId] || "0") || 0;
    setOrderPlanItem(
      flowerId,
      qty > 0 ? qty : 0,
      !current,
    );
  };

  const handlePlanQtyChange = (flowerId: string, value: string) => {
    setPlanQty({ ...planQty, [flowerId]: value });
    const qty = parseInt(value || "0") || 0;
    const flower = flowers.find((f) => f.id === flowerId);
    if (qty > 0) {
      setOrderPlanItem(flowerId, qty, true);
    } else {
      setOrderPlanItem(flowerId, 0, false);
    }
  };

  const handleQuickAdd = (flowerId: string) => {
    const qty = parseInt(quickAddQty[flowerId] || "0");
    const price = parseFloat(quickAddPrice[flowerId] || "0");
    const supplierId = quickAddSupplier[flowerId] || undefined;
    if (!qty || qty <= 0 || !price || price <= 0) return;
    addPurchase(flowerId, qty, price, undefined, supplierId);
    setQuickAddQty({ ...quickAddQty, [flowerId]: "" });
    setQuickAddPrice({ ...quickAddPrice, [flowerId]: "" });
    setQuickAddSupplier({ ...quickAddSupplier, [flowerId]: "" });
  };

  const handleSelectAllSuggested = () => {
    suggestions.forEach((s) => {
      if (s.suggestedQuantity > 0) {
        const flower = flowers.find((f) => f.id === s.flowerId);
        setPlanQty((prev) => ({
          ...prev,
          [s.flowerId]: String(s.suggestedQuantity),
        }));
        setOrderPlanItem(s.flowerId, s.suggestedQuantity, true);
      }
    });
  };

  return (
    <div className="space-y-6 pb-48">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-ink flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-rose-500" />
            采购建议
          </h1>
          <p className="text-sm text-ink/60 mt-1">
            根据本周销量、损耗和当前库存，智能推荐进货量
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm bg-leaf-50 text-leaf-600 px-4 py-2 rounded-full">
            当前库存 ¥{totalValue.toFixed(2)}
          </div>
          <div className="text-sm bg-amber-50 text-amber-600 px-4 py-2 rounded-full">
            建议采购约 ¥{totalSuggestedValue.toFixed(0)}
          </div>
        </div>
      </div>

      {urgentCount > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-amber-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-ink">
              <span className="text-red-600 font-bold">{urgentCount}</span>{" "}
              种花材需要紧急补货
            </p>
            <p className="text-xs text-red-500 mt-0.5">
              库存已经低于安全线，建议尽快安排采购
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {(["urgent", "trending-up", "suggest", "hold", "reduce"] as
          PurchaseSuggestionLevel[]).map((level) => {
          const count = suggestions.filter((s) => s.level === level).length;
          const config = levelConfig[level];
          const Icon = config.icon;
          return (
            <div
              key={level}
              className={`${config.bg} ${config.border} border rounded-2xl p-4`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${config.color}`} />
                <span className={`text-xs font-medium ${config.color}`}>
                  {config.label}
                </span>
              </div>
              <p className="font-serif text-3xl font-bold text-ink">{count}</p>
              <p className="text-xs text-ink/50 mt-1">种花材</p>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl card-shadow overflow-hidden">
        <div className="px-5 py-4 border-b border-rose-50 flex items-center justify-between">
          <h2 className="font-serif text-lg font-semibold text-ink flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            花材采购建议清单
          </h2>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleSelectAllSuggested}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              全选有建议的
            </Button>
          </div>
        </div>

        <div className="divide-y divide-rose-50">
          {suggestions.map((item) => {
            const config = levelConfig[item.level];
            const isExpanded = expandedFlowerId === item.flowerId;
            const flower = flowers.find((f) => f.id === item.flowerId);
            const Icon = config.icon;
            const selected = isSelected(item.flowerId);

            return (
              <div key={item.flowerId}>
                <div className="flex items-center gap-3 px-5 py-4 hover:bg-rose-50/30 transition-colors">
                  <button
                    onClick={() => handleToggleSelect(item.flowerId)}
                    className="flex-shrink-0 text-rose-400 hover:text-rose-600 transition-colors"
                  >
                    {selected ? (
                      <CheckSquare className="w-5 h-5 fill-rose-100" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>

                  <button
                    className="p-1 rounded-lg hover:bg-rose-100 transition-colors text-ink/50"
                    onClick={() => toggleExpand(item.flowerId)}
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>

                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ backgroundColor: flower?.color || "#eee" }}
                  >
                    {item.emoji}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-ink">{item.name}</p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${config.bg} ${config.color} font-medium`}
                      >
                        {config.label}
                      </span>
                    </div>
                    <p className="text-xs text-ink/50 mt-0.5 truncate">
                      {item.reason}
                    </p>
                  </div>

                  <div className="text-right hidden sm:block">
                    <p className="text-sm text-ink/50">当前库存</p>
                    <p className="font-serif text-lg font-bold text-ink">
                      {item.currentStock} 枝
                    </p>
                  </div>

                  <div className="text-right hidden sm:block">
                    <p className="text-sm text-ink/50">本周消耗</p>
                    <p className="font-serif text-lg font-bold text-rose-500">
                      {item.weeklyUsage + item.weeklyLoss} 枝
                    </p>
                  </div>

                  <div className="text-right min-w-[80px] hidden md:block">
                    <p className="text-sm text-ink/50">参考进价</p>
                    <p className="font-serif text-base font-bold text-ink">
                      ¥{flower?.avgCostPrice.toFixed(2) || "0.00"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="flex flex-col items-end">
                      <p className="text-[10px] text-ink/50 mb-0.5">订货数量</p>
                      <input
                        type="number"
                        min="0"
                        value={planQty[item.flowerId] || ""}
                        placeholder={
                          item.suggestedQuantity > 0
                            ? String(item.suggestedQuantity)
                            : "0"
                        }
                        onChange={(e) =>
                          handlePlanQtyChange(item.flowerId, e.target.value)
                        }
                        onClick={(e) => e.stopPropagation()}
                        className="w-20 px-2 py-1 text-sm text-right rounded-lg border border-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-200"
                      />
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="bg-rose-50/30 px-5 py-4 pl-16">
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-4">
                      <div className="bg-white rounded-xl p-3">
                        <p className="text-xs text-ink/50 mb-1">本周售出</p>
                        <p className="font-serif text-lg font-bold text-leaf-600">
                          {item.weeklyUsage} 枝
                        </p>
                      </div>
                      <div className="bg-white rounded-xl p-3">
                        <p className="text-xs text-ink/50 mb-1">本周损耗</p>
                        <p className="font-serif text-lg font-bold text-red-500">
                          {item.weeklyLoss} 枝
                        </p>
                      </div>
                      <div className="bg-white rounded-xl p-3">
                        <p className="text-xs text-ink/50 mb-1">损耗率</p>
                        <p className="font-serif text-lg font-bold text-amber-500">
                          {item.weeklyUsage + item.weeklyLoss > 0
                            ? (
                                (item.weeklyLoss /
                                  (item.weeklyUsage + item.weeklyLoss)) *
                                100
                              ).toFixed(0)
                            : 0}
                          %
                        </p>
                      </div>
                      <div className="bg-white rounded-xl p-3">
                        <p className="text-xs text-ink/50 mb-1">保鲜天数</p>
                        <p className="font-serif text-lg font-bold text-purple-500 flex items-center gap-1">
                          <Flower2 className="w-4 h-4" />
                          {item.freshDays} 天
                        </p>
                      </div>
                      <div className="bg-white rounded-xl p-3">
                        <p className="text-xs text-ink/50 mb-1">库存可售</p>
                        <p
                          className={`font-serif text-lg font-bold ${
                            item.weeklyUsage + item.weeklyLoss > 0 &&
                            (item.currentStock /
                              (item.weeklyUsage + item.weeklyLoss)) *
                              7 >
                              item.freshDays
                              ? "text-amber-500"
                              : "text-ink"
                          }`}
                        >
                          {item.weeklyUsage + item.weeklyLoss > 0
                            ? Math.round(
                                (item.currentStock /
                                  (item.weeklyUsage + item.weeklyLoss)) *
                                  7,
                              )
                            : 999}{" "}
                          天
                        </p>
                      </div>
                    </div>

                    {item.trends.length > 0 && (
                      <div className="bg-white rounded-xl p-4 mb-4">
                        <p className="text-sm font-medium text-ink/70 mb-3 flex items-center gap-1.5">
                          <TrendingUp className="w-4 h-4 text-rose-400" />
                          最近4周销量趋势
                          {item.trendHint === "up" && (
                            <span className="ml-2 text-xs px-2 py-0.5 bg-purple-100 text-purple-600 rounded-full font-medium">
                              销量上升 ↑
                            </span>
                          )}
                          {item.trendHint === "down" && (
                            <span className="ml-2 text-xs px-2 py-0.5 bg-amber-100 text-amber-600 rounded-full font-medium">
                              销量下降 ↓
                            </span>
                          )}
                          {item.trendHint === "stable" && (
                            <span className="ml-2 text-xs px-2 py-0.5 bg-leaf-100 text-leaf-600 rounded-full font-medium">
                              销量稳定 →
                            </span>
                          )}
                        </p>
                        <div className="h-40">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={item.trends}
                              margin={{ top: 5, right: 5, left: -15, bottom: 0 }}
                            >
                              <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="#FCE4EC"
                              />
                              <XAxis
                                dataKey="weekLabel"
                                tick={{ fontSize: 10, fill: "#4A4A4A" }}
                                axisLine={false}
                                tickLine={false}
                              />
                              <YAxis
                                tick={{ fontSize: 10, fill: "#4A4A4A" }}
                                axisLine={false}
                                tickLine={false}
                                width={35}
                              />
                              <Tooltip
                                contentStyle={{
                                  borderRadius: "12px",
                                  border: "none",
                                  boxShadow:
                                    "0 4px 20px rgba(201,123,132,0.15)",
                                  fontSize: "12px",
                                }}
                                formatter={(
                                  value: number,
                                  name: string,
                                ) => [
                                  `${value} 枝`,
                                  name === "sales" ? "售出" : "损耗",
                                ]}
                              />
                              <Bar
                                dataKey="sales"
                                name="sales"
                                fill="#E8B4B8"
                                radius={[4, 4, 0, 0]}
                              />
                              <Bar
                                dataKey="loss"
                                name="loss"
                                fill="#F8B4B4"
                                radius={[4, 4, 0, 0]}
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="flex items-center justify-center gap-6 mt-2">
                          <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full bg-[#E8B4B8]" />
                            <span className="text-xs text-ink/60">售出</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full bg-[#F8B4B4]" />
                            <span className="text-xs text-ink/60">损耗</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {item.weeklyLoss > 0 &&
                      item.weeklyLoss / (item.weeklyUsage + item.weeklyLoss) >
                        0.2 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-xs font-medium text-amber-700">
                              损耗偏高提示
                            </p>
                            <p className="text-[11px] text-amber-600 mt-0.5">
                              建议尝试：深水醒花2小时、每日剪根换水、存放于5-8℃冷藏环境、避免阳光直射
                            </p>
                          </div>
                        </div>
                      )}

                    {item.trendHint === "up" && (
                      <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 mb-4 flex items-start gap-2">
                        <TrendingUp className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-medium text-purple-700">
                            销量上升提示
                          </p>
                          <p className="text-[11px] text-purple-600 mt-0.5">
                            最近两周销量增长明显，建议适当增加备货量，避免缺货影响销售
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="bg-white rounded-xl p-4">
                      <p className="text-sm font-medium text-ink/70 mb-3 flex items-center gap-1.5">
                        <Package className="w-4 h-4 text-rose-400" />
                        快速登记进货
                      </p>
                      <div className="flex flex-wrap gap-3 items-end">
                        <div className="flex-1 min-w-[120px]">
                          <label className="block text-xs text-ink/50 mb-1">
                            进货数量（枝）
                          </label>
                          <input
                            type="number"
                            min="1"
                            placeholder={`建议 ${item.suggestedQuantity || 0}`}
                            value={quickAddQty[item.flowerId] || ""}
                            onChange={(e) =>
                              setQuickAddQty({
                                ...quickAddQty,
                                [item.flowerId]: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 rounded-lg border border-rose-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200"
                          />
                        </div>
                        <div className="flex-1 min-w-[120px]">
                          <label className="block text-xs text-ink/50 mb-1">
                            进价（元/枝）
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder={
                              flower
                                ? `参考 ¥${flower.avgCostPrice.toFixed(2)}`
                                : "例如 3.5"
                            }
                            value={quickAddPrice[item.flowerId] || ""}
                            onChange={(e) =>
                              setQuickAddPrice({
                                ...quickAddPrice,
                                [item.flowerId]: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 rounded-lg border border-rose-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200"
                          />
                        </div>
                        <div className="flex-1 min-w-[140px]">
                          <label className="block text-xs text-ink/50 mb-1">
                            供应商（可选）
                          </label>
                          <select
                            value={quickAddSupplier[item.flowerId] || ""}
                            onChange={(e) =>
                              setQuickAddSupplier({
                                ...quickAddSupplier,
                                [item.flowerId]: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 rounded-lg border border-rose-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 bg-white"
                          >
                            <option value="">选择供应商</option>
                            {suppliers.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleQuickAdd(item.flowerId)}
                          disabled={
                            !quickAddQty[item.flowerId] ||
                            !quickAddPrice[item.flowerId] ||
                            parseInt(quickAddQty[item.flowerId]) <= 0 ||
                            parseFloat(quickAddPrice[item.flowerId]) <= 0
                          }
                        >
                          <Clock className="w-3.5 h-3.5" />
                          登记进货
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-gradient-to-br from-rose-50/80 to-leaf-50/50 rounded-2xl p-5 border border-rose-100">
        <h3 className="font-serif font-semibold text-ink flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-amber-500" />
          采购建议说明
        </h3>
        <ul className="text-sm text-ink/70 space-y-1.5">
          <li>
            •{" "}
            <span className="text-red-600 font-medium">急需补货</span>
            ：库存低于安全线或已售罄，建议尽快采购
          </li>
          <li>
            •{" "}
            <span className="text-purple-600 font-medium">销量上升</span>
            ：最近销量增长超过30%，建议适当多备货
          </li>
          <li>
            •{" "}
            <span className="text-amber-600 font-medium">建议补货</span>
            ：库存不足一周用量，建议近期补货
          </li>
          <li>
            •{" "}
            <span className="text-leaf-600 font-medium">按需补货</span>
            ：库存合理，可根据订单情况少量补货
          </li>
          <li>
            •{" "}
            <span className="text-rose-500 font-medium">减少进货</span>
            ：库存充足、损耗率高或超过保鲜期，建议少进一点
          </li>
          <li>
            • 建议进货量结合「两周用量 × 趋势系数 - 当前库存」估算，实际采购请结合保鲜期和节日情况调整
          </li>
          <li>
            • 库存可售天数超过保鲜期1.5倍时会提醒少进货，避免鲜花变质损耗
          </li>
          <li>
            • 损耗率超过20%会给出保存建议，可尝试深水醒花、冷藏、每日剪根换水等方法
          </li>
          <li>
            • 勾选花材加入订货计划，登记进货后已采购项会自动从计划中清除
          </li>
        </ul>
      </div>

      {planSummary.items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-rose-100 shadow-[0_-4px_20px_rgba(201,123,132,0.1)]">
          <div className="max-w-6xl mx-auto">
            <div
              className="flex items-center justify-between px-5 py-3 cursor-pointer hover:bg-rose-50/50 transition-colors"
              onClick={() => setIsPlanPanelOpen(!isPlanPanelOpen)}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center">
                  <ClipboardList className="w-4.5 h-4.5 text-rose-500" />
                </div>
                <div>
                  <p className="font-medium text-ink text-sm flex items-center gap-2">
                    订货计划
                    <span className="text-xs bg-rose-500 text-white px-2 py-0.5 rounded-full">
                      {planSummary.items.length} 项
                    </span>
                  </p>
                  <p className="text-xs text-ink/50">
                    预计金额 ¥{planSummary.totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isPlanPanelOpen ? (
                  <ChevronDown className="w-5 h-5 text-ink/40" />
                ) : (
                  <ChevronUp className="w-5 h-5 text-ink/40" />
                )}
              </div>
            </div>

            {isPlanPanelOpen && (
              <div className="px-5 pb-4 max-h-80 overflow-y-auto border-t border-rose-50">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 py-4">
                  {planSummary.items.map((item) => (
                    <div
                      key={item.flowerId}
                      className="bg-rose-50/50 rounded-xl p-3 flex items-center gap-3"
                    >
                      <span className="text-2xl">{item.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-ink">
                          {item.name}
                        </p>
                        <p className="text-xs text-ink/50">
                          {item.quantity}枝 × ¥{item.unitPrice.toFixed(2)} = ¥
                          {item.totalPrice.toFixed(2)}
                        </p>
                        <p className="text-[10px] text-leaf-600 mt-0.5">
                          预计可卖 {item.sellableDays >= 999 ? "∞" : item.sellableDays} 天
                        </p>
                      </div>
                      <button
                        onClick={() => clearOrderPlanItem(item.flowerId)}
                        className="p-1.5 rounded-lg text-ink/30 hover:text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-rose-100">
                  <div className="text-sm">
                    <span className="text-ink/50">共 </span>
                    <span className="font-bold text-ink">
                      {planSummary.items.reduce((sum, i) => sum + i.quantity, 0)}
                    </span>
                    <span className="text-ink/50"> 枝花材，预计 </span>
                    <span className="font-serif font-bold text-rose-500 text-lg">
                      ¥{planSummary.totalAmount.toFixed(2)}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      if (confirm("确定清空整个订货计划吗？")) {
                        clearOrderPlan();
                        setPlanQty({});
                      }
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    清空计划
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
