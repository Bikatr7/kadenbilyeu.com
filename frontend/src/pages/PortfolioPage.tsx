// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file.

// maintain allman bracket style for consistency

// chakra ui
import { Box, VStack, Text, Button } from "@chakra-ui/react";

// components
import NamedDivider from "../components/NamedDivider";
import EmbedSEO from "../components/EmbedSEO";

// sections - import normally for instant loading
import PortfolioIntroduction from "../sections/portfolio/PortfolioIntroduction";
import Education from "../sections/portfolio/Education";
import Experience from "../sections/portfolio/Experience";
import PortfolioProjects from "../sections/portfolio/PortfolioProjects";
import Skills from "../sections/common/Skills";
import Certifications from "../sections/portfolio/Certifications";
import Accomplishments from "../sections/portfolio/Accomplishments";

// contexts
import { useTheme } from '../contexts/ThemeContext';

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
            <Education />

            <NamedDivider name="Experience" id="experience" />
            <Experience />

            <NamedDivider name="Projects" id="projects" />
            <PortfolioProjects />

            <NamedDivider name="Skills" id="skills" />
            <Skills />

            <NamedDivider name="Certifications" id="certifications" />
            <Certifications />

            <NamedDivider name="Accomplishments" id="accomplishments" />
            <Accomplishments />
        </Box>
    );
}

export default PortfolioPage;