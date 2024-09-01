// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file.

// maintain allman bracket style for consistency

// react
import React from 'react';

// chakra-ui
import { Box, Flex, Image, Heading, Text, Link, Tag, Wrap, WrapItem } from '@chakra-ui/react';

// icons
import { IconBrandGithub, IconExternalLink } from "@tabler/icons-react";

// animations
import { iconAnimation, tagAnimation, imageAnimation } from '../animations/common';

interface ProjectItemProps 
{
  title: string;
  dateRange: string;
  description?: string[];
  imageUrl?: string;
  imageAlt?: string;
  websiteUrl?: string;
  githubUrl?: string;
  tags?: string[];
  useBulletPoints?: boolean;
}

const Item: React.FC<ProjectItemProps> = (
{
  title,
  dateRange,
  description,
  imageUrl,
  imageAlt,
  websiteUrl,
  githubUrl,
  tags,
  useBulletPoints = true
}) => 
{
  return (
    <Box bg="gray.800" color="white" borderRadius="md" overflow="hidden" mb={4} position="relative">
      <Flex alignItems="flex-start" p={4}>
        <Box flex="1">
          <Heading as="h3" size="sm" color="yellow.400" mb={1}>
            {title}
          </Heading>
          <Text fontSize="xs" color="blue.300" mb={2}>
            {dateRange}
          </Text>
          {description && description.map((item, index) => (
            <Text key={index} fontSize="xs" mb={1}>
              {useBulletPoints ? `• ${item}` : item}
            </Text>
          ))}
          {tags && (
            <Wrap mt={2} mb={2}>
              {tags.map(tag => (
                <WrapItem key={tag} css={tagAnimation}>
                  <Tag size="sm" variant="solid" colorScheme="teal" fontSize="xs">
                    {tag}
                  </Tag>
                </WrapItem>
              ))}
            </Wrap>
          )}
          <Flex mt={2}>
            {websiteUrl && (
              <Link href={websiteUrl} isExternal mr={2} _hover={{ color: "yellow.400" }} css={iconAnimation}>
                <IconExternalLink size={20} />
              </Link>
            )}
            {githubUrl && (
              <Link href={githubUrl} isExternal _hover={{ color: "yellow.400" }} css={iconAnimation}>
                <IconBrandGithub size={20} />
              </Link>
            )}
          </Flex>
        </Box>
        {imageUrl && (
          <Box ml={4}>
            <Image
              src={imageUrl}
              alt={imageAlt || title}
              boxSize="90px"
              objectFit="cover"
              borderRadius="full"
              border="3px solid"
              borderColor="gray.700"
              css={imageAnimation}
            />
          </Box>
        )}
      </Flex>
    </Box>
  );
};

interface CardProps 
{
  title: string;
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, children }) => 
{
  return (
    <Box bg="gray.900" p={6} borderRadius="lg" marginBottom={10}>
      <Heading as="h2" size="xl" color="yellow.400" mb={6}>
        {title}
      </Heading>
      {children}
    </Box>
  );
};

export { Card, Item };