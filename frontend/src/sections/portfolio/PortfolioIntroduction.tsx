// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file.

// maintain allman bracket style for consistency

// chakra-ui
import { Box, Stack, Flex, Text, Heading, Image } from "@chakra-ui/react";

// components
import NamedDivider from "../../components/NamedDivider";

// images
import face from "../../assets/images/personals/kadenbilyeu.webp";

import { isBikatr7URL } from "../../utils";

function PortfolioIntroduction() {
    return (
        <Box padding="5">
            <Stack direction={{ base: 'column', md: 'row' }} bg="black" id="home" paddingTop={5} >
                <Flex flex={1} justifyContent={{ base: 'center', md: 'flex-start' }} alignItems="center">
                    <Image boxSize={400} alt="Kaden Bilyeu's Profile Picture" objectFit="cover" src={face} borderRadius={"full"} />
                </Flex>
                <Flex p={8} flex={1} align="center">
                    <Stack spacing={6} w="full" maxW="xl">
                        <Heading fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }}>
                            <Text as="span" position="relative">
                                {isBikatr7URL() ? "Kaden Bilyeu (Bikatr7)" : "Kaden Bilyeu"}
                            </Text>
                            <br />
                        </Heading>
                        <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.500">
                            Recent UCCS graduate.
                        </Text>
                    </Stack>
                </Flex>
            </Stack>
            <NamedDivider id="portfolio_page_separator" />
            <Text fontSize="md" marginBottom="4" color="gray.500">
                This is my portfolio page - my chance to tell the full story behind my work and what I'm passionate about. It's deliberately more detailed and conversational than traditional professional documents.
            </Text>
            <Text fontSize="md" marginBottom="4" color="gray.500">
                <Text as="span" fontWeight="bold" color="yellow.400">Need something to scan quickly?</Text> Check out my resume using the button in the top right. It's clean, concise, and hits all the professional highlights you'd expect.
            </Text>
            <Text fontSize="md" marginBottom="4" color="gray.500">
                <Text as="span" fontWeight="bold" color="yellow.400">Have time to hear me talk about what I actually enjoy working on?</Text> You're in the right place. This portfolio includes the context, challenges, learnings, and honest thoughts behind each project and experience. It's not formal - it's me genuinely yapping about what I'm passionate about.
            </Text>
            <Text fontSize="md" marginBottom="4" color="gray.500">
                Each section now includes both detailed narratives and quick-scan summaries, so you can choose your own adventure through my work lol.
            </Text>
        </Box>
    );
}

export default PortfolioIntroduction;
