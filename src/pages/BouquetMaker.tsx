import { useState, useMemo } from "react";
import { Flower2, AlertCircle, Check, Calculator, Plus, Trash2, X } from "lucide-react";
import { useFlowerStore } from "@/store/useFlowerStore";
import type { BouquetTemplate, FlowerUsage } from "@/types";
import Modal from "@/components/Modal";
import Button from "@/components/Button";

export default function BouquetMaker() {
  const { bouquetTemplates, flowers, checkBouquetStock, calculateBouquetCost, makeBouquet, addCustomBouquetTemplate, deleteBouquetTemplate } = useFlowerStore();
  const [selectedBouquet, setSelectedBouquet] = useState<BouquetTemplate | null>(null);
  const [sellPrice, setSellPrice] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newSuggestedPrice, setNewSuggestedPrice] = useState("");
  const [newFlowers, setNewFlowers] = useState<FlowerUsage[]>([{ flowerId: flowers[0]?.id || "rose", quantity: 1 }]);

  const getFlowerName = (id: string) => flowers.find(f => f.id === id)?.name || id;
  const getFlowerEmoji = (id: string) => flowers.find(f => f.id === id)?.emoji || "🌸";

  const stockStatus = useMemo(() => {
    if (!selectedBouquet) return { enough: true, shortages: [] };
    return checkBouquetStock(selectedBouquet.id);
  }, [selectedBouquet, checkBouquetStock]);

  const costPrice = useMemo(() => {
    if (!selectedBouquet) return 0;
    return calculateBouquetCost(selectedBouquet.id);
  }, [selectedBouquet, calculateBouquetCost]);

  const profit = useMemo(() => {
    if (!sellPrice) return 0;
    return parseFloat(sellPrice) - costPrice;
  }, [sellPrice, costPrice]);

  const profitRate = useMemo(() => {
    if (!sellPrice || costPrice === 0) return 0;
    return (profit / costPrice) * 100;
  }, [sellPrice, costPrice, profit]);

  const handleSelect = (bouquet: BouquetTemplate) => {
    setSelectedBouquet(bouquet);
    setSellPrice(String(bouquet.suggestedPrice));
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleMake = () => {
    if (!selectedBouquet || !sellPrice) return;
    setErrorMessage("");
    const result = makeBouquet(selectedBouquet.id, parseFloat(sellPrice));
    if (result.success) {
      setSuccessMessage(`${selectedBouquet.name} 制作成功！已扣减库存`);
      setTimeout(() => {
        setSelectedBouquet(null);
        setSellPrice("");
        setSuccessMessage("");
      }, 1500);
    } else {
      setErrorMessage(result.message || "制作失败");
    }
  };

  const addFlowerRow = () => {
    setNewFlowers([...newFlowers, { flowerId: flowers[0]?.id || "rose", quantity: 1 }]);
  };

  const removeFlowerRow = (idx: number) => {
    if (newFlowers.length <= 1) return;
    setNewFlowers(newFlowers.filter((_, i) => i !== idx));
  };

  const updateFlowerRow = (idx: number, field: "flowerId" | "quantity", value: string | number) => {
    setNewFlowers(newFlowers.map((f, i) => i === idx ? { ...f, [field]: value } : f));
  };

  const handleCreateTemplate = () => {
    if (!newName.trim()) return;
    const validFlowers = newFlowers.filter(f => f.quantity > 0);
    if (validFlowers.length === 0) return;

    const image = validFlowers.slice(0, 3).map(f => getFlowerEmoji(f.flowerId)).join("");

    addCustomBouquetTemplate({
      name: newName.trim(),
      description: newDesc.trim() || "自定义花束",
      image,
      suggestedPrice: parseFloat(newSuggestedPrice) || 0,
      flowers: validFlowers,
    });

    setIsCreateModalOpen(false);
    setNewName("");
    setNewDesc("");
    setNewSuggestedPrice("");
    setNewFlowers([{ flowerId: flowers[0]?.id || "rose", quantity: 1 }]);
  };

  const handleDeleteTemplate = (e: React.MouseEvent, id: string, isCustom?: boolean) => {
    e.stopPropagation();
    if (!isCustom) {
      alert("系统预设模板不能删除哦~");
      return;
    }
    if (confirm("确定删除这个自定义花束模板吗？")) {
      deleteBouquetTemplate(id);
    }
  };

  const sellPriceNum = parseFloat(sellPrice);
  const sellPriceInvalid = sellPrice && (isNaN(sellPriceNum) || sellPriceNum <= 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-ink flex items-center gap-2">
            <Flower2 className="w-6 h-6 text-rose-500" />
            花束制作中心
          </h1>
          <p className="text-sm text-ink/60 mt-1">选择花束样式，自动核算成本、利润和库存（支持自定义模板）</p>
        </div>
        <Button variant="secondary" onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-4 h-4" />
          新建花束模板
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {bouquetTemplates.map((bouquet, idx) => {
          const status = checkBouquetStock(bouquet.id);
          const cost = calculateBouquetCost(bouquet.id);
          return (
            <div
              key={bouquet.id}
              style={{ animationDelay: `${idx * 60}ms` }}
              className="relative bg-white rounded-2xl card-shadow card-hover overflow-hidden animate-fade-in-up cursor-pointer group"
              onClick={() => handleSelect(bouquet)}
            >
              {bouquet.isCustom && (
                <div className="absolute top-3 left-3 text-xs bg-leaf-50 text-leaf-600 px-2 py-0.5 rounded-full">
                  自定义
                </div>
              )}
              <button
                onClick={(e) => handleDeleteTemplate(e, bouquet.id, bouquet.isCustom)}
                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/80 backdrop-blur flex items-center justify-center text-ink/40 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <div className="gradient-cream p-8 text-center">
                <div className="text-5xl mb-2 group-hover:scale-110 transition-transform">
                  {bouquet.image}
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-serif font-semibold text-lg text-ink">{bouquet.name}</h3>
                  {!status.enough && (
                    <span className="flex items-center gap-1 text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-full whitespace-nowrap">
                      <AlertCircle className="w-3 h-3" />
                      库存不足
                    </span>
                  )}
                </div>
                <p className="text-sm text-ink/60 mb-3 line-clamp-2">{bouquet.description}</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {bouquet.flowers.map((f) => (
                    <span key={f.flowerId} className="text-xs bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full">
                      {getFlowerEmoji(f.flowerId)} {f.quantity}枝
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-rose-50">
                  <div>
                    <p className="text-xs text-ink/50">成本约</p>
                    <p className="font-serif font-bold text-ink">¥{cost.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-ink/50">建议售价</p>
                    <p className="font-serif font-bold text-rose-500">¥{bouquet.suggestedPrice}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={!!selectedBouquet}
        onClose={() => setSelectedBouquet(null)}
        title={selectedBouquet?.name || ""}
      >
        {selectedBouquet && (
          <div className="space-y-5">
            {successMessage ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto rounded-full bg-leaf-100 flex items-center justify-center mb-4">
                  <Check className="w-8 h-8 text-leaf-500" />
                </div>
                <p className="font-serif text-lg font-medium text-ink">{successMessage}</p>
              </div>
            ) : (
              <>
                <div className="text-center pb-4 border-b border-rose-50">
                  <div className="text-5xl mb-2">{selectedBouquet.image}</div>
                  <p className="text-sm text-ink/60">{selectedBouquet.description}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-ink/70 mb-2 flex items-center gap-1.5">
                    <Flower2 className="w-4 h-4 text-rose-400" />
                    用花明细
                  </h4>
                  <div className="space-y-2">
                    {selectedBouquet.flowers.map((f) => {
                      const flower = flowers.find(fl => fl.id === f.flowerId);
                      const hasEnough = flower && flower.currentStock >= f.quantity;
                      return (
                        <div key={f.flowerId} className="flex items-center justify-between py-2 px-3 rounded-xl bg-rose-50/50">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{getFlowerEmoji(f.flowerId)}</span>
                            <span className="text-sm text-ink">{getFlowerName(f.flowerId)}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-ink">× {f.quantity}枝</span>
                            <span className={`text-xs ${hasEnough ? "text-leaf-600" : "text-red-500"}`}>
                              库存 {flower?.currentStock || 0}枝
                              {!hasEnough && " ⚠️"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {!stockStatus.enough && (
                  <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-red-600 mb-1">库存不足，无法制作</p>
                        <ul className="text-xs text-red-500 space-y-0.5">
                          {stockStatus.shortages.map((s, i) => (
                            <li key={i}>• {s.name}：需要 {s.needed} 枝，现有 {s.available} 枝</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {errorMessage && (
                  <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-600">{errorMessage}</p>
                    </div>
                  </div>
                )}

                <div className="bg-gradient-to-br from-rose-50 to-leaf-50 rounded-xl p-4">
                  <h4 className="text-sm font-medium text-ink/70 mb-3 flex items-center gap-1.5">
                    <Calculator className="w-4 h-4 text-rose-400" />
                    成本 & 利润核算
                  </h4>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-xs text-ink/50">总成本</p>
                      <p className="font-serif text-xl font-bold text-ink">¥{costPrice.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-ink/50">
                        <label htmlFor="sellPrice" className="cursor-pointer hover:text-rose-500">实际售价</label>
                      </p>
                      <input
                        id="sellPrice"
                        type="number"
                        min="0"
                        step="0.01"
                        value={sellPrice}
                        onChange={(e) => {
                          setSellPrice(e.target.value);
                          setErrorMessage("");
                        }}
                        className={`w-full text-center font-serif text-xl font-bold rounded-lg px-2 py-0.5 focus:outline-none focus:ring-2 ${
                          sellPriceInvalid
                            ? "text-red-500 bg-red-50 ring-red-200"
                            : "text-rose-500 bg-white/50 focus:ring-rose-200"
                        }`}
                      />
                      {sellPriceInvalid && (
                        <p className="text-xs text-red-500 mt-1">售价需大于0</p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-ink/50">利润</p>
                      <p className={`font-serif text-xl font-bold ${profit >= 0 ? "text-leaf-600" : "text-red-500"}`}>
                        ¥{profit.toFixed(2)}
                      </p>
                      <p className="text-xs text-ink/50">{profitRate.toFixed(0)}%</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-1">
                  <Button variant="ghost" className="flex-1" onClick={() => setSelectedBouquet(null)}>
                    取消
                  </Button>
                  <Button
                    variant="success"
                    className="flex-1"
                    onClick={handleMake}
                    disabled={!stockStatus.enough || !sellPrice || sellPriceInvalid}
                  >
                    <Check className="w-4 h-4" />
                    确认制作
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>

      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="新建花束模板">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink/70 mb-1.5">花束名称</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="例如：99朵红玫瑰"
              className="w-full px-4 py-2.5 rounded-xl border border-rose-100 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink/70 mb-1.5">花束描述（可选）</label>
            <input
              type="text"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="简单描述一下这款花束"
              className="w-full px-4 py-2.5 rounded-xl border border-rose-100 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink/70 mb-1.5">建议售价（元）</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={newSuggestedPrice}
              onChange={(e) => setNewSuggestedPrice(e.target.value)}
              placeholder="例如：199"
              className="w-full px-4 py-2.5 rounded-xl border border-rose-100 bg-white text-ink focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-ink/70">用花清单</label>
              <Button size="sm" variant="ghost" onClick={addFlowerRow}>
                <Plus className="w-3.5 h-3.5" />
                添加花材
              </Button>
            </div>
            <div className="space-y-2">
              {newFlowers.map((f, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <select
                    value={f.flowerId}
                    onChange={(e) => updateFlowerRow(idx, "flowerId", e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-rose-100 bg-white text-sm text-ink focus:outline-none focus:ring-2 focus:ring-rose-200"
                  >
                    {flowers.map(fl => (
                      <option key={fl.id} value={fl.id}>{fl.emoji} {fl.name}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={f.quantity}
                    onChange={(e) => updateFlowerRow(idx, "quantity", parseInt(e.target.value) || 0)}
                    placeholder="数量"
                    className="w-24 px-3 py-2 rounded-xl border border-rose-100 bg-white text-sm text-ink text-center focus:outline-none focus:ring-2 focus:ring-rose-200"
                  />
                  <button
                    onClick={() => removeFlowerRow(idx)}
                    disabled={newFlowers.length <= 1}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-ink/40 hover:text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:hover:text-ink/40 disabled:hover:bg-transparent transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" className="flex-1" onClick={() => setIsCreateModalOpen(false)}>
              取消
            </Button>
            <Button
              className="flex-1"
              onClick={handleCreateTemplate}
              disabled={!newName.trim() || newFlowers.every(f => f.quantity <= 0)}
            >
              <Plus className="w-4 h-4" />
              保存模板
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
