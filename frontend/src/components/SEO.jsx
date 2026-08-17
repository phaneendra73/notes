import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function SEO({
  title = 'Notes — Phaneendra Marri',
  description = 'Interactive notes, mental models, and deep dives into core engineering concepts.',
  image = 'https://avatars.githubusercontent.com/u/118047850?s=96&v=4',
  article = false,
  author = 'Phaneendra Marri',
  publishedTime,
  tags = [],
}) {
  const siteName = 'Notes';
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;

  const jsonLd = article
    ? {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: title,
        image: [image],
        datePublished: publishedTime,
        author: {
          '@type': 'Person',
          name: author,
        },
        publisher: {
          '@type': 'Organization',
          name: siteName,
        },
        description,
        keywords: tags.join(', '),
      }
    : null;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />

      <meta property="og:type" content={article ? 'article' : 'website'} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={siteName} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
}
