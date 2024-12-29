// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file.

// maintain allman bracket style for consistency

// chakra-ui
import { Box, Button, Image, Flex, Stack, Text } from "@chakra-ui/react";

// icons and images
import { IconBrandGithub, IconBrandTwitter, IconBrandLinkedin, IconMail, IconBrandDiscord} from '@tabler/icons-react';

import { isBikatr7URL } from '../../utils';

import face from '../../assets/images/personals/kadenbilyeu.webp';

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
                        {isBikatr7URL() ? "Kaden Bilyeu (Bikatr7)" : "Kaden Bilyeu"}
                    </Text>
                    <Text fontSize="md" color="gray.500" mb={4}>
                        kadenbilyeu@proton.me
                    </Text>
                    <Stack spacing={4} justifyContent="flex-start">
                        <Stack direction={{ base: 'column', md: 'row' }} spacing={4} justifyContent="flex-start">
                            <Button as="a" href="mailto:kadenbilyeu@proton.me" leftIcon={<IconMail />} rounded="full" _hover={{ color: 'yellow', transform: 'scale(1.01)'}} _active={{ transform: 'scale(0.99)'}} variant="outline">
                                Mail
                            </Button>
                            <Button as="a" href="https://linkedin.com/in/kadenbilyeu" leftIcon={<IconBrandLinkedin />} rounded="full" _hover={{ color: 'yellow', transform: 'scale(1.01)'}} _active={{ transform: 'scale(0.99)'}} variant="outline">
                                LinkedIn
                            </Button>
                            <Button as="a" href="https://github.com/Bikatr7" leftIcon={<IconBrandGithub />} rounded="full" _hover={{ color: 'yellow', transform: 'scale(1.01)'}} _active={{ transform: 'scale(0.99)'}} variant="outline">
                                GitHub
                            </Button>
                        </Stack>
                        <Stack direction="row" spacing={4} justifyContent="center">
                            <Button as="a" href="https://discord.com/users/1141562307885936763" leftIcon={<IconBrandDiscord />} rounded="full" _hover={{ color: 'yellow', transform: 'scale(1.01)'}} _active={{ transform: 'scale(0.99)'}} variant="outline">
                                Discord
                            </Button>
                            <Button as="a" href="https://twitter.com/bikatr7" leftIcon={<IconBrandTwitter />} rounded="full"_hover={{ color: 'yellow', transform: 'scale(1.01)'}} _active={{ transform: 'scale(0.99)'}} variant="outline">
                                Twitter
                            </Button>
                        </Stack>
                    </Stack>
                </Box>
            </Flex>
            <Box textAlign="center" ml={5} mr={20}>
                <Text fontSize="md" color="gray.500" marginBottom="4">
                    Feel free to reach out about anything! I'm always open to new opportunities and collaborations.
                </Text>
            </Box>
            <Box textAlign="center" ml={5} mr={20} mt={4} mb={100}>
                <Text fontSize="md" color="gray.500">
                    And if email isn't your thing, feel free to reach out to me on discord or any of my other socials!
                </Text>
            </Box>
        </Box>
    );
}

export default Contact;