// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file.

// react
import { useState} from 'react';

// chakra-ui
import { ChakraProvider, Container, Box } from "@chakra-ui/react";

// root components
import Router from "./Router.tsx";
import theme from "./theme.ts";

// custom components
import Navbar from "./components/Navbar.tsx";
import Footer from "./components/Footer.tsx";
import LoadingAnimation from "./components/LoadingAnimation.tsx";

function App() 
{
    const [isLoading, setIsLoading] = useState(true);

    const handleLoadingComplete = () => {
        setIsLoading(false);
    };

    return (
        <ChakraProvider theme={theme}>
            <Box bg="black" minH="100vh">
                {isLoading && <LoadingAnimation onLoadingComplete={handleLoadingComplete} />}
                {!isLoading && (
                    <>
                        <Navbar/>
                        <Container maxW={'6xl'}>
                            <Router/>
                        </Container>
                        <Footer/>
                    </>
                )}
            </Box>
        </ChakraProvider>
    );
}

export default App;
