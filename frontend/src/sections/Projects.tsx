// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com)
// Use of this source code is governed by a GNU General Public License v3.0
// license that can be found in the LICENSE file.

// logos
import c_logo from '../assets/images/skills/c_logo.png';

// custom components
import Project from '../components/Project';

function Projects() {
    return (
        <>
            <Project
                title="dummy project"
                subtitle="dumb things"
                imageUrl={c_logo}
                imageAlt="lol"
                linkUrl="/that's crazy"
                githubUrl="doesn't work lol"
                documentationUrl="nope lol"
                tags={["c", "dumb"]}
            />
            <Project
                title="dummy project 2"
                subtitle="dumb things"
                imageUrl={c_logo}
                imageAlt="lol"
                linkUrl="/that's crazy"
                githubUrl="doesn't work lol"
                documentationUrl="nope lol"
                tags={["c", "dumb"]}
                reverse={true}
            />
        </>
    );
}

export default Projects;