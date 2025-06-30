// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file.

// maintain allman bracket style for consistency

// react
import { useState } from 'react';

// chakra-ui
import { ChakraProvider, Box } from "@chakra-ui/react";

// helmet
import { HelmetProvider } from 'react-helmet-async';

// root components
import theme from "./theme.ts";

// custom components
import LoadingAnimation from './components/LoadingAnimation.tsx';
import GlobalSEO from './components/GlobalSEO.tsx';

import Router from './Router.tsx';
import { ThemeProvider } from './contexts/ThemeContext';
import { isBikatr7URL } from './utils';

function App() {
    const [isLoading, setIsLoading] = useState(true);
    const [showContent, setShowContent] = useState(false);
    const [contentLoaded, setContentLoaded] = useState(false);
    const isBikatr7 = isBikatr7URL();

    const handleLoadingComplete = () => {
        setIsLoading(false);
    };

    const toggleContent = () => {
        setShowContent(!showContent);
        if (!contentLoaded) {
            setContentLoaded(true);
        }
    };

    return (
        <ThemeProvider>
            <HelmetProvider>
                <ChakraProvider theme={theme}>
                    <GlobalSEO />
                    <Box bg="black" minH="100vh" display="flex" flexDirection="column">
                        {!isBikatr7 && isLoading && <LoadingAnimation onLoadingComplete={handleLoadingComplete} />}
                        {(isBikatr7 || !isLoading) && (
                            <Router
                                showContent={showContent}
                                toggleContent={toggleContent}
                                contentLoaded={contentLoaded}
                            />
                        )}
                    </Box>
                </ChakraProvider>
            </HelmetProvider>
        </ThemeProvider>
    );
}

export default App;