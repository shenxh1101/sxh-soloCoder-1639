import { useState } from "react";
import { Trash2, History, Plus, Calendar } from "lucide-react";
import { useFlowerStore } from "@/store/useFlowerStore";
import Button from "@/components/Button";

export default function LossRecord() {
  const { flowers, losses, addLoss } = useFlowerStore();
  const [flowerId, setFlowerId] = useState(flowers[0]?.id || "");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const getFlowerName = (id: string) => flowers.find(f => f.id === id)?.name || id;
  const getFlowerEmoji = (id: string) => flowers.find(f => f.id === id)?.emoji || "🌸";
  const getFlowerColor = (id: string) => flowers.find(f => f.id === id)?.color || "#eee";

  const today = new Date().toISOString().split("T")[0];
  const todayLosses = losses.filter(l => l.date === today);
  const todayLossAmount = todayLosses.reduce((sum, l) => sum + l.quantity * l.unitCost, 0);

  const sortedLosses = [...losses].sort((a, b) => (b.date > a.date ? 1 : -1));

  const handleSubmit = () => {
    const qty = parseInt(quantity);
    if (!flowerId || !qty || qty <= 0) return;

    const result = addLoss(flowerId, qty, note || undefined);
    if (result.success) {
      setQuantity("");
      setNote("");
      setError("");
      const flower = flowers.find(f => f.id === flowerId);
      setSuccess(`已记录 ${flower?.emoji}${flower?.name} 损耗 ${qty} 枝`);
      setTimeout(() => setSuccess(""), 2000);
    } else {
      setSuccess("");
      setError(result.message || "记录失败，请检查后重试");
    }
  };

  const currentFlower = flowers.find(f => f.id === flowerId);
  const qtyNum = parseInt(quantity || "0");
  const quantityExceeds = currentFlower && qtyNum > currentFlower.currentStock;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-ink flex items-center gap-2">
          <Trash2 className="w-6 h-6 text-rose-500" />
          损耗记录
        </h1>
        <p className="text-sm text-ink/60 mt-1">每天结束时记录蔫掉的花，系统自动扣减库存</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl card-shadow p-5">
          <div className="flex items-center gap-2 mb-4">
            <Plus className="w-5 h-5 text-rose-500" />
            <h2 className="font-serif text-lg font-semibold text-ink">登记损耗</h2>
          </div>

          {success && (
            <div className="mb-4 bg-leaf-50 border border-leaf-100 text-leaf-600 text-sm rounded-xl px-4 py-3">
              {success}
            </div>
          )}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">
              ⚠️ {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink/70 mb-1.5">选择花材</label>
              <select
                value={flowerId}
                onChange={(e) => { setFlowerId(e.target.value); setError(""); }}
                className="w-full px-4 py-2.5 rounded-xl border border-rose-100 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
              >
                {flowers.map(f => (
                  <option key={f.id} value={f.id}>
                    {f.emoji} {f.name}（库存 {f.currentStock} 枝）
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink/70 mb-1.5">损耗数量（枝）</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => { setQuantity(e.target.value); setError(""); }}
                placeholder={`最多可记 ${currentFlower?.currentStock || 0} 枝`}
                className={`w-full px-4 py-2.5 rounded-xl border bg-white text-ink focus:outline-none focus:ring-2 ${
                  quantityExceeds
                    ? "border-red-400 focus:ring-red-200 focus:border-red-400"
                    : "border-rose-100 focus:ring-rose-200 focus:border-rose-300"
                }`}
              />
              {quantityExceeds && (
                <p className="mt-1.5 text-xs text-red-500">
                  输入数量超过当前库存（{currentFlower?.currentStock} 枝），请核对后再记录
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-ink/70 mb-1.5">备注（可选）</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="例如：水臭了、挤压变形"
                className="w-full px-4 py-2.5 rounded-xl border border-rose-100 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
              />
            </div>

            {quantity && currentFlower && (
              <div className="bg-red-50 rounded-xl p-3 text-center">
                <p className="text-xs text-ink/60">损耗金额约</p>
                <p className="font-serif text-xl font-bold text-red-500">
                  ¥{(parseInt(quantity || "0") * currentFlower.avgCostPrice).toFixed(2)}
                </p>
              </div>
            )}

            <Button className="w-full" onClick={handleSubmit} disabled={!quantity || parseInt(quantity) <= 0}>
              <Trash2 className="w-4 h-4" />
              记录损耗
            </Button>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl card-shadow p-5">
              <div className="flex items-center gap-2 text-red-400 mb-2">
                <Calendar className="w-4 h-4" />
                <span className="text-xs font-medium">今日损耗金额</span>
              </div>
              <p className="font-serif text-3xl font-bold text-ink">¥{todayLossAmount.toFixed(2)}</p>
              <p className="text-xs text-ink/50 mt-1">{todayLosses.length} 次记录</p>
            </div>
            <div className="bg-white rounded-2xl card-shadow p-5">
              <div className="flex items-center gap-2 text-rose-400 mb-2">
                <History className="w-4 h-4" />
                <span className="text-xs font-medium">总损耗记录</span>
              </div>
              <p className="font-serif text-3xl font-bold text-ink">{losses.length}</p>
              <p className="text-xs text-ink/50 mt-1">条历史记录</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl card-shadow p-5">
            <div className="flex items-center gap-2 mb-4">
              <History className="w-5 h-5 text-rose-500" />
              <h2 className="font-serif text-lg font-semibold text-ink">损耗历史</h2>
            </div>
            {sortedLosses.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">🌸</div>
                <p className="text-sm text-ink/50">暂无损耗记录</p>
                <p className="text-xs text-ink/40 mt-1">希望你的花永远新鲜~</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {sortedLosses.map((loss) => (
                  <div key={loss.id} className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-rose-50/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: getFlowerColor(loss.flowerId) }}
                      >
                        {getFlowerEmoji(loss.flowerId)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-ink">{getFlowerName(loss.flowerId)}</p>
                          <span className="text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-full">-{loss.quantity}枝</span>
                        </div>
                        <p className="text-xs text-ink/50">
                          {loss.date} {loss.note && `· ${loss.note}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-red-500">-¥{(loss.quantity * loss.unitCost).toFixed(2)}</p>
                      <p className="text-xs text-ink/40">¥{loss.unitCost.toFixed(2)}/枝</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
