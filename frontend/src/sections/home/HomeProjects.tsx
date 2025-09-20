// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file.

// maintain allman bracket style for consistency

// logos
import elucidate_logo from '../../assets/images/logos/projects/elucidate_logo.webp';
import easytl_logo from '../../assets/images/logos/projects/easytl_logo.webp';
import kairyou_logo from '../../assets/images/logos/projects/kairyou_logo.webp';
import kakusui_logo from '../../assets/images/logos/projects/kakusui_logo.webp';
import kudasai_logo from '../../assets/images/logos/projects/kudasai_logo.webp';
import seisen_logo from '../../assets/images/logos/projects/seisen_logo.webp';
import tltmi_logo from '../../assets/images/logos/projects/tltmi_logo.webp';
import kai_logo from '../../assets/images/logos/projects/kai_logo.svg';
import negation_game_logo from '../../assets/images/logos/projects/negation_game_logo.png';
import kb_logo from '../../assets/images/personals/kb.webp';

// custom components
import Project from '../../components/Project';
import { useTheme } from '../../contexts/ThemeContext';
import { SimpleGrid } from '@chakra-ui/react';

function Projects() {
    const { isRetro } = useTheme();

    const projects = [
        {
            title: "Kai Language",
            subtitle: "A minimal, statically typed expression language implemented in Haskell",
            imageUrl: kai_logo,
            imageAlt: "Kai Language Logo",
            linkUrl: "https://bikatr7.github.io/Kai/",
            githubUrl: "https://github.com/Bikatr7/kai",
            tags: ["Open Source", "Haskell", "Programming Language", "Type System", "Parser", "Compiler", "Functional Programming"]
        },
        {
            title: "Negation Game",
            subtitle: "Discussion platform with economic incentives for intellectual honesty and epistemic accountability",
            imageUrl: negation_game_logo,
            imageAlt: "Negation Game Logo",
            linkUrl: "https://negationgame.com",
            githubUrl: "https://github.com/network-goods-institute/negation-game",
            tags: ["Employment Project", "Next.js", "TypeScript", "PostgreSQL", "Game Theory", "Real-time", "AI Integration"],
            employmentProject: true
        },
        {
            title: "Homelab Management Portal",
            subtitle: "Future project to transform kadenbilyeu.com into a comprehensive homelab management portal",
            imageUrl: kb_logo,
            imageAlt: "Homelab Management Portal Logo",
            linkUrl: "https://kadenbilyeu.com",
            githubUrl: "https://github.com/Bikatr7/kadenbilyeu.com",
            tags: ["Future Project", "Homelab", "Infrastructure", "Monitoring", "Self-Hosting", "Open Source", "React", "FastAPI", "Docker"]
        },
        {
            title: "Kudasai",
            subtitle: "Streamlining Japanese-English Translation with Advanced Preprocessing",
            imageUrl: kudasai_logo,
            imageAlt: "Kudasai Logo",
            linkUrl: "https://huggingface.co/spaces/Bikatr7/Kudasai",
            githubUrl: "https://github.com/Bikatr7/kudasai",
            tags: ["Open Source", "Python", "Hugging Face", "sPacy", "Google Translate", "DeepL", "OpenAI", "Gemini", "Gradio"]
        },
        {
            title: "kadenbilyeu.com",
            subtitle: "My personal website (the one you're on right now) - Fully self-hosted with automated backups",
            imageUrl: kb_logo,
            imageAlt: "Kaden Bilyeu Logo",
            linkUrl: "https://kadenbilyeu.com",
            githubUrl: "https://github.com/Bikatr7/kadenbilyeu.com",
            tags: ["Open Source", "React", "TypeScript", "Vite", "Python", "FastAPI", "Docker", "Self-Hosted", "Automated Backups"]
        },
        {
            title: "kakusui.org",
            subtitle: "The Official Website of Kakusui, a LLC aiming to revolutionize machine translation with new LLM and AI technologies.",
            imageUrl: kakusui_logo,
            imageAlt: "Kakusui Logo",
            linkUrl: "https://kakusui.org",
            githubUrl: "https://github.com/Kakusui/kakusui.org",
            tags: ["Open Source", "React", "TypeScript", "Vite", "Python", "FastAPI", "Docker"]
        },
        {
            title: "EasyTL",
            subtitle: "Seamless Multi-API Translation: Simplifying Language Barriers with DeepL, OpenAI, Gemini, Google Translate and More!",
            imageUrl: easytl_logo,
            imageAlt: "EasyTL Logo",
            linkUrl: "https://easytl.org",
            githubUrl: "https://github.com/Bikatr7/EasyTL",
            documentationUrl: "https://easytl.readthedocs.io/en/latest/index.html",
            tags: ["Open Source", "Python", "Package", "OpenAI", "DeepL", "Google Translate", "Gemini", "Azure", "Anthropic", "React", "TypeScript", "Vite", "FastAPI"]
        },
        {
            title: "TLTMI",
            subtitle: "A lightweight translation container using Huggingface Transformers",
            imageUrl: tltmi_logo,
            imageAlt: "TLTMI Logo",
            githubUrl: "https://github.com/Kakusui/TLTMI",
            tags: ["Open Source", "Python", "Hugging Face", "FastAPI", "Docker"]
        },
        {
            title: "Kairyou",
            subtitle: "Quickly preprocesses Japanese text using NLP/NER from SpaCy for Japanese translation or other NLP tasks.",
            imageUrl: kairyou_logo,
            imageAlt: "Kairyou Logo",
            linkUrl: "https://kakusui.org/kairyou",
            githubUrl: "https://github.com/bikatr7/kairyou",
            tags: ["Open Source", "Python", "NLP", "sPacy", "NER"]
        },
        {
            title: "Seisen",
            subtitle: "Train yourself on Japanese kana, kanji, and vocabulary!",
            imageUrl: seisen_logo,
            imageAlt: "Seisen Logo",
            githubUrl: "https://github.com/Bikatr7/seisen",
            tags: ["Open Source", "Python", "MySQL", "mysql-connector-python"]
        },
        {
            title: "Elucidate",
            subtitle: "Smarter Translations through LLM Self-Evaluation",
            imageUrl: elucidate_logo,
            imageAlt: "Elucidate Logo",
            linkUrl: "https://kakusui.org/elucidate",
            githubUrl: "https://github.com/Kakusui/Elucidate",
            tags: ["Open Source", "Python", "OpenAI", "Gemini", "Anthropic"]
        }
    ];

    return (
        <>
            {isRetro ? (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} px={4} mb={10}>
                    {projects.map((project, index) => (
                        <Project
                            key={index}
                            {...project}
                        />
                    ))}
                </SimpleGrid>
            ) : (
                <>
                    {projects.map((project, index) => (
                        <Project
                            key={index}
                            {...project}
                            reverse={index % 2 === 1}
                        />
                    ))}
                </>
            )}
        </>
    );
}

export default Projects;