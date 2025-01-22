// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file.

// maintain allman bracket style for consistency

// react
import React from 'react';

// chakra-ui
import { Stack, Flex, Image, Heading, Text, Link, Tag, Wrap, WrapItem, Box } from '@chakra-ui/react';

// icons
import { IconBrandGithub, IconExternalLink, IconBook } from "@tabler/icons-react";

// framer motion
import { motion } from 'framer-motion';

// context
import { useTheme } from '../contexts/ThemeContext';

// animations
import { iconAnimation, tagAnimation, imageAnimation } from '../animations/common';

// animation variants for retro mode
const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
};

const imageVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { duration: 0.5 }
};

const iconVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    whileHover: { 
        scale: 1.2,
        rotate: [0, -10, 10, -10, 0],
        transition: { duration: 0.3 }
    }
};

interface ProjectProps {
    title: string;
    subtitle: string;
    imageUrl: string;
    imageAlt: string;
    linkUrl?: string;
    documentationUrl?: string;
    githubUrl?: string;
    reverse?: boolean;
    tags?: string[];
}

const MotionBox = motion(Box);

const Project: React.FC<ProjectProps> = ({ title, subtitle, imageUrl, imageAlt, linkUrl, githubUrl, documentationUrl, reverse, tags }) => {
    const { isRetro } = useTheme();

    if (isRetro) {
        return (
            <MotionBox
                initial="initial"
                animate="animate"
                variants={cardVariants}
                border="2px solid"
                borderColor="purple.400"
                p={4}
                mb={6}
                bg="black"
                width="100%"
                height="100%"
                display="flex"
                flexDirection="column"
            >
                <Flex direction="column" align="center" flex="1">
                    <MotionBox
                        initial="initial"
                        animate="animate"
                        variants={imageVariants}
                    >
                        <Image 
                            boxSize="100px"
                            alt={imageAlt} 
                            objectFit="cover" 
                            src={imageUrl} 
                            mb={4}
                        />
                    </MotionBox>
                    <Heading 
                        fontSize="md"
                        color="purple.400"
                        fontFamily="'Press Start 2P', monospace"
                        textAlign="center"
                        mb={3}
                    >
                        {title}
                    </Heading>
                    <Text 
                        fontSize="xs"
                        color="purple.200"
                        fontFamily="'Press Start 2P', monospace"
                        textAlign="center"
                        mb={4}
                    >
                        {subtitle}
                    </Text>
                    <Stack 
                        direction="row" 
                        spacing={4} 
                        justify="center"
                        mt="auto"
                    >
                        {linkUrl && (
                            <MotionBox
                                variants={iconVariants}
                                whileHover="whileHover"
                            >
                                <Link 
                                    href={linkUrl} 
                                    isExternal 
                                    color="purple.400"
                                    _hover={{ color: "purple.200" }}
                                >
                                    <IconExternalLink cursor="pointer" aria-label='External Link' />
                                </Link>
                            </MotionBox>
                        )}
                        {githubUrl && (
                            <MotionBox
                                variants={iconVariants}
                                whileHover="whileHover"
                            >
                                <Link 
                                    href={githubUrl} 
                                    isExternal 
                                    color="purple.400"
                                    _hover={{ color: "purple.200" }}
                                >
                                    <IconBrandGithub cursor="pointer" aria-label='GitHub Link' />
                                </Link>
                            </MotionBox>
                        )}
                        {documentationUrl && (
                            <MotionBox
                                variants={iconVariants}
                                whileHover="whileHover"
                            >
                                <Link 
                                    href={documentationUrl} 
                                    isExternal 
                                    color="purple.400"
                                    _hover={{ color: "purple.200" }}
                                >
                                    <IconBook cursor="pointer" aria-label='Documentation Link' />
                                </Link>
                            </MotionBox>
                        )}
                    </Stack>
                </Flex>
            </MotionBox>
        );
    }

    return (
        <Box mb={20}>
            <Stack direction={{ base: 'column', md: reverse ? 'row-reverse' : 'row' }} marginBottom={25}>
                <Flex flex={1} justifyContent="center">
                    <Image boxSize={{ base: '300px', md: '400px' }} alt={imageAlt} objectFit="cover" src={imageUrl} css={imageAnimation} />
                </Flex>
                <Flex p={8} flex={1} align="center">
                    <Stack spacing={6} w="full" maxW="xl">
                        <Heading fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }}>
                            <Text as="span" position="relative">
                                {title}
                            </Text>
                            <br />
                        </Heading>
                        <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.500">
                            {subtitle}
                        </Text>
                        <Wrap>
                            {tags && tags.map(tag => (
                                <WrapItem key={tag} css={tagAnimation}>
                                    <Tag size="md" variant="solid" colorScheme="teal">
                                        {tag}
                                    </Tag>
                                </WrapItem>
                            ))}
                        </Wrap>
                        <Stack direction="row" spacing={4} align="center">
                            {linkUrl && (
                                <Link href={linkUrl} isExternal _hover={{ color: "yellow" }} css={iconAnimation} _active={{ transform: 'scale(0.95)' }}>
                                    <IconExternalLink cursor="pointer" aria-label='External Link' />
                                </Link>
                            )}
                            {githubUrl && (
                                <Link href={githubUrl} isExternal _hover={{ color: "yellow" }} css={iconAnimation} _active={{ transform: 'scale(0.95)' }}>
                                    <IconBrandGithub cursor="pointer" aria-label='GitHub Link' />
                                </Link>
                            )}
                            {documentationUrl && (
                                <Link href={documentationUrl} isExternal _hover={{ color: "yellow" }} css={iconAnimation} _active={{ transform: 'scale(0.95)' }}>
                                    <IconBook cursor="pointer" aria-label='Documentation Link' />
                                </Link>
                            )}
                        </Stack>
                    </Stack>
                </Flex>
            </Stack>
        </Box>
    );
};

export default Project;