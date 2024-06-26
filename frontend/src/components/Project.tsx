// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com)
// Use of this source code is governed by a GNU General Public License v3.0
// license that can be found in the LICENSE file.

// react
import React from 'react';

// chakra-ui
import { Stack, Flex, Image, Heading, Text, Link, Tag, Wrap, WrapItem, Box } from '@chakra-ui/react';

// icons
import { IconBrandGithub, IconExternalLink, IconBook } from "@tabler/icons-react";

// emotion
import { keyframes } from '@emotion/react';
import { css } from '@emotion/react';

// Define keyframes for bulge and shake animation for icons
const bulgeShake = keyframes`
  0% { transform: scale(1) translateX(0); }
  20% { transform: scale(1.1) translateX(-2px); }
  40% { transform: scale(1.1) translateX(2px); }
  60% { transform: scale(1.1) translateX(-2px); }
  80% { transform: scale(1.1) translateX(2px); }
  100% { transform: scale(1) translateX(0); }
`;

// CSS for the icon animation
const iconAnimation = css`
  &:hover {
    animation: ${bulgeShake} 0.5s ease-in-out;
  }
`;

// Define keyframes for expand and rotate animation for tags
const expandRotate = keyframes`
  0% { transform: scale(1) rotate(0deg); }
  25% { transform: scale(1.01) rotate(5deg); }
  50% { transform: scale(1.01) rotate(0deg); }
  75% { transform: scale(1.01) rotate(-5deg); }
  100% { transform: scale(1) rotate(0deg); }
`;

// CSS for the tag animation
const tagAnimation = css`
  &:hover {
    animation: ${expandRotate} 0.5s ease-in-out;
  }
`;

// CSS for the image animation
const imageAnimation = css`
  border-radius: 50%;
  transition: transform 0.3s ease-in-out;
  &:hover {
    transform: translateY(-10px);
  }
`;

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

const Project: React.FC<ProjectProps> = ({ title, subtitle, imageUrl, imageAlt, linkUrl, githubUrl, documentationUrl, reverse, tags }) => {
    return (
        <>
        <Box mb={20}>
            <Stack direction={{ base: 'column', md: reverse ? 'row-reverse' : 'row' }} mt={10} marginBottom={25}>
                <Flex flex={1}>
                    <Image boxSize={400} alt={imageAlt} objectFit="cover" src={imageUrl} css={imageAnimation} />
                </Flex>
                <Flex p={8} flex={1} align="center">
                    <Stack spacing={6} w="full" maxW="xl">
                        <Heading fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }}>
                            <Text as="span" position="relative">
                                {title}
                            </Text>
                            <br />
                            <Text color="gray.500" as="span" fontSize="sm" mt={2}>
                                {subtitle}
                            </Text>
                        </Heading>
                        <Wrap>
                            {tags && tags.map(tag => (
                                <WrapItem key={tag} css={tagAnimation}>
                                    <Tag size="md" variant="solid" colorScheme="teal">
                                        {tag}
                                    </Tag>
                                </WrapItem>
                            ))}
                        </Wrap>
                        <Stack direction={{ base: 'column', md: 'row' }} spacing={4} align="center">
                            {linkUrl && (
                                <Link href={linkUrl} isExternal _hover={{color:"yellow"}} css={iconAnimation} _active={{ transform: 'scale(0.95)'}}>
                                    <IconExternalLink cursor="pointer" />
                                </Link>
                            )}
                            {githubUrl && (
                                <Link href={githubUrl} isExternal _hover={{color:"yellow"}} css={iconAnimation} _active={{ transform: 'scale(0.95)'}}>
                                    <IconBrandGithub cursor="pointer" />
                                </Link>
                            )}
                            {documentationUrl && (
                                <Link href={documentationUrl} isExternal _hover={{color:"yellow"}} css={iconAnimation} _active={{ transform: 'scale(0.95)'}}>
                                    <IconBook cursor="pointer" />
                                </Link>
                            )}
                        </Stack>
                    </Stack>
                </Flex>
            </Stack>
        </Box>
        </>
    );
};

export default Project;