// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file.

// maintain allman bracket style for consistency

// chakra ui
import { Box } from "@chakra-ui/react";

// components
import NamedDivider from "../components/NamedDivider";
import PortfolioIntroduction from "../sections/portfolio/PortfolioIntroduction";
import Education from "../sections/portfolio/Education";
import Experience from "../sections/portfolio/Experience";
import PortfolioProjects from "../sections/portfolio/PortfolioProjects";
import Skills from "../sections/common/Skills";
import Accomplishments from "../sections/portfolio/Accomplishments";

function PortfolioPage() {
    return (
        <Box>
            <PortfolioIntroduction />
            <NamedDivider name="Education" id="education" />
            <Education />
            <NamedDivider name="Experience" id="experience" />
            <Experience />
            <NamedDivider name="Projects" id="projects" />
            <PortfolioProjects />
            <NamedDivider name="Skills" id="skills" />
            <Skills />
            <NamedDivider name="Accomplishments" id="accomplishments" />
            <Accomplishments />
        </Box>
    );
}

export default PortfolioPage;