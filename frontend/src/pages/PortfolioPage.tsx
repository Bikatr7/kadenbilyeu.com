// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file.

// maintain allman bracket style for consistency

import { lazy, Suspense } from 'react';

import { Box, VStack, Text, Button, Spinner } from "@chakra-ui/react";

// components
import NamedDivider from "../components/NamedDivider";
import EmbedSEO from "../components/EmbedSEO";

import PortfolioIntroduction from "../sections/portfolio/PortfolioIntroduction";

const Education = lazy(() => import("../sections/portfolio/Education"));
const Experience = lazy(() => import("../sections/portfolio/Experience"));
const PortfolioProjects = lazy(() => import("../sections/portfolio/PortfolioProjects"));
const Skills = lazy(() => import("../sections/common/Skills"));
const Certifications = lazy(() => import("../sections/portfolio/Certifications"));
const Accomplishments = lazy(() => import("../sections/portfolio/Accomplishments"));

import { useTheme } from '../contexts/ThemeContext';
const SectionLoader = () => (
    <Box textAlign="center" py={4}>
        <Spinner color="teal.500" />
    </Box>
);

function PortfolioPage() {
    const { isRetro, toggleRetro } = useTheme();

    if (isRetro) {
        return (
            <Box
                flex="1"
                display="flex"
                alignItems="center"
                justifyContent="center"
                bg="black"
            >
                <VStack
                    spacing={6}
                    p={8}
                    bg="purple.900"
                    borderRadius="lg"
                    border="2px"
                    borderColor="purple.600"
                    maxW="600px"
                    w="90%"
                    mt="25vh"
                >
                    <Text
                        fontSize="xl"
                        color="purple.200"
                        fontFamily="'Press Start 2P', monospace"
                        textAlign="center"
                    >
                        ERROR 404: PORTFOLIO NOT FOUND IN RETRO MODE
                    </Text>
                    <Button
                        onClick={toggleRetro}
                        bg="black"
                        color="purple.200"
                        _hover={{ bg: 'purple.800', transform: 'scale(1.1)' }}
                        _active={{ bg: 'purple.700' }}
                        borderRadius="none"
                        border="2px"
                        borderColor="purple.400"
                        fontFamily="'Press Start 2P', monospace"
                        fontSize="sm"
                        p={6}
                    >
                        SWITCH TO PERSONAL MODE
                    </Button>
                </VStack>
            </Box>
        );
    }

    return (
        <Box flex="1">
            <EmbedSEO
                title="Portfolio | Kaden Bilyeu"
                description="Detailed look at Kaden Bilyeu's education, experience, projects, skills, and accomplishments."
                image={`${window.location.origin}/kb.webp`}
                imageAlt="Kaden Bilyeu (Bikatr7) Profile Picture"
            />
            <PortfolioIntroduction />

            <NamedDivider name="Education" id="education" />
            <Suspense fallback={<SectionLoader />}>
                <Education />
            </Suspense>

            <NamedDivider name="Experience" id="experience" />
            <Suspense fallback={<SectionLoader />}>
                <Experience />
            </Suspense>

            <NamedDivider name="Projects" id="projects" />
            <Suspense fallback={<SectionLoader />}>
                <PortfolioProjects />
            </Suspense>

            <NamedDivider name="Skills" id="skills" />
            <Suspense fallback={<SectionLoader />}>
                <Skills />
            </Suspense>

            <NamedDivider name="Certifications" id="certifications" />
            <Suspense fallback={<SectionLoader />}>
                <Certifications />
            </Suspense>

            <NamedDivider name="Accomplishments" id="accomplishments" />
            <Suspense fallback={<SectionLoader />}>
                <Accomplishments />
            </Suspense>
        </Box>
    );
}

export default PortfolioPage;