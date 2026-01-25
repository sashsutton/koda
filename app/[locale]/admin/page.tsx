import { getAllUsers, getAllProducts } from "@/app/actions/admin";
import { AdminRestoreButton } from "@/app/components/admin/admin-restore-button";
import { AdminBanButton } from "@/app/components/admin/admin-ban-button";
import { AdminRoleButton } from "@/app/components/admin/admin-role-button";
import { AdminDeleteButton } from "@/app/components/admin/admin-delete-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { AdminProductTable } from "@/app/components/admin/admin-product-table";
import { Users, Package } from "lucide-react";
import { getTranslations, getFormatter } from "next-intl/server";

export default async function AdminDashboard() {
    const [users, products, t, format] = await Promise.all([
        getAllUsers(),
        getAllProducts(),
        getTranslations('Admin'),
        getFormatter()
    ]);

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
                                                {user.stripeConnectId && <span className="text-green-600 ml-2 font-semibold">({t('usersTable.seller')})</span>}
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
                            </tbody>
                        </table>
                    </div>
                </TabsContent>

                <TabsContent value="products">
                    <AdminProductTable products={products} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
