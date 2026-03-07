// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file.

// maintain allman bracket style for consistency

// chakra-ui
import { Box } from "@chakra-ui/react";

// components
import { Card, Item } from "../../components/Card";

// icons
import { IconInfoCircle, IconChartBar, IconSchool } from "@tabler/icons-react";

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
                    sections={[
                        {
                            title: "Academic Stats",
                            icon: <IconChartBar size={16} />,
                            bgColor: "gray.700",
                            textColor: "cyan.200",
                            content: [
                                { text: "Computer Science major with Cybersecurity track focus", useBullet: true },
                                { text: "ACM member and officer (Secretary-Treasurer since Fall 2024)", useBullet: true },
                                { text: "Expected graduation: May 2026", useBullet: true },
                                { text: "GPA: 3.67", useBullet: true }
                            ]
                        },
                        {
                            title: "The College Experience",
                            icon: <IconSchool size={16} />,
                            content: [
                                "I've attended UCCS for a bit over 3 years now and have been working towards my degree in Computer Science. I'm expected to graduate in May 2026.",
                                "I'm currently a member of the Association for Computing Machinery (ACM), I became an officer in the fall of 2024.",
                                "I am focusing in a cybersecurity track. Although a lot of my relevant experience is more in AI/ML or general software engineering which is self-taught."
                            ]
                        }
                    ]}
                    imageUrl={uccs_logo}
                    imageAlt="UCCS Logo"
                />
                <Item
                    title="High School Diploma at Pine Creek High School (PCHS)"
                    dateRange="August 2018 - May 2022"
                    sections={[
                        {
                            title: "The Highlights",
                            icon: <IconChartBar size={16} />,
                            bgColor: "gray.700",
                            textColor: "cyan.200",
                            content: [
                                { text: "AP Computer Science Principles - scored a 5", useBullet: true },
                                { text: "DECA member (2 years) - business, marketing, and leadership focus", useBullet: true },
                                { text: "Speech and Debate Club (1 year)", useBullet: true },
                                { text: "Graduated May 2022", useBullet: true }
                            ]
                        },
                        {
                            title: "Honest Assessment",
                            icon: <IconInfoCircle size={16} />,
                            content: [
                                "I graduated from Pine Creek High School in May 2022.",
                                "I took a few AP classes here, mostly related to computer science. I did manage to score a 5 on the AP Computer Science Principles exam.",
                                "I was a member of DECA for two years, and I was in the speech and debate club for one year.",
                                "No one particularly cares about high school really, so i won't pretend it was anything special. I was frankly a mid student as I did the bare minimum to get by and spent my time doing stuff I enjoyed like programming, playing games, and being a nerd."
                            ]
                        }
                    ]}
                    imageUrl={pchs_logo}
                    imageAlt="Pine Creek High School Logo"
                />
            </Card>
        </Box>
    );
}

export default Education;
