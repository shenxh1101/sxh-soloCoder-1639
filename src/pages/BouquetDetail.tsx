import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Flower2,
  ArrowLeft,
  Calendar,
  TrendingUp,
  TrendingDown,
  Coins,
  BarChart2,
  Package,
  History,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useFlowerStore } from "@/store/useFlowerStore";
import type { ReportRange, Sale } from "@/types";

export default function BouquetDetail() {
  const { bouquetId } = useParams<{ bouquetId: string }>();
  const navigate = useNavigate();
  const { getBouquetDetail, getBouquetSalesStats, flowers } = useFlowerStore();

  const [range, setRange] = useState<ReportRange>("month");

  const detail = useMemo(() => {
    if (!bouquetId) return null;
    return getBouquetDetail(bouquetId, range);
  }, [bouquetId, range, getBouquetDetail]);

  const allStats = useMemo(() => {
    return getBouquetSalesStats(range);
  }, [range, getBouquetSalesStats]);

  const bouquetRank = useMemo(() => {
    if (!bouquetId) return 0;
    return allStats.findIndex((s) => s.bouquetTemplateId === bouquetId) + 1;
  }, [bouquetId, allStats]);

  const [expandedSaleId, setExpandedSaleId] = useState<string | null>(null);

  const getFlowerEmoji = (flowerId: string) =>
    flowers.find((f) => f.id === flowerId)?.emoji || "🌸";
  const getFlowerName = (flowerId: string) =>
    flowers.find((f) => f.id === flowerId)?.name || flowerId;

  const priceChartData = useMemo(() => {
    if (!detail) return [];
    return detail.pricePoints.map((p) => ({
      ...p,
      dateLabel: p.date.slice(5),
    }));
  }, [detail]);

  if (!detail || !detail.template) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate("/bouquet")}
          className="flex items-center gap-2 text-ink/60 hover:text-rose-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回花束制作
        </button>
        <div className="text-center py-16">
          <div className="text-5xl mb-4">💐</div>
          <p className="text-ink/50">未找到该花束样式</p>
        </div>
      </div>
    );
  }

  const getProfitColor = (rate: number) => {
    if (rate >= 50) return "text-leaf-600";
    if (rate >= 30) return "text-ink";
    if (rate >= 0) return "text-amber-500";
    return "text-red-500";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/bouquet")}
            className="w-10 h-10 rounded-xl bg-white card-shadow flex items-center justify-center text-ink/60 hover:text-rose-500 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-serif text-2xl font-bold text-ink flex items-center gap-2">
              <span className="text-3xl">{detail.template.image}</span>
              {detail.template.name}
            </h1>
            <p className="text-sm text-ink/60 mt-1">
              {detail.template.description}
            </p>
          </div>
        </div>
        <div className="inline-flex rounded-full bg-rose-50 p-1">
          <button
            onClick={() => setRange("week")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              range === "week"
                ? "bg-rose-500 text-white shadow-md"
                : "text-ink/60 hover:text-ink"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            本周
          </button>
          <button
            onClick={() => setRange("month")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              range === "month"
                ? "bg-rose-500 text-white shadow-md"
                : "text-ink/60 hover:text-ink"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            本月
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 card-shadow">
          <div className="flex items-center gap-2 text-rose-500 mb-2">
            <BarChart2 className="w-4 h-4" />
            <span className="text-xs font-medium">销量排名</span>
          </div>
          <p className="font-serif text-3xl font-bold text-ink">
            {bouquetRank > 0 ? `第 ${bouquetRank} 名` : "暂无"}
          </p>
          <p className="text-xs text-ink/50 mt-1">
            共 {allStats.length} 款花束参与排名
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 card-shadow">
          <div className="flex items-center gap-2 text-leaf-500 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-medium">总销量</span>
          </div>
          <p className="font-serif text-3xl font-bold text-ink">
            {detail.totalSales} 束
          </p>
          <p className="text-xs text-ink/50 mt-1">总营业额 ¥{detail.totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 card-shadow">
          <div className="flex items-center gap-2 text-rose-400 mb-2">
            <Coins className="w-4 h-4" />
            <span className="text-xs font-medium">平均利润</span>
          </div>
          <p className={`font-serif text-3xl font-bold ${getProfitColor(detail.avgProfitRate)}`}>
            ¥{detail.avgProfit.toFixed(2)}
          </p>
          <p className="text-xs text-ink/50 mt-1">利润率 {detail.avgProfitRate}%</p>
        </div>
        <div className="bg-white rounded-2xl p-5 card-shadow">
          <div className="flex items-center gap-2 text-amber-500 mb-2">
            <Package className="w-4 h-4" />
            <span className="text-xs font-medium">平均成本</span>
          </div>
          <p className="font-serif text-3xl font-bold text-ink">
            ¥{detail.avgCost.toFixed(2)}
          </p>
          <p className="text-xs text-ink/50 mt-1">平均售价 ¥{detail.avgSellPrice.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-ink">配方快照说明</p>
          <p className="text-xs text-amber-700 mt-0.5">
            每笔销售记录都会保存当时的配方快照，后续修改模板不会影响历史订单的成本和利润核算
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl card-shadow p-5">
          <h3 className="font-serif text-lg font-semibold text-ink mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-rose-500" />
            售价 & 利润波动
          </h3>
          {priceChartData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="text-4xl mb-3">📈</div>
              <p className="text-sm text-ink/50">暂无销售数据</p>
            </div>
          ) : (
            <>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={priceChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#FCE4EC" />
                    <XAxis
                      dataKey="dateLabel"
                      tick={{ fontSize: 11, fill: "#4A4A4A" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#4A4A4A" }}
                      axisLine={false}
                      tickLine={false}
                      width={50}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 4px 20px rgba(201,123,132,0.15)",
                        fontSize: "12px",
                      }}
                      formatter={(value: number, name: string) => [
                        `¥${value.toFixed(2)}`,
                        name === "sellPrice" ? "售价" : name === "profit" ? "利润" : "成本",
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="sellPrice"
                      stroke="#E8B4B8"
                      strokeWidth={2}
                      dot={{ fill: "#E8B4B8", r: 4 }}
                      name="sellPrice"
                    />
                    <Line
                      type="monotone"
                      dataKey="costPrice"
                      stroke="#A8CC95"
                      strokeWidth={2}
                      dot={{ fill: "#A8CC95", r: 4 }}
                      name="costPrice"
                    />
                    <Line
                      type="monotone"
                      dataKey="profit"
                      stroke="#D89CA0"
                      strokeWidth={2}
                      dot={{ fill: "#D89CA0", r: 4 }}
                      name="profit"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#E8B4B8]" />
                  <span className="text-xs text-ink/60">售价</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#A8CC95]" />
                  <span className="text-xs text-ink/60">成本</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#D89CA0]" />
                  <span className="text-xs text-ink/60">利润</span>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="bg-white rounded-2xl card-shadow p-5">
          <h3 className="font-serif text-lg font-semibold text-ink mb-4 flex items-center gap-2">
            <Flower2 className="w-5 h-5 text-rose-500" />
            主要用花花材
          </h3>
          {detail.topBatchFlowers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="text-4xl mb-3">🌸</div>
              <p className="text-sm text-ink/50">暂无数据</p>
            </div>
          ) : (
            <div className="space-y-3">
              {detail.topBatchFlowers.map((item, i) => (
                <div
                  key={item.flowerId}
                  className="flex items-center gap-3 p-3 rounded-xl bg-rose-50/30"
                >
                  <span className="w-7 h-7 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </span>
                  <span className="text-2xl">{item.emoji}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-ink">{item.name}</p>
                    <p className="text-xs text-ink/50">共用 {item.totalQty} 枝</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-ink">¥{item.avgCost.toFixed(2)}</p>
                    <p className="text-xs text-ink/50">平均进价</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl card-shadow p-5">
        <h3 className="font-serif text-lg font-semibold text-ink mb-4 flex items-center gap-2">
          <History className="w-5 h-5 text-rose-500" />
          销售明细（点击展开查看批次扣减）
        </h3>
        {detail.recentSales.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">💐</div>
            <p className="text-sm text-ink/50">暂无销售记录</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {detail.recentSales.map((sale: Sale) => {
              const isExpanded = expandedSaleId === sale.id;
              const profit = sale.sellPrice - sale.costPrice;
              const profitRate = sale.sellPrice > 0 ? (profit / sale.sellPrice) * 100 : 0;
              return (
                <div
                  key={sale.id}
                  className="rounded-xl border border-rose-100 overflow-hidden"
                >
                  <div
                    onClick={() => setExpandedSaleId(isExpanded ? null : sale.id)}
                    className="flex items-center gap-3 p-3 hover:bg-rose-50/30 cursor-pointer transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-ink/40 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-ink/40 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink">{sale.date}</p>
                      {sale.recipeSnapshot && (
                        <p className="text-xs text-ink/40 truncate">
                          配方快照：
                          {sale.recipeSnapshot.flowers
                            .map((f) => `${getFlowerEmoji(f.flowerId)}×${f.quantity}`)
                            .join(" ")}
                        </p>
                      )}
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-sm text-ink/50">成本</p>
                      <p className="text-sm font-medium text-ink">¥{sale.costPrice.toFixed(2)}</p>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-sm text-ink/50">售价</p>
                      <p className="text-sm font-medium text-rose-500">¥{sale.sellPrice.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-ink/50">利润</p>
                      <p className={`text-sm font-bold ${getProfitColor(profitRate)}`}>
                        ¥{profit.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="bg-rose-50/30 p-3 pt-0 border-t border-rose-100">
                      <p className="text-xs font-medium text-ink/60 pt-2 mb-2">
                        批次扣减明细：
                      </p>
                      <div className="space-y-2">
                        {sale.batchDeductions.map((bd) => (
                          <div
                            key={bd.flowerId}
                            className="bg-white rounded-lg p-2.5"
                          >
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-lg">
                                {getFlowerEmoji(bd.flowerId)}
                              </span>
                              <span className="text-sm font-medium text-ink">
                                {getFlowerName(bd.flowerId)}
                              </span>
                              <span className="text-xs text-ink/50 ml-auto">
                                共 {bd.deductions.reduce((s, d) => s + d.quantity, 0)} 枝
                              </span>
                            </div>
                            <div className="space-y-1 pl-6">
                              {bd.deductions.map((d, i) => (
                                <div
                                  key={i}
                                  className="flex items-center justify-between text-xs"
                                >
                                  <span className="text-ink/50">
                                    批次 {d.batchId.slice(-6)} · ¥{d.unitCost.toFixed(2)}/枝
                                  </span>
                                  <span className="text-ink/70">扣 {d.quantity} 枝</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      {sale.recipeSnapshot && (
                        <div className="mt-3 bg-amber-50 rounded-lg p-2.5 border border-amber-100">
                          <p className="text-[11px] font-medium text-amber-700 mb-1">
                            📸 当时配方快照
                          </p>
                          <div className="grid grid-cols-2 gap-1 text-[11px]">
                            <div>
                              <span className="text-ink/50">预估成本：</span>
                              <span className="text-ink">¥{sale.recipeSnapshot.estimatedCost.toFixed(2)}</span>
                            </div>
                            <div>
                              <span className="text-ink/50">建议售价：</span>
                              <span className="text-ink">¥{sale.recipeSnapshot.suggestedPrice.toFixed(2)}</span>
                            </div>
                          </div>
                          <p className="text-[11px] text-ink/50 mt-1">
                            配方：
                            {sale.recipeSnapshot.flowers
                              .map((f) => `${getFlowerName(f.flowerId)}×${f.quantity}`)
                              .join("、")}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
