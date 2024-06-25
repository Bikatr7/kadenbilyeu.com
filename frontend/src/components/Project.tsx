// react
import React from 'react';

// chakra-ui
import { Stack, Flex, Image, Heading, Text, Link } from '@chakra-ui/react';

// icons
import { IconBrandGithub, IconExternalLink } from "@tabler/icons-react";

interface ProjectProps {
    title: string;
    subtitle: string;
    imageUrl: string;
    imageAlt: string;
    linkUrl?: string; 
    githubUrl?: string; 
    reverse?: boolean;
}

const Project: React.FC<ProjectProps> = ({ title, subtitle, imageUrl, imageAlt, linkUrl, githubUrl, reverse }) => {
    return (
        <>
            <Stack direction={{ base: 'column', md: reverse ? 'row-reverse' : 'row' }} mt={14}>
                <Flex flex={1}>
                    <Image boxSize={400} alt={imageAlt} objectFit="cover" src={imageUrl} />
                </Flex>
                <Flex p={8} flex={1} align="center">
                    <Stack spacing={6} w="full" maxW="xl">
                        <Heading fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }}>
                            <Text as="span" position="relative">
                                {title}
                            </Text>
                            <br />
                            <Text color="gray.500" as="span">
                                {subtitle}
                            </Text>
                        </Heading>
                        <Stack direction={{ base: 'column', md: 'row' }} spacing={4} align="center">
                            {linkUrl && (
                                <Link href={linkUrl} isExternal>
                                    <IconExternalLink cursor="pointer" />
                                </Link>
                            )}
                            {githubUrl && (
                                <Link href={githubUrl} isExternal>
                                    <IconBrandGithub cursor="pointer" />
                                </Link>
                            )}
                        </Stack>
                    </Stack>
                </Flex>
            </Stack>
        </>
    );
};

export default Project;