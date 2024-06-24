// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by a GNU General Public License v3.0
// license that can be found in the LICENSE file.

// chakra-ui
import {
    Box,
    Button,
    Image,
    Flex,
    Stack,
    Text,
} from "@chakra-ui/react";

// icons and images
import { IconBrandGithub, IconBrandTwitter, IconBrandLinkedin, IconMail, IconBrandDiscord} from '@tabler/icons-react';

import face from '../assets/images/personals/kadenbilyeu.png';

function Contact() {
    return (
        <Box p={4} textAlign="center">
            <Flex direction={{ base: 'column', md: 'row' }} alignItems="center" justifyContent="center" mb={4}>
                <Image
                    borderRadius="full"
                    boxSize="150px"
                    src={face}
                    alt="Kaden Bilyeu"
                    mr={{ base: 0, md: 8 }}
                    mb={{ base: 4, md: 0 }}
                />
                <Box textAlign="left">
                    <Text fontSize="lg" fontWeight="bold">
                        Kaden Bilyeu
                    </Text>
                    <Text fontSize="md" color="gray.500" mb={4}>
                        kadenbilyeu@proton.me
                    </Text>
                    <Stack spacing={4} justifyContent="flex-start">
                        <Stack direction={{ base: 'column', md: 'row' }} spacing={4} justifyContent="flex-start">
                            <Button as="a" href="mailto:kadenbilyeu@proton.me" leftIcon={<IconMail />} rounded="full" _hover={{ color: 'yellow' }} variant="outline">
                                Mail
                            </Button>
                            <Button as="a" href="https://linkedin.com/in/kadenbilyeu" leftIcon={<IconBrandLinkedin />} rounded="full" _hover={{ color: 'yellow' }} variant="outline">
                                LinkedIn
                            </Button>
                            <Button as="a" href="https://github.com/Bikatr7" leftIcon={<IconBrandGithub />} rounded="full" _hover={{ color: 'yellow' }} variant="outline">
                                GitHub
                            </Button>
                        </Stack>
                        <Stack direction="row" spacing={4} justifyContent="center">
                            <Button as="a" href="https://discord.com" leftIcon={<IconBrandDiscord />} rounded="full" _hover={{ color: 'yellow' }} variant="outline">
                                Discord
                            </Button>
                            <Button as="a" href="https://twitter.com/kadenbilyeu0" leftIcon={<IconBrandTwitter />} rounded="full" _hover={{ color: 'yellow' }} variant="outline">
                                Twitter
                            </Button>
                        </Stack>
                    </Stack>
                </Box>
            </Flex>
            <Box textAlign="center" ml={5} mr={20}>
                <Text fontSize="md" color="gray.500">
                    Feel free to reach out about anything! I'm always open to new opportunities and collaborations. I'm also looking for internships and job opportunities in software development.
                </Text>
            </Box>
            <Box textAlign="left" ml={9} mr={50} mt={4} mb={100}>
                <Text fontSize="md" color="gray.500">
                    And if email isn't your thing, feel free to reach out to me on discord or any of my other socials!
                </Text>
            </Box>
        </Box>
    );
}

export default Contact;