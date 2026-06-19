import { useState, useMemo } from "react";
import { BarChart3, TrendingUp, Lightbulb, PieChart as PieIcon, Calendar, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useFlowerStore } from "@/store/useFlowerStore";
import type { ReportRange } from "@/types";

const COLORS = ["#E8B4B8", "#A8CC95", "#F5D5CB", "#CDE0C1", "#D89CA0"];

export default function Reports() {
  const { getSalesData, getLossData, getProfitSummary, getInsights, flowers } = useFlowerStore();
  const [range, setRange] = useState<ReportRange>("week");

  const salesData = getSalesData(range);
  const lossData = getLossData(range);
  const profit = getProfitSummary(range);
  const insights = getInsights();

  const totalSalesQty = salesData.reduce((sum, d) => sum + d.value, 0);
  const totalLossAmount = lossData.reduce((sum, d) => sum + d.value, 0);

  const lossPieData = lossData.filter(d => d.value > 0);

  const topLossFlower = useMemo(() => {
    const weeklyLoss = getLossData("week");
    return weeklyLoss[0]?.value > 0 ? weeklyLoss[0] : null;
  }, [getLossData]);

  const rangeLabel = range === "week" ? "本周" : "本月";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-ink flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-rose-500" />
            数据报表
          </h1>
          <p className="text-sm text-ink/60 mt-1">销量排行、损耗统计，帮你优化采购决策</p>
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

      {topLossFlower && range === "week" && (
        <div className="bg-gradient-to-r from-amber-50 to-red-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-ink">
              {rangeLabel}损耗最多的花材提醒
            </p>
            <p className="text-sm text-amber-700 mt-0.5">
              {topLossFlower.emoji} <span className="font-semibold">{topLossFlower.name}</span>
              共损耗 ¥{topLossFlower.value.toFixed(2)}，下周建议适当减少进货量
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 card-shadow">
          <div className="flex items-center gap-2 text-rose-500 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-medium">{rangeLabel}营业额</span>
          </div>
          <p className="font-serif text-3xl font-bold text-ink">¥{profit.revenue.toFixed(2)}</p>
          <p className="text-xs text-ink/50 mt-1">{profit.salesCount}笔订单</p>
        </div>
        <div className="bg-white rounded-2xl p-5 card-shadow">
          <div className="flex items-center gap-2 text-leaf-500 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-medium">{rangeLabel}利润</span>
          </div>
          <p className="font-serif text-3xl font-bold text-ink">¥{profit.profit.toFixed(2)}</p>
          <p className="text-xs text-ink/50 mt-1">
            利润率 {profit.revenue > 0 ? ((profit.profit / profit.revenue) * 100).toFixed(0) : 0}%
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 card-shadow">
          <div className="flex items-center gap-2 text-red-400 mb-2">
            <PieIcon className="w-4 h-4" />
            <span className="text-xs font-medium">{rangeLabel}损耗</span>
          </div>
          <p className="font-serif text-3xl font-bold text-ink">¥{totalLossAmount.toFixed(2)}</p>
          <p className="text-xs text-ink/50 mt-1">
            占营业额 {profit.revenue > 0 ? ((totalLossAmount / profit.revenue) * 100).toFixed(1) : 0}%
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 card-shadow">
          <div className="flex items-center gap-2 text-leaf-500 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-medium">{rangeLabel}用花量</span>
          </div>
          <p className="font-serif text-3xl font-bold text-ink">{totalSalesQty}</p>
          <p className="text-xs text-ink/50 mt-1">枝花材已售出</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl card-shadow p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-rose-500" />
            <h2 className="font-serif text-lg font-semibold text-ink">{rangeLabel}花材销量排行</h2>
          </div>
          {totalSalesQty === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="text-4xl mb-3">📊</div>
              <p className="text-sm text-ink/50">{rangeLabel}还没有销售数据</p>
              <p className="text-xs text-ink/40 mt-1">制作花束后这里会显示销量统计</p>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: "#4A4A4A" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#4A4A4A" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 20px rgba(201,123,132,0.15)",
                      fontSize: "13px",
                    }}
                    formatter={(value: number, _name: string, props: { payload: { emoji: string } }) => [
                      `${value} 枝`,
                      `${props.payload.emoji} 用量`,
                    ]}
                  />
                  <Bar
                    dataKey="value"
                    radius={[8, 8, 0, 0]}
                    fill="#E8B4B8"
                  >
                    {salesData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="mt-4 space-y-1.5">
            {salesData.slice(0, 3).map((d, i) => d.value > 0 && (
              <div key={d.name} className="flex items-center gap-2 text-sm">
                <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </span>
                <span>{d.emoji} {d.name}</span>
                <span className="text-ink/50 ml-auto">{d.value} 枝</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl card-shadow p-5">
          <div className="flex items-center gap-2 mb-4">
            <PieIcon className="w-5 h-5 text-rose-500" />
            <h2 className="font-serif text-lg font-semibold text-ink">{rangeLabel}损耗金额占比</h2>
          </div>
          {lossPieData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="text-4xl mb-3">🌸</div>
              <p className="text-sm text-ink/50">{rangeLabel}暂无损耗</p>
              <p className="text-xs text-ink/40 mt-1">太棒了，继续保持！</p>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={lossPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {lossPieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 20px rgba(201,123,132,0.15)",
                      fontSize: "13px",
                    }}
                    formatter={(value: number, _name: string, props: { payload: { name: string; emoji: string } }) => [
                      `¥${value.toFixed(2)}`,
                      `${props.payload.emoji} ${props.payload.name}损耗`,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-3">
            {lossData.map((d, i) => d.value > 0 && (
              <div key={d.name} className="flex items-center gap-1.5 text-sm">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span>{d.emoji} {d.name}</span>
                <span className="text-ink/50 text-xs">¥{d.value.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl card-shadow p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <h2 className="font-serif text-lg font-semibold text-ink">{rangeLabel}损耗排行榜</h2>
        </div>
        {totalLossAmount === 0 ? (
          <div className="text-center py-8">
            <div className="text-3xl mb-2">🎉</div>
            <p className="text-sm text-ink/50">{rangeLabel}没有损耗记录</p>
          </div>
        ) : (
          <div className="space-y-2">
            {lossData.filter(d => d.value > 0).map((d, i) => (
              <div
                key={d.name}
                className={`flex items-center gap-3 p-3 rounded-xl ${
                  i === 0 ? "bg-gradient-to-r from-red-50 to-amber-50 border border-red-100" : "bg-rose-50/30"
                }`}
              >
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  i === 0 ? "bg-red-400 text-white" : i === 1 ? "bg-amber-400 text-white" : i === 2 ? "bg-amber-300 text-white" : "bg-rose-200 text-rose-600"
                }`}>
                  {i + 1}
                </span>
                <div className="text-2xl">{d.emoji}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-ink">{d.name}</p>
                  <p className="text-xs text-ink/50">{d.totalAmount} 枝</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-red-500">¥{d.value.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl card-shadow p-5">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          <h2 className="font-serif text-lg font-semibold text-ink">智能分析建议</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {insights.map((insight, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-4 rounded-2xl bg-gradient-to-br from-rose-50/80 to-amber-50/50"
            >
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                <span className="text-lg">
                  {idx === 0 ? "🔥" : idx === 1 ? "⚠️" : idx === 2 ? "📦" : "💡"}
                </span>
              </div>
              <p className="text-sm text-ink/80 leading-relaxed">{insight}</p>
            </div>
          ))}
        </div>

        {salesData[0]?.value > 0 && (
          <div className="mt-5 p-4 rounded-2xl bg-leaf-50 border border-leaf-100">
            <p className="text-sm text-leaf-700">
              <span className="font-semibold">采购建议：</span>
              根据数据分析，{salesData[0].emoji}{salesData[0].name}销量最高，
              建议保持充足库存；
              {lossData[0]?.value > 0 && (
                <>
                  {lossData[0].emoji}
                  {lossData[0].name}损耗较多（¥{lossData[0].value.toFixed(2)}），
                  可以适当减少进货量或优化保存方式。
                </>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
