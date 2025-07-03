// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file.

// maintain allman bracket style for consistency

// chakra-ui
import { Box, Text } from "@chakra-ui/react";

function AboutMe() {
    return (
        <Box padding="5">
            <Text fontSize="md" marginBottom="4" color="gray.500">
                My name is Kaden Bilyeu, I also go by the pseudonym Bikatr7. I'm a senior at the University of Colorado Colorado Springs (UCCS) studying Computer Science with a focus in Cybersecurity and a minor in Japanese.
            </Text>
            <Text fontSize="md" marginBottom="4" color="gray.500">
                I'm currently 21 years old and I've been programming since I was 10, nowadays my coding is mostly focused on exploring LLMs, NER/NLP, and other AI/ML technologies. I also make tools to assist with my Japanese learning and translation hobby.
            </Text>
            <Text fontSize="md" marginBottom="4" color="gray.500">
                I'm a big fan of open-source software and I try to contribute to projects and make my own whenever possible. As for hobbies outside of coding, I really enjoy biking, learning and translating Japanese, and reading.
            </Text>
        </Box>
    );
}

export default AboutMe;