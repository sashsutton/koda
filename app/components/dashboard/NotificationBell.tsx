"use client";

import { useEffect, useState } from "react";
import { Bell, Check, MessageSquare, ShoppingBag, Star, Package, Trash2, Trash } from "lucide-react";
import {
    getNotifications,
    getUnreadNotificationCount,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    deleteNotification,
    deleteAllNotifications,
    INotificationData
} from "@/app/actions/notifications";
import { Link, useRouter } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { Button } from "@/app/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/app/components/ui/popover";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/app/components/ui/dialog";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { enUS, fr, es, de } from "date-fns/locale";
import { useLocale, useTranslations } from "next-intl";

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<INotificationData[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showClearConfirm, setShowClearConfirm] = useState(false);
    const locale = useLocale();
    const router = useRouter();
    const t = useTranslations();

    const getDateLocale = () => {
        switch (locale) {
            case 'fr': return fr;
            case 'es': return es;
            case 'de': return de;
            default: return enUS;
        }
    };

    const fetchNotifications = async () => {
        try {
            const [data, count] = await Promise.all([
                getNotifications(10),
                getUnreadNotificationCount()
            ]);
            setNotifications(data);
            setUnreadCount(count);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    // Initial load & Polling
    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 10000);
        return () => clearInterval(interval);
    }, []);

    // Refresh when opening popover
    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    const handleMarkAllRead = async () => {
        setIsLoading(true);
        try {
            await markAllNotificationsAsRead();
            await fetchNotifications();
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearAllClick = () => {
        setShowClearConfirm(true);
    };

    const confirmClearAll = async () => {
        setShowClearConfirm(false);
        setIsDeleting(true);
        // Optimistic update
        setNotifications([]);
        setUnreadCount(0);

        try {
            await deleteAllNotifications();
            await fetchNotifications(); // Sync with server
        } catch (error) {
            console.error("Failed to clear notifications", error);
            fetchNotifications(); // Revert on error
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDelete = async (e: React.MouseEvent, notificationId: string) => {
        e.stopPropagation();
        // Optimistic update
        setNotifications(prev => prev.filter(n => n._id !== notificationId));
        setUnreadCount(prev => {
            // If we deleted an unread notification, decrease count
            const notification = notifications.find(n => n._id === notificationId);
            if (notification && !notification.read) return Math.max(0, prev - 1);
            return prev;
        });

        try {
            await deleteNotification(notificationId);
        } catch (error) {
            console.error("Failed to delete notification", error);
            fetchNotifications(); // Revert
        }
    };

    const handleNotificationClick = async (notification: INotificationData) => {
        if (!notification.read) {
            await markNotificationAsRead(notification._id);
            setUnreadCount(prev => Math.max(0, prev - 1));
            setNotifications(prev => prev.map(n => n._id === notification._id ? { ...n, read: true } : n));
        }
        setIsOpen(false);
        router.push(notification.link);
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'MESSAGE': return <MessageSquare className="w-4 h-4 text-blue-500" />;
            case 'SALE': return <ShoppingBag className="w-4 h-4 text-green-500" />;
            case 'ORDER': return <Package className="w-4 h-4 text-orange-500" />;
            case 'REVIEW': return <Star className="w-4 h-4 text-yellow-500" />;
            default: return <Bell className="w-4 h-4 text-gray-500" />;
        }
    };

    // Helper to handle legacy keys in DB (notifications.x vs Notifications.x)
    const normalizeKey = (key: string) => {
        if (!key) return key;
        if (key.startsWith('notifications.')) {
            return 'Notifications.' + key.substring(14);
        }
        return key;
    };

    return (
        <>
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                        <Bell className="w-5 h-5 text-muted-foreground" />
                        {unreadCount > 0 && (
                            <span className={cn(
                                "absolute top-1 right-1 flex items-center justify-center min-w-[16px] h-[16px] px-0.5",
                                "text-[10px] font-bold text-white bg-red-500 rounded-full ring-2 ring-background",
                                "animate-in zoom-in duration-300"
                            )}>
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                    <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
                        <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-sm">{t('Notifications.center.title')}</h4>
                            {notifications.length > 0 && (
                                <button
                                    onClick={handleClearAllClick}
                                    disabled={isDeleting}
                                    title={t('Notifications.center.clearAll')}
                                    className="text-muted-foreground hover:text-red-500 transition-colors cursor-pointer"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                disabled={isLoading}
                                className="text-xs text-primary hover:text-primary/80 transition-colors disabled:opacity-50 font-medium cursor-pointer"
                            >
                                {t('Notifications.center.markAllRead')}
                            </button>
                        )}
                    </div>
                    <ScrollArea className="h-[300px]">
                        {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground p-4 text-center">
                                <Bell className="w-8 h-8 mb-2 opacity-20" />
                                <p className="text-sm">{t('Notifications.center.empty')}</p>
                            </div>
                        ) : (
                            <div className="flex flex-col">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification._id}
                                        className={cn(
                                            "group relative flex items-start gap-3 p-4 text-left hover:bg-muted/50 transition-colors border-b last:border-0 cursor-pointer",
                                            !notification.read && "bg-muted/20"
                                        )}
                                        onClick={() => handleNotificationClick(notification)}
                                    >
                                        <div className={cn(
                                            "mt-1 p-2 rounded-full bg-background border shadow-sm flex-shrink-0",
                                            !notification.read && "border-primary/20"
                                        )}>
                                            {getIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 space-y-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className={cn("text-sm font-medium leading-none truncate", !notification.read && "text-primary")}>
                                                    {notification.titleKey ? t(normalizeKey(notification.titleKey), notification.params) : notification.title}
                                                </p>
                                                <span className="text-[10px] text-muted-foreground whitespace-nowrap flex-shrink-0">
                                                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: getDateLocale() })}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground line-clamp-2 break-words">
                                                {notification.messageKey ? t(normalizeKey(notification.messageKey), notification.params) : notification.message}
                                            </p>
                                        </div>

                                        {!notification.read && (
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary" />
                                        )}

                                        <button
                                            onClick={(e) => handleDelete(e, notification._id)}
                                            className="absolute right-2 top-2 p-1.5 opacity-0 group-hover:opacity-100 bg-background/80 hover:bg-red-50 hover:text-red-500 rounded-full transition-all shadow-sm border border-transparent hover:border-red-100 z-10 cursor-pointer"
                                            title={t('Notifications.center.delete')}
                                        >
                                            <Trash className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </PopoverContent>
            </Popover>

            <Dialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('Notifications.center.clearAll')}</DialogTitle>
                        <DialogDescription>
                            {t('Notifications.center.confirmClearAll')}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowClearConfirm(false)}>
                            {t('Common.cancel') || 'Cancel'}
                        </Button>
                        <Button variant="destructive" onClick={confirmClearAll}>
                            {t('Notifications.center.clearAll')}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
