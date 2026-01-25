import { getAllUsers, getAllProducts } from "@/app/actions/admin";
import { AdminRestoreButton } from "@/app/components/admin/admin-restore-button";
import { AdminTabs } from "@/app/components/admin/admin-tabs";
import { AdminBanButton } from "@/app/components/admin/admin-ban-button";
import { AdminRoleButton } from "@/app/components/admin/admin-role-button";
import { AdminDeleteButton } from "@/app/components/admin/admin-delete-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { AdminProductTable } from "@/app/components/admin/admin-product-table";
import { AdminSearch } from "@/app/components/admin/admin-search";
import { Users, Package } from "lucide-react";
import { getTranslations, getFormatter } from "next-intl/server";

export default async function AdminDashboard({
    searchParams,
}: {
    searchParams: Promise<{ userQ?: string; productQ?: string }>;
}) {
    // Dans Next.js 15+, searchParams est une Promise
    const params = await searchParams;
    const userSearch = params.userQ || "";
    const productSearch = params.productQ || "";

    const [users, products, t, format] = await Promise.all([
        getAllUsers(userSearch),
        getAllProducts(productSearch),
        getTranslations('Admin'),
        getFormatter()
    ]);

    // Préparation des traductions pour le client
    const translations = {
        tabs: {
            users: t('tabs.users'),
            products: t('tabs.products')
        },
        usersTable: {
            user: t('usersTable.user'),
            email: t('usersTable.email'),
            role: t('usersTable.role'),
            date: t('usersTable.date'),
            actions: t('usersTable.actions'),
            noName: t('usersTable.noName'),
            missingEmail: t('usersTable.missingEmail'),
            seller: t('usersTable.seller'),
            banned: t('usersTable.banned')
        },
        productsTable: {
            product: t('productsTable.product'),
            seller: t('productsTable.seller'),
            price: t('productsTable.price'),
            status: t('productsTable.status'),
            actions: t('productsTable.actions'),
            certified: t('productsTable.certified'),
            unverified: t('productsTable.unverified'),
            test: t('productsTable.test'),
            decertify: t('productsTable.decertify'),
            certify: t('productsTable.certify'),
            noProducts: t('productsTable.noProducts')
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold italic tracking-tight">{t('title')}</h1>
                <AdminRestoreButton />
            </div>

            <Tabs defaultValue="users" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8 max-w-md">
                    <TabsTrigger value="users" className="gap-2">
                        <Users className="w-4 h-4" /> {t('tabs.users')} ({users.length})
                    </TabsTrigger>
                    <TabsTrigger value="products" className="gap-2">
                        <Package className="w-4 h-4" /> {t('tabs.products')} ({products.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="users" className="space-y-4">
                    {/* Barre de recherche Utilisateurs */}
                    <AdminSearch type="users" />

                    <div className="bg-white dark:bg-gray-950 rounded-lg shadow overflow-x-auto">
                        <table className="w-full text-left min-w-[900px]">
                            <thead className="bg-gray-100 dark:bg-gray-900 border-b">
                                <tr>
                                    <th className="p-4">{t('usersTable.user')}</th>
                                    <th className="p-4">{t('usersTable.email')}</th>
                                    <th className="p-4">{t('usersTable.role')}</th>
                                    <th className="p-4">{t('usersTable.date')}</th>
                                    <th className="p-4 text-right">{t('usersTable.actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user: any) => (
                                    <tr key={user._id} className={`border-b hover:bg-gray-50 dark:hover:bg-gray-900 ${user.isBanned ? 'bg-red-50/50 dark:bg-red-900/10' : ''}`}>
                                        <td className="p-4 text-sm font-medium">
                                            <div className="font-medium text-base">
                                                {user.username || user.firstName ?
                                                    (user.username || `${user.firstName} ${user.lastName || ''}`) :
                                                    <span className="text-gray-400 italic">{t('usersTable.noName')}</span>
                                                }
                                            </div>
                                            <div className="text-xs text-gray-500 font-mono mt-1 opacity-70">
                                                {user.clerkId}
                                                {user.stripeConnectId && user.onboardingComplete && <span className="text-green-600 ml-2 font-semibold">({t('usersTable.seller')})</span>}
                                                {user.isBanned && <span className="text-red-600 ml-2 font-bold">[{t('usersTable.banned')}]</span>}
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm">
                                            {user.email ? (
                                                user.email
                                            ) : (
                                                <span className="text-orange-300 text-xs px-2 py-1 bg-orange-900/20 rounded">{t('usersTable.missingEmail')}</span>
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
                                            <AdminDeleteButton userId={user.clerkId} />
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
                    {/* Barre de recherche Produits */}
                    <AdminSearch type="products" />

                    <AdminProductTable products={products} />
                </TabsContent>
            </Tabs>
            <AdminTabs
                users={users}
                products={products}
                translations={translations}
            />
        </div>
    );
}