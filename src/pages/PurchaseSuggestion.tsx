import { useMemo, useState } from "react";
import { ShoppingCart, AlertTriangle, TrendingDown, CheckCircle, Clock, ChevronDown, ChevronUp, Package, Sparkles } from "lucide-react";
import { useFlowerStore } from "@/store/useFlowerStore";
import type { PurchaseSuggestionLevel } from "@/types";
import Button from "@/components/Button";

const levelConfig: Record<PurchaseSuggestionLevel, { label: string; color: string; bg: string; border: string; icon: typeof AlertTriangle }> = {
  urgent: { label: "急需补货", color: "text-red-600", bg: "bg-red-50", border: "border-red-200", icon: AlertTriangle },
  suggest: { label: "建议补货", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", icon: ShoppingCart },
  hold: { label: "按需补货", color: "text-leaf-600", bg: "bg-leaf-50", border: "border-leaf-200", icon: CheckCircle },
  reduce: { label: "减少进货", color: "text-rose-500", bg: "bg-rose-50", border: "border-rose-200", icon: TrendingDown },
};

export default function PurchaseSuggestion() {
  const { getPurchaseSuggestions, flowers, addPurchase, getTotalInventoryValue } = useFlowerStore();
  const suggestions = getPurchaseSuggestions();
  const [expandedFlowerId, setExpandedFlowerId] = useState<string | null>(null);
  const [quickAddQty, setQuickAddQty] = useState<Record<string, string>>({});
  const [quickAddPrice, setQuickAddPrice] = useState<Record<string, string>>({});

  const totalSuggestedValue = useMemo(() => {
    return suggestions.reduce((sum, s) => {
      const flower = flowers.find(f => f.id === s.flowerId);
      return sum + s.suggestedQuantity * (flower?.avgCostPrice || 0);
    }, 0);
  }, [suggestions, flowers]);

  const totalValue = getTotalInventoryValue();
  const urgentCount = suggestions.filter(s => s.level === "urgent").length;

  const toggleExpand = (flowerId: string) => {
    setExpandedFlowerId(expandedFlowerId === flowerId ? null : flowerId);
  };

  const handleQuickAdd = (flowerId: string) => {
    const qty = parseInt(quickAddQty[flowerId] || "0");
    const price = parseFloat(quickAddPrice[flowerId] || "0");
    if (!qty || qty <= 0 || !price || price <= 0) return;
    addPurchase(flowerId, qty, price);
    setQuickAddQty({ ...quickAddQty, [flowerId]: "" });
    setQuickAddPrice({ ...quickAddPrice, [flowerId]: "" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-ink flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-rose-500" />
            采购建议
          </h1>
          <p className="text-sm text-ink/60 mt-1">根据本周销量、损耗和当前库存，智能推荐进货量</p>
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
              <span className="text-red-600 font-bold">{urgentCount}</span> 种花材需要紧急补货
            </p>
            <p className="text-xs text-red-500 mt-0.5">库存已经低于安全线，建议尽快安排采购</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {(["urgent", "suggest", "hold", "reduce"] as PurchaseSuggestionLevel[]).map(level => {
          const count = suggestions.filter(s => s.level === level).length;
          const config = levelConfig[level];
          const Icon = config.icon;
          return (
            <div key={level} className={`${config.bg} ${config.border} border rounded-2xl p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${config.color}`} />
                <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
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
          <span className="text-xs text-ink/50">按优先级排序</span>
        </div>

        <div className="divide-y divide-rose-50">
          {suggestions.map((item) => {
            const config = levelConfig[item.level];
            const isExpanded = expandedFlowerId === item.flowerId;
            const flower = flowers.find(f => f.id === item.flowerId);
            const Icon = config.icon;

            return (
              <div key={item.flowerId}>
                <div
                  className="flex items-center gap-4 px-5 py-4 hover:bg-rose-50/30 transition-colors cursor-pointer"
                  onClick={() => toggleExpand(item.flowerId)}
                >
                  <button className="p-1 rounded-lg hover:bg-rose-100 transition-colors text-ink/50">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
                    style={{ backgroundColor: flower?.color || "#eee" }}
                  >
                    {item.emoji}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-ink">{item.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${config.bg} ${config.color} font-medium`}>
                        {config.label}
                      </span>
                    </div>
                    <p className="text-xs text-ink/50 mt-0.5">{item.reason}</p>
                  </div>

                  <div className="text-right hidden sm:block">
                    <p className="text-sm text-ink/50">当前库存</p>
                    <p className="font-serif text-lg font-bold text-ink">{item.currentStock} 枝</p>
                  </div>

                  <div className="text-right hidden sm:block">
                    <p className="text-sm text-ink/50">本周消耗</p>
                    <p className="font-serif text-lg font-bold text-rose-500">{item.weeklyUsage + item.weeklyLoss} 枝</p>
                  </div>

                  <div className={`text-right min-w-[100px] ${
                    item.suggestedQuantity > 0 ? "" : "opacity-50"
                  }`}>
                    <p className="text-sm text-ink/50">建议进货</p>
                    <p className={`font-serif text-xl font-bold ${
                      item.level === "urgent" ? "text-red-500" :
                      item.level === "suggest" ? "text-amber-500" :
                      item.level === "reduce" ? "text-rose-400" :
                      "text-leaf-600"
                    }`}>
                      {item.suggestedQuantity > 0 ? `${item.suggestedQuantity} 枝` : "暂不进货"}
                    </p>
                  </div>
                </div>

                {isExpanded && (
                  <div className="bg-rose-50/30 px-5 py-4 pl-16">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                      <div className="bg-white rounded-xl p-3">
                        <p className="text-xs text-ink/50 mb-1">本周售出</p>
                        <p className="font-serif text-lg font-bold text-leaf-600">{item.weeklyUsage} 枝</p>
                      </div>
                      <div className="bg-white rounded-xl p-3">
                        <p className="text-xs text-ink/50 mb-1">本周损耗</p>
                        <p className="font-serif text-lg font-bold text-red-500">{item.weeklyLoss} 枝</p>
                      </div>
                      <div className="bg-white rounded-xl p-3">
                        <p className="text-xs text-ink/50 mb-1">损耗率</p>
                        <p className="font-serif text-lg font-bold text-amber-500">
                          {item.weeklyUsage + item.weeklyLoss > 0
                            ? ((item.weeklyLoss / (item.weeklyUsage + item.weeklyLoss)) * 100).toFixed(0)
                            : 0}%
                        </p>
                      </div>
                      <div className="bg-white rounded-xl p-3">
                        <p className="text-xs text-ink/50 mb-1">安全库存</p>
                        <p className="font-serif text-lg font-bold text-ink">{flower?.lowStockThreshold || 0} 枝</p>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl p-4">
                      <p className="text-sm font-medium text-ink/70 mb-3 flex items-center gap-1.5">
                        <Package className="w-4 h-4 text-rose-400" />
                        快速登记进货
                      </p>
                      <div className="flex flex-wrap gap-3 items-end">
                        <div className="flex-1 min-w-[120px]">
                          <label className="block text-xs text-ink/50 mb-1">进货数量（枝）</label>
                          <input
                            type="number"
                            min="1"
                            placeholder={`建议 ${item.suggestedQuantity || 0}`}
                            value={quickAddQty[item.flowerId] || ""}
                            onChange={(e) => setQuickAddQty({ ...quickAddQty, [item.flowerId]: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-rose-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200"
                          />
                        </div>
                        <div className="flex-1 min-w-[120px]">
                          <label className="block text-xs text-ink/50 mb-1">进价（元/枝）</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder={flower ? `参考 ¥${flower.avgCostPrice.toFixed(2)}` : "例如 3.5"}
                            value={quickAddPrice[item.flowerId] || ""}
                            onChange={(e) => setQuickAddPrice({ ...quickAddPrice, [item.flowerId]: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-rose-100 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200"
                          />
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
          <li>• <span className="text-red-600 font-medium">急需补货</span>：库存低于安全线或已售罄，建议尽快采购</li>
          <li>• <span className="text-amber-600 font-medium">建议补货</span>：库存不足一周用量，建议近期补货</li>
          <li>• <span className="text-leaf-600 font-medium">按需补货</span>：库存合理，可根据订单情况少量补货</li>
          <li>• <span className="text-rose-500 font-medium">减少进货</span>：库存充足或损耗率高，建议少进一点</li>
          <li>• 建议进货量按「两周用量 - 当前库存」估算，实际采购请结合保鲜期和节日情况调整</li>
        </ul>
      </div>
    </div>
  );
}
