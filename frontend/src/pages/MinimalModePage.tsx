// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file.

// maintain allman bracket style for consistency

// chakra-ui
import { Box, Button, Heading, Text, VStack } from "@chakra-ui/react";

// components
import EmbedSEO from '../components/EmbedSEO';

// contexts
import { useTheme } from '../contexts/ThemeContext';

function MinimalModePage() {
    const { isRetro } = useTheme();
    const email = "kadenbilyeu@proton.me";

    return (
        <Box
            bg="black"
            color={isRetro ? "purple.300" : "white"}
            minHeight="83vh"
            display="flex"
            alignItems="center"
            justifyContent="center"
            px={6}
            className={isRetro ? 'retro-mode' : ''}
        >
            <EmbedSEO
                title="Kaden Bilyeu"
                description="Contact Kaden Bilyeu for resume access."
            />
            <VStack spacing={5} textAlign="center" maxW="520px">
                <Heading
                    fontSize={{ base: "2xl", md: "3xl" }}
                    color={isRetro ? "purple.300" : "yellow"}
                    fontFamily={isRetro ? "'Press Start 2P', monospace" : "inherit"}
                >
                    {isRetro ? "CONTACT REQUIRED" : "Contact Required"}
                </Heading>
                <Text
                    fontSize={{ base: "md", md: "lg" }}
                    color={isRetro ? "purple.200" : "gray.300"}
                    fontFamily={isRetro ? "'Press Start 2P', monospace" : "inherit"}
                    lineHeight="1.8"
                >
                    Email me at {email} to request my resume.
                </Text>
                <Button
                    as="a"
                    href={`mailto:${email}`}
                    rounded={isRetro ? "none" : "full"}
                    border={isRetro ? "2px solid" : "none"}
                    borderColor={isRetro ? "purple.400" : "transparent"}
                    bg={isRetro ? "black" : undefined}
                    color={isRetro ? "purple.200" : undefined}
                    fontFamily={isRetro ? "'Press Start 2P', monospace" : "inherit"}
                    _hover={{
                        color: isRetro ? 'purple.400' : 'yellow',
                        transform: 'scale(1.01)'
                    }}
                    _active={{ transform: 'scale(0.99)' }}
                >
                    Email Me
                </Button>
            </VStack>
        </Box>
    );
}

export default MinimalModePage;
