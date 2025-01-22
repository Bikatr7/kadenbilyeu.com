// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file.

// maintain allman bracket style for consistency

// chakra-ui
import { Box, Button, Stack, Text } from "@chakra-ui/react";

// icons
import { IconBrandGithub, IconBrandTwitter, IconBrandLinkedin, IconMail} from '@tabler/icons-react';

// context
import { useTheme } from '../../contexts/ThemeContext';

function HomeIntroduction() {
    const { isRetro } = useTheme();

    return (
        <Box padding="5">
            {isRetro ? (
                <Text 
                    fontSize="md" 
                    marginBottom="4" 
                    color="purple.400"
                    fontFamily="'Press Start 2P', monospace"
                    textAlign="center"
                >
                    Placeholder as I am unimaginative.
                </Text>
            ) : (
                <>
                    <Text fontSize="md" marginBottom="4" color="gray.500">
                        Welcome to my personal website! Below are my personal projects, skills, some info about me and the site, and my contact info. Just click the the divider! If you want something more detailed, check out my portfolio page.
                    </Text>
                    <Text fontSize="md" marginBottom="4" color="gray.500">
                        Feel free to reach out to me if you have any questions or would like to collaborate on a project.
                    </Text>
                    <Text fontSize="md" marginBottom="4" color="gray.500">
                        I've been lucky enough to already secure internship opportunities for Spring and Summer 2025. However, if you wish to talk about other opportunities, please reach out to me via any of the methods below.
                    </Text>
                </>
            )}
            <Stack direction={{ base: 'column', md: 'row' }} spacing={4} justifyContent="center">
                {!isRetro && (
                    <>
                        <Button as="a" href="mailto:kadenbilyeu@proton.me" leftIcon={<IconMail />} rounded="full" _hover={{ color: 'yellow', transform: 'scale(1.01)'}} _active={{ transform: 'scale(0.99)'}}>
                            Email Me
                        </Button>
                        <Button as="a" href="https://linkedin.com/in/kadenbilyeu" leftIcon={<IconBrandLinkedin />} rounded="full" _hover={{ color: 'yellow', transform: 'scale(1.01)'}} _active={{ transform: 'scale(0.99)'}}>
                            LinkedIn
                        </Button>
                    </>
                )}
                <Button 
                    as="a" 
                    href="https://twitter.com/bikatr7" 
                    leftIcon={<IconBrandTwitter />} 
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
                    _active={{ transform: 'scale(0.99)'}}
                >
                    Twitter
                </Button>
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
                    _hover={{ 
                        color: isRetro ? 'purple.400' : 'yellow', 
                        transform: 'scale(1.01)'
                    }}
                    _active={{ transform: 'scale(0.99)'}}
                >
                    Github
                </Button>
            </Stack>
        </Box>
    );
}

export default HomeIntroduction;