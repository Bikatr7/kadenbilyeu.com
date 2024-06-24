// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by a GNU General Public License v3.0
// license that can be found in the LICENSE file.

// chakra-ui
import {
    Box,
    Button,
    Stack,
    Text,
} from "@chakra-ui/react";

// icons
import { IconBrandGithub, IconBrandTwitter, IconBrandLinkedin, IconMail} from '@tabler/icons-react';

function Introduction() {
    return (
        <Box padding="5">
            <Text fontSize="md" marginBottom="4" color="gray.500">
                Welcome to my personal website! Below is some contact information, my socials, my skills, and my personal projects. Feel free to reach out to me if you have any questions or would like to collaborate on a project.
            </Text>
            <Text fontSize="md" marginBottom="4" color="gray.500">
                I'm also currently looking for internships and job opportunities in software development. If you need anyone in Colorado Springs or remotely, please reach out to me.
            </Text>
            <Stack direction={{ base: 'column', md: 'row' }} spacing={4} justifyContent="center">
                <Button as="a" href="mailto:kadenbilyeu@proton.me" leftIcon={<IconMail />} rounded="full" _hover={{ color: 'yellow' }}>
                    Email Me
                </Button>
                <Button as="a" href="https://linkedin.com/in/kadenbilyeu" leftIcon={<IconBrandLinkedin />} rounded="full" _hover={{ color: 'yellow' }}>
                    LinkedIn
                </Button>
                <Button as="a" href="https://twitter.com/kadenbilyeu0" leftIcon={<IconBrandTwitter />} rounded="full" _hover={{ color: 'yellow' }}>
                    Twitter
                </Button>
                <Button as="a" href="https://github.com/Bikatr7" leftIcon={<IconBrandGithub />} rounded="full" _hover={{ color: 'yellow' }}>
                    Github
                </Button>
            </Stack>
        </Box>
    );
}

export default Introduction;