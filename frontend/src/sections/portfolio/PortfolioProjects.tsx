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

// logos
import elucidate_logo from '../../assets/images/logos/projects/elucidate_logo.webp';
import easytl_logo from '../../assets/images/logos/projects/easytl_logo.webp';
import kairyou_logo from '../../assets/images/logos/projects/kairyou_logo.webp';
import kakusui_logo from '../../assets/images/logos/projects/kakusui_logo.webp';
import kudasai_logo from '../../assets/images/logos/projects/kudasai_logo.webp';
import seisen_logo from '../../assets/images/logos/projects/seisen_logo.webp';
import tltmi_logo from '../../assets/images/logos/projects/tltmi_logo.webp';
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
                    title="Kudasai"
                    dateRange="January 2023 - Present"
                    description={[
                        "Kudasai is my pride and joy of the programming world. Put simply, it's an application that allows you to efficiently translate Japanese text using multiple APIs.",
                        "There's a lot too it, it's based on EasyTL and Kairyou and combines them both with a lot of additional logic to specifically target Japanese Translation.",
                        "Originally, it was designed to be a simple preprocessor (Which is what Kairyou is now), but as I added more and more features, it became more and more of a full-fledged Japanese translation pipeline.",
                        "It got so big I had to split up the main logic into their own libraries (now EasyTL and Kairyou).",
                        "A lot of my projects connect back to Translation and Japanese in some way which you'll see.",
                        "Datelines are also subjective, as I consider maintaining being something I still work on. I don't really abandon projects that often.",
                        "If you need translate Japanese and want to JE check (term for people checking the accuracy of a machine translation output) it well. Use Kudasai.",
                        "I'll come back to this soon, currently working on a way to translate locally (no other people's apis) and will soon add Anthropic's Claude."
                    ]}
                    imageUrl={kudasai_logo}
                    imageAlt="Kudasai Logo"
                    websiteUrl="https://huggingface.co/spaces/Bikatr7/Kudasai"
                    githubUrl="https://github.com/Bikatr7/kudasai"
                    tags={["Open Source", "Python", "Hugging Face", "sPacy", "Google Translate", "DeepL", "OpenAI", "Gemini", "Gradio"]}
                    useBulletPoints={false}
                />
                <Item
                    title="kadenbilyeu.com"
                    dateRange="June 2024 - Present"
                    description={[
                        "This is my personal website, the one you're on right now. I'm very proud of this as well. It's funny because I made it solely out of spite because my friends said my old GitHub pages site was ugly (to be fair it was).",
                        "It's fairly simple, blog backend, static frontend. Not much to say."
                    ]}
                    imageUrl={kb_logo}
                    imageAlt="Kaden Bilyeu Logo"
                    websiteUrl="https://kadenbilyeu.com"
                    githubUrl="https://github.com/Bikatr7/kadenbilyeu.com"
                    tags={["Open Source", "React", "TypeScript", "Vite", "Python", "FastAPI", "Docker", "sqlite"]}
                    useBulletPoints={false}
                />
                <Item
                    title="kakusui.org"
                    dateRange="April 2024 - Present"
                    description={[
                        "This is the website for my LLC, Kakusui LLC. It was created for the sole purpose for me to well, have an LLC and structure my projects around Translation.",
                        "Currently, it mostly just hosts BYOK methods for my other creations, those being EasyTL, Kairyou, and Elucidate.",
                        "At some point, I want to expand upon it further, maybe turn it into something of a SaaS Lite, where it looks nicer and offers paid translation features.",
                        "BYOK will always be free of course, and hosting costs are completely negligible for me. But having a way to provide paid translation features is something I'd like to do.",
                    ]}
                    imageUrl={kakusui_logo}
                    imageAlt="Kakusui Logo"
                    websiteUrl="https://kakusui.org"
                    githubUrl="https://github.com/Kakusui/kakusui.org"
                    tags={["Open Source", "React", "TypeScript", "Vite", "Python", "FastAPI", "Docker"]}
                    useBulletPoints={false}
                />
                <Item
                    title="EasyTL"
                    dateRange="February 2024 - Present"
                    description={[
                        "When one project gets so bloated that it would be easier to extract all the logic to a separate library to maintain, iterate, and improve on it there instead, that is what EasyTL is.",
                        "That project was Kudasai, and at a certain point EasyTL was realized.",
                        "Basically, it's like 6 different API's (3 strictly translation, and 3 LLM ones) wrapped together and made consistent with each other by streamlining the logic and adding more features.",
                        "So in the end, it was a customizable translation tool, you wouldn't be limited to strictly one API, and with the LLM ones translation becomes truly unique I feel.",
                        "You can't really tell something like google translate or deepl to translate something in a certain way, but with LLM's you can. I feel that is a big part of the future of translation."
                    ]}
                    imageUrl={easytl_logo}
                    imageAlt="EasyTL Logo"
                    websiteUrl="https://easytl.org"
                    githubUrl="https://github.com/Bikatr7/EasyTL"
                    tags={["Open Source", "Python", "Package", "OpenAI", "DeepL", "Google Translate", "Gemini", "Azure", "Anthropic", "React", "TypeScript", "Vite", "FastAPI"]}
                    useBulletPoints={false}
                />
                <Item
                    title="TLTMI"
                    dateRange="August 2024 - Present"
                    description={[
                        "This is that local translation thing I was talking about earlier, it's still a work in progress and I don't really know how it will turn out yet.",
                        "But basically, we set up a lightweight FastAPI Docker container that uses models from the Huggingface Transformers python library, and we can translate using those.",
                        "Think of it as a mini translation pipeline, currently it uses Helsinki-NLP's opus-mt batch of models.",
                        "That's all I really want to target, I don't really have much time right now so I'm trying to allocate it everywhere which leads to slow progress on my own."
                    ]}
                    imageUrl={tltmi_logo}
                    imageAlt="TLTMI Logo"
                    githubUrl="https://github.com/Kakusui/TLTMI"
                    tags={[]}
                    useBulletPoints={false}
                />
                <Item
                    title="Kairyou"
                    dateRange="December 2023 - Present"
                    description={[
                        "Oh Kairyou, it'll always have a special place in my heart. It was originally just the Kudasai script.",
                        "I can't take full credit with most of my things, but the originally Kudasai script was actually called Onegai, and was made by a very smart person named Void.",
                        "Back then I didn't really understand git, so I kinda just took it, and made it my own repository instead of forking it properly. I regret that, but thankfully I refactored and changed it enough that I can call it my own.",
                        "Just like EasyTL, it's a library that originated from Kudasai, but it's also a standalone library that can be used to preprocess Japanese text for translation or other NLP tasks."
                    ]}
                    imageUrl={kairyou_logo}
                    imageAlt="Kairyou Logo"
                    websiteUrl="https://kakusui.org/kairyou"
                    githubUrl="https://github.com/bikatr7/kairyou"
                    tags={["Open Source", "Python", "NLP", "sPacy", "NER"]}
                    useBulletPoints={false}
                />
                <Item
                    title="Seisen"
                    dateRange="May 2022 - July 2024"
                    description={[
                        "Seisen was my first true project. Sadly most of it's history is not on GitHub as I was a dumb kid iterating on IDLE of all things.",
                        "This was what I used to train myself on Japanese. It's basically a worse Anki. I don't really work on it anymore, and nobody else really uses it. So I have shelved it.",
                        "But hey, it taught me a lot about Python and I'll always be grateful for that."
                    ]}
                    imageUrl={seisen_logo}
                    imageAlt="Seisen Logo"
                    githubUrl="https://github.com/Bikatr7/seisen"
                    tags={["Open Source", "Python", "MySQL", "mysql-connector-python"]}
                    useBulletPoints={false}
                />
                <Item
                    title="Elucidate"
                    dateRange="June 2024 - July 2024"
                    description={[
                        "Elucidate is.. complicated. I wanted it to be something that could support EasyTL and maybe Kudasai, but I don't think my programming skills are good enough to build what I envisioned.",
                        "I wanted it to be a way for LLMs to self-evaluate their translations. Basically you have something like EasyTL translate some text, and then send it to Elucidate to see how accurate it is and revise it.",
                        "But at a certain point I decided to reuse EasyTL application code by utilizing Protocols. This would work by bootstrapping new functions onto the EasyTL package at runtime, and then ELucidate would use the modified EasyTL under the hood.",
                        "But then it occurred to me that this was pointless, I could just modify EasyTL at this point. So I dropped it.",
                        "It's technically a functioning product, but it's not what I wanted. Currently I feel like it would do better with a new codebase and agentic code. But I am still new to that world and do not have the time outside of school and work to research it.", 
                        "One day, I will come back to it."
                    ]}
                    imageUrl={elucidate_logo}
                    imageAlt="Elucidate Logo"
                    websiteUrl="https://kakusui.org/elucidate"
                    githubUrl="https://github.com/Kakusui/Elucidate"
                    tags={["Open Source", "Python", "OpenAI", "Gemini", "Anthropic"]}
                    useBulletPoints={false}
                />
            </Card>
        </Box>
    );
}

export default PortfolioProjects;