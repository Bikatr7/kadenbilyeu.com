// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file.

// maintain allman bracket style for consistency

// chakra-ui
import { Button, Flex, Heading, Image, Stack, Text } from '@chakra-ui/react';

// icons and images
import { IconBrandGithub} from '@tabler/icons-react';

import face from '../assets/images/personals/kadenbilyeu.webp';

function Preface({ showContent, toggleContent }: { showContent: boolean, toggleContent: () => void }) {
    const handleClick = () => {
        if (!showContent) {
            toggleContent();
        }
    };

    return (
        <Stack direction={{ base: 'column', md: 'row' }} bg="black" id="home" paddingTop={5} >
            <Flex p={8} flex={1} align="center">
                <Stack spacing={6} w="full" maxW="xl">
                    <Heading fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }}>
                        <Text as="span" position="relative">
                            Kaden Bilyeu
                        </Text>
                        <br />
                    </Heading>
                    <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.500">
                        Computer science student at UCCS focusing on incorporating AI, LLMs, data science, and NER/NLP into software for real-world applications.
                    </Text>
                    <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
                        <Button 
                            rounded="full" 
                            as="a" 
                            href={showContent ? "#aboutme" : undefined} 
                            onClick={handleClick}
                            _hover={{ color: 'yellow', transform: 'scale(1.01)'}}
                            _active={{ transform: 'scale(0.99)'}}
                        >
                            More about me
                        </Button>
                        <Button as="a" href="/blog" rounded="full" _hover={{ color: 'yellow', transform: 'scale(1.01)'}} _active={{ transform: 'scale(0.99)'}}>
                            Blog (Coming Soon)
                        </Button>
                        <Button as="a" href="https://github.com/Bikatr7" leftIcon={<IconBrandGithub />} rounded="full" _hover={{ color: 'yellow', transform: 'scale(1.01)'}} _active={{ transform: 'scale(0.99)'}}>
                            My Github
                        </Button>
                    </Stack>
                </Stack>
            </Flex>
            <Flex flex={1}>
                <Image boxSize={400} alt="Kaden Bilyeu's Profile Picture" objectFit="cover" src={face} borderRadius={"full"} />
            </Flex>
        </Stack>
    );
}

export default Preface;