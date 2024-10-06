// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file.

// maintain allman bracket style for consistency

// chakra-ui
import { Box, Button, Stack, Text } from "@chakra-ui/react";

// icons
import { IconBrandGithub, IconBrandTwitter, IconBrandLinkedin, IconMail} from '@tabler/icons-react';

function HomeIntroduction() {
    return (
        <Box padding="5">
            <Text fontSize="md" marginBottom="4" color="gray.500">
                Welcome to my personal website! Below are my personal projects, skills, some info about me and the site, and my contact info. Just click the the divider! If you want something more detailed, check out my portfolio page.
            </Text>
            <Text fontSize="md" marginBottom="4" color="gray.500">
                Feel free to reach out to me if you have any questions or would like to collaborate on a project.
            </Text>
            <Text fontSize="md" marginBottom="4" color="gray.500">
                I'm also currently looking for internships and job opportunities in software development. If you need anyone in Colorado Springs or remotely, please reach out to me.
            </Text>
            <Text fontSize="md" marginBottom="4" color="gray.500">
                I'm specifically looking for Spring and Summer 2025 internships. Open to AI/ML, Cybersecurity, Software Engineering, and Data Science roles. Willing to relocate for summer 2025.
            </Text>
            <Stack direction={{ base: 'column', md: 'row' }} spacing={4} justifyContent="center">
                <Button as="a" href="mailto:kadenbilyeu@proton.me" leftIcon={<IconMail />} rounded="full" _hover={{ color: 'yellow', transform: 'scale(1.01)'}} _active={{ transform: 'scale(0.99)'}}>
                    Email Me
                </Button>
                <Button as="a" href="https://linkedin.com/in/kadenbilyeu" leftIcon={<IconBrandLinkedin />} rounded="full" _hover={{ color: 'yellow', transform: 'scale(1.01)'}} _active={{ transform: 'scale(0.99)'}}>
                    LinkedIn
                </Button>
                <Button as="a" href="https://twitter.com/bikatr7" leftIcon={<IconBrandTwitter />} rounded="full" _hover={{ color: 'yellow', transform: 'scale(1.01)'}} _active={{ transform: 'scale(0.99)'}}>
                    Twitter
                </Button>
                <Button as="a" href="https://github.com/Bikatr7" leftIcon={<IconBrandGithub />} rounded="full" _hover={{ color: 'yellow', transform: 'scale(1.01)'}} _active={{ transform: 'scale(0.99)'}}>
                    Github
                </Button>
            </Stack>
        </Box>
    );
}

export default HomeIntroduction;