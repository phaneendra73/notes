import React from "react";
import { Helmet } from "react-helmet-async";

export default function SEO({
  title = "Kadha Notes — Personal Engineering Study Platform",
  description = "A personal engineering study hub to review concepts in C#, .NET Core, Data Structures & Algorithms, SQL, and System Design.",
  image = "https://avatars.githubusercontent.com/u/118047850?s=96&v=4",
  article = false,
  author = "Phaneendra",
  publishedTime,
  tags = [],
}) {
  const siteName = "Kadha Notes";
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;

  // JSON-LD structured data for articles
  const jsonLd = article
    ? {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: title,
        image: [image],
        datePublished: publishedTime,
        author: {
          "@type": "Person",
          name: author,
        },
        publisher: {
          "@type": "Organization",
          name: siteName,
          logo: {
            "@type": "ImageObject",
            url: "https://phaneendra73.github.io/kadha2.0/assets/kadha.svg",
          },
        },
        description,
        keywords: tags.join(", "),
      }
    : null;

  return (
    <Helmet>
      {/* Standard metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={article ? "article" : "website"} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* JSON-LD Article Schema */}
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
}
