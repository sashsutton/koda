"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { AdminProductTable } from "@/app/components/admin/admin-product-table";
import { Users, Package, Mail } from "lucide-react";
import { AdminBanButton } from "@/app/components/admin/admin-ban-button";
import { AdminRoleButton } from "@/app/components/admin/admin-role-button";
import { AdminDeleteButton } from "@/app/components/admin/admin-delete-button";
import { AdminSearch } from "@/app/components/admin/admin-search"; // Import ajouté

import { useFormatter } from "next-intl";

interface AdminTabsProps {
    users: any[];
    products: any[];
    translations: {
        tabs: any;
        usersTable: any;
        productsTable: any;
    };
}

export function AdminTabs({ users, products, translations }: AdminTabsProps) {
    const [mounted, setMounted] = useState(false);
    const format = useFormatter();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="h-96 w-full animate-pulse bg-muted/20 rounded-xl" />;
    }

    // Helper simple pour accéder aux traductions imbriquées passées en props
    const t = (path: string, fallback: string) => {
        const keys = path.split('.');
        let val: any = translations;
        for (const k of keys) {
            val = val?.[k];
        }
        return val || fallback;
    }

    return (
        <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 max-w-2xl">
                <TabsTrigger value="users" className="gap-2">
                    <Users className="w-4 h-4" /> {translations.tabs.users} ({users.length})
                </TabsTrigger>
                <TabsTrigger value="products" className="gap-2">
                    <Package className="w-4 h-4" /> {translations.tabs.products} ({products.length})
                </TabsTrigger>
                <TabsTrigger value="marketing" className="gap-2">
                    <Mail className="w-4 h-4" /> Marketing
                </TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-4">
                {/* Barre de recherche ajoutée ici */}
                <AdminSearch type="users" />

                <div className="bg-white dark:bg-gray-950 rounded-lg shadow overflow-x-auto">
                    <table className="w-full text-left min-w-[900px]">
                        <thead className="bg-gray-100 dark:bg-gray-900 border-b">
                            <tr>
                                <th className="p-4">{translations.usersTable.user}</th>
                                <th className="p-4">{translations.usersTable.email}</th>
                                <th className="p-4">{translations.usersTable.role}</th>
                                <th className="p-4">{translations.usersTable.date}</th>
                                <th className="p-4 text-right">{translations.usersTable.actions}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user: any) => (
                                <tr key={user._id} className={`border-b hover:bg-gray-50 dark:hover:bg-gray-900 ${user.isBanned ? 'bg-red-50/50 dark:bg-red-900/10' : ''}`}>
                                    <td className="p-4 text-sm font-medium">
                                        <div className="font-medium text-base">
                                            {user.username || user.firstName ?
                                                (user.username || `${user.firstName} ${user.lastName || ''}`) :
                                                <span className="text-gray-400 italic">{translations.usersTable.noName}</span>
                                            }
                                        </div>
                                        <div className="text-xs text-gray-500 font-mono mt-1 opacity-70">
                                            {user.clerkId}
                                            {user.stripeConnectId && user.onboardingComplete && <span className="text-green-600 ml-2 font-semibold">({translations.usersTable.seller})</span>}
                                            {user.stripeConnectId && !user.onboardingComplete && <span className="text-yellow-600 ml-2 font-semibold text-xs bg-yellow-100 dark:bg-yellow-900/30 px-1 rounded">Stripe Pending</span>}
                                            {user.isBanned && <span className="text-red-600 ml-2 font-bold">[{translations.usersTable.banned}]</span>}
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm">
                                        {user.email ? (
                                            user.email
                                        ) : (
                                            <span className="text-orange-300 text-xs px-2 py-1 bg-orange-900/20 rounded">{translations.usersTable.missingEmail}</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${user.role === 'admin'
                                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300'
                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                                                }`}>
                                                {user.role}
                                            </span>
                                            <AdminBanButton
                                                userId={user.clerkId}
                                                initialIsBanned={user.isBanned}
                                                role={user.role}
                                            />
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-gray-500">
                                        {format.dateTime(new Date(user.createdAt), { year: 'numeric', month: 'numeric', day: 'numeric' })}
                                    </td>
                                    <td className="p-4 flex justify-end items-center gap-2">
                                        <AdminRoleButton
                                            userId={user.clerkId}
                                            initialRole={user.role}
                                        />
                                        <AdminDeleteButton userId={user.clerkId} role={user.role} />
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                                        Aucun utilisateur trouvé.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </TabsContent>

            <TabsContent value="products" className="space-y-4">
                {/* Barre de recherche ajoutée ici */}
                <AdminSearch type="products" />

                <AdminProductTable products={products} />
            </TabsContent>

            <TabsContent value="marketing" className="space-y-4">
                <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-8 text-center">
                    <div className="flex flex-col items-center gap-4">
                        <Mail className="w-12 h-12 text-purple-500" />
                        <div>
                            <h2 className="text-2xl font-bold mb-2">📧 Email Marketing & Notifications</h2>
                            <p className="text-muted-foreground mb-6">
                                Send bulk emails and notifications to your users with advanced filtering
                            </p>
                        </div>
                        <a
                            href="/admin/marketing"
                            className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
                        >
                            Open Marketing Dashboard →
                        </a>
                    </div>
                </div>
            </TabsContent>
        </Tabs>
    );
}