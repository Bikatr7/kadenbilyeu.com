import Router from "./Router.tsx";

import {ChakraProvider, Container} from "@chakra-ui/react";

import theme from "./theme.ts"; 


function App() 
{
    // navbar and footer goes *around* the container
    return (
        <ChakraProvider theme={theme}>
            <Container maxW={'6xl'}>
                <Router/>
            </Container>

        </ChakraProvider>
    );
}

export default App;