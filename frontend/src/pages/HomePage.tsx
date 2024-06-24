// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by a GNU General Public License v3.0
// license that can be found in the LICENSE file.

// react
import { useEffect, useState } from 'react';

// chakra-ui
import {
    Box,
    Button,
    Image,
    Flex,
    Heading,
    Stack,
    Text,
    IconButton,
    Collapse,
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverArrow,
    PopoverCloseButton,
    PopoverHeader,
    PopoverBody
} from "@chakra-ui/react";

import { InfoOutlineIcon } from '@chakra-ui/icons';

// icons and images
import { IconBrandGithub, IconBrandTwitter, IconBrandLinkedin, IconMail} from '@tabler/icons-react';

import face from '../assets/images/personals/kadenbilyeu.png';
import python_logo from '../assets/images/skills/python_logo.png';

// custom components
import NamedDivider from '../components/NamedDivider';
import Skill from '../components/Skill';


function HomePage() {
    useEffect(() => {
        document.title = 'Kaden Bilyeu | Home';
    }, []);

    return (
        <Box bg="black" color="white" minHeight="100vh">
            <Preface />
            <NamedDivider name="Introduction" id="introduction" />
            <Introduction />
            <NamedDivider name="Projects" id="projects" />
            <NamedDivider name="Skills" id="skills" />
            <SkillsSection />
            <NamedDivider name="About Me" id="aboutme" />
        </Box>
    );
}

function Preface() {
    return (
        <Stack direction={{ base: 'column', md: 'row' }} bg="black">
            <Flex p={8} flex={1} align="center">
                <Stack spacing={6} w="full" maxW="xl">
                    <Popover>
                        <PopoverTrigger>
                            <IconButton
                                aria-label="Site Information"
                                icon={<InfoOutlineIcon />}
                                variant="ghost"
                                color="teal.500"
                            />
                        </PopoverTrigger>
                        <PopoverContent>
                            <PopoverArrow />
                            <PopoverCloseButton />
                            <PopoverHeader>Site Information</PopoverHeader>
                            <PopoverBody>
                                This site is currently under construction. Please check back periodically for updates. Thank you for your patience. For more information, visit https://github.com/Bikatr7/kadenbilyeu.com
                            </PopoverBody>
                        </PopoverContent>
                    </Popover>
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
                        <Button rounded="full" as="a" href="/aboutme" _hover={{ color: 'yellow' }}>
                            More about me
                        </Button>
                        <Button as="a" href="https://github.com/Bikatr7" leftIcon={<IconBrandGithub />} rounded="full" _hover={{ color: 'yellow' }}>
                            My Github
                        </Button>
                    </Stack>
                </Stack>
            </Flex>
            <Flex flex={1}>
                <Image boxSize={400} alt="Kaden Bilyeu's Profile Picture" objectFit="cover" src={face} />
            </Flex>
        </Stack>
    );
}

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

function SkillsSection() {
    const [showMore, setShowMore] = useState(false);

    const handleToggle = () => setShowMore(!showMore);

    return (
        <Box
            display="flex"
            flexWrap="wrap"
            justifyContent="center"
            p={4}
        >
            {/* Programming Languages */}
            <Skill name="Python" image={python_logo} />
            <Skill name="Java" />
            <Skill name="JavaScript" />
            <Skill name="TypeScript" />
            <Skill name="C" />
            <Skill name="C++" />
            <Skill name="R" />
            <Skill name="HTML" />
            <Skill name="CSS" />
            
            {/* Databases */}
            <Skill name="MySQL" />
            <Skill name="Oracle SQL" />
            <Skill name="PL/SQL" />

            {/* Tools & Platforms */}
            <Skill name="Git" />
            <Skill name="Docker" />
            <Skill name="FastAPI" />
            <Skill name="Flask" />
            <Skill name="React" />

            {/* Methodologies */}
            <Skill name="Agile" />

            <Collapse in={showMore} animateOpacity>
                <Box
                    display="flex"
                    flexWrap="wrap"
                    justifyContent="center"
                >
                    {/* Additional Tools & Libraries */}
                    <Skill name="OpenAI API" />
                    <Skill name="DeepL API" />
                    <Skill name="discord.py" />
                    <Skill name="Gradio" />
                    <Skill name="spaCy" />
                    <Skill name="PIL/Pillow" />
                    <Skill name="Vite" />
                    
                    {/* Concepts */}
                    <Skill name="OOP" />
                    <Skill name="UI/UX" />
                    <Skill name="CI/CD" />
                    <Skill name="API Integration" />

                    {/* Soft Skills */}
                    <Skill name="Teamwork" />
                    
                </Box>
            </Collapse>
            <Button 
                onClick={handleToggle} 
                mt={4} 
                alignSelf="center" 
                _hover={{ color: 'yellow' }} 
                rounded={'full'}
                colorScheme="teal"
                variant="outline"
            >
                {showMore ? "Show Less" : "Show More"}
            </Button>
        </Box>
    );
}

export default HomePage;