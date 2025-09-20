// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file.

// maintain allman bracket style for consistency

// chakra-ui
import { Box } from "@chakra-ui/react";

// helmet
import { Helmet } from 'react-helmet-async';

// components
import { Card, Item } from "../../components/Card";

// icons
import { IconInfoCircle, IconChartBar, IconTarget, IconCode } from "@tabler/icons-react";

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

function PortfolioProjects() {
    const projectsSchema = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Software Development Projects',
        description: 'Portfolio of software development projects by Kaden Bilyeu',
        itemListElement: [
            {
                '@type': 'SoftwareApplication',
                name: 'Kai Language',
                description: 'Minimal, statically typed expression language implemented in Haskell',
                url: 'https://github.com/Bikatr7/kai',
                applicationCategory: 'Programming Language',
                operatingSystem: 'Cross-platform',
                programmingLanguage: ['Haskell'],
                author: {
                    '@type': 'Person',
                    name: 'Kaden Bilyeu'
                }
            },
            {
                '@type': 'WebApplication',
                name: 'Negation Game',
                description: 'Discussion platform with economic incentives for intellectual honesty and epistemic accountability',
                url: 'https://negationgame.com',
                applicationCategory: 'Discussion Platform',
                programmingLanguage: ['TypeScript', 'JavaScript'],
                author: {
                    '@type': 'Person',
                    name: 'Kaden Bilyeu'
                }
            },
            {
                '@type': 'SoftwareApplication',
                name: 'Kudasai',
                description: 'Japanese translation application using multiple APIs',
                url: 'https://github.com/Bikatr7/kudasai',
                applicationCategory: 'Translation Software',
                operatingSystem: 'Cross-platform',
                programmingLanguage: ['Python'],
                author: {
                    '@type': 'Person',
                    name: 'Kaden Bilyeu'
                }
            },
            {
                '@type': 'WebSite',
                name: 'kadenbilyeu.com',
                description: 'Personal portfolio website',
                url: 'https://kadenbilyeu.com',
                author: {
                    '@type': 'Person',
                    name: 'Kaden Bilyeu'
                },
                programmingLanguage: ['TypeScript', 'Python']
            },
            {
                '@type': 'WebSite',
                name: 'kakusui.org',
                description: 'LLC website hosting translation tools and services',
                url: 'https://kakusui.org',
                author: {
                    '@type': 'Person',
                    name: 'Kaden Bilyeu'
                },
                programmingLanguage: ['TypeScript', 'Python']
            },
            {
                '@type': 'SoftwareApplication',
                name: 'EasyTL',
                description: 'Translation API wrapper library',
                url: 'https://github.com/Bikatr7/EasyTL',
                applicationCategory: 'Software Library',
                programmingLanguage: ['Python'],
                author: {
                    '@type': 'Person',
                    name: 'Kaden Bilyeu'
                }
            },
            {
                '@type': 'SoftwareApplication',
                name: 'TLTMI',
                description: 'Local translation pipeline using Hugging Face models',
                url: 'https://github.com/Kakusui/TLTMI',
                applicationCategory: 'Translation Software',
                programmingLanguage: ['Python'],
                author: {
                    '@type': 'Person',
                    name: 'Kaden Bilyeu'
                }
            },
            {
                '@type': 'SoftwareApplication',
                name: 'Kairyou',
                description: 'Japanese text preprocessor for translation and NLP tasks',
                url: 'https://github.com/bikatr7/kairyou',
                applicationCategory: 'Software Library',
                programmingLanguage: ['Python'],
                author: {
                    '@type': 'Person',
                    name: 'Kaden Bilyeu'
                }
            },
            {
                '@type': 'SoftwareApplication',
                name: 'Seisen',
                description: 'Japanese language learning application with spaced repetition',
                url: 'https://github.com/Bikatr7/seisen',
                applicationCategory: 'Educational Software',
                programmingLanguage: ['Python'],
                author: {
                    '@type': 'Person',
                    name: 'Kaden Bilyeu'
                }
            },
            {
                '@type': 'SoftwareApplication',
                name: 'Elucidate',
                description: 'LLM-based translation evaluation and revision tool',
                url: 'https://github.com/Kakusui/Elucidate',
                applicationCategory: 'Software Library',
                programmingLanguage: ['Python'],
                author: {
                    '@type': 'Person',
                    name: 'Kaden Bilyeu'
                }
            }
        ]
    };
    return (
        <Box>
            <Helmet>
                <script type="application/ld+json">
                    {JSON.stringify(projectsSchema)}
                </script>
            </Helmet>
            <Card title="Projects">
                <Item
                    title="Kai Language"
                    dateRange="December 2024 - Present"
                    sections={[
                        {
                            title: "Language Stats",
                            icon: <IconChartBar size={16} />,
                            bgColor: "gray.700",
                            textColor: "cyan.200",
                            content: [
                                { text: "Minimal, statically typed expression language implemented in Haskell", useBullet: true },
                                { text: "v0.0.3 with full type inference, lambdas, and static type checking", useBullet: true },
                                { text: "221 test examples (Hspec + QuickCheck) - all passing", useBullet: true },
                                { text: "Complete CLI, website demo, and CI/CD with automated releases", useBullet: true }
                            ]
                        },
                        {
                            title: "What It Does",
                            icon: <IconTarget size={16} />,
                            bgColor: "gray.750",
                            textColor: "green.200",
                            content: [
                                { text: "Expression-only language with arithmetic, booleans, strings, conditionals", useBullet: true },
                                { text: "Lambda functions with closures and function application", useBullet: true },
                                { text: "Hindley-Milner style type inference with unification", useBullet: true },
                                { text: "Megaparsec parser with precedence and error handling", useBullet: true }
                            ]
                        },
                        {
                            title: "The Vision",
                            icon: <IconInfoCircle size={16} />,
                            content: [
                                "Kai is my attempt at building a clean, statically typed scripting language from scratch. It started as a way to learn Haskell and language implementation, but evolved into something I'm genuinely proud of.",
                                "The goal is to combine the safety of static typing with the ease of scripting. Think of it as what you'd get if you took the best parts of Haskell's type system and made it accessible for everyday scripting tasks.",
                                "Right now it's just expressions - no variables, no modules, no standard library. But it has solid foundations: a proper parser, complete type inference, comprehensive tests, and a clean architecture.",
                                "The roadmap includes let-bindings, algebraic data types, pattern matching, a standard library, and eventually a full module system. I want it to feel like writing Python but with the confidence that comes from strong static typing.",
                                "It's been a fantastic learning project for understanding parsers, type systems, and functional language design. Plus it's got me deep into Haskell, which has been incredibly rewarding."
                            ]
                        }
                    ]}
                    imageUrl={kai_logo}
                    imageAlt="Kai Language Logo"
                    websiteUrl="https://bikatr7.github.io/Kai/"
                    githubUrl="https://github.com/Bikatr7/kai"
                    tags={["Open Source", "Haskell", "Programming Language", "Type System", "Parser", "Compiler", "Functional Programming", "Static Typing"]}
                />
                <Item
                    title="Negation Game"
                    dateRange="November 2024 - Present"
                    sections={[
                        {
                            title: "Platform Overview",
                            icon: <IconChartBar size={16} />,
                            bgColor: "gray.700",
                            textColor: "cyan.200",
                            content: [
                                { text: "Discussion platform with economic incentives for intellectual honesty", useBullet: true },
                                { text: "Implements epistemic accountability through Cred, Favor, and commitment mechanisms", useBullet: true },
                                { text: "Features: Points/Negations, Rationales, Spaces, AI Assistant, Collaborative editing", useBullet: true },
                                { text: "Tech: Next.js, TypeScript, PostgreSQL, Yjs, Privy, Gemini AI, OpenAI", useBullet: true }
                            ]
                        },
                        {
                            title: "What It Does",
                            icon: <IconTarget size={16} />,
                            bgColor: "gray.750",
                            textColor: "green.200",
                            content: [
                                { text: "Creates economic incentives for changing your mind when presented with evidence", useBullet: true },
                                { text: "Rewards intellectual integrity through Restaking, Slashing, and Doubting mechanisms", useBullet: true },
                                { text: "Enables structured reasoning through Rationales and organized argument trees", useBullet: true },
                                { text: "Provides topic-focused discussion Spaces for communities and DAOs", useBullet: true }
                            ]
                        },
                        {
                            title: "My Contributions",
                            icon: <IconInfoCircle size={16} />,
                            content: [
                                "I've been the lead full-stack developer on Negation Game since taking ownership in February 2024. This has been one of the most intellectually challenging and rewarding projects I've worked on.",
                                "The core concept is fascinating: what if we could create a discussion platform where being wrong isn't embarrassing, but profitable? Where admitting you changed your mind based on evidence actually earns you resources?",
                                "I've implemented the entire economic incentive system, the collaborative editing features using Yjs, the AI assistant integration, and the complex relationship system between Points and Negations.",
                                "The technical challenges have been substantial - building a real-time collaborative platform with complex economic mechanics, while keeping the UX intuitive enough that people actually want to use it.",
                                "We're constantly iterating on the game theory aspects, trying to find the right balance of incentives that promote genuine truth-seeking behavior rather than gaming the system.",
                                "It's been an incredible learning experience in game theory, mechanism design, real-time systems, and building products that try to improve how humans reason together."
                            ]
                        }
                    ]}
                    imageUrl={negation_game_logo}
                    imageAlt="Negation Game Logo"
                    websiteUrl="https://negationgame.com"
                    githubUrl="https://github.com/network-goods-institute/negation-game"
                    tags={["Employment Project", "Next.js", "TypeScript", "PostgreSQL", "Yjs", "Game Theory", "Epistocracy", "Real-time", "AI Integration"]}
                    employmentProject={true}
                />
                <Item
                    title="Homelab Management Portal"
                    dateRange="Future Project"
                    sections={[
                        {
                            title: "Infrastructure Vision",
                            icon: <IconChartBar size={16} />,
                            bgColor: "gray.700",
                            textColor: "cyan.200",
                            content: [
                                { text: "Transform kadenbilyeu.com into a comprehensive homelab management portal", useBullet: true },
                                { text: "Monitor all self-hosted services and infrastructure", useBullet: true },
                                { text: "Centralized control panel for Docker containers and services", useBullet: true },
                                { text: "Network monitoring and diagnostics tools", useBullet: true },
                                { text: "Git mirror management for git.kadenbilyeu.com and git.bikatr.7.com", useBullet: true }
                            ]
                        },
                        {
                            title: "Planned Features",
                            icon: <IconTarget size={16} />,
                            bgColor: "gray.750",
                            textColor: "green.200",
                            content: [
                                { text: "System status monitoring and resource usage tracking", useBullet: true },
                                { text: "Automated backup monitoring and management", useBullet: true },
                                { text: "Log aggregation and centralized logging dashboard", useBullet: true },
                                { text: "Service orchestration and container management", useBullet: true },
                                { text: "Network tools and internal diagnostics", useBullet: true }
                            ]
                        },
                        {
                            title: "Open Source Commitment",
                            icon: <IconInfoCircle size={16} />,
                            content: [
                                "When I have the time to develop this, I plan to open source the entire homelab management system. This follows my philosophy of making infrastructure tools freely available to the community.",
                                "The portal will be built using the existing kadenbilyeu.com tech stack (React, TypeScript, FastAPI, Docker) and will serve as both a personal management tool and a template for others to deploy their own homelab monitoring solutions.",
                                "This project represents the natural evolution of my self-hosted ecosystem - taking all the individual services and providing a unified interface to manage them all."
                            ]
                        }
                    ]}
                    imageUrl={kb_logo}
                    imageAlt="Homelab Management Portal Logo"
                    websiteUrl="https://kadenbilyeu.com"
                    githubUrl="https://github.com/Bikatr7/kadenbilyeu.com"
                    tags={["Future Project", "Homelab", "Infrastructure", "Monitoring", "Self-Hosting", "Open Source", "React", "FastAPI", "Docker"]}
                />
                <Item
                    title="Kudasai"
                    dateRange="January 2023 - Present"
                    sections={[
                        {
                            title: "Quick Stats",
                            icon: <IconChartBar size={16} />,
                            bgColor: "gray.700",
                            textColor: "cyan.200",
                            content: [
                                { text: "25 Stars on GitHub", useBullet: true },
                                { text: "Supports 6 translation APIs (Google, DeepL, OpenAI, Gemini, Azure, Anthropic)", useBullet: true },
                                { text: "Japanese text preprocessing with 95%+ accuracy on NER tasks", useBullet: true },
                                { text: "Complete translation pipeline from raw text to JE-checked output", useBullet: true }
                            ]
                        },
                        {
                            title: "What It Does",
                            icon: <IconTarget size={16} />,
                            bgColor: "gray.750",
                            textColor: "green.200",
                            content: [
                                { text: "Efficiently translates Japanese text using multiple APIs with preprocessing", useBullet: true },
                                { text: "Handles complex Japanese syntax, names, and cultural references", useBullet: true },
                                { text: "Built-in quality checking for translation accuracy (JE checking)", useBullet: true },
                                { text: "Spawned two major libraries: EasyTL (API wrapper) and Kairyou (preprocessing)", useBullet: true }
                            ]
                        },
                        {
                            title: "The Journey",
                            icon: <IconInfoCircle size={16} />,
                            content: [
                                "Kudasai is my pride and joy of the programming world. Put simply, it's an application that allows you to efficiently translate Japanese text using multiple APIs.",
                                "Originally, it was designed to be a simple preprocessor (Which is what Kairyou is now), but as I added more and more features, it became more and more of a full-fledged Japanese translation pipeline.",
                                "It got so big I had to split up the main logic into their own libraries (now EasyTL and Kairyou). A lot of my projects connect back to Translation and Japanese in some way which you'll see.",
                                "If you need translate Japanese and want to JE check (term for people checking the accuracy of a machine translation output) it well. Use Kudasai.",
                                "I really wish I had the need to completely redesign it from the ground up, but it's just not there. It works well for what it is, and eventually Kudasai will become something that just isn't needed anymore."
                            ]
                        }
                    ]}
                    imageUrl={kudasai_logo}
                    imageAlt="Kudasai Logo"
                    websiteUrl="https://huggingface.co/spaces/Bikatr7/Kudasai"
                    githubUrl="https://github.com/Bikatr7/kudasai"
                    tags={["Open Source", "Python", "Hugging Face", "sPacy", "Google Translate", "DeepL", "OpenAI", "Gemini", "Gradio"]}
                />
                <Item
                    title="kadenbilyeu.com"
                    dateRange="June 2024 - Present"
                    sections={[
                        {
                            title: "Tech Stack",
                            icon: <IconCode size={16} />,
                            bgColor: "gray.700",
                            textColor: "cyan.200",
                            content: [
                                { text: "Frontend: React, TypeScript, Vite, Chakra UI", useBullet: true },
                                { text: "Backend: Python, FastAPI, SQLite with automated backups", useBullet: true },
                                { text: "Deployment: Docker containers, automated CI/CD", useBullet: true },
                                { text: "Security: JWT auth, TOTP 2FA, GPG encrypted backups", useBullet: true },
                                { text: "Features: Blog system, portfolio, responsive design", useBullet: true }
                            ]
                        },
                        {
                            title: "Self-Hosting & Infrastructure",
                            icon: <IconChartBar size={16} />,
                            bgColor: "gray.750",
                            textColor: "green.200",
                            content: [
                                { text: "Fully self-hosted backend with Docker containerization", useBullet: true },
                                { text: "Automated encrypted database backups (every 6 hours via SMTP)", useBullet: true },
                                { text: "Production API endpoint: https://api.kadenbilyeu.com", useBullet: true },
                                { text: "Git mirrors hosted on git.kadenbilyeu.com and git.bikatr.7.com", useBullet: true },
                                { text: "Infrastructure designed for high availability and redundancy", useBullet: true }
                            ]
                        },
                        {
                            title: "Origin Story",
                            icon: <IconInfoCircle size={16} />,
                            content: [
                                "This is my personal website, the one you're on right now. I'm very proud of this as well. It's funny because I made it solely out of spite because my friends said my old GitHub pages site was ugly (to be fair it was).",
                                "It's fairly simple, blog backend, static frontend. Not much to say.",
                                "I did it with React, TypeScript, Vite, Python, FastAPI, Docker, and sqlite. It's a pretty simple stack and it's a cute website."
                            ]
                        }
                    ]}
                    imageUrl={kb_logo}
                    imageAlt="Kaden Bilyeu Logo"
                    websiteUrl="https://kadenbilyeu.com"
                    githubUrl="https://github.com/Bikatr7/kadenbilyeu.com"
                    tags={["Open Source", "React", "TypeScript", "Vite", "Python", "FastAPI", "Docker", "sqlite"]}
                />
                <Item
                    title="kakusui.org"
                    dateRange="April 2024 - Present"
                    sections={[
                        {
                            title: "Business Overview",
                            icon: <IconChartBar size={16} />,
                            bgColor: "gray.700",
                            textColor: "cyan.200",
                            content: [
                                { text: "LLC website hosting translation tools and services", useBullet: true },
                                { text: "BYOK (Bring Your Own Key) methods for EasyTL, Kairyou, Elucidate", useBullet: true },
                                { text: "Free hosting for open source translation tools", useBullet: true },
                                { text: "Self-hosted infrastructure with Docker containers", useBullet: true },
                                { text: "Future plans: SaaS features, custom translation models", useBullet: true }
                            ]
                        },
                        {
                            title: "Self-Hosting & Infrastructure",
                            icon: <IconTarget size={16} />,
                            bgColor: "gray.750",
                            textColor: "green.200",
                            content: [
                                { text: "Fully self-hosted backend using FastAPI and Docker", useBullet: true },
                                { text: "Automated deployment and container orchestration", useBullet: true },
                                { text: "Supports multiple translation APIs with BYOK architecture", useBullet: true },
                                { text: "Infrastructure designed to handle translation workloads efficiently", useBullet: true },
                                { text: "Negligible hosting costs for BYOK free tier services", useBullet: true }
                            ]
                        },
                        {
                            title: "The LLC Life",
                            icon: <IconTarget size={16} />,
                            content: [
                                "This is the website for my LLC, Kakusui LLC. It was created for the sole purpose for me to well, have an LLC and structure my projects around Translation.",
                                "Currently, it mostly just hosts BYOK methods for my other creations, those being EasyTL, Kairyou, and Elucidate.",
                                "At some point, I want to expand upon it further, maybe turn it into something of a SaaS Lite, where it looks nicer and offers paid translation features. I sort of did it but like, there's no real market or use for it.",
                                "BYOK will always be free of course, and hosting costs are completely negligible for me. But having a way to provide paid translation features is something cool even if it's not really used.",
                                "If i ever have the time I'll train my own translation model and do some cool things under the Kakusui umbrella, but again, I don't have the time."
                            ]
                        }
                    ]}
                    imageUrl={kakusui_logo}
                    imageAlt="Kakusui Logo"
                    websiteUrl="https://kakusui.org"
                    githubUrl="https://github.com/Kakusui/kakusui.org"
                    tags={["Open Source", "React", "TypeScript", "Vite", "Python", "FastAPI", "Docker"]}
                />
                <Item
                    title="EasyTL"
                    dateRange="February 2024 - Present"
                    sections={[
                        {
                            title: "Library Stats",
                            icon: <IconChartBar size={16} />,
                            bgColor: "gray.700",
                            textColor: "cyan.200",
                            content: [
                                { text: "Unified API wrapper for 6 translation services (Google, DeepL, OpenAI, etc.)", useBullet: true },
                                { text: "Extracted from Kudasai to be reusable across projects", useBullet: true },
                                { text: "Custom prompting support for LLM-based translation", useBullet: true }
                            ]
                        },
                        {
                            title: "The Extraction Story",
                            icon: <IconInfoCircle size={16} />,
                            content: [
                                "When one project gets so bloated that it would be easier to extract all the logic to a separate library to maintain, iterate, and improve on it there instead, that is what EasyTL is.",
                                "That project was Kudasai, and at a certain point EasyTL was realized.",
                                "Basically, it's like 6 different API's (3 strictly translation, and 3 LLM ones) wrapped together and made consistent with each other by streamlining the logic and adding more features.",
                                "So in the end, it was a customizable translation tool, you wouldn't be limited to strictly one API, and with the LLM ones translation becomes truly unique I feel.",
                                "You can't really tell something like google translate or deepl to translate something in a certain way, but with LLM's you can. I feel that is a big part of the future of translation.",
                                "At a certain point Kudasai became so messy and I realized I wanted the translation logic for other projects so I stole it from myself, and put it in EasyTL.",
                                "I won't pretend it's anything totally special or unique but it's pretty cool and I'm proud of it."
                            ]
                        }
                    ]}
                    imageUrl={easytl_logo}
                    imageAlt="EasyTL Logo"
                    websiteUrl="https://easytl.org"
                    githubUrl="https://github.com/Bikatr7/EasyTL"
                    tags={["Open Source", "Python", "Package", "OpenAI", "DeepL", "Google Translate", "Gemini", "Azure", "Anthropic", "React", "TypeScript", "Vite", "FastAPI"]}
                />
                <Item
                    title="TLTMI"
                    dateRange="August 2024 - January 2025"
                    sections={[
                        {
                            title: "Project Status",
                            icon: <IconChartBar size={16} />,
                            bgColor: "gray.700",
                            textColor: "orange.200",
                            content: [
                                { text: "Local translation pipeline using Hugging Face Transformers", useBullet: true },
                                { text: "FastAPI Docker container with Helsinki-NLP opus-mt models", useBullet: true },
                                { text: "Paused as of January 2025 - Better tools for LLMs and Better LLMs themselves made it obsolete", useBullet: true },
                                { text: "Early exploration of local translation before LLM dominance", useBullet: true }
                            ]
                        },
                        {
                            title: "The Reality Check",
                            icon: <IconInfoCircle size={16} />,
                            content: [
                                "This is that local translation thing I was talking about earlier, it's still a work in progress and I don't really know how it will turn out yet.",
                                "But basically, we set up a lightweight FastAPI Docker container that uses models from the Huggingface Transformers python library, and we can translate using those.",
                                "Think of it as a mini translation pipeline, currently it uses Helsinki-NLP's opus-mt batch of models.",
                                "That's all I really want to target, I don't really have much time right now so I'm trying to allocate it everywhere which leads to slow progress on my own.",
                                "I paused it as of January 2025, as frankly by the time I was able to put work on it, Translation by LLMs doesn't really need custom tools like this anymore.",
                                "I hoped on this boat fairly early in 2023, but I think it's safe to say translation by humans is going to be near dead soon."
                            ]
                        }
                    ]}
                    imageUrl={tltmi_logo}
                    imageAlt="TLTMI Logo"
                    githubUrl="https://github.com/Kakusui/TLTMI"
                    tags={["Python", "FastAPI", "Docker", "Hugging Face", "Helsinki-NLP", "Local Translation"]}
                />
                <Item
                    title="Kairyou"
                    dateRange="December 2023 - Present"
                    sections={[
                        {
                            title: "Technical Overview",
                            icon: <IconChartBar size={16} />,
                            bgColor: "gray.700",
                            textColor: "cyan.200",
                            content: [
                                { text: "Japanese text preprocessor using sPacy NER/NLP", useBullet: true },
                                { text: "Evolved from simple string replacement to advanced NLP pipeline", useBullet: true },
                                { text: "Handles complex Japanese linguistics (names, katakana, context)", useBullet: true },
                                { text: "Extracted from Kudasai, now standalone library", useBullet: true }
                            ]
                        },
                        {
                            title: "The Heritage Story",
                            icon: <IconInfoCircle size={16} />,
                            content: [
                                "Oh Kairyou, it'll always have a special place in my heart. It was originally just the original Kudasai script I inherited.",
                                "I can't take full credit with most of my things, but the originally Kudasai script was actually called Onegai, and was made by a very smart person named Void.",
                                "Back then I didn't really understand git, so I kinda just took it, and made it my own repository instead of forking it properly. I regret that, but thankfully I refactored and changed it enough that I can call it my own.",
                                "Just like EasyTL, it's a library that originated from Kudasai, but it's also a standalone thing that can be used to preprocess Japanese text for translation or other NLP tasks.",
                                "Back when I first got it, it was basically just a fancy string.replace() iterator that ingested a json, but nowadays it's a lot more powerful and can do a lot more things.",
                                "I built the NER/NLP stuff myself on top of it, I talked with a few friends as we were troubleshooting on how to deal with katakana, since if you're not familiar with Japanese it's pretty commonly used with names but it's not something that's easily to programmatically analyze",
                                "Like sure, a human can look at it and be like 'oh that's a name', but it's not something that a computer can easily do. If you try to bulk replace things you'll end up replacing a lot of things you don't want to replace.",
                                "NER/NLP fixes most of that with normal Japanese, but Katakana is like, well for lack of a better word, bullshit. So you can only do so much with it."
                            ]
                        }
                    ]}
                    imageUrl={kairyou_logo}
                    imageAlt="Kairyou Logo"
                    websiteUrl="https://kakusui.org/kairyou"
                    githubUrl="https://github.com/bikatr7/kairyou"
                    tags={["Open Source", "Python", "NLP", "sPacy", "NER"]}
                />
                <Item
                    title="Seisen"
                    dateRange="May 2022 - July 2024"
                    sections={[
                        {
                            title: "Project Legacy",
                            icon: <IconChartBar size={16} />,
                            bgColor: "gray.700",
                            textColor: "cyan.200",
                            content: [
                                { text: "My first true programming project - Japanese learning app", useBullet: true },
                                { text: "Spaced repetition system with custom scheduling algorithm", useBullet: true },
                                { text: "MySQL database with Python interface and scoring system", useBullet: true },
                                { text: "Foundation for all my programming knowledge", useBullet: true }
                            ]
                        },
                        {
                            title: "The Learning Journey",
                            icon: <IconInfoCircle size={16} />,
                            content: [
                                "Seisen was my first true project. Sadly most of it's history is not on GitHub as I was a dumb kid iterating on IDLE of all things.",
                                "This was what I used to train myself on Japanese. It's basically a worse Anki. I don't really work on it anymore, and nobody else really uses it. So I have shelved it.",
                                "But hey, it taught me a lot about Python and I'll always be grateful for that.",
                                "In short it was basically just a really fancy loop around a sort of interface to MySQL. It had it's own scheduler and used something similar to spaced repetition to schedule reviews, with a scoring system on the side to poke things in a different way.",
                                "The bulk majority of my initial programming knowledge was from Seisen, and I'll always be grateful for that.",
                                "Still fun to use as it does work, but... at this point I just use Anki."
                            ]
                        }
                    ]}
                    imageUrl={seisen_logo}
                    imageAlt="Seisen Logo"
                    githubUrl="https://github.com/Bikatr7/seisen"
                    tags={["Open Source", "Python", "MySQL", "mysql-connector-python"]}
                />
                <Item
                    title="Elucidate"
                    dateRange="June 2024 - July 2024"
                    sections={[
                        {
                            title: "Vision vs Reality",
                            icon: <IconChartBar size={16} />,
                            bgColor: "gray.700",
                            textColor: "orange.200",
                            content: [
                                { text: "Ambitious LLM self-evaluation and revision system for translations", useBullet: true },
                                { text: "Prototype works but doesn't match original vision", useBullet: true },
                                { text: "Attempted runtime protocol bootstrapping (too complex)", useBullet: true },
                                { text: "Shelved for future agentic AI approach", useBullet: true }
                            ]
                        },
                        {
                            title: "The Complicated Story",
                            icon: <IconInfoCircle size={16} />,
                            content: [
                                "Elucidate is.. complicated. I wanted it to be something that could support EasyTL and maybe Kudasai, but I don't think my programming skills are good enough to build what I envisioned, at least at the time since I have revisited it in over a year at the time of updating this (September 2025). I probably could but I don't have the time or interest anymore.",
                                "I wanted it to be a way for LLMs to self-evaluate their translations. Basically you have something like EasyTL translate some text, and then send it to Elucidate to see how accurate it is and revise it.",
                                "But at a certain point I decided to reuse EasyTL application code by utilizing Protocols. This would work by bootstrapping new functions onto the EasyTL package at runtime, and then ELucidate would use the modified EasyTL under the hood.",
                                "But then it occurred to me that this was pointless, I could just modify EasyTL at this point. So I dropped it.",
                                "I also wanted it to be agentic and function sort of like a code interpreter, in the end it just wasn't worth the time or effort.",
                                "It's technically a functioning product, but it's not what I wanted. Currently I feel like it would do better with a new codebase and agentic code. But I am still new to that world and do not have the time outside of school and work to research it.",
                                "One day, I will come back to it. (TM)"
                            ]
                        }
                    ]}
                    imageUrl={elucidate_logo}
                    imageAlt="Elucidate Logo"
                    websiteUrl="https://kakusui.org/elucidate"
                    githubUrl="https://github.com/Kakusui/Elucidate"
                    tags={["Open Source", "Python", "OpenAI", "Gemini", "Anthropic"]}
                />
            </Card>
        </Box>
    );
}

export default PortfolioProjects;