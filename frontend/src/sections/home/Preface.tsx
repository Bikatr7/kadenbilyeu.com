// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file.

// maintain allman bracket style for consistency

// chakra-ui
import { Button, Flex, Heading, Image, Stack, Text} from '@chakra-ui/react';

// icons and images
import { IconBrandGithub} from '@tabler/icons-react';

import face from '../../assets/images/personals/kadenbilyeu.webp';
import { useTheme } from '../../contexts/ThemeContext';

function Preface({ showContent, toggleContent }: { showContent: boolean, toggleContent: () => void }) {
    const { isRetro } = useTheme();

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
                            {isRetro ? "Kaden Bilyeu (Bikatr7)" : "Kaden Bilyeu"}
                        </Text>
                        <br />
                    </Heading>
                        <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.500">
                        Computer science junior at the University of Colorado Colorado Springs passionate in applying my skills on AI/ML, LLMs, data science, and NER/NLP into software for real-world applications.
                        </Text>
                        <Text fontSize={{ base: 'md', lg: 'lg' }} color="gray.500">
                            Eligible for security clearance. Proud U.S. Citizen.
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
                        <Button as="a" href="/portfolio" rounded="full" _hover={{ color: 'yellow', transform: 'scale(1.01)'}} _active={{ transform: 'scale(0.99)'}}>
                            My Portfolio
                        </Button>
                        <Button as="a" href="/blog" rounded="full" _hover={{ color: 'yellow', transform: 'scale(1.01)'}} _active={{ transform: 'scale(0.99)'}}>
                            My Blog   
                        </Button>
                        <Button as="a" href="https://github.com/Bikatr7" leftIcon={<IconBrandGithub />} rounded="full" _hover={{ color: 'yellow', transform: 'scale(1.01)'}} _active={{ transform: 'scale(0.99)'}}>
                            My Github
                        </Button>
                    </Stack>
                </Stack>
            </Flex>
            <Flex flex={1} justifyContent={{ base: 'center', md: 'flex-start' }} alignItems="center">
                <Image boxSize={400} alt="Kaden Bilyeu's Profile Picture" objectFit="cover" src={face} borderRadius={"full"} />
            </Flex>
        </Stack>
    );
}

export default Preface;