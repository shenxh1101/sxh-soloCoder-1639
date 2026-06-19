import { useState } from "react";
import { Plus, Package, History, ChevronDown, ChevronUp, Calendar, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { useFlowerStore } from "@/store/useFlowerStore";
import Modal from "@/components/Modal";
import Button from "@/components/Button";

export default function Inventory() {
  const { flowers, purchases, addPurchase, getFlowerBatches, getTotalInventoryValue, getInventoryValueBreakdown, getBatchUsageRecords } = useFlowerStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFlowerId, setSelectedFlowerId] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split("T")[0]);
  const [quantity, setQuantity] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [expandedFlowerId, setExpandedFlowerId] = useState<string | null>(null);
  const [expandedBatchId, setExpandedBatchId] = useState<string | null>(null);

  const handleOpenModal = (flowerId?: string) => {
    setSelectedFlowerId(flowerId || flowers[0]?.id || "");
    setPurchaseDate(new Date().toISOString().split("T")[0]);
    setQuantity("");
    setCostPrice("");
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    const qty = parseInt(quantity);
    const price = parseFloat(costPrice);
    if (!selectedFlowerId || !qty || qty <= 0 || !price || price <= 0) return;

    addPurchase(selectedFlowerId, qty, price, purchaseDate);
    setIsModalOpen(false);
  };

  const recentPurchases = [...purchases].reverse().slice(0, 10);
  const totalValue = getTotalInventoryValue();

  const toggleExpand = (flowerId: string) => {
    setExpandedFlowerId(expandedFlowerId === flowerId ? null : flowerId);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-ink flex items-center gap-2">
            <Package className="w-6 h-6 text-rose-500" />
            花材库存管理
          </h1>
          <p className="text-sm text-ink/60 mt-1">查看库存状态、按批次管理进货（先进先出扣减）</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm bg-leaf-50 text-leaf-600 px-4 py-2 rounded-full">
            库存总价值 ¥{totalValue.toFixed(2)}
          </div>
          <Button onClick={() => handleOpenModal()}>
            <Plus className="w-4 h-4" />
            登记进货
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-rose-50/50">
                <th className="text-left px-5 py-3 text-sm font-medium text-ink/70 w-8"></th>
                <th className="text-left px-5 py-3 text-sm font-medium text-ink/70">花材</th>
                <th className="text-right px-5 py-3 text-sm font-medium text-ink/70">当前库存</th>
                <th className="text-right px-5 py-3 text-sm font-medium text-ink/70">批次均价</th>
                <th className="text-right px-5 py-3 text-sm font-medium text-ink/70">库存价值</th>
                <th className="text-right px-5 py-3 text-sm font-medium text-ink/70">在库批次</th>
                <th className="text-right px-5 py-3 text-sm font-medium text-ink/70">状态</th>
                <th className="text-right px-5 py-3 text-sm font-medium text-ink/70">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-50">
              {flowers.map((flower) => {
                const isLow = flower.currentStock <= flower.lowStockThreshold;
                const isOut = flower.currentStock === 0;
                const isExpanded = expandedFlowerId === flower.id;
                const batches = getFlowerBatches(flower.id).filter(b => b.remainingQuantity > 0);
                return (
                  <>
                    <tr key={flower.id} className="hover:bg-rose-50/30 transition-colors">
                      <td className="px-3 py-4">
                        <button
                          onClick={() => toggleExpand(flower.id)}
                          className="p-1 rounded-lg hover:bg-rose-100 transition-colors text-ink/50"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                            style={{ backgroundColor: flower.color }}
                          >
                            {flower.emoji}
                          </div>
                          <span className="font-medium text-ink">{flower.name}</span>
                        </div>
                      </td>
                      <td className="text-right px-5 py-4">
                        <span className={`font-serif text-lg font-bold ${isOut ? "text-ink/30" : isLow ? "text-red-500" : "text-ink"}`}>
                          {flower.currentStock}
                          <span className="text-sm font-normal text-ink/50 ml-1">枝</span>
                        </span>
                      </td>
                      <td className="text-right px-5 py-4 text-ink">
                        ¥{flower.avgCostPrice.toFixed(2)}
                        <span className="text-xs text-ink/50">/枝</span>
                      </td>
                      <td className="text-right px-5 py-4 font-medium text-leaf-600">
                        ¥{(flower.currentStock * flower.avgCostPrice).toFixed(2)}
                      </td>
                      <td className="text-right px-5 py-4">
                        <span className="inline-block px-2.5 py-1 rounded-full text-xs bg-rose-50 text-rose-600">
                          {batches.length} 批
                        </span>
                      </td>
                      <td className="text-right px-5 py-4">
                        {isOut ? (
                          <span className="inline-block px-2.5 py-1 rounded-full text-xs bg-ink text-white">已售罄</span>
                        ) : isLow ? (
                          <span className="inline-block px-2.5 py-1 rounded-full text-xs bg-red-50 text-red-500">库存偏低</span>
                        ) : (
                          <span className="inline-block px-2.5 py-1 rounded-full text-xs bg-leaf-50 text-leaf-600">充足</span>
                        )}
                      </td>
                      <td className="text-right px-5 py-4">
                        <Button size="sm" variant="secondary" onClick={() => handleOpenModal(flower.id)}>
                          <Plus className="w-3.5 h-3.5" />
                          进货
                        </Button>
                      </td>
                    </tr>
                    {isExpanded && batches.length > 0 && (
                      <tr key={`${flower.id}-detail`} className="bg-rose-50/30">
                        <td colSpan={8} className="px-5 py-4">
                          <div className="pl-8">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                              <div>
                                <p className="text-xs font-medium text-ink/60 flex items-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5" />
                                  {flower.name} 在库批次（按FIFO顺序排列，优先扣减最上方最早批次）
                                </p>
                                <p className="text-[11px] text-ink/40 mt-0.5">
                                  💡 扣减时纯按进货日期排序，即使后来补录旧批次，也会优先用更早的批次
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-xs bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full">
                                  共 {batches.length} 批 · 总库存 {batches.reduce((s, b) => s + b.remainingQuantity, 0)} 枝
                                </span>
                              </div>
                            </div>

                            <div className="bg-leaf-50 border border-leaf-100 rounded-xl p-3 mb-4">
                              <p className="text-xs font-medium text-leaf-700 flex items-center gap-1.5 mb-2">
                                <DollarSign className="w-3.5 h-3.5" />
                                库存价值计算明细
                              </p>
                              <p className="text-xs text-ink/70 leading-relaxed">
                                {getInventoryValueBreakdown(flower.id).explanation}
                              </p>
                              <p className="text-sm font-bold text-leaf-600 mt-1.5">
                                当前库存价值 = ¥{getInventoryValueBreakdown(flower.id).total.toFixed(2)}
                              </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              {[...batches].sort((a, b) => a.purchaseDate.localeCompare(b.purchaseDate) || a.id.localeCompare(b.id)).map((batch, idx) => {
                                const usagePct = ((batch.initialQuantity - batch.remainingQuantity) / batch.initialQuantity) * 100;
                                const isUsed = batch.remainingQuantity < batch.initialQuantity;
                                const isFirst = idx === 0;
                                const isBatchExpanded = expandedBatchId === batch.id;
                                const usageRecords = getBatchUsageRecords(batch.id);

                                return (
                                  <div
                                    key={batch.id}
                                    className={`bg-white rounded-xl border transition-all overflow-hidden ${
                                      isFirst
                                        ? "border-rose-300 ring-2 ring-rose-200 ring-opacity-60"
                                        : isUsed
                                        ? "border-amber-200"
                                        : "border-rose-100"
                                    }`}
                                  >
                                    <div
                                      className="p-3 cursor-pointer hover:bg-rose-50/30 transition-colors"
                                      onClick={() => setExpandedBatchId(isBatchExpanded ? null : batch.id)}
                                    >
                                      <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-xs text-ink/50">{batch.purchaseDate}</span>
                                          {isFirst && (
                                            <span className="text-[10px] bg-rose-500 text-white px-1.5 py-0.5 rounded-full font-medium">
                                              优先扣减
                                            </span>
                                          )}
                                          {!isFirst && isUsed && (
                                            <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
                                              已部分使用
                                            </span>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-xs font-semibold text-leaf-700">
                                            ¥{batch.costPrice.toFixed(2)}
                                          </span>
                                          {isBatchExpanded ? (
                                            <ChevronUp className="w-3.5 h-3.5 text-ink/40" />
                                          ) : (
                                            <ChevronDown className="w-3.5 h-3.5 text-ink/40" />
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex items-baseline gap-1.5 mb-2">
                                        <span className="font-serif text-xl font-bold text-ink">{batch.remainingQuantity}</span>
                                        <span className="text-xs text-ink/50">/ {batch.initialQuantity} 枝剩余</span>
                                      </div>
                                      <div className="h-1.5 bg-rose-100 rounded-full overflow-hidden">
                                        <div
                                          className={`h-full rounded-full transition-all ${
                                            isFirst ? "bg-gradient-to-r from-rose-400 to-rose-500" : "bg-gradient-to-r from-rose-300 to-rose-400"
                                          }`}
                                          style={{ width: `${usagePct}%` }}
                                        />
                                      </div>
                                      <div className="flex items-center justify-between mt-1.5">
                                        <p className="text-xs text-ink/50">
                                          已用 {batch.initialQuantity - batch.remainingQuantity} 枝
                                        </p>
                                        <p className="text-xs font-medium text-leaf-600">
                                          余值 ¥{(batch.remainingQuantity * batch.costPrice).toFixed(2)}
                                        </p>
                                      </div>
                                    </div>

                                    {isBatchExpanded && usageRecords.length > 0 && (
                                      <div className="bg-rose-50/50 px-3 py-2 border-t border-rose-100">
                                        <p className="text-[11px] font-medium text-ink/60 mb-1.5">批次使用记录：</p>
                                        <div className="space-y-1 max-h-32 overflow-y-auto">
                                          {usageRecords.map((record, ri) => (
                                            <div key={ri} className="flex items-center justify-between text-[11px]">
                                              <span className="text-ink/50">{record.date}</span>
                                              <span className={`flex items-center gap-1 ${
                                                record.type === "sale" ? "text-leaf-600" : "text-red-500"
                                              }`}>
                                                {record.type === "sale" ? (
                                                  <><TrendingUp className="w-3 h-3" /> 售出 {record.quantity} 枝</>
                                                ) : (
                                                  <><TrendingDown className="w-3 h-3" /> 损耗 {record.quantity} 枝</>
                                                )}
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {isBatchExpanded && usageRecords.length === 0 && (
                                      <div className="bg-rose-50/50 px-3 py-2 border-t border-rose-100">
                                        <p className="text-[11px] text-ink/40">该批次尚未被使用过</p>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                    {isExpanded && batches.length === 0 && (
                      <tr key={`${flower.id}-empty`} className="bg-rose-50/30">
                        <td colSpan={8} className="px-5 py-6 text-center">
                          <p className="text-sm text-ink/50">暂无在库批次，点击「进货」补充 {flower.name}</p>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-2xl card-shadow p-5">
        <div className="flex items-center gap-2 mb-4">
          <History className="w-5 h-5 text-rose-500" />
          <h2 className="font-serif text-lg font-semibold text-ink">最近进货记录</h2>
        </div>
        {recentPurchases.length === 0 ? (
          <p className="text-sm text-ink/50 text-center py-8">暂无进货记录，点击上方按钮登记第一次进货吧~</p>
        ) : (
          <div className="space-y-2">
            {recentPurchases.map((purchase) => {
              const flower = flowers.find(f => f.id === purchase.flowerId);
              return (
                <div key={purchase.id} className="flex items-center justify-between py-2.5 px-4 rounded-xl hover:bg-rose-50/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: flower?.color || "#eee" }}
                    >
                      {flower?.emoji}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-ink">{flower?.name || "未知"}</p>
                      <p className="text-xs text-ink/50">{purchase.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-ink">
                      +{purchase.quantity}枝 × ¥{purchase.costPrice.toFixed(2)}
                    </p>
                    <p className="text-xs text-leaf-600">合计 ¥{(purchase.quantity * purchase.costPrice).toFixed(2)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="登记进货">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink/70 mb-1.5">进货日期</label>
            <input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-rose-100 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink/70 mb-1.5">选择花材</label>
            <select
              value={selectedFlowerId}
              onChange={(e) => setSelectedFlowerId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-rose-100 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
            >
              {flowers.map(f => (
                <option key={f.id} value={f.id}>{f.emoji} {f.name}（当前 {f.currentStock} 枝）</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink/70 mb-1.5">进货数量（枝）</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="例如：50"
                className="w-full px-4 py-2.5 rounded-xl border border-rose-100 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink/70 mb-1.5">进价（元/枝）</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                placeholder="例如：3.5"
                className="w-full px-4 py-2.5 rounded-xl border border-rose-100 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
              />
            </div>
          </div>
          {quantity && costPrice && (
            <div className="bg-leaf-50 rounded-xl p-3 text-center">
              <p className="text-sm text-ink/60">本次进货合计</p>
              <p className="font-serif text-xl font-bold text-leaf-600">
                ¥{(parseInt(quantity || "0") * parseFloat(costPrice || "0")).toFixed(2)}
              </p>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" className="flex-1" onClick={() => setIsModalOpen(false)}>
              取消
            </Button>
            <Button className="flex-1" onClick={handleSubmit} disabled={!quantity || !costPrice}>
              确认进货
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
