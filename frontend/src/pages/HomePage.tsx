import { useEffect } from 'react';
import {
    AbsoluteCenter,
    Box,
    Button,
    Image,
    Divider,
    Flex,
    Heading,
    Stack,
    Text
} from "@chakra-ui/react";

import { IconBrandGithub } from '@tabler/icons-react';

import face from '../assets/images/kadenbilyeu.png';

function HomePage() {
    useEffect(() => {
        document.title = 'Kaden Bilyeu | Home';
    }, []);

    return (
        <Box bg="black" color="white" minHeight="100vh">
            <Preface />
            <Box position="relative" padding="10">
                <Divider />
                <AbsoluteCenter bg="black" px="4" id="introduction">
                    Introduction
                </AbsoluteCenter>
            </Box>
        </Box>
    );
}

function Preface() {
    return (
        <Stack direction={{ base: 'column', md: 'row' }} bg="black">
            <Flex p={8} flex={1} align="center">
                <Stack spacing={6} w="full" maxW="xl">
                    <Heading fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }}>
                        <Text as="span" position="relative">
                            Kaden Bilyeu
                        </Text>
                        <br />
                    </Heading>
                    <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.500">
                        Computer science student at UCCS focusing on incorporating AI, LLMs, data science, and NER/NLP into software for real-world applications.
                    </Text>
                    <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
                        <Button rounded="full" as="a" href="#introduction" _hover={{ color: 'yellow' }}>
                            More about me
                        </Button>
                        <Button as="a" href="https://github.com/Bikatr7" leftIcon={<IconBrandGithub />} rounded="full" _hover={{ color: 'yellow' }}>
                            My Github
                        </Button>
                    </Stack>
                </Stack>
            </Flex>
            <Flex flex={1}>
                <Image boxSize={400} alt="Kaden Bilyeu's Profile Picture" objectFit="cover" src={face} />
            </Flex>
        </Stack>
    );
}

export default HomePage;