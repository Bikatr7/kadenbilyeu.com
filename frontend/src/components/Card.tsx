// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file.

// maintain allman bracket style for consistency

// react
import React from 'react';

// chakra-ui
import { Box, Flex, Image, Heading, Text, Link, Tag, Wrap, WrapItem, VStack, HStack } from '@chakra-ui/react';

// icons
import { IconBrandGithub, IconExternalLink } from "@tabler/icons-react";

// animations
import { iconAnimation, tagAnimation, imageAnimation } from '../animations/common';

interface ContentLine {
  text: string;
  useBullet?: boolean;
}

interface ItemSection {
  title?: string;
  content: (string | ContentLine)[];
  icon?: React.ReactNode;
  bgColor?: string;
  textColor?: string;
}

interface ProjectItemProps {
  title: string;
  dateRange: string;
  sections?: ItemSection[];
  // Legacy support
  description?: string[];
  imageUrl?: string;
  imageAlt?: string;
  websiteUrl?: string;
  githubUrl?: string;
  tags?: string[];
  useBulletPoints?: boolean;
  employmentProject?: boolean;
}

const renderSectionContent = (content: (string | ContentLine)[], defaultUseBullet: boolean = false) => {
  return content.map((item, index) => {
    if (typeof item === 'string') {
      return (
        <Text key={index} fontSize="xs" mb={1}>
          {defaultUseBullet ? `• ${item}` : item}
        </Text>
      );
    } else {
      return (
        <Text key={index} fontSize="xs" mb={1}>
          {item.useBullet ? `• ${item.text}` : item.text}
        </Text>
      );
    }
  });
};

const Item: React.FC<ProjectItemProps> = (
  {
    title,
    dateRange,
    sections,
    // Legacy props
    description,
    imageUrl,
    imageAlt,
    websiteUrl,
    githubUrl,
    tags,
    useBulletPoints = true,
    employmentProject = false
  }) => {
  // Convert legacy description to sections if needed
  const finalSections = sections || (description ? [{
    content: description.map(desc => desc),
  }] : []);

  return (
    <Box bg="gray.800" color="white" borderRadius="md" overflow="hidden" mb={4} position="relative">
      <Flex alignItems="flex-start" p={4}>
        <VStack flex="1" align="stretch" spacing={3}>
          {/* Header */}
          <Box>
            <Heading as="h3" size="sm" color="yellow.400" mb={1}>
              {title}
            </Heading>
            <Text fontSize="xs" color="blue.300" mb={2}>
              {dateRange}
            </Text>
            {employmentProject && (
              <HStack spacing={2} mb={2}>
                <Box
                  bg="orange.600"
                  color="white"
                  px={2}
                  py={1}
                  borderRadius="md"
                  fontSize="xs"
                  fontWeight="bold"
                >
                  Employment Project
                </Box>
                <Text fontSize="xs" color="gray.400">
                  Built during my time at Network Goods Institute
                </Text>
              </HStack>
            )}
          </Box>

          {/* Sections */}
          {finalSections.map((section, sectionIndex) => (
            <Box
              key={sectionIndex}
              bg={section.bgColor || "transparent"}
              p={section.bgColor ? 3 : 0}
              borderRadius={section.bgColor ? "md" : "none"}
              border={section.bgColor ? "1px solid" : "none"}
              borderColor={section.bgColor ? "gray.600" : "transparent"}
            >
              {section.title && (
                <HStack mb={2} align="center">
                  {section.icon}
                  <Text
                    fontSize="sm"
                    fontWeight="bold"
                    color={section.textColor || "cyan.300"}
                  >
                    {section.title}
                  </Text>
                </HStack>
              )}
              <Box color={section.textColor || "white"}>
                {renderSectionContent(section.content, useBulletPoints)}
              </Box>
            </Box>
          ))}

          {/* Tags */}
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

          {/* Links */}
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
        </VStack>

        {/* Image */}
        {imageUrl && (
          <Box ml={4}>
            <Image
              src={imageUrl}
              alt={imageAlt || title}
              boxSize="90px"
              objectFit="contain"
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

interface CardProps {
  title: string;
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, children }) => {
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