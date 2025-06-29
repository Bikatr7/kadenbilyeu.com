// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file.

// maintain allman bracket style for consistency

// react
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';

// chakra-ui
import { Box, Button, SimpleGrid, Text } from "@chakra-ui/react";

// logos
// @ts-ignore
import agile_logo from '../../assets/images/skills/agile_logo.webp';
// @ts-ignore
import c_logo from '../../assets/images/skills/c_logo.webp';
// @ts-ignore
import cpp_logo from '../../assets/images/skills/c++_logo.webp';
// @ts-ignore
import css_logo from '../../assets/images/skills/css_logo.webp';
// @ts-ignore
import deepL_logo from '../../assets/images/skills/deepL_logo.webp';
// @ts-ignore
import discordpy_logo from '../../assets/images/skills/discord.py_logo.webp';
// @ts-ignore
import docker_logo from '../../assets/images/skills/docker_logo.webp';
// @ts-ignore
import fastapi_logo from '../../assets/images/skills/fastapi_logo.webp';
// @ts-ignore
import flask_logo from '../../assets/images/skills/flask_logo.webp';
// @ts-ignore
import git_logo from '../../assets/images/skills/git_logo.webp';
// @ts-ignore
import github_logo from '../../assets/images/skills/github_logo.webp';
// @ts-ignore
import gradio_logo from '../../assets/images/skills/gradio_logo.webp';
// @ts-ignore
import html_logo from '../../assets/images/skills/html_logo.webp';
// @ts-ignore
import java_logo from '../../assets/images/skills/java_logo.webp';
// @ts-ignore
import javascript_logo from '../../assets/images/skills/javascript_logo.webp';
// @ts-ignore
import linux_logo from '../../assets/images/skills/linux_logo.webp';
// @ts-ignore
import mysql_logo from '../../assets/images/skills/mysql_logo.webp';
// @ts-ignore
import openai_logo from '../../assets/images/skills/openai_logo.webp';
// @ts-ignore
import oracle_sql_logo from '../../assets/images/skills/oracle_sql_logo.webp';
// @ts-ignore
import pl_sql_logo from '../../assets/images/skills/pl_sql_logo.webp';
// @ts-ignore
import python_logo from '../../assets/images/skills/python_logo.webp';
// @ts-ignore
import r_logo from '../../assets/images/skills/r_logo.webp';
// @ts-ignore
import react_logo from '../../assets/images/skills/react_logo.webp';
// @ts-ignore
import spacy_logo from '../../assets/images/skills/spacy_logo.webp';
// @ts-ignore
import typescript_logo from '../../assets/images/skills/typescript_logo.webp';
// @ts-ignore
import vite_logo from '../../assets/images/skills/vite_logo.webp';
// @ts-ignore
import plotly_logo from '../../assets/images/skills/plotly.webp';
// @ts-ignore
import networkx_logo from '../../assets/images/skills/networkx.webp';
// @ts-ignore
import numpy_logo from '../../assets/images/skills/numpy.webp';
// @ts-ignore
import django_logo from '../../assets/images/skills/django_logo.webp';
// @ts-ignore
import go_logo from '../../assets/images/skills/go_logo.webp';
// @ts-ignore
import keras_logo from '../../assets/images/skills/keras_logo.webp';
// @ts-ignore
import pytorch_logo from '../../assets/images/skills/pytorch_logo.webp';
// @ts-ignore
import tensorflow_logo from '../../assets/images/skills/tensorflow_logo.webp';

// custom components
import Skill from '../../components/Skill';

const skillData = [
    // Programming Languages
    { name: "Python", image: python_logo },
    { name: "Java", image: java_logo },
    { name: "JavaScript", image: javascript_logo },
    { name: "TypeScript", image: typescript_logo },
    { name: "C", image: c_logo },
    { name: "C++", image: cpp_logo },
    { name: "R", image: r_logo },
    { name: "Go", image: go_logo },

    // Web Technologies
    { name: "HTML", image: html_logo },
    { name: "CSS", image: css_logo },
    { name: "React", image: react_logo },

    // Databases
    { name: "MySQL", image: mysql_logo },
    { name: "Oracle SQL", image: oracle_sql_logo },
    { name: "PL/SQL", image: pl_sql_logo },

    // Version Control
    { name: "Git", image: git_logo },
    { name: "GitHub", image: github_logo },

    // DevOps & Cloud
    { name: "Docker", image: docker_logo },
    { name: "AWS" },
    { name: "Cloudflare" },
    { name: "CI/CD" },

    // Frameworks & Libraries
    { name: "FastAPI", image: fastapi_logo },
    { name: "Flask", image: flask_logo },
    { name: "Django", image: django_logo },
    { name: "Vite", image: vite_logo },
    { name: "Dash", image: plotly_logo },
    { name: "Plotly", image: plotly_logo },
    { name: "NetworkX", image: networkx_logo },
    { name: "NumPy", image: numpy_logo },
    { name: "Pandas" },
    { name: "scikit-learn" },
    { name: "Keras", image: keras_logo },
    { name: "PyTorch", image: pytorch_logo },
    { name: "TensorFlow", image: tensorflow_logo },

    // AI & NLP
    { name: "OpenAI API", image: openai_logo },
    { name: "spaCy", image: spacy_logo },

    // Other Technologies
    { name: "Linux", image: linux_logo },
    { name: "DeepL API", image: deepL_logo },
    { name: "discord.py", image: discordpy_logo },
    { name: "Gradio", image: gradio_logo },
    { name: "PIL/Pillow" },

    // Methodologies & Concepts
    { name: "Agile", image: agile_logo },
    { name: "OOP" },
    { name: "UI/UX" },
    { name: "API Integration" },

    // Soft Skills
    { name: "Teamwork" },
    { name: "Problem Solving" }
];

const developingSkills = [
    "Supabase",
    "Next.js",
    "Tailwind CSS"
];

function Skills() {
    const [showMore, setShowMore] = useState(false);
    const visibleSkills = showMore ? skillData : skillData.slice(0, 15);

    return (
        <Box p={4}>
            <Helmet>
                {/* Preload critical skill images */}
                <link rel="preload" as="image" href={python_logo} />
                <link rel="preload" as="image" href={javascript_logo} />
                <link rel="preload" as="image" href={typescript_logo} />
                <link rel="preload" as="image" href={react_logo} />
                <link rel="preload" as="image" href={java_logo} />
                <link rel="preload" as="image" href={git_logo} />
                <link rel="preload" as="image" href={docker_logo} />
                <link rel="preload" as="image" href={html_logo} />
                <link rel="preload" as="image" href={css_logo} />
            </Helmet>
            <SimpleGrid columns={[2, 3, 4, 5]} spacing={4}>
                {visibleSkills.map((skill, index) => (
                    <Skill key={index} name={skill.name} image={skill.image} />
                ))}
            </SimpleGrid>
            <Box textAlign="center" mt={4}>
                <Button
                    onClick={() => setShowMore(!showMore)}
                    _hover={{ color: 'yellow', transform: 'scale(1.01)' }}
                    _active={{ transform: 'scale(0.99)' }}
                    rounded={'full'}
                    colorScheme="teal"
                    variant="outline"
                >
                    {showMore ? "Show Less" : "Show More"}
                </Button>
            </Box>

            {/* New developing skills section */}
            <Box mt={6} textAlign="center">
                <Box fontSize="sm" color="gray.500" mb={2}>
                    Currently developing skills in the following
                </Box>
                <Box fontSize="md" color="gray.400">
                    {developingSkills.join(" • ")}
                </Box>
                <Text fontSize="sm" color="gray.500" mt={2}>
                    This is due to my current internship and personal interests.
                </Text>
            </Box>
        </Box>
    );
}

export default Skills;