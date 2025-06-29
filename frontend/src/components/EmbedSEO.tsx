// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file.

// maintain allman bracket style for consistency

// helmet
import { Helmet } from 'react-helmet-async';

interface EmbedSEOProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'article' | 'website' | string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
  locale?: string;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
}

const EmbedSEO = ({
  title,
  description,
  image,
  url = typeof window !== 'undefined' ? window.location.href : undefined,
  type = 'website',
  author,
  publishedTime,
  modifiedTime,
  tags,
  locale = 'en_US',
  imageAlt,
  imageWidth = 1200,
  imageHeight = 630,
}: EmbedSEOProps) => {

  // Determine site context & alternate domain FIRST
  const host = typeof window !== 'undefined' ? window.location.hostname : '';
  const isBikatr7 = host.includes('bikatr7');
  const siteName = isBikatr7 ? 'Bikatr7' : 'Kaden Bilyeu';
  const otherDomain = isBikatr7 ? 'kadenbilyeu.com' : 'bikatr7.com';
  const otherUrl = url ? url.replace(host, otherDomain) : undefined;

  // Build JSON-LD after variables exist
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': type === 'article' ? 'Article' : 'WebPage',
    name: title,
    headline: title,
    description,
    url,
    ...(image ? {
      image: {
        '@type': 'ImageObject',
        url: image,
        ...(imageAlt ? { caption: imageAlt } : {}),
        width: imageWidth,
        height: imageHeight,
      },
    } : {}),
    ...(type === 'article'
      ? {
        ...(author
          ? {
            author: {
              '@type': 'Person',
              name: author,
              url: isBikatr7
                ? 'https://github.com/Bikatr7'
                : 'https://kadenbilyeu.com',
            },
          }
          : {}),
        ...(publishedTime ? { datePublished: publishedTime } : {}),
        ...(modifiedTime ? { dateModified: modifiedTime } : {}),
        ...(tags ? { keywords: tags.join(', ') } : {}),
        publisher: {
          '@type': 'Person',
          name: siteName,
          url: isBikatr7 ? 'https://bikatr7.com' : 'https://kadenbilyeu.com',
        },
      }
      : {}),
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="language" content="en" />
      <meta name="author" content={author || siteName} />
      {tags && <meta name="keywords" content={tags.join(', ')} />}

      {/* Canonical */}
      {url && <link rel="canonical" href={url} />}

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:locale" content={locale} />
      {url && <meta property="og:url" content={url} />}
      {image && (
        <>
          <meta property="og:image" content={image} />
          <meta property="og:image:width" content={imageWidth.toString()} />
          <meta property="og:image:height" content={imageHeight.toString()} />
          {imageAlt && <meta property="og:image:alt" content={imageAlt} />}
        </>
      )}
      <meta property="og:site_name" content={siteName} />
      {type === 'article' && (
        <>
          {author && <meta property="article:author" content={author} />}
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          {tags && tags.map(tag => <meta key={tag} property="article:tag" content={tag} />)}
        </>
      )}

      {/* Alternate domain link for dual-site canonicalization */}
      {otherUrl && <link rel="alternate" href={otherUrl} />}

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:site" content={isBikatr7 ? "@Bikatr7" : "@KadenBilyeu"} />
      <meta name="twitter:creator" content={isBikatr7 ? "@Bikatr7" : "@KadenBilyeu"} />
      {image && (
        <>
          <meta name="twitter:image" content={image} />
          {imageAlt && <meta name="twitter:image:alt" content={imageAlt} />}
        </>
      )}

      {/* Structured Data */}
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
};

export default EmbedSEO;

