// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by a GNU General Public License v3.0
// license that can be found in the LICENSE file.

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

import { Tooltip, IconButton } from '@chakra-ui/react';
import { InfoOutlineIcon } from '@chakra-ui/icons';
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
                    <Tooltip 
                        label="This site is currently under construction. Please check back periodically for updates. Thank you for your patience. For more information: https://github.com/Bikatr7/kadenbilyeu.com" 
                        fontSize="md"
                        placement="top-start"
                        hasArrow
                    >
                        <IconButton
                            aria-label="Site Information"
                            icon={<InfoOutlineIcon />}
                            variant="ghost"
                            color="teal.500"
                        />
                    </Tooltip>
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