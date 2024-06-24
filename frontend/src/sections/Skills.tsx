// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by a GNU General Public License v3.0
// license that can be found in the LICENSE file.

// react
import { useState } from 'react';

// chakra-ui
import {
    Box,
    Button,
    Collapse,
} from "@chakra-ui/react";

// logos
import agile_logo from '../assets/images/skills/agile_logo.png'
import c_logo from '../assets/images/skills/c_logo.png'
import cpp_logo from '../assets/images/skills/c++_logo.png'
import css_logo from '../assets/images/skills/css_logo.png'
import deepL_logo from '../assets/images/skills/deepL_logo.png'
import discordpy_logo from '../assets/images/skills/discord.py_logo.png'
import docker_logo from '../assets/images/skills/docker_logo.png'
import fastapi_logo from '../assets/images/skills/fastapi_logo.png'
import flask_logo from '../assets/images/skills/flask_logo.png'
import git_logo from '../assets/images/skills/git_logo.png'
import github_logo from '../assets/images/skills/github_logo.png'
import gradio_logo from '../assets/images/skills/gradio_logo.png'
import html_logo from '../assets/images/skills/html_logo.png'
import java_logo from '../assets/images/skills/java_logo.png'
import javascript_logo from '../assets/images/skills/javascript_logo.png'
import linux_logo from '../assets/images/skills/linux_logo.png'
import mysql_logo from '../assets/images/skills/mysql_logo.png'
import openai_logo from '../assets/images/skills/openai_logo.jpg'
import oracle_sql_logo from '../assets/images/skills/oracle_sql_logo.png'
import pl_sql_logo from '../assets/images/skills/pl_sql_logo.png'
import python_logo from '../assets/images/skills/python_logo.png'
import r_logo from '../assets/images/skills/r_logo.png'
import react_logo from '../assets/images/skills/react_logo.png'
import spacy_logo from '../assets/images/skills/spacy_logo.png'
import typescript_logo from '../assets/images/skills/typescript_logo.png'
import vite_logo from '../assets/images/skills/vite_logo.png'

// custom components
import Skill from '../components/Skill';

function Skills() {
    const [showMore, setShowMore] = useState(false);

    const handleToggle = () => setShowMore(!showMore);

    return (
        <Box p={4}>
            <Box
                display="grid"
                gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))"
                gap={4}
                justifyItems="center"
            >
                {/* Programming Languages */}
                <Skill name="Python" image={python_logo} />
                <Skill name="Java" image={java_logo} />
                <Skill name="JavaScript" image={javascript_logo} />
                <Skill name="TypeScript" image={typescript_logo} />
                <Skill name="C" image={c_logo} />
                <Skill name="C++" image={cpp_logo} />
                <Skill name="R" image={r_logo} />
                <Skill name="HTML" image={html_logo} />
                <Skill name="CSS" image={css_logo} />
                
                {/* Databases */}
                <Skill name="MySQL" image={mysql_logo} />
                <Skill name="Oracle SQL" image={oracle_sql_logo} />
                <Skill name="PL/SQL" image={pl_sql_logo} />

                {/* Tools & Platforms */}
                <Skill name="Git" image={git_logo} />
                <Skill name="GitHub" image={github_logo} />
                <Skill name="Docker" image={docker_logo} />
                <Skill name="FastAPI" image={fastapi_logo} />
                <Skill name="Flask" image={flask_logo} />
                <Skill name="React" image={react_logo} />
                <Skill name="Linux" image={linux_logo} />

                {/* Methodologies */}
                <Skill name="Agile" image={agile_logo} />
            </Box>

            <Collapse in={showMore} animateOpacity>
                <Box
                    display="grid"
                    gridTemplateColumns="repeat(auto-fit, minmax(200px, 1fr))"
                    gap={4}
                    justifyItems="center"
                    mt={4}
                >
                    {/* Additional Tools & Libraries */}
                    <Skill name="OpenAI API" image={openai_logo} />
                    <Skill name="DeepL API" image={deepL_logo} />
                    <Skill name="discord.py" image={discordpy_logo} />
                    <Skill name="Gradio" image={gradio_logo} />
                    <Skill name="spaCy" image={spacy_logo} />
                    <Skill name="PIL/Pillow" />
                    <Skill name="Vite" image={vite_logo} />
                    
                    {/* Concepts */}
                    <Skill name="OOP" />
                    <Skill name="UI/UX" />
                    <Skill name="CI/CD" />
                    <Skill name="API Integration" />

                    {/* Soft Skills */}
                    <Skill name="Teamwork" />
                </Box>
            </Collapse>

            <Box textAlign="center" mt={4}>
                <Button 
                    onClick={handleToggle} 
                    _hover={{ color: 'yellow' }} 
                    rounded={'full'}
                    colorScheme="teal"
                    variant="outline"
                >
                    {showMore ? "Show Less" : "Show More"}
                </Button>
            </Box>
        </Box>
    );
}

export default Skills;