// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by a GNU General Public License v3.0
// license that can be found in the LICENSE file.

import { useEffect } from 'react';
import {
    Box,
    Button,
    Image,
    Flex,
    Heading,
    Stack,
    Text,
    IconButton,
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverArrow,
    PopoverCloseButton,
    PopoverHeader,
    PopoverBody
} from "@chakra-ui/react";
import { InfoOutlineIcon } from '@chakra-ui/icons';
import { IconBrandGithub, IconBrandTwitter, IconBrandLinkedin, IconMail } from '@tabler/icons-react';
import face from '../assets/images/kadenbilyeu.png';
import NamedDivider from '../components/NamedDivider';

function HomePage() {
    useEffect(() => {
        document.title = 'Kaden Bilyeu | Home';
    }, []);

    return (
        <Box bg="black" color="white" minHeight="100vh">
            <Preface />
            <NamedDivider name="Introduction" id="introduction" />
            <Introduction />
            <NamedDivider name="Projects" id="projects" />
            <NamedDivider name="Skills" id="skills" />
            <NamedDivider name="About Me" id="aboutme" />
        </Box>
    );
}

function Preface() {
    return (
        <Stack direction={{ base: 'column', md: 'row' }} bg="black">
            <Flex p={8} flex={1} align="center">
                <Stack spacing={6} w="full" maxW="xl">
                    <Popover>
                        <PopoverTrigger>
                            <IconButton
                                aria-label="Site Information"
                                icon={<InfoOutlineIcon />}
                                variant="ghost"
                                color="teal.500"
                            />
                        </PopoverTrigger>
                        <PopoverContent>
                            <PopoverArrow />
                            <PopoverCloseButton />
                            <PopoverHeader>Site Information</PopoverHeader>
                            <PopoverBody>
                                This site is currently under construction. Please check back periodically for updates. Thank you for your patience. For more information, visit https://github.com/Bikatr7/kadenbilyeu.com
                            </PopoverBody>
                        </PopoverContent>
                    </Popover>
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
                        <Button rounded="full" as="a" href="/aboutme" _hover={{ color: 'yellow' }}>
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

function Introduction() {
    return (
        <Box padding="5">
            <Text fontSize="md" marginBottom="4" color="gray.500">
                Welcome to my personal website! Below is some contact information, my socials, my skills, and my personal projects. Feel free to reach out to me if you have any questions or would like to collaborate on a project.
            </Text>
            <Text fontSize="md" marginBottom="4" color="gray.500">
                I'm also currently looking for internships and job opportunities in software development. If you need anyone in Colorado Springs or remotely, please reach out to me.
            </Text>
            <Stack direction={{ base: 'column', md: 'row' }} spacing={4} justifyContent="center">
                <Button as="a" href="mailto:kadenbilyeu@proton.me" leftIcon={<IconMail />} rounded="full" _hover={{ color: 'yellow' }}>
                    Email Me
                </Button>
                <Button as="a" href="https://linkedin.com/in/kadenbilyeu" leftIcon={<IconBrandLinkedin />} rounded="full" _hover={{ color: 'yellow' }}>
                    LinkedIn
                </Button>
                <Button as="a" href="https://twitter.com/kadenbilyeu0" leftIcon={<IconBrandTwitter />} rounded="full" _hover={{ color: 'yellow' }}>
                    Twitter
                </Button>
                <Button as="a" href="https://github.com/Bikatr7" leftIcon={<IconBrandGithub />} rounded="full" _hover={{ color: 'yellow' }}>
                    Github
                </Button>
            </Stack>
        </Box>
    );
}

export default HomePage;