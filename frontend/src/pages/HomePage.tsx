import { useEffect } from 'react';
import {
    AbsoluteCenter,
    Box,
    Button,
    Divider,
    Flex,
    Heading,
    Stack,
    Text
} from "@chakra-ui/react";

function HomePage() {
    useEffect(() => {
        document.title = 'Kaden Bilyeu | Home';
    }, []);

    return (
        <>
            <Flex
                direction={{ base: 'column', md: 'row' }}
                align="center"
                justify="center"
                minH="100vh"
                bg="black"
                color="silver"
                textAlign="center"
                px={4}
            >
                <Stack spacing={6} maxW="xl" align="center">
                    <Heading fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }}>
                        Welcome to Kakusui
                    </Heading>
                    <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.300">
                        This is a dummy page.
                    </Text>
                    <Button colorScheme="yellow" bg="yellow.500" color="black" _hover={{ bg: "yellow.400" }}>
                        Click me
                    </Button>
                </Stack>
            </Flex>
        </>
    );
}

export default HomePage;