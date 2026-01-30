"use client";

import { useState } from "react";
import {
    createRefundRequest,
    processRefund,
    rejectRefund
} from "@/app/actions/refunds";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface RefundTableProps {
    purchases: any[];
    mode: 'all' | 'pending' | 'completed';
}

export function AdminRefundsTable({ purchases, mode }: RefundTableProps) {
    const [processing, setProcessing] = useState<string | null>(null);
    const t = useTranslations('Admin.refunds');

    const getStatusBadge = (status: string) => {
        const badges: Record<string, { bg: string; text: string; label: string }> = {
            pending: { bg: 'bg-yellow-500/10', text: 'text-yellow-500', label: t('statusPending') },
            approved: { bg: 'bg-blue-500/10', text: 'text-blue-500', label: t('statusApproved') },
            completed: { bg: 'bg-green-500/10', text: 'text-green-500', label: t('statusCompleted') },
            failed: { bg: 'bg-red-500/10', text: 'text-red-500', label: t('statusFailed') },
            rejected: { bg: 'bg-gray-500/10', text: 'text-gray-500', label: t('statusRejected') },
        };

        const badge = badges[status] || badges.pending;
        return (
            <span className={`px-2 py-1 rounded text-xs font-semibold ${badge.bg} ${badge.text}`}>
                {badge.label}
            </span>
        );
    };

    const handleProcessRefund = async (purchaseId: string) => {
        if (!confirm(t('confirmProcess'))) return;

        setProcessing(purchaseId);
        try {
            const result = await processRefund(purchaseId);
            toast.success(t('processSuccess'));
        } catch (error: any) {
            toast.error(error.message || t('processFailed'));
        } finally {
            setProcessing(null);
        }
    };

    const handleReject = async (purchaseId: string) => {
        const reason = prompt(t('rejectReasonPrompt'));
        if (!reason) return;

        setProcessing(purchaseId);
        try {
            await rejectRefund(purchaseId, reason);
            toast.success(t('rejectSuccess'));
        } catch (error: any) {
            toast.error(error.message || t('rejectFailed'));
        } finally {
            setProcessing(null);
        }
    };

    if (purchases.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                {t('noRefunds')}
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead>
                    <tr className="border-b">
                        <th className="p-4 text-left">{t('product')}</th>
                        <th className="p-4 text-left">{t('buyer')}</th>
                        <th className="p-4 text-left">{t('seller')}</th>
                        <th className="p-4 text-left">{t('amount')}</th>
                        <th className="p-4 text-left">{t('status')}</th>
                        <th className="p-4 text-left">{t('reason')}</th>
                        <th className="p-4 text-left">{t('date')}</th>
                        {mode === 'pending' && <th className="p-4 text-left">{t('actions')}</th>}
                    </tr>
                </thead>
                <tbody>
                    {purchases.map((purchase) => (
                        <tr key={purchase._id} className="border-b hover:bg-muted/50">
                            <td className="p-4">
                                <div className="font-medium">{purchase.productId?.title || 'N/A'}</div>
                                <div className="text-xs text-muted-foreground">
                                    {purchase.productId?.category || ''}
                                </div>
                            </td>
                            <td className="p-4 text-sm">{purchase.buyerId}</td>
                            <td className="p-4 text-sm">{purchase.sellerId}</td>
                            <td className="p-4 font-semibold">€{purchase.amount}</td>
                            <td className="p-4">{getStatusBadge(purchase.refundStatus)}</td>
                            <td className="p-4 text-sm max-w-xs truncate">
                                {purchase.refundReason || '-'}
                            </td>
                            <td className="p-4 text-sm">
                                {purchase.refundedAt
                                    ? new Date(purchase.refundedAt).toLocaleDateString()
                                    : new Date(purchase.createdAt).toLocaleDateString()
                                }
                            </td>
                            {mode === 'pending' && (
                                <td className="p-4">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleProcessRefund(purchase._id)}
                                            disabled={processing === purchase._id}
                                            className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm disabled:opacity-50"
                                        >
                                            {processing === purchase._id ? t('processing') : t('approve')}
                                        </button>
                                        <button
                                            onClick={() => handleReject(purchase._id)}
                                            disabled={processing === purchase._id}
                                            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm disabled:opacity-50"
                                        >
                                            {t('reject')}
                                        </button>
                                    </div>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
