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

// animations
import { iconAnimation, tagAnimation, imageAnimation } from '../animations/common';

interface ProjectProps 
{
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

const Project: React.FC<ProjectProps> = ({ title, subtitle, imageUrl, imageAlt, linkUrl, githubUrl, documentationUrl, reverse, tags }) => 
{
    return (
        <>
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
        </>
    );
};

export default Project;