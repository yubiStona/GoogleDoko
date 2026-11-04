import React from "react";
import { Trash2, Plus, Minus } from "lucide-react";
import type { CartItem as CartItemType } from "../../context/CartContext";
import { resolveProductSellingUnit } from "../../utils/productUnits";

export interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity?: (id: string, change: number) => void;
  onRemove?: (id: string) => void;
}

export const CartItem: React.FC<CartItemProps> = ({ item, onUpdateQuantity, onRemove }) => {
  const unit = resolveProductSellingUnit(item.category, item.sellingUnit, item.weight);

  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-slate-100 last:border-0">
      <div className="flex items-center gap-3">
        {item.image && (
          <img
            src={item.image}
            alt={item.name}
            className="w-14 h-14 object-cover rounded-lg border border-slate-100"
          />
        )}
        <div>
          <h4 className="text-sm font-semibold text-slate-800">{item.name}</h4>
          <p className="text-xs text-slate-500">
            {item.variant ? `Option: ${item.variant.name || item.variant} • ` : item.weight ? `${item.weight} • ` : ""}
            Rs. {item.price.toLocaleString()} / {unit}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden">
          <button
            type="button"
            className="px-2 py-1 hover:bg-slate-50 text-slate-600"
            onClick={() => onUpdateQuantity?.(item.id, -1)}
            disabled={item.quantity <= 1}
          >
            <Minus size={14} />
          </button>
          <span className="px-2.5 text-xs font-semibold text-slate-800">{item.quantity}</span>
          <button
            type="button"
            className="px-2 py-1 hover:bg-slate-50 text-slate-600"
            onClick={() => onUpdateQuantity?.(item.id, 1)}
          >
            <Plus size={14} />
          </button>
        </div>

        <button
          type="button"
          className="text-slate-400 hover:text-red-500 transition-colors p-1"
          onClick={() => onRemove?.(item.id)}
          aria-label="Remove item"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default CartItem;
