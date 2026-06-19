import { useMemo } from "react";
import { BarChart3, TrendingUp, Lightbulb, PieChart as PieIcon } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useFlowerStore } from "@/store/useFlowerStore";

const COLORS = ["#E8B4B8", "#A8CC95", "#F5D5CB", "#CDE0C1", "#D89CA0"];

export default function Reports() {
  const { getWeeklySalesData, getMonthlyLossData, getInsights, sales, losses } = useFlowerStore();
  const weeklyData = getWeeklySalesData();
  const monthlyLoss = getMonthlyLossData();
  const insights = getInsights();

  const totalWeeklySales = weeklyData.reduce((sum, d) => sum + d.value, 0);
  const totalMonthlyLoss = monthlyLoss.reduce((sum, d) => sum + d.value, 0);

  const totalRevenue = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    const weekStart = startOfWeek.toISOString().split("T")[0];
    return sales
      .filter(s => s.date >= weekStart)
      .reduce((sum, s) => sum + s.sellPrice, 0);
  }, [sales]);

  const totalProfit = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    const weekStart = startOfWeek.toISOString().split("T")[0];
    return sales
      .filter(s => s.date >= weekStart)
      .reduce((sum, s) => sum + (s.sellPrice - s.costPrice), 0);
  }, [sales]);

  const pieData = monthlyLoss.filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-ink flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-rose-500" />
          数据报表
        </h1>
        <p className="text-sm text-ink/60 mt-1">周销售排行、月损耗统计，帮你优化采购决策</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 card-shadow">
          <div className="flex items-center gap-2 text-rose-500 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-medium">本周营业额</span>
          </div>
          <p className="font-serif text-3xl font-bold text-ink">¥{totalRevenue.toFixed(2)}</p>
          <p className="text-xs text-ink/50 mt-1">{sales.length}笔订单</p>
        </div>
        <div className="bg-white rounded-2xl p-5 card-shadow">
          <div className="flex items-center gap-2 text-leaf-500 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-medium">本周利润</span>
          </div>
          <p className="font-serif text-3xl font-bold text-ink">¥{totalProfit.toFixed(2)}</p>
          <p className="text-xs text-ink/50 mt-1">
            利润率 {totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(0) : 0}%
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 card-shadow">
          <div className="flex items-center gap-2 text-amber-500 mb-2">
            <PieIcon className="w-4 h-4" />
            <span className="text-xs font-medium">本月损耗</span>
          </div>
          <p className="font-serif text-3xl font-bold text-ink">¥{totalMonthlyLoss.toFixed(2)}</p>
          <p className="text-xs text-ink/50 mt-1">{losses.length}次记录</p>
        </div>
        <div className="bg-white rounded-2xl p-5 card-shadow">
          <div className="flex items-center gap-2 text-leaf-500 mb-2">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-medium">本周用花量</span>
          </div>
          <p className="font-serif text-3xl font-bold text-ink">{totalWeeklySales}</p>
          <p className="text-xs text-ink/50 mt-1">枝花材已售出</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl card-shadow p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-rose-500" />
            <h2 className="font-serif text-lg font-semibold text-ink">本周花材销量排行</h2>
          </div>
          {totalWeeklySales === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="text-4xl mb-3">📊</div>
              <p className="text-sm text-ink/50">本周还没有销售数据</p>
              <p className="text-xs text-ink/40 mt-1">制作花束后这里会显示销量统计</p>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                    {weeklyData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="mt-4 space-y-1.5">
            {weeklyData.slice(0, 3).map((d, i) => d.value > 0 && (
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
            <h2 className="font-serif text-lg font-semibold text-ink">本月损耗金额占比</h2>
          </div>
          {pieData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="text-4xl mb-3">🌸</div>
              <p className="text-sm text-ink/50">本月暂无损耗</p>
              <p className="text-xs text-ink/40 mt-1">太棒了，继续保持！</p>
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
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
            {monthlyLoss.map((d, i) => d.value > 0 && (
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

        {weeklyData[0]?.value > 0 && (
          <div className="mt-5 p-4 rounded-2xl bg-leaf-50 border border-leaf-100">
            <p className="text-sm text-leaf-700">
              <span className="font-semibold">采购建议：</span>
              根据数据分析，{weeklyData[0].emoji}{weeklyData[0].name}销量最高，
              建议保持充足库存；
              {monthlyLoss.sort((a, b) => b.value - a.value)[0]?.value > 0 && (
                <>
                  {monthlyLoss.sort((a, b) => b.value - a.value)[0].emoji}
                  {monthlyLoss.sort((a, b) => b.value - a.value)[0].name}损耗较多，
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
