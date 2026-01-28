"use client";

import { useTranslations } from "next-intl";
import { LayoutDashboard, ShoppingBag, User, MessageSquare } from "lucide-react";

export type DashboardMode = 'buyer' | 'seller' | 'profile' | 'messages';

interface DashboardModeSwitcherProps {
    currentMode: DashboardMode;
    onChangeMode: (mode: DashboardMode) => void;
}

export default function DashboardModeSwitcher({ currentMode, onChangeMode }: DashboardModeSwitcherProps) {
    const t = useTranslations('Dashboard.modes');

    return (
        <div className="flex space-x-1 bg-muted p-1 rounded-lg mb-6 overflow-x-auto">
            <button
                onClick={() => onChangeMode('buyer')}
                className={`flex items-center px-4 py-2 rounded-md transition-all whitespace-nowrap cursor-pointer ${currentMode === 'buyer'
                    ? 'bg-background shadow-sm text-foreground font-medium'
                    : 'text-muted-foreground hover:bg-background/50 hover:text-foreground'
                    }`}
            >
                <ShoppingBag className="w-4 h-4 mr-2" />
                {t('buyer')}
            </button>
            <button
                onClick={() => onChangeMode('seller')}
                className={`flex items-center px-4 py-2 rounded-md transition-all whitespace-nowrap cursor-pointer ${currentMode === 'seller'
                    ? 'bg-background shadow-sm text-foreground font-medium'
                    : 'text-muted-foreground hover:bg-background/50 hover:text-foreground'
                    }`}
            >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                {t('seller')}
            </button>
            <button
                onClick={() => onChangeMode('messages')}
                className={`flex items-center px-4 py-2 rounded-md transition-all whitespace-nowrap cursor-pointer ${currentMode === 'messages'
                    ? 'bg-background shadow-sm text-foreground font-medium'
                    : 'text-muted-foreground hover:bg-background/50 hover:text-foreground'
                    }`}
            >
                <MessageSquare className="w-4 h-4 mr-2" />
                Messages
            </button>
            <button
                onClick={() => onChangeMode('profile')}
                className={`flex items-center px-4 py-2 rounded-md transition-all whitespace-nowrap cursor-pointer ${currentMode === 'profile'
                    ? 'bg-background shadow-sm text-foreground font-medium'
                    : 'text-muted-foreground hover:bg-background/50 hover:text-foreground'
                    }`}
            >
                <User className="w-4 h-4 mr-2" />
                {t('profile')}
            </button>
        </div>
    );
}
