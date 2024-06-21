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