import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations('Legal');
    return {
        title: `${t('title')} - Koda`,
    };
}

export default async function LegalPage() {
    const t = await getTranslations('Legal');

    return (
        <div className="min-h-screen bg-background text-foreground py-16 pt-32">
            <div className="container mx-auto px-4 max-w-4xl space-y-12">
                <div className="space-y-4 text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight">{t('title')}</h1>
                    <p className="text-muted-foreground">{t('lastUpdated')}</p>
                </div>

                <div className="space-y-10 bg-card p-8 md:p-12 rounded-2xl border border-border/50 shadow-sm leading-relaxed">
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold">{t('editor.title')}</h2>
                        <p className="text-muted-foreground">{t('editor.content')}</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold">{t('host.title')}</h2>
                        <p className="text-muted-foreground">{t('host.content')}</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold">{t('contact.title')}</h2>
                        <p className="text-muted-foreground">{t('contact.content')}</p>
                    </section>
                </div>
            </div>
        </div>
    );
}
