// hooks/use-cart.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { IAutomation } from '@/types/automation';
import { toast } from 'sonner';

interface CartStore {
    items: IAutomation[];
    addItem: (data: IAutomation) => void;
    removeItem: (id: string) => void;
    removeAll: () => void;
    setItems: (items: IAutomation[]) => void;
}

export const useCart = create(
    persist<CartStore>(
        (set, get) => ({
            items: [],
            addItem: (data: IAutomation) => {
                const currentItems = get().items;
                const existingItem = currentItems.find((item) => item._id === data._id);
                if (existingItem) return;
                set({ items: [...get().items, data] });
            },
            removeItem: (id: string) => {
                set({ items: [...get().items.filter((item) => item._id !== id)] });
            },
            removeAll: () => set({ items: [] }),
            // charger le panier BDD
            setItems: (items: IAutomation[]) => set({ items }),
        }),
        {
            name: 'cart-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);