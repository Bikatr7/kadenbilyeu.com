// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com)
// Use of this source code is governed by a GNU General Public License v3.0
// license that can be found in the LICENSE file.

// react
import { useState } from 'react';

// chakra-ui
import {
    Box,
    Button
} from "@chakra-ui/react";

// logos
import agile_logo from '../assets/images/skills/agile_logo.png';
import c_logo from '../assets/images/skills/c_logo.png';
import cpp_logo from '../assets/images/skills/c++_logo.png';
import css_logo from '../assets/images/skills/css_logo.png';
import deepL_logo from '../assets/images/skills/deepL_logo.png';
import discordpy_logo from '../assets/images/skills/discord.py_logo.png';
import docker_logo from '../assets/images/skills/docker_logo.png';
import fastapi_logo from '../assets/images/skills/fastapi_logo.png';
import flask_logo from '../assets/images/skills/flask_logo.png';
import git_logo from '../assets/images/skills/git_logo.png';
import github_logo from '../assets/images/skills/github_logo.png';
import gradio_logo from '../assets/images/skills/gradio_logo.png';
import html_logo from '../assets/images/skills/html_logo.png';
import java_logo from '../assets/images/skills/java_logo.png';
import javascript_logo from '../assets/images/skills/javascript_logo.png';
import linux_logo from '../assets/images/skills/linux_logo.png';
import mysql_logo from '../assets/images/skills/mysql_logo.png';
import openai_logo from '../assets/images/skills/openai_logo.jpg';
import oracle_sql_logo from '../assets/images/skills/oracle_sql_logo.png';
import pl_sql_logo from '../assets/images/skills/pl_sql_logo.png';
import python_logo from '../assets/images/skills/python_logo.png';
import r_logo from '../assets/images/skills/r_logo.png';
import react_logo from '../assets/images/skills/react_logo.png';
import spacy_logo from '../assets/images/skills/spacy_logo.png';
import typescript_logo from '../assets/images/skills/typescript_logo.png';
import vite_logo from '../assets/images/skills/vite_logo.png';

// custom components
import Skill from '../components/Skill';

const skillData = [
    { name: "Python", image: python_logo },
    { name: "Java", image: java_logo },
    { name: "JavaScript", image: javascript_logo },
    { name: "TypeScript", image: typescript_logo },
    { name: "C", image: c_logo },
    { name: "C++", image: cpp_logo },
    { name: "R", image: r_logo },
    { name: "HTML", image: html_logo },
    { name: "CSS", image: css_logo },
    { name: "MySQL", image: mysql_logo },
    { name: "Oracle SQL", image: oracle_sql_logo },
    { name: "PL/SQL", image: pl_sql_logo },
    { name: "Git", image: git_logo },
    { name: "GitHub", image: github_logo },
    { name: "Docker", image: docker_logo },
    { name: "FastAPI", image: fastapi_logo },
    { name: "Flask", image: flask_logo },
    { name: "React", image: react_logo },
    { name: "Linux", image: linux_logo },
    { name: "Agile", image: agile_logo },
    { name: "OpenAI API", image: openai_logo },
    { name: "DeepL API", image: deepL_logo },
    { name: "discord.py", image: discordpy_logo },
    { name: "Gradio", image: gradio_logo },
    { name: "spaCy", image: spacy_logo },
    { name: "PIL/Pillow" },
    { name: "Vite", image: vite_logo },
    { name: "OOP" },
    { name: "UI/UX" },
    { name: "CI/CD" },
    { name: "API Integration" },
    { name: "Teamwork" },
];

function Skills() {
    const [showMore, setShowMore] = useState(false);
    const [visibleSkills, setVisibleSkills] = useState(skillData.slice(0, 18));

    const handleToggle = () => {
        setShowMore(!showMore);
        if (!showMore) {
            setVisibleSkills(skillData); // Show all skills
        } else {
            setVisibleSkills(skillData.slice(0, 18)); // Show initial skills
        }
    };

    return (
        <Box p={4}>
            <Box
                display="grid"
                gridTemplateColumns="repeat(auto-fill, minmax(180px, 1fr))"
                gap={4}
                justifyItems="center"
                width="100%"
            >
                {visibleSkills.map((skill, index) => (
                    <Skill key={index} name={skill.name} image={skill.image} />
                ))}
            </Box>
            <Box textAlign="center" mt={4}>
                <Button 
                    onClick={handleToggle} 
                    _hover={{ color: 'yellow', transform: 'scale(1.01)' }} _active={{ transform: 'scale(0.99)' }}
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