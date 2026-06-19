import { useState } from "react";
import { Plus, Package, History, ChevronDown, ChevronUp, Calendar, TrendingUp, TrendingDown, DollarSign, ArrowRightLeft, Store, UserPlus } from "lucide-react";
import { useFlowerStore } from "@/store/useFlowerStore";
import Modal from "@/components/Modal";
import Button from "@/components/Button";

export default function Inventory() {
  const { flowers, purchases, suppliers, addPurchase, addSupplier, getFlowerBatches, getTotalInventoryValue, getInventoryValueBreakdown, getBatchUsageRecords, getBatchLedger } = useFlowerStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [selectedFlowerId, setSelectedFlowerId] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split("T")[0]);
  const [quantity, setQuantity] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [newSupplierName, setNewSupplierName] = useState("");
  const [newSupplierContact, setNewSupplierContact] = useState("");
  const [expandedFlowerId, setExpandedFlowerId] = useState<string | null>(null);
  const [expandedBatchId, setExpandedBatchId] = useState<string | null>(null);
  const [showEmptyBatches, setShowEmptyBatches] = useState<Record<string, boolean>>({});

  const handleOpenModal = (flowerId?: string) => {
    setSelectedFlowerId(flowerId || flowers[0]?.id || "");
    setPurchaseDate(new Date().toISOString().split("T")[0]);
    setQuantity("");
    setCostPrice("");
    setSelectedSupplierId(suppliers[0]?.id || "");
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    const qty = parseInt(quantity);
    const price = parseFloat(costPrice);
    if (!selectedFlowerId || !qty || qty <= 0 || !price || price <= 0) return;

    addPurchase(selectedFlowerId, qty, price, purchaseDate, selectedSupplierId || undefined);
    setIsModalOpen(false);
  };

  const handleAddSupplier = () => {
    if (!newSupplierName.trim()) return;
    const id = addSupplier(newSupplierName.trim(), newSupplierContact.trim() || undefined);
    setSelectedSupplierId(id);
    setNewSupplierName("");
    setNewSupplierContact("");
    setIsSupplierModalOpen(false);
  };

  const recentPurchases = [...purchases].reverse().slice(0, 10);
  const totalValue = getTotalInventoryValue();

  const toggleExpand = (flowerId: string) => {
    setExpandedFlowerId(expandedFlowerId === flowerId ? null : flowerId);
  };

  const getSupplierName = (supplierId?: string) => {
    if (!supplierId) return "未标注";
    return suppliers.find((s) => s.id === supplierId)?.name || "未知供应商";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-ink flex items-center gap-2">
            <Package className="w-6 h-6 text-rose-500" />
            花材批次台账
          </h1>
          <p className="text-sm text-ink/60 mt-1">完整记录每批进货、售出、损耗流水，库存金额只按在库批次计算</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm bg-leaf-50 text-leaf-600 px-4 py-2 rounded-full">
            在库总价值 ¥{totalValue.toFixed(2)}
          </div>
          <Button onClick={() => handleOpenModal()}>
            <Plus className="w-4 h-4" />
            登记进货
          </Button>
        </div>
      </div>

      <div className="bg-gradient-to-r from-rose-50 to-leaf-50 border border-rose-100 rounded-2xl p-4 flex items-start gap-3">
        <ArrowRightLeft className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-ink">批次扣减规则说明</p>
          <p className="text-xs text-ink/60 mt-0.5">
            系统严格按照「进货日期」先进先出（FIFO），补录旧批次后会自动重排序，制作花束或记损耗时永远先消耗最早进的那批。库存金额只按当前还在库的批次 × 对应进价计算。
          </p>
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
                <th className="text-right px-5 py-3 text-sm font-medium text-ink/70">加权均价</th>
                <th className="text-right px-5 py-3 text-sm font-medium text-ink/70">库存价值</th>
                <th className="text-right px-5 py-3 text-sm font-medium text-ink/70">批次数量</th>
                <th className="text-right px-5 py-3 text-sm font-medium text-ink/70">状态</th>
                <th className="text-right px-5 py-3 text-sm font-medium text-ink/70">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-50">
              {flowers.map((flower) => {
                const isLow = flower.currentStock <= flower.lowStockThreshold;
                const isOut = flower.currentStock === 0;
                const isExpanded = expandedFlowerId === flower.id;
                const activeBatches = getFlowerBatches(flower.id, false);
                const allBatches = getFlowerBatches(flower.id, true);
                const emptyBatches = allBatches.filter((b) => b.remainingQuantity === 0);
                const showEmpty = showEmptyBatches[flower.id] || false;
                const displayBatches = showEmpty ? allBatches : activeBatches;
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
                        <span className="inline-flex items-center gap-1.5">
                          <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-leaf-50 text-leaf-600">
                            在库 {activeBatches.length}
                          </span>
                          {emptyBatches.length > 0 && (
                            <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-ink/5 text-ink/50">
                              用完 {emptyBatches.length}
                            </span>
                          )}
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
                    {isExpanded && (
                      <tr key={`${flower.id}-detail`} className="bg-rose-50/30">
                        <td colSpan={8} className="px-5 py-4">
                          <div className="pl-8">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                              <div>
                                <p className="text-xs font-medium text-ink/60 flex items-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5" />
                                  {flower.name} 批次台账（FIFO顺序，优先扣减最早批次）
                                </p>
                                <p className="text-[11px] text-ink/40 mt-0.5">
                                  💡 库存价值只按当前在库批次 × 对应进价精确计算，已用完批次不计入
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                {emptyBatches.length > 0 && (
                                  <button
                                    onClick={() => setShowEmptyBatches({ ...showEmptyBatches, [flower.id]: !showEmpty })}
                                    className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                                      showEmpty ? "bg-rose-500 text-white" : "bg-white text-ink/60 hover:bg-rose-100 border border-rose-100"
                                    }`}
                                  >
                                    {showEmpty ? "隐藏已用完" : `显示已用完 (${emptyBatches.length})`}
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="bg-leaf-50 border border-leaf-100 rounded-xl p-3 mb-4">
                              <p className="text-xs font-medium text-leaf-700 flex items-center gap-1.5 mb-2">
                                <DollarSign className="w-3.5 h-3.5" />
                                库存价值计算明细（仅统计在库批次）
                              </p>
                              <p className="text-xs text-ink/70 leading-relaxed">
                                {getInventoryValueBreakdown(flower.id).explanation}
                              </p>
                              <p className="text-sm font-bold text-leaf-600 mt-1.5">
                                当前库存价值 = ¥{getInventoryValueBreakdown(flower.id).total.toFixed(2)}
                              </p>
                            </div>

                            {displayBatches.length === 0 ? (
                              <div className="text-center py-6">
                                <p className="text-sm text-ink/50">暂无批次记录，点击「进货」补充 {flower.name}</p>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {displayBatches.map((batch, idx) => {
                                  const usagePct = batch.initialQuantity > 0
                                    ? ((batch.initialQuantity - batch.remainingQuantity) / batch.initialQuantity) * 100
                                    : 0;
                                  const isEmpty = batch.remainingQuantity === 0;
                                  const isFirstActive = !isEmpty && activeBatches.findIndex((b) => b.id === batch.id) === 0;
                                  const isBatchExpanded = expandedBatchId === batch.id;
                                  const usageRecords = getBatchUsageRecords(batch.id);
                                  const ledger = getBatchLedger(batch.id);
                                  const supplierName = getSupplierName(batch.supplierId);

                                  return (
                                    <div
                                      key={batch.id}
                                      className={`bg-white rounded-xl border transition-all overflow-hidden ${
                                        isEmpty
                                          ? "border-ink/10 opacity-70"
                                          : isFirstActive
                                          ? "border-rose-300 ring-2 ring-rose-200 ring-opacity-60"
                                          : usagePct > 0
                                          ? "border-amber-200"
                                          : "border-rose-100"
                                      }`}
                                    >
                                      <div
                                        className="p-3 cursor-pointer hover:bg-rose-50/30 transition-colors"
                                        onClick={() => setExpandedBatchId(isBatchExpanded ? null : batch.id)}
                                      >
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                          <span className="text-xs text-ink/50 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {batch.purchaseDate}
                                          </span>
                                          <span className="text-xs text-ink/50 flex items-center gap-1">
                                            <Store className="w-3 h-3" />
                                            {supplierName}
                                          </span>
                                          {isEmpty && (
                                            <span className="text-[10px] bg-ink/10 text-ink/60 px-1.5 py-0.5 rounded-full font-medium">
                                              已用完
                                            </span>
                                          )}
                                          {!isEmpty && isFirstActive && (
                                            <span className="text-[10px] bg-rose-500 text-white px-1.5 py-0.5 rounded-full font-medium">
                                              下一批扣减
                                            </span>
                                          )}
                                          {!isEmpty && !isFirstActive && usagePct > 0 && (
                                            <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
                                              部分使用
                                            </span>
                                          )}
                                        </div>
                                        <div className="flex items-baseline justify-between mb-2">
                                          <div className="flex items-baseline gap-1.5">
                                            <span className={`font-serif text-xl font-bold ${isEmpty ? "text-ink/30" : "text-ink"}`}>
                                              {batch.remainingQuantity}
                                            </span>
                                            <span className="text-xs text-ink/50">/ {batch.initialQuantity} 枝剩余</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <span className="text-xs font-semibold text-leaf-700">
                                              ¥{batch.costPrice.toFixed(2)}/枝
                                            </span>
                                            {isBatchExpanded ? (
                                              <ChevronUp className="w-3.5 h-3.5 text-ink/40" />
                                            ) : (
                                              <ChevronDown className="w-3.5 h-3.5 text-ink/40" />
                                            )}
                                          </div>
                                        </div>
                                        <div className="h-1.5 bg-rose-100 rounded-full overflow-hidden">
                                          <div
                                            className={`h-full rounded-full transition-all ${
                                              isEmpty ? "bg-ink/20" : isFirstActive ? "bg-gradient-to-r from-rose-400 to-rose-500" : "bg-gradient-to-r from-rose-300 to-rose-400"
                                            }`}
                                            style={{ width: `${usagePct}%` }}
                                          />
                                        </div>
                                        <div className="flex items-center justify-between mt-1.5">
                                          <p className="text-xs text-ink/50">
                                            已用 {batch.initialQuantity - batch.remainingQuantity} 枝（{usagePct.toFixed(0)}%）
                                          </p>
                                          <p className={`text-xs font-medium ${isEmpty ? "text-ink/30" : "text-leaf-600"}`}>
                                            {isEmpty ? "余值 ¥0.00" : `余值 ¥${(batch.remainingQuantity * batch.costPrice).toFixed(2)}`}
                                          </p>
                                        </div>
                                      </div>

                                      {isBatchExpanded && ledger.length > 0 && (
                                        <div className="bg-rose-50/50 px-3 py-3 border-t border-rose-100">
                                          <p className="text-[11px] font-medium text-ink/60 mb-2 flex items-center gap-1.5">
                                            <History className="w-3.5 h-3.5" />
                                            批次流水明细
                                          </p>
                                          <div className="space-y-1 max-h-48 overflow-y-auto">
                                            {ledger.map((entry, ei) => (
                                              <div key={ei} className="flex items-center justify-between text-[11px] py-1 px-2 rounded hover:bg-white/60">
                                                <div className="flex items-center gap-2 min-w-0">
                                                  <span className="text-ink/40 w-20 flex-shrink-0">{entry.date}</span>
                                                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] ${
                                                    entry.type === "in"
                                                      ? "bg-leaf-100 text-leaf-700"
                                                      : entry.type === "out-sale"
                                                      ? "bg-rose-100 text-rose-700"
                                                      : "bg-red-100 text-red-700"
                                                  }`}>
                                                    {entry.type === "in" ? (
                                                      <><Plus className="w-2.5 h-2.5" /> 进货</>
                                                    ) : entry.type === "out-sale" ? (
                                                      <><TrendingUp className="w-2.5 h-2.5" /> 售出</>
                                                    ) : (
                                                      <><TrendingDown className="w-2.5 h-2.5" /> 损耗</>
                                                    )}
                                                  </span>
                                                  <span className="text-ink/70 truncate">{entry.note}</span>
                                                </div>
                                                <div className="flex items-center gap-3 flex-shrink-0">
                                                  <span className={`font-medium ${
                                                    entry.type === "in" ? "text-leaf-600" : "text-red-500"
                                                  }`}>
                                                    {entry.type === "in" ? "+" : "-"}{entry.quantity}枝
                                                  </span>
                                                  <span className="text-ink/50 w-16 text-right">余 {entry.balance}枝</span>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                          {usageRecords.length > 0 && (
                                            <p className="text-[10px] text-ink/40 mt-2 pt-2 border-t border-rose-100">
                                              本批次共被使用 {usageRecords.length} 次，合计 {usageRecords.reduce((s, r) => s + r.quantity, 0)} 枝
                                            </p>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
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
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-rose-500" />
            <h2 className="font-serif text-lg font-semibold text-ink">最近进货记录</h2>
          </div>
          <button
            onClick={() => setIsSupplierModalOpen(true)}
            className="text-xs text-rose-500 hover:text-rose-600 flex items-center gap-1"
          >
            <UserPlus className="w-3.5 h-3.5" />
            管理供应商
          </button>
        </div>
        {recentPurchases.length === 0 ? (
          <p className="text-sm text-ink/50 text-center py-8">暂无进货记录，点击上方按钮登记第一次进货吧~</p>
        ) : (
          <div className="space-y-2">
            {recentPurchases.map((purchase) => {
              const flower = flowers.find((f) => f.id === purchase.flowerId);
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
                      <p className="text-xs text-ink/50 flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />
                        {purchase.date}
                        <span className="text-ink/30">·</span>
                        <Store className="w-3 h-3" />
                        {getSupplierName(purchase.supplierId)}
                      </p>
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
              {flowers.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.emoji} {f.name}（当前 {f.currentStock} 枝，保鲜 {f.freshDays} 天）
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink/70 mb-1.5 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5" />
              供应商
            </label>
            <div className="flex gap-2">
              <select
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-rose-100 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
              >
                <option value="">未标注供应商</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}{s.contact ? ` · ${s.contact}` : ""}</option>
                ))}
              </select>
              <button
                onClick={() => setIsSupplierModalOpen(true)}
                className="px-3 py-2.5 rounded-xl border border-rose-100 bg-white text-ink/60 hover:bg-rose-50 hover:text-rose-500 transition-colors"
                title="新增供应商"
              >
                <UserPlus className="w-4 h-4" />
              </button>
            </div>
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

      <Modal isOpen={isSupplierModalOpen} onClose={() => setIsSupplierModalOpen(false)} title="管理供应商">
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-medium text-ink/60">现有供应商</p>
            {suppliers.length === 0 ? (
              <p className="text-sm text-ink/40 text-center py-4">暂无供应商</p>
            ) : (
              <div className="space-y-1.5">
                {suppliers.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => { setSelectedSupplierId(s.id); }}
                    className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                      selectedSupplierId === s.id ? "bg-rose-50 border border-rose-200" : "bg-rose-50/30 hover:bg-rose-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-rose-400" />
                      <span className="text-sm font-medium text-ink">{s.name}</span>
                    </div>
                    {s.contact && <span className="text-xs text-ink/50">{s.contact}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="border-t border-rose-100 pt-4 space-y-3">
            <p className="text-xs font-medium text-ink/60">新增供应商</p>
            <div>
              <label className="block text-xs text-ink/50 mb-1">供应商名称</label>
              <input
                type="text"
                value={newSupplierName}
                onChange={(e) => setNewSupplierName(e.target.value)}
                placeholder="例如：云南鲜花基地"
                className="w-full px-3 py-2 rounded-xl border border-rose-100 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-200"
              />
            </div>
            <div>
              <label className="block text-xs text-ink/50 mb-1">联系方式（可选）</label>
              <input
                type="text"
                value={newSupplierContact}
                onChange={(e) => setNewSupplierContact(e.target.value)}
                placeholder="例如：138xxxx8888"
                className="w-full px-3 py-2 rounded-xl border border-rose-100 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-200"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <Button variant="ghost" className="flex-1" onClick={() => setIsSupplierModalOpen(false)}>
                关闭
              </Button>
              <Button
                size="sm"
                onClick={handleAddSupplier}
                disabled={!newSupplierName.trim()}
              >
                <UserPlus className="w-3.5 h-3.5" />
                添加
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
