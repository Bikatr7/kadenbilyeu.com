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
}

const EmbedSEO = ({ title, description, image, url }: EmbedSEOProps) =>
(
  <Helmet>
    {/* Basic Meta Tags */}
    <title>{title}</title>
    <meta name="description" content={description} />

    {/* Open Graph Meta Tags */}
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content="article" />
    {url && <meta property="og:url" content={url} />}
    {image && <meta property="og:image" content={image} />}
    <meta property="og:site_name" content="Kaden Bilyeu's Blog" />

    {/* Twitter Card Meta Tags */}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    {image && <meta name="twitter:image" content={image} />}
  </Helmet>
);

export default EmbedSEO;

