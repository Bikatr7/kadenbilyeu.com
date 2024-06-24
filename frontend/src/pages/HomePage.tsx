// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by a GNU General Public License v3.0
// license that can be found in the LICENSE file.

// react
import { useEffect } from 'react';

// chakra-ui
import { Box } from "@chakra-ui/react";

// custom components
import NamedDivider from '../components/NamedDivider';

// sections
import Preface from '../sections/Preface';
import Introduction from '../sections/Introduction';
import Skills from '../sections/Skills';
import Contact from '../sections/Contact';

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
            <Skills />
            <NamedDivider name="About Me" id="aboutme" />
            <NamedDivider name="About The Site" id="aboutsite" />
            <NamedDivider name="Contact" id="contact" />
            <Contact />
        </Box>
    );
}

export default HomePage;