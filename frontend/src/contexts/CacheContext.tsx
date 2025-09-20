// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file.

// maintain allman bracket style for consistency

// react
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface CacheItem {
    data: any;
    timestamp: number;
    expiry: number;
}

interface CacheContextType {
    getCache: (key: string) => any | null;
    setCache: (key: string, data: any, expiryMs: number) => void;
    clearCache: (key?: string) => void;
}

const CacheContext = createContext<CacheContextType | undefined>(undefined);

export const CacheProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [cache, setCache] = useState<Map<string, CacheItem>>(new Map());

    const getCache = useCallback((key: string): any | null => {
        const item = cache.get(key);
        if (!item) return null;

        if (Date.now() > item.timestamp + item.expiry) {
            cache.delete(key);
            setCache(new Map(cache));
            return null;
        }

        return item.data;
    }, [cache]);

    const setCacheItem = useCallback((key: string, data: any, expiryMs: number) => {
        const newCache = new Map(cache);
        newCache.set(key, {
            data,
            timestamp: Date.now(),
            expiry: expiryMs
        });
        setCache(newCache);
    }, [cache]);

    const clearCache = useCallback((key?: string) => {
        if (key) {
            const newCache = new Map(cache);
            newCache.delete(key);
            setCache(newCache);
        } else {
            setCache(new Map());
        }
    }, [cache]);

    return (
        <CacheContext.Provider value={{ getCache, setCache: setCacheItem, clearCache }}>
            {children}
        </CacheContext.Provider>
    );
};

export const useCache = () => {
    const context = useContext(CacheContext);
    if (!context) {
        throw new Error('useCache must be used within a CacheProvider');
    }
    return context;
};