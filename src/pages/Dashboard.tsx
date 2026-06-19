import { useNavigate } from "react-router-dom";
import { Plus, Flower2, Trash2, BarChart3, TrendingUp, AlertTriangle, Lightbulb, Coins } from "lucide-react";
import { useFlowerStore } from "@/store/useFlowerStore";
import Button from "@/components/Button";

export default function Dashboard() {
  const navigate = useNavigate();
  const { flowers, getTodayStats, getTotalInventoryValue, getInsights } = useFlowerStore();
  const stats = getTodayStats();
  const totalValue = getTotalInventoryValue();
  const insights = getInsights();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-ink">今日概览</h1>
          <p className="text-sm text-ink/60 mt-1">
            {new Date().toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric", weekday: "long" })}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm bg-leaf-50 text-leaf-600 px-4 py-2 rounded-full">
          <Coins className="w-4 h-4" />
          <span>库存总价值 ¥{totalValue.toFixed(2)}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 card-shadow">
          <div className="flex items-center gap-2 text-rose-500 mb-2">
            <Flower2 className="w-4 h-4" />
            <span className="text-xs font-medium">今日花束</span>
          </div>
          <p className="font-serif text-3xl font-bold text-ink">{stats.salesCount}</p>
          <p className="text-xs text-ink/50 mt-1">束已制作</p>
        </div>
        <div className="bg-white rounded-2xl p-5 card-shadow">
          <div className="flex items-center gap-2 text-red-400 mb-2">
            <Trash2 className="w-4 h-4" />
            <span className="text-xs font-medium">今日损耗</span>
          </div>
          <p className="font-serif text-3xl font-bold text-ink">¥{stats.lossAmount.toFixed(2)}</p>
          <p className="text-xs text-ink/50 mt-1">损耗金额</p>
        </div>
        <div className="bg-white rounded-2xl p-5 card-shadow">
          <div className="flex items-center gap-2 text-leaf-500 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-medium">花材种类</span>
          </div>
          <p className="font-serif text-3xl font-bold text-ink">{flowers.length}</p>
          <p className="text-xs text-ink/50 mt-1">种在售花材</p>
        </div>
        <div className="bg-white rounded-2xl p-5 card-shadow">
          <div className="flex items-center gap-2 text-amber-500 mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs font-medium">低库存</span>
          </div>
          <p className="font-serif text-3xl font-bold text-ink">
            {flowers.filter(f => f.currentStock <= f.lowStockThreshold).length}
          </p>
          <p className="text-xs text-ink/50 mt-1">种花材需关注</p>
        </div>
      </div>

      <div>
        <h2 className="font-serif text-lg font-semibold text-ink mb-3">花材库存</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {flowers.map((flower, idx) => {
            const isLow = flower.currentStock <= flower.lowStockThreshold;
            return (
              <div
                key={flower.id}
                style={{ animationDelay: `${idx * 60}ms` }}
                className={`relative bg-white rounded-2xl p-5 card-shadow card-hover animate-fade-in-up ${
                  isLow ? "ring-2 ring-red-300 ring-opacity-75" : ""
                }`}
              >
                {isLow && flower.currentStock > 0 && (
                  <div className="absolute -top-2 -right-2 bg-red-400 text-white text-xs px-2 py-0.5 rounded-full shadow-md animate-pulse-slow">
                    库存低
                  </div>
                )}
                {flower.currentStock === 0 && (
                  <div className="absolute -top-2 -right-2 bg-ink text-white text-xs px-2 py-0.5 rounded-full shadow-md">
                    已售罄
                  </div>
                )}
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-3"
                  style={{ backgroundColor: flower.color }}
                >
                  {flower.emoji}
                </div>
                <p className="font-medium text-ink">{flower.name}</p>
                <p className="font-serif text-2xl font-bold text-ink mt-1">
                  {flower.currentStock}
                  <span className="text-sm font-normal text-ink/50 ml-1">枝</span>
                </p>
                <p className="text-xs text-ink/50 mt-1">
                  进价 ¥{flower.avgCostPrice.toFixed(2)}/枝
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Button
          size="lg"
          onClick={() => navigate("/inventory")}
          className="flex-col !py-5 h-auto"
        >
          <Plus className="w-6 h-6" />
          <div className="text-left">
            <p className="font-medium">登记进货</p>
            <p className="text-xs opacity-80">补充花材库存</p>
          </div>
        </Button>
        <Button
          size="lg"
          variant="success"
          onClick={() => navigate("/bouquet")}
          className="flex-col !py-5 h-auto"
        >
          <Flower2 className="w-6 h-6" />
          <div className="text-left">
            <p className="font-medium">制作花束</p>
            <p className="text-xs opacity-80">核算成本利润</p>
          </div>
        </Button>
        <Button
          size="lg"
          variant="secondary"
          onClick={() => navigate("/loss")}
          className="flex-col !py-5 h-auto"
        >
          <Trash2 className="w-6 h-6" />
          <div className="text-left">
            <p className="font-medium">记录损耗</p>
            <p className="text-xs opacity-80">今日蔫掉的花</p>
          </div>
        </Button>
      </div>

      <div className="bg-white rounded-2xl p-5 card-shadow">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          <h2 className="font-serif text-lg font-semibold text-ink">智能提醒</h2>
        </div>
        <ul className="space-y-2">
          {insights.map((insight, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2 text-sm text-ink/80 py-1.5 px-3 rounded-xl bg-rose-50/50"
            >
              <span className="text-rose-400 mt-0.5">•</span>
              {insight}
            </li>
          ))}
        </ul>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/reports")}
          className="mt-4 w-full justify-center"
        >
          <BarChart3 className="w-4 h-4" />
          查看详细报表
        </Button>
      </div>
    </div>
  );
}
