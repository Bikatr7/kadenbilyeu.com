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
                            Computer science senior at the University of Colorado Colorado Springs looking to utilize my skills on AI/ML, LLMs, data science, full stack and NER/NLP into software for real-world applications.
                        </Text>
                        <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.500">
                            Eligible for security clearance. U.S. Citizen.
                        </Text>
                    </Stack>
                </Flex>
            </Stack>
            <NamedDivider id="portfolio_page_separator" />
            <Text fontSize="md" marginBottom="4" color="gray.500">
                This is my portfolio page. It's a bit more detailed than my main page and has more information about my projects and education, and new things like my professional experience and accomplishments.
            </Text>
            <Text fontSize="md" marginBottom="4" color="gray.500">
                I like to think of it as an expanded, digital version of my resume. Resume's are great, but they're stuffy, not reactive, and don't leave room for creativity. This allows me to say and show what I want.
            </Text>
            <Text fontSize="md" marginBottom="4" color="gray.500">
                If you're looking for something strictly professional, you can download my resume with that button in the top right.
            </Text>
        </Box>
    );
}

export default PortfolioIntroduction;