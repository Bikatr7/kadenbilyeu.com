// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file.

// maintain allman bracket style for consistency

// chakra-ui
import { Box, Button, Stack, Text } from "@chakra-ui/react";

// icons
import { IconBrandTwitter, IconBrandLinkedin, IconMail, IconBrandGithub } from '@tabler/icons-react';

// context
import { useTheme } from '../../contexts/ThemeContext';



function HomeIntroduction() {
    const { isRetro } = useTheme();

    return (
        <Box padding="5" position="relative">
            {isRetro ? (
                <Stack
                    direction={{ base: 'column', lg: 'row' }}
                    spacing={0}
                    align="flex-start"
                >
                    <Stack
                        spacing={6}
                        w="full"
                        maxW="xl"
                        align="flex-start"
                    >
                        <Text
                            fontSize="md"
                            marginBottom="4"
                            color="purple.400"
                            fontFamily="'Press Start 2P', monospace"
                            textAlign={{ base: 'center', lg: 'left' }}
                        >
                            Yo, my name's Bikatr7. Welcome to my personal website. Feel free to click the controller icon in the top right for something more professional.
                            <br /><br />
                            I'm a programmer, I mostly work on translation tech, and my current internship. I also go to school full time.
                            <br /><br />
                            Feel free to email me or contact me on twitter for any queries, also pretty much everything I do is open source so check out my github.
                        </Text>
                        <Stack
                            direction={{ base: 'column', md: 'row' }}
                            spacing={4}
                            justifyContent={{ base: 'center', lg: 'flex-start' }}
                            width={{ base: "100%", md: "auto" }}
                        >
                            <Button
                                as="a"
                                href="https://twitter.com/bikatr7"
                                leftIcon={<IconBrandTwitter />}
                                rounded="none"
                                border="2px solid"
                                borderColor="purple.400"
                                bg="black"
                                color="purple.200"
                                fontFamily="'Press Start 2P', monospace"
                                _hover={{
                                    color: 'purple.400',
                                    transform: 'scale(1.01)'
                                }}
                                _active={{ transform: 'scale(0.99)' }}
                            >
                                Twitter
                            </Button>
                            <Button
                                as="a"
                                href="mailto:bikatr7@proton.me"
                                leftIcon={<IconMail />}
                                rounded="none"
                                border="2px solid"
                                borderColor="purple.400"
                                bg="black"
                                color="purple.200"
                                fontFamily="'Press Start 2P', monospace"
                                _hover={{
                                    color: 'purple.400',
                                    transform: 'scale(1.01)'
                                }}
                                _active={{ transform: 'scale(0.99)' }}
                            >
                                Email
                            </Button>
                        </Stack>
                    </Stack>
                </Stack>
            ) : (
                <Stack spacing={6} align="flex-start">
                    <>
                        <Text
                            fontSize="md"
                            marginBottom="4"
                            color="gray.500"
                            textAlign="left"
                            pl={8}
                        >
                            Welcome to my personal website! Below are my personal projects, skills, some info about me and the site, and my contact info. If you want something more detailed, check out my portfolio page.
                        </Text>
                        <Text
                            fontSize="md"
                            marginBottom="4"
                            color="gray.500"
                            textAlign="left"
                            pl={8}
                        >
                            Feel free to reach out to me if you have any questions or would like to collaborate on a project.
                        </Text>
                        <Text
                            fontSize="md"
                            marginBottom="4"
                            color="gray.500"
                            textAlign="left"
                            pl={8}
                        >
                            I'm currently looking for New Graduate oppurtunites and a possible Fall 2025/Spring 2026 Internship. Please contact me if I interest you. Would be especially excited for any opportunities in the defense sector, startups, or anything cool involving AI.
                        </Text>
                    </>
                    <Stack
                        direction={{ base: 'column', md: 'row' }}
                        spacing={4}
                        justifyContent="center"
                        width="100%"
                    >
                        <Button as="a" href="mailto:kadenbilyeu@proton.me" leftIcon={<IconMail />} rounded="full" _hover={{ color: 'yellow', transform: 'scale(1.01)' }} _active={{ transform: 'scale(0.99)' }}>
                            Email Me
                        </Button>
                        <Button as="a" href="https://linkedin.com/in/kadenbilyeu" leftIcon={<IconBrandLinkedin />} rounded="full" _hover={{ color: 'yellow', transform: 'scale(1.01)' }} _active={{ transform: 'scale(0.99)' }}>
                            LinkedIn
                        </Button>
                        <Button
                            as="a"
                            href="https://twitter.com/bikatr7"
                            leftIcon={<IconBrandTwitter />}
                            rounded="full"
                            _hover={{
                                color: 'yellow',
                                transform: 'scale(1.01)'
                            }}
                            _active={{ transform: 'scale(0.99)' }}
                        >
                            Twitter
                        </Button>
                        <Button
                            as="a"
                            href="https://github.com/Bikatr7"
                            leftIcon={<IconBrandGithub />}
                            rounded="full"
                            _hover={{
                                color: 'yellow',
                                transform: 'scale(1.01)'
                            }}
                            _active={{ transform: 'scale(0.99)' }}
                        >
                            GitHub
                        </Button>
                    </Stack>
                </Stack>
            )}
        </Box>
    );
}

export default HomeIntroduction;