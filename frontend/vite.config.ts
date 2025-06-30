// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file.

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => 
{

  if(mode === 'production') 
  {
    process.env.NODE_ENV = 'production';
  } 
  else 
  {
    process.env.NODE_ENV = 'development';
  }

  return {
    plugins: [react()],
    build: {
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: (id: string) => {
            // Vendor chunks - keep these separate for caching
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
                return 'react-vendor';
              }
              if (id.includes('@chakra-ui') || id.includes('@emotion')) {
                return 'chakra-vendor';
              }
              if (id.includes('react-helmet-async') || id.includes('framer-motion') ||
                  id.includes('react-markdown') || id.includes('react-syntax-highlighter') || 
                  id.includes('rehype') || id.includes('remark') ||
                  id.includes('jwt-decode') || id.includes('react-hook-form') || 
                  id.includes('react-lazy-load-image-component')) {
                return 'utility-vendor';
              }
              return 'vendor';
            }
            
            // Reduce chunk granularity - combine related pages
            if (id.includes('/pages/Blog')) {
              return 'blog-pages';
            }
            if (id.includes('/pages/')) {
              return 'app-pages';
            }
            
            // Combine all sections into fewer chunks
            if (id.includes('/sections/')) {
              return 'app-sections';
            }
            
            // Keep blog components separate as they're only loaded when needed
            if (id.includes('/components/Blog') || id.includes('/components/Login') || 
                id.includes('/components/MakePost') || id.includes('/components/EditPost') ||
                id.includes('/components/PostEditor')) {
              return 'blog-components';
            }
          }
        }
      },
      chunkSizeWarningLimit: 1000
    },
    server: {
      port: 5173, 
    },
  }
})
