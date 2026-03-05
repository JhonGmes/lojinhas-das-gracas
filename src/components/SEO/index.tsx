import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: 'website' | 'product' | 'article';
    jsonLd?: any;
}

export function SEO({
    title,
    description,
    image,
    url,
    type = 'website',
    jsonLd
}: SEOProps) {
    const siteName = 'Lojinha das Graças';
    const fullTitle = title ? `${title} | ${siteName}` : siteName;
    const defaultDescription = 'Encontre os melhores tesouros e artigos religiosos na Lojinha das Graças.';
    const siteUrl = 'https://lojinha-das-gracas.vercel.app';
    const ogUrl = url || window.location.href;
    const ogImage = image || `${siteUrl}/og-image.jpg`;

    return (
        <Helmet>
            {/* Basic Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="description" content={description || defaultDescription} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={ogUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description || defaultDescription} />
            <meta property="og:image" content={ogImage} />
            <meta property="og:site_name" content={siteName} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={ogUrl} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description || defaultDescription} />
            <meta name="twitter:image" content={ogImage} />

            {/* Canonical Link */}
            <link rel="canonical" href={ogUrl} />

            {/* Structured Data */}
            {jsonLd && (
                <script type="application/ld+json">
                    {JSON.stringify(jsonLd)}
                </script>
            )}
        </Helmet>
    );
}
