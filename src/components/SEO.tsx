import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title: string;
    description: string;
    image?: string;
    url?: string;
    type?: 'website' | 'product' | 'article';
    jsonLd?: any;
}

export function SEO({ title, description, image, url, type = 'website', jsonLd }: SEOProps) {
    const siteName = 'Lojinha das Graças';
    const currentUrl = url || window.location.href;
    const defaultImage = 'https://images.unsplash.com/photo-1544764200-d834fd210a23?auto=format&fit=crop&q=80&w=1200'; // Uma imagem digna padrão

    return (
        <Helmet>
            {/* Standard tags */}
            <title>{title} | {siteName}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={currentUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={currentUrl} />
            <meta property="og:title" content={`${title} | ${siteName}`} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image || defaultImage} />
            <meta property="og:site_name" content={siteName} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={currentUrl} />
            <meta name="twitter:title" content={`${title} | ${siteName}`} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={image || defaultImage} />

            {/* JSON-LD Structured Data */}
            {jsonLd && (
                <script type="application/ld+json">
                    {JSON.stringify(jsonLd)}
                </script>
            )}
        </Helmet>
    );
}
