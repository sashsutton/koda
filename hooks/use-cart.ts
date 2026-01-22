// hooks/use-cart.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { IAutomation } from '@/types/automation';
import { toast } from 'sonner'; // Pour les notifications (déjà dans ton package.json)

interface CartStore {
    items: IAutomation[];
    addItem: (data: IAutomation) => void;
    removeItem: (id: string) => void;
    removeAll: () => void;
}

export const useCart = create(
    persist<CartStore>(
        (set, get) => ({
            items: [],
            addItem: (data: IAutomation) => {
                const currentItems = get().items;
                const existingItem = currentItems.find((item) => item._id === data._id);

                if (existingItem) {
                    return toast.error("Cet article est déjà dans le panier.");
                }

                set({ items: [...get().items, data] });
                toast.success("Article ajouté au panier !");
            },
            removeItem: (id: string) => {
                set({ items: [...get().items.filter((item) => item._id !== id)] });
                toast.success("Article retiré du panier.");
            },
            removeAll: () => set({ items: [] }),
        }),
        {
            name: 'cart-storage', // Nom de la clé dans le LocalStorage
            storage: createJSONStorage(() => localStorage),
        }
    )
);