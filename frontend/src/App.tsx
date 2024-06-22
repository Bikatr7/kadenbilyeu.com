// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by a GNU General Public License v3.0
// license that can be found in the LICENSE file.

import Router from "./Router.tsx";

import {ChakraProvider, Container} from "@chakra-ui/react";

import theme from "./theme.ts"; 

import Navbar from "./components/Navbar.tsx";
import Footer from "./components/Footer.tsx";

function App() 
{
    return (
        <ChakraProvider theme={theme}>
            <Navbar/>
            <Container maxW={'6xl'}>
                <Router/>
            </Container>
            <Footer/>

        </ChakraProvider>
    );
}

export default App;