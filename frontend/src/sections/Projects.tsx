// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com)
// Use of this source code is governed by a GNU General Public License v3.0
// license that can be found in the LICENSE file.

// logos
import easytl_logo from '../assets/images/logos/easytl_logo.png';
import kairyou_logo from '../assets/images/logos/kairyou_logo.png';
import kakusui_logo from '../assets/images/logos/kakusui_logo.png';
import kudasai_logo from '../assets/images/logos/kudasai_logo.png';
import seisen_logo from '../assets/images/logos/seisen_logo.png';

// custom components
import Project from '../components/Project';

function Projects() {
    return (
        <>
            <Project
                title="EasyTL"
                subtitle="Seamless Multi-API Translation: Simplifying Language Barriers with DeepL, OpenAI, Gemini, Google Translate and More!"
                imageUrl={easytl_logo}
                imageAlt="EasyTL Logo"
                linkUrl="https://kakusui.org/easytl"
                githubUrl="https://github.com/Bikatr7/EasyTL"
                documentationUrl="https://easytl.readthedocs.io/en/latest/index.html"
                tags={["Open Source", "Python", "Package", "OpenAI", "DeepL", "Google Translate", "Gemini", "Azure", "Anthropic"]}
            />
            <Project
                title="Kakusui.org"
                subtitle="The Official Website of Kakusui, a LLC aiming to revolutionize machine translation with new LLM and AI technologies."
                imageUrl={kakusui_logo}
                imageAlt="Kakusui Logo"
                linkUrl="https://kakusui.org"
                githubUrl="https://github.com/Kakusui/kakusui.org"
                tags={["Open Source", "React", "TypeScript", "Vite", "Python", "FastAPI", "Docker"]}
                reverse={true}
            />
            <Project
                title="Kudasai"
                subtitle="Streamlining Japanese-English Translation with Advanced Preprocessing and Integrated Translation Technologies"
                imageUrl={kudasai_logo}
                imageAlt="Kudasai Logo"
                linkUrl="https://huggingface.co/spaces/Bikatr7/Kudasai"
                githubUrl="https://github.com/Bikatr7/kudasai"
                tags={["Open Source", "Python", "Hugging Face", "sPacy", "Google Translate", "DeepL", "OpenAI", "Gemini", "Gradio"]}
            />
            <Project
                title="Kairyou"
                subtitle="Quickly preprocesses Japanese text using NLP/NER from SpaCy for Japanese translation or other NLP tasks."
                imageUrl={kairyou_logo}
                imageAlt="Kairyou Logo"
                linkUrl="https://kakusui.org/kairyou"
                githubUrl="https://github.com/bikatr7/kairyou"
                tags={["Open Source", "Python", "NLP", "sPacy", "NER"]}
                reverse={true}
            />
            <Project
                title="Seisen"
                subtitle="Train yourself on Japanese kana, kanji, and vocabulary!"
                imageUrl={seisen_logo}
                imageAlt="Seisen Logo"
                githubUrl="https://github.com/Bikatr7/seisen"
                tags={["Open Source", "Python", "MySQL", "mysql-connector-python"]}
            />

        </>
    );
}

export default Projects;