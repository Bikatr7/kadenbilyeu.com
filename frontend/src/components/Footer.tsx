// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file.

// maintain allman bracket style for consistency

// chakra-ui imports
import { Box, Container,Divider, Flex, IconButton, Image, Stack, Text } from '@chakra-ui/react';
import { useTheme } from '../contexts/ThemeContext';

// icons and images
import { IconBrandGithub, IconActivity } from '@tabler/icons-react';

// logo
import logo from '../assets/images/personals/kb.webp';

function Footer() 
{
    const { isRetro } = useTheme();
    const currentYear = new Date().getFullYear();

    return (
        <Box
            bg="black"
            color={isRetro ? "purple.200" : "white"}
            width="100%"
            position="relative"
            mt="auto"
            height="80px"
            className={isRetro ? 'retro-mode' : ''}
        >
            <Divider borderColor={isRetro ? "purple.600" : "gray.800"} />
            <Container
                as={Stack}
                maxW={'6xl'}
                py={4}
                direction={{ base: 'column', md: 'row' }}
                spacing={4}
                justify={{ base: 'space-between', md: 'space-between' }}
                align={{ base: 'center', md: 'center' }}>
                <Flex display={{ base: 'flex', md: 'none' }} width="100%" justify="space-between" align="center">
                    <Flex gap={2}>
                        <IconButton
                            as='a'
                            href='https://github.com/Bikatr7'
                            aria-label='Github'
                            icon={<IconBrandGithub />}
                            bg="transparent"
                            color={isRetro ? "purple.200" : "white"}
                            border={isRetro ? "2px solid" : "none"}
                            borderColor="purple.400"
                            borderRadius="none"
                            _hover={{
                                bg: 'transparent',
                                color: isRetro ? 'purple.400' : 'yellow',
                                transform: 'scale(1.1)'
                            }}
                        />
                        <IconButton
                            as='a'
                            href={isRetro ? 'https://status.bikatr7.com' : 'https://status.kadenbilyeu.com'}
                            aria-label='Status'
                            icon={<IconActivity />}
                            bg="transparent"
                            color={isRetro ? "purple.200" : "white"}
                            border={isRetro ? "2px solid" : "none"}
                            borderColor="purple.400"
                            borderRadius="none"
                            _hover={{
                                bg: 'transparent',
                                color: isRetro ? 'purple.400' : 'yellow',
                                transform: 'scale(1.1)'
                            }}
                        />
                    </Flex>
                    <Text
                        textAlign="center"
                        fontFamily={isRetro ? "'Press Start 2P', monospace" : "inherit"}
                        fontSize={isRetro ? { base: "10px", md: "xs" } : "inherit"}
                    >
                        © 2024-{currentYear} {isRetro ? 'Bikatr7' : 'Kaden Bilyeu (Bikatr7)'}. All rights reserved
                    </Text>
                    <Image src={logo} boxSize='30px' alt="Kaden Bilyeu (Bikatr7) Logo" />
                </Flex>
                <Flex display={{ base: 'none', md: 'flex' }} width="100%" justify="space-between" align="center">
                    <Image src={logo} boxSize='30px' alt="Kaden Bilyeu (Bikatr7) Logo" />
                    <Text
                        textAlign="center"
                        flex="1"
                        fontFamily={isRetro ? "'Press Start 2P', monospace" : "inherit"}
                        fontSize={isRetro ? "xs" : "inherit"}
                    >
                        © 2024-{currentYear} {isRetro ? 'Bikatr7' : 'Kaden Bilyeu (Bikatr7)'}. All rights reserved
                    </Text>
                    <Flex gap={2}>
                        <IconButton
                            as='a'
                            href='https://github.com/Bikatr7'
                            aria-label='Github'
                            icon={<IconBrandGithub />}
                            bg="transparent"
                            color={isRetro ? "purple.200" : "white"}
                            border={isRetro ? "2px solid" : "none"}
                            borderColor="purple.400"
                            borderRadius="none"
                            _hover={{
                                bg: 'transparent',
                                color: isRetro ? 'purple.400' : 'yellow',
                                transform: 'scale(1.1)'
                            }}
                        />
                        <IconButton
                            as='a'
                            href={isRetro ? 'https://status.bikatr7.com' : 'https://status.kadenbilyeu.com'}
                            aria-label='Status'
                            icon={<IconActivity />}
                            bg="transparent"
                            color={isRetro ? "purple.200" : "white"}
                            border={isRetro ? "2px solid" : "none"}
                            borderColor="purple.400"
                            borderRadius="none"
                            _hover={{
                                bg: 'transparent',
                                color: isRetro ? 'purple.400' : 'yellow',
                                transform: 'scale(1.1)'
                            }}
                        />
                    </Flex>
                </Flex>
            </Container>
        </Box>
    );
}

export default Footer;
