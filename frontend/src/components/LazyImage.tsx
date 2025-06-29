// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file.

// maintain allman bracket style for consistency

// react
import { useState, useRef, useEffect } from 'react';

// chakra-ui
import { Image, Box, Spinner } from "@chakra-ui/react";

interface LazyImageProps {
  src: string;
  alt: string;
  placeholder?: string;
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  loading?: 'lazy' | 'eager';
  [key: string]: any;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  placeholder,
  width,
  height,
  borderRadius,
  loading = 'lazy',
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    setError(false);
  };

  const handleError = () => {
    setError(true);
    setIsLoaded(false);
  };

  return (
    <Box
      ref={imgRef}
      width={width}
      height={height}
      position="relative"
      display="inline-block"
      borderRadius={borderRadius}
      overflow="hidden"
      {...props}
    >
      {!isLoaded && !error && isInView && (
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          zIndex={2}
        >
          <Spinner size="md" color="gray.500" />
        </Box>
      )}
      
      {placeholder && !isInView && (
        <Image
          src={placeholder}
          alt={`${alt} placeholder`}
          width={width}
          height={height}
          borderRadius={borderRadius}
          filter="blur(5px)"
          {...props}
        />
      )}

      {isInView && (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          borderRadius={borderRadius}
          loading={loading}
          onLoad={handleLoad}
          onError={handleError}
          opacity={isLoaded ? 1 : 0}
          transition="opacity 0.3s ease-in-out"
          {...props}
        />
      )}
      
      {error && (
        <Box
          width={width}
          height={height}
          bg="gray.200"
          display="flex"
          alignItems="center"
          justifyContent="center"
          borderRadius={borderRadius}
          color="gray.500"
          fontSize="sm"
        >
          Failed to load image
        </Box>
      )}
    </Box>
  );
};

export default LazyImage;