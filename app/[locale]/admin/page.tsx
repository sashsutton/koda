import { getAllUsers, getAllProducts } from "@/app/actions/admin";
import { AdminTabs } from "@/app/components/admin/admin-tabs";
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
        <div className="space-y-6 container mx-auto px-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-3xl font-bold italic tracking-tight">{t('title')}</h1>
            </div>

            {/* Marketing Card */}
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold mb-2">📧 Email Marketing & Notifications</h2>
                        <p className="text-muted-foreground text-sm">
                            Send bulk emails and notifications to your users with advanced filtering
                        </p>
                    </div>
                    <a
                        href="/admin/marketing"
                        className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                    >
                        Go to Marketing →
                    </a>
                </div>
            </div>

            <AdminTabs
                users={users}
                products={products}
                translations={translations}
            />
        </div>
    );
}
