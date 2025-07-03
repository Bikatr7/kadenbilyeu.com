// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file.

// maintain allman bracket style for consistency

// chakra-ui
import { Box } from "@chakra-ui/react";

// components
import { Card, Item } from "../../components/Card";

// images
import uccs_logo from "../../assets/images/logos/portfolio/uccs_logo.webp";
import pchs_logo from "../../assets/images/logos/portfolio/pchs_logo.webp";

function Education() {
    return (
        <Box>
            <Card title="Education">
                <Item
                    title="Bachelor of Science in Computer Science at the University of Colorado Colorado Springs (UCCS)"
                    dateRange="August 2022 - Present (Expected Graduation: May 2026)"
                    description={[
                        "I've attended UCCS for a bit over 3 years now and have been working towards my degree in Computer Science. I'm expected to graduate in May 2026.",
                        "Also I am working towards a minor in Japanese.",
                        "I'm currently a member of the Association for Computing Machinery (ACM), I became an officer in the fall of 2024.",
                        "Along with my minor, I am focusing in a cybersecurity track. Although a lot of my relevant experience is more in AI/ML or general software engineering which is self-taught.",
                        "I started doing undergraduate research in June of 2025, frankly I don't have much to say about it yet."
                    ]}
                    imageUrl={uccs_logo}
                    imageAlt="UCCS Logo"
                    useBulletPoints={false}
                />
                <Item
                    title="High School Diploma at Pine Creek High School (PCHS)"
                    dateRange="August 2018 - May 2022"
                    description={[
                        "I graduated from Pine Creek High School in May 2022.",
                        "I took a few AP classes here, mostly related to computer science. I did manage to score a 5 on the AP Computer Science Principles exam.",
                        "I was a member of DECA for two years, and I was in the speech and debate club for one year.",
                    ]}
                    imageUrl={pchs_logo}
                    imageAlt="Pine Creek High School Logo"
                    useBulletPoints={false}
                />
            </Card>
        </Box>
    );
}

export default Education;