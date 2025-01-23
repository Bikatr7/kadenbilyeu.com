// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file.

// maintain allman bracket style for consistency

// react
import { lazy, Suspense } from 'react';

// chakra-ui
import { Box, Spinner } from "@chakra-ui/react";

// custom components
import NamedDivider from '../components/NamedDivider';
import StorageNoticeModal from '../components/StorageNoticeModal';

// sections
import Preface from '../sections/home/Preface';
import HomeIntroduction from '../sections/home/HomeIntroduction';
import HomeProjects from '../sections/home/HomeProjects';

// Lazy load the other components
const Projects = lazy(() => import('../sections/home/HomeProjects'));
const Skills = lazy(() => import('../sections/common/Skills'));
const AboutMe = lazy(() => import('../sections/home/AboutMe'));
const AboutSite = lazy(() => import('../sections/home/AboutSite'));
const Contact = lazy(() => import('../sections/home/Contact'));
import { useTheme } from '../contexts/ThemeContext';
import { isBikatr7URL } from '../utils';

function HomePage({ showContent, toggleContent, contentLoaded }: { showContent: boolean, toggleContent: any, contentLoaded: boolean })
{
    const { isRetro } = useTheme();
    const isBikatr7 = isBikatr7URL();

    return (
        <Box 
            bg="black"
            color="white" 
            minHeight="83vh"
            className={isRetro ? 'retro-mode' : ''}
        >
            <Preface 
                showContent={showContent} 
                toggleContent={toggleContent}  
            />
            <NamedDivider 
                name="Introduction" 
                id="introduction"
            />
            <HomeIntroduction />
            
            {isRetro ? (
                <>
                    <NamedDivider 
                        name="[Projects]" 
                        id="projects"
                    />
                    <HomeProjects />
                </>
            ) : (
                <>
                    <NamedDivider
                        name={showContent ? "Projects" : "Click for More"}
                        id="projects"
                        isExpandable={true}
                        isExpanded={showContent}
                        onToggle={toggleContent}
                    />
                    {contentLoaded && (
                        <Suspense fallback={<Box textAlign="center" py={4}><Spinner color="white" /></Box>}>
                            {showContent && (
                                <>
                                    <Projects/>
                                    <NamedDivider name="Skills" id="skills" />
                                    <Skills  />
                                    <NamedDivider name="About Me" id="aboutme" />
                                    <AboutMe />
                                    <NamedDivider name="About The Site" id="aboutsite" />
                                    <AboutSite  />
                                    <NamedDivider name="Contact" id="contact"  />
                                    <Contact />
                                </>
                            )}
                        </Suspense>
                    )}
                </>
            )}
            {!isBikatr7 && <StorageNoticeModal />}
        </Box>
    );
}

export default HomePage;