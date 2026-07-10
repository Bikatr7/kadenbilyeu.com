// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file.

// maintain allman bracket style for consistency

// chakra-ui
import { Box, Text } from "@chakra-ui/react";

function getAge() {
    const today = new Date();
    const birthdayThisYear = new Date(today.getFullYear(), 2, 2);
    let age = today.getFullYear() - 2004;

    if (today < birthdayThisYear) {
        age -= 1;
    }

    return age;
}

function AboutMe() {
    const age = getAge();

    return (
        <Box padding="5">
            <Text fontSize="md" marginBottom="4" color="gray.500">
                My name is Kaden Bilyeu, I also go by the pseudonym Bikatr7. I'm a recent University of Colorado Colorado Springs (UCCS) graduate with a B.S. in Computer Science and a focus in Cybersecurity.
            </Text>
            <Text fontSize="md" marginBottom="4" color="gray.500">
                I'm currently {age} years old and I've been programming since I was 10, nowadays my coding is mostly focused on exploring LLMs, NER/NLP, and other AI/ML technologies. I also make tools to assist with my Japanese learning and translation hobby. Although admittingly I lack the time to work on such things as much as I'd like to. Currently focusing on my current position and working on a homelab.
            </Text>
            <Text fontSize="md" marginBottom="4" color="gray.500">
                I'm a big fan of open-source software and I try to contribute to projects and make my own whenever possible. As for hobbies outside of coding, I really enjoy biking, learning and translating Japanese, and reading.
            </Text>
        </Box>
    );
}

export default AboutMe;
