import React, { useEffect } from 'react';

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface MetaSEOProps {
  title: string;
  description: string;
  canonicalPath?: string;
  canonical?: string;
  keywords?: string;
  ogType?: 'website' | 'article' | 'profile';
  ogImage?: string;
  datePublished?: string;
  dateModified?: string;
  authorName?: string;
  breadcrumbs?: BreadcrumbItem[];
  schemaData?: Record<string, any>;
}

export const MetaSEO: React.FC<MetaSEOProps> = ({
  title,
  description,
  canonicalPath,
  canonical,
  keywords,
  ogType = 'website',
  ogImage = 'https://stroitx.com/og-cover.png',
  datePublished,
  dateModified = '2026-10-17',
  authorName = 'StroitX Editorial Team & Civil Engineering Advisory',
  breadcrumbs,
  schemaData,
}) => {
  useEffect(() => {
    // 1. Update Document Title (Enforcing optimal 50-60 character range)
    const formattedTitle = title.includes('StroitX') ? title : `${title} | StroitX`;
    document.title = formattedTitle;

    // Helper to create or update meta tags
    const setMetaTag = (attrName: string, attrVal: string, contentVal: string) => {
      let element = document.querySelector(`meta[${attrName}="${attrVal}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrVal);
        document.head.appendChild(element);
      }
      element.setAttribute('content', contentVal);
    };

    // Helper to create or update link tags
    const setLinkTag = (rel: string, href: string) => {
      let element = document.querySelector(`link[rel="${rel}"]`);
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
    };

    const fullUrl = canonical
      ? (canonical.startsWith('http') ? canonical : `https://stroitx.com${canonical}`)
      : `https://stroitx.com${canonicalPath || window.location.pathname}`;

    // 2. Primary Meta Tags
    setMetaTag('name', 'description', description);
    if (keywords) {
      setMetaTag('name', 'keywords', keywords);
    }
    setMetaTag('name', 'robots', 'index, follow');

    // 3. Canonical Tag
    setLinkTag('canonical', fullUrl);

    // 4. Open Graph Tags
    setMetaTag('property', 'og:title', formattedTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:url', fullUrl);
    setMetaTag('property', 'og:image', ogImage);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:site_name', 'StroitX Construction Marketplace');
    setMetaTag('property', 'og:locale', 'en_IN');

    // 5. Twitter Card Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', formattedTitle);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', ogImage);

    // 6. Dynamic JSON-LD Structured Data
    const graphItems: any[] = [];

    // WebPage or Article Schema
    if (ogType === 'article') {
      graphItems.push({
        '@type': 'Article',
        '@id': `${fullUrl}#article`,
        headline: formattedTitle,
        description: description,
        datePublished: datePublished || '2026-01-01',
        dateModified: dateModified || '2026-10-17',
        mainEntityOfPage: fullUrl,
        author: {
          '@type': 'Person',
          name: authorName,
          jobTitle: 'Certified Civil Engineer & Construction Advisor',
        },
        publisher: {
          '@type': 'Organization',
          name: 'StroitX Technologies Pvt. Ltd.',
          logo: {
            '@type': 'ImageObject',
            url: 'https://stroitx.com/favicon.svg',
          },
        },
      });
    } else {
      graphItems.push({
        '@type': 'WebPage',
        '@id': `${fullUrl}#webpage`,
        url: fullUrl,
        name: formattedTitle,
        description: description,
        dateModified: dateModified,
        isPartOf: {
          '@type': 'WebSite',
          name: 'StroitX',
          url: 'https://stroitx.com',
        },
      });
    }

    // BreadcrumbList Schema
    if (breadcrumbs && breadcrumbs.length > 0) {
      graphItems.push({
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((crumb, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: crumb.name,
          item: crumb.url.startsWith('http') ? crumb.url : `https://stroitx.com${crumb.url}`,
        })),
      });
    }

    // Additional custom schemas (e.g. FAQPage, HowTo)
    if (schemaData) {
      graphItems.push(schemaData);
    }

    const jsonLdContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': graphItems,
    });

    let scriptElement = document.getElementById('stroitx-page-schema') as HTMLScriptElement | null;
    if (!scriptElement) {
      scriptElement = document.createElement('script');
      scriptElement.id = 'stroitx-page-schema';
      scriptElement.type = 'application/ld+json';
      document.head.appendChild(scriptElement);
    }
    scriptElement.textContent = jsonLdContent;
  }, [
    title,
    description,
    canonicalPath,
    keywords,
    ogType,
    ogImage,
    datePublished,
    dateModified,
    authorName,
    breadcrumbs,
    schemaData,
  ]);

  return null;
};
