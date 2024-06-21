// react
import { useEffect } from 'react';

// chakra-ui
import {
    AbsoluteCenter,
    Box,
    Button,
    Divider,
    Flex,
    Heading,
    Image,
    Stack,
    Text
} from "@chakra-ui/react";

// logos and images

// icons
import { IconBrandGithub } from '@tabler/icons-react';

// components

function HomePage() {

    useEffect(() => {
        document.title = 'Kakusui | Home';

    }, []);

    return (
        <Box>
            <Heading as="h1" size="xl">Welcome to Kakusui</Heading>
            <Text>This is a dummy page.</Text>
            <Button colorScheme="blue">Click me</Button>
        </Box>
    );
}

export default HomePage;