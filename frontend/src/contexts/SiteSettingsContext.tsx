// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file.

// maintain allman bracket style for consistency

// react
import React, { createContext, useContext, useEffect, useState } from 'react';

// utils
import { authenticatedFetch, getURL } from '../utils';

interface SiteSettings {
    minimal_mode: boolean;
}

interface SiteSettingsContextType {
    settings: SiteSettings;
    isLoading: boolean;
    refreshSettings: () => Promise<void>;
    updateMinimalMode: (minimalMode: boolean) => Promise<void>;
}

const defaultSettings: SiteSettings = {
    minimal_mode: false,
};

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
    const [isLoading, setIsLoading] = useState(true);

    const refreshSettings = async () => {
        try {
            const response = await fetch(getURL('/site-settings'), {
                credentials: 'include'
            });

            if (response.ok) {
                setSettings(await response.json());
            }
        } catch (error) {
            console.error('Failed to fetch site settings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        refreshSettings();

        const interval = window.setInterval(refreshSettings, 30000);
        return () => window.clearInterval(interval);
    }, []);

    const updateMinimalMode = async (minimalMode: boolean) => {
        const response = await authenticatedFetch(getURL('/site-settings'), {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                minimal_mode: minimalMode,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to update site settings');
        }

        setSettings(await response.json());
    };

    return (
        <SiteSettingsContext.Provider value={{ settings, isLoading, refreshSettings, updateMinimalMode }}>
            {children}
        </SiteSettingsContext.Provider>
    );
}

export function useSiteSettings() {
    const context = useContext(SiteSettingsContext);

    if (context === undefined) {
        throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
    }

    return context;
}
