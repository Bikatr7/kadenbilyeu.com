// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file.

// maintain allman bracket style for consistency

// chakra-ui
import { Button, Flex, Heading, Image, Stack, Text, Box } from '@chakra-ui/react';

// icons and images
import { IconBrandGithub } from '@tabler/icons-react';

import face from '../../assets/images/personals/kadenbilyeu.webp';
import bikatr7Logo from '../../assets/images/personals/bikatr7_logo.webp';
import { useTheme } from '../../contexts/ThemeContext';
import { useSiteSettings } from '../../contexts/SiteSettingsContext';

import { keyframes } from '@emotion/react';

const scrollingTextKeyframes = keyframes`
  0% { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
`;

function Preface({ showContent, toggleContent }: { showContent: boolean, toggleContent: () => void }) {
    const { isRetro } = useTheme();
    const { settings, isLoading: settingsLoading } = useSiteSettings();
    const isMinimal = settingsLoading || settings.minimal_mode;

    const handleClick = () => {
        if (!showContent) {
            toggleContent();
        }
    };

    return (
        <Stack direction={{ base: 'column', md: 'row' }} bg="black" id="home" paddingTop={5} >
            <Flex
                p={8}
                flex={1}
                align="center"
                justify={isRetro ? "flex-start" : "center"}
            >
                <Stack spacing={6} w="full" maxW="xl">
                    <Heading fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }}>
                        <Text
                            as="span"
                            position="relative"
                            fontFamily={isRetro ? "'Press Start 2P', monospace" : "inherit"}
                            color={isRetro ? "purple.200" : "white"}
                        >
                            {isRetro ? "Bikatr7" : "Kaden Bilyeu"}
                        </Text>
                        <br />
                    </Heading>
                    {isRetro ? (
                        <Box
                            overflow="hidden"
                            width="100%"
                            position="relative"
                            border="2px solid"
                            borderColor="purple.400"
                            p={2}
                        >
                            <Text
                                fontSize={{ base: 'md', lg: 'lg' }}
                                color="purple.400"
                                fontFamily="'Press Start 2P', monospace"
                                whiteSpace="nowrap"
                                animation={`${scrollingTextKeyframes} 7s linear infinite`}
                                display="inline-block"
                            >
                                SYSTEM ONLINE: Welcome to a mediocre website
                            </Text>
                        </Box>
                    ) : (
                        <>
                            <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.500" lineHeight="tall">
                                Computer science senior at the University of Colorado Colorado Springs looking to utilize my skills in cyber, AI/ML, LLMs, data science, full stack and NER/NLP into software for real-world applications.
                            </Text>
                            <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.500" mb={4}>
                                Eligible for security clearance. Proud U.S. Citizen.
                            </Text>
                        </>
                    )}
                    <Stack direction={{ base: 'column', md: 'row' }} spacing={3} wrap="wrap" justifyContent={{ base: 'center', md: 'flex-start' }}>
                        {!isRetro && (
                            <>
                                <Button
                                    rounded="full"
                                    as="a"
                                    href={showContent ? "#aboutme" : undefined}
                                    onClick={handleClick}
                                    size="md"
                                    _hover={{ color: 'yellow', transform: 'scale(1.01)' }}
                                    _active={{ transform: 'scale(0.99)' }}
                                >
                                    More about me
                                </Button>
                                {!isMinimal && (
                                    <Button
                                        as="a"
                                        href="/portfolio"
                                        rounded="full"
                                        size="md"
                                        _hover={{ color: 'yellow', transform: 'scale(1.01)' }}
                                        _active={{ transform: 'scale(0.99)' }}
                                    >
                                        My Portfolio
                                    </Button>
                                )}
                            </>
                        )}
                        {!isMinimal && (
                            <Button
                                as="a"
                                href="/blog"
                                rounded={isRetro ? "none" : "full"}
                                border={isRetro ? "2px solid" : "none"}
                                borderColor={isRetro ? "purple.400" : "transparent"}
                                bg={isRetro ? "black" : undefined}
                                color={isRetro ? "purple.200" : undefined}
                                fontFamily={isRetro ? "'Press Start 2P', monospace" : "inherit"}
                                size="md"
                                _hover={{
                                    color: isRetro ? 'purple.400' : 'yellow',
                                    transform: 'scale(1.01)'
                                }}
                                _active={{ transform: 'scale(0.99)' }}
                            >
                                My Blog
                            </Button>
                        )}
                        <Button
                            as="a"
                            href="https://github.com/Bikatr7"
                            leftIcon={<IconBrandGithub />}
                            rounded={isRetro ? "none" : "full"}
                            border={isRetro ? "2px solid" : "none"}
                            borderColor={isRetro ? "purple.400" : "transparent"}
                            bg={isRetro ? "black" : undefined}
                            color={isRetro ? "purple.200" : undefined}
                            fontFamily={isRetro ? "'Press Start 2P', monospace" : "inherit"}
                            size="md"
                            _hover={{
                                color: isRetro ? 'purple.400' : 'yellow',
                                transform: 'scale(1.01)'
                            }}
                            _active={{ transform: 'scale(0.99)' }}
                        >
                            My Github
                        </Button>
                    </Stack>
                </Stack>
            </Flex>
            {!isRetro && (
                <Flex flex={1} direction="column" alignItems="center" justifyContent="center" p={8}>
                    <Stack spacing={6} align="center">
                        <Image
                            boxSize={400}
                            alt="Kaden Bilyeu's Profile Picture"
                            objectFit="cover"
                            src={face}
                            borderRadius="full"
                            border="3px solid"
                            borderColor="gray.600"
                        />
                    </Stack>
                </Flex>
            )}
            {isRetro && (
                <Flex
                    flex={1}
                    direction="column"
                    justifyContent={{ base: 'center', lg: 'flex-start' }}
                    alignItems={{ base: 'center', lg: 'flex-start' }}
                    pl={{ base: 0, lg: 8 }}
                    mt={24}
                    width={{ base: "100%", lg: "auto" }}
                >
                    <Box mb={6}>
                        <Image
                            boxSize={300}
                            alt="Bikatr7 Logo"
                            objectFit="cover"
                            src={bikatr7Logo}
                            border="2px solid"
                            borderColor="purple.400"
                        />
                    </Box>
                </Flex>
            )}
        </Stack>
    );
}

export default Preface;
