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

import { motion } from 'framer-motion';

const rotateAnimation = {
    rotate: [0, 360],
    transition: {
        duration: 20,
        repeat: Infinity,
        ease: "linear"
    }
};

const jitterAnimation = (delay: number) => ({
    x: [0, 2, -1, 3, -2, 0],
    y: [-1, 2, -2, 1, -3, -1],
    transition: {
        duration: 4,
        repeat: Infinity,
        ease: "linear",
        delay: delay,
    }
});

const frameAnimation = {
    y: [-5, 5, -5],
    x: [-3, 3, -3],
    transition: {
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut"
    }
};

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
                            <br/><br/>
                            I'm a programmer, I mostly work on translation tech, and my current internship. I also go to school full time.
                            <br/><br/>
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
                                _active={{ transform: 'scale(0.99)'}}
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
                                _active={{ transform: 'scale(0.99)'}}
                            >
                                Email
                            </Button>
                        </Stack>
                    </Stack>

                    <Box 
                        position="relative" 
                        flex="1" 
                        height="400px"
                        display={{ base: 'none', lg: 'block' }}
                        ml="-100px"
                        mt={0}
                        mr="-50px"
                    >
                        <Box
                            position="absolute"
                            top="45%"
                            left="60%"
                            transform="translate(-50%, -60%) scale(1.6)"
                        >
                            <motion.svg
                                width="300"
                                height="300"
                                viewBox="0 0 300 300"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 1 }}
                            >
                                <motion.g 
                                    animate={{ 
                                        ...rotateAnimation,
                                        ...frameAnimation
                                    }}
                                >
                                    {Array.from({ length: 48 }).map((_, i) => {
                                        const angle = (i * 7.5) * Math.PI / 180;
                                        const radius = 100;
                                        const baseVariation = 8 * Math.sin(i * 2.5);

                                        
                                        return (
                                            <motion.line
                                                key={`grid-${i}`}
                                                x1={150 + (radius + baseVariation - 10) * Math.cos(angle)}
                                                y1={150 + (radius + baseVariation - 10) * Math.sin(angle)}
                                                x2={150 + (radius + baseVariation + 10) * Math.cos(angle)}
                                                y2={150 + (radius + baseVariation + 10) * Math.sin(angle)}
                                                stroke="rgba(147, 51, 234, 0.3)"
                                                strokeWidth="2"
                                                animate={jitterAnimation(i * 0.1)}
                                            />
                                        );
                                    })}
                                    {Array.from({ length: 32 }).map((_, i) => {
                                        const angle1 = (i * 11.25) * Math.PI / 180;
                                        const angle2 = ((i + 1) * 11.25) * Math.PI / 180;
                                        const radiusVar = Math.sin(i) * 8;
                                        
                                        return (
                                            <motion.line
                                                key={`connect-${i}`}
                                                x1={150 + (110 + radiusVar) * Math.cos(angle1)}
                                                y1={150 + (110 + radiusVar) * Math.sin(angle1)}
                                                x2={150 + (110 + radiusVar) * Math.cos(angle2)}
                                                y2={150 + (110 + radiusVar) * Math.sin(angle2)}
                                                stroke="rgba(147, 51, 234, 0.2)"
                                                strokeWidth="1"
                                                animate={jitterAnimation(i * 0.15)}
                                            />
                                        );
                                    })}
                                </motion.g>
                            </motion.svg>
                        </Box>
                    </Box>
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
                            Welcome to my personal website! Below are my personal projects, skills, some info about me and the site, and my contact info. Just click the the divider! If you want something more detailed, check out my portfolio page.
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
                            I've been lucky enough to already secure internship opportunities for Spring and Summer 2025. However, if you wish to talk about other opportunities, please reach out to me via any of the methods below.
                        </Text>
                    </>
                    <Stack 
                        direction={{ base: 'column', md: 'row' }} 
                        spacing={4} 
                        justifyContent="center"
                        width="100%"
                    >
                        <Button as="a" href="mailto:kadenbilyeu@proton.me" leftIcon={<IconMail />} rounded="full" _hover={{ color: 'yellow', transform: 'scale(1.01)'}} _active={{ transform: 'scale(0.99)'}}>
                            Email Me
                        </Button>
                        <Button as="a" href="https://linkedin.com/in/kadenbilyeu" leftIcon={<IconBrandLinkedin />} rounded="full" _hover={{ color: 'yellow', transform: 'scale(1.01)'}} _active={{ transform: 'scale(0.99)'}}>
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
                            _active={{ transform: 'scale(0.99)'}}
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
                            _active={{ transform: 'scale(0.99)'}}
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