import { useState, useMemo } from "react";
import { Flower2, AlertCircle, Check, Calculator } from "lucide-react";
import { useFlowerStore } from "@/store/useFlowerStore";
import type { BouquetTemplate } from "@/types";
import Modal from "@/components/Modal";
import Button from "@/components/Button";

export default function BouquetMaker() {
  const { bouquetTemplates, flowers, checkBouquetStock, calculateBouquetCost, makeBouquet } = useFlowerStore();
  const [selectedBouquet, setSelectedBouquet] = useState<BouquetTemplate | null>(null);
  const [sellPrice, setSellPrice] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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
    setSuccessMessage("");
  };

  const handleMake = () => {
    if (!selectedBouquet || !sellPrice) return;
    const result = makeBouquet(selectedBouquet.id, parseFloat(sellPrice));
    if (result.success) {
      setSuccessMessage(`${selectedBouquet.name} 制作成功！已扣减库存`);
      setTimeout(() => {
        setSelectedBouquet(null);
        setSellPrice("");
        setSuccessMessage("");
      }, 1500);
    } else {
      alert(result.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-ink flex items-center gap-2">
          <Flower2 className="w-6 h-6 text-rose-500" />
          花束制作中心
        </h1>
        <p className="text-sm text-ink/60 mt-1">选择花束样式，自动核算成本、利润和库存</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {bouquetTemplates.map((bouquet, idx) => {
          const status = checkBouquetStock(bouquet.id);
          const cost = calculateBouquetCost(bouquet.id);
          return (
            <div
              key={bouquet.id}
              style={{ animationDelay: `${idx * 60}ms` }}
              className="bg-white rounded-2xl card-shadow card-hover overflow-hidden animate-fade-in-up cursor-pointer group"
              onClick={() => handleSelect(bouquet)}
            >
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
                        value={sellPrice}
                        onChange={(e) => setSellPrice(e.target.value)}
                        className="w-full text-center font-serif text-xl font-bold text-rose-500 bg-white/50 rounded-lg px-2 py-0.5 focus:outline-none focus:ring-2 focus:ring-rose-200"
                      />
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
                    disabled={!stockStatus.enough || !sellPrice}
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
    </div>
  );
}
