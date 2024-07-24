// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file.

// react
import { useState, useEffect, lazy, Suspense } from 'react';

// chakra-ui
import { Box, Spinner } from "@chakra-ui/react";

// custom components
import NamedDivider from '../components/NamedDivider';

// sections
import Preface from '../sections/Preface';
import Introduction from '../sections/Introduction';

// Lazy load the other components
const Projects = lazy(() => import('../sections/Projects'));
const Skills = lazy(() => import('../sections/Skills'));
const AboutMe = lazy(() => import('../sections/AboutMe'));
const AboutSite = lazy(() => import('../sections/AboutSite'));
const Contact = lazy(() => import('../sections/Contact'));

function HomePage() {
    const [showContent, setShowContent] = useState(false);
    const [contentLoaded, setContentLoaded] = useState(false);
    
    useEffect(() => {
        document.title = 'Kaden Bilyeu | Home';
    }, []);

    const toggleContent = () => {
        setShowContent(!showContent);
        if (!contentLoaded) {
            setContentLoaded(true);
        }
    };

    return (
        <Box bg="black" color="white" minHeight="100vh">
            <Preface />
            <NamedDivider name="Introduction" id="introduction" />
            <Introduction />
            
            <NamedDivider 
                name={showContent ? "Projects" : "Click for More"} 
                id="projects" 
                isExpandable={true}
                isExpanded={showContent}
                onToggle={toggleContent}
            />

            {contentLoaded && (
                <Suspense fallback={<Box textAlign="center" py={4}><Spinner /></Box>}>
                    {showContent && (
                        <>
                            <Projects />
                            <NamedDivider name="Skills" id="skills" />
                            <Skills />
                            <NamedDivider name="About Me" id="aboutme" />
                            <AboutMe />
                            <NamedDivider name="About The Site" id="aboutsite" />
                            <AboutSite />
                            <NamedDivider name="Contact" id="contact" />
                            <Contact />
                        </>
                    )}
                </Suspense>
            )}
        </Box>
    );
}

export default HomePage;