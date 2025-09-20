// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file.

// maintain allman bracket style for consistency

// chakra-ui
import { Box, Text } from "@chakra-ui/react";

// components
import { Card, Item } from "../../components/Card";

// icons
import { IconInfoCircle, IconChartBar, IconTrophy, IconUsers } from "@tabler/icons-react";

function Accomplishments() {
    return (
        <Box>
            <Text fontSize="md" marginBottom="4" color="gray.500">
                I don't particular have any accomplishments that I can really show off, but I'll do my best to list some of the things I've done.
            </Text>
            <Card title="Accomplishments">
                <Item
                    title="Officer for the ACM (Association for Computing Machinery - UCCS)"
                    dateRange="September 2024 - Present"
                    sections={[
                        {
                            title: "Role Details",
                            icon: <IconChartBar size={16} />,
                            bgColor: "gray.700",
                            textColor: "cyan.200",
                            content: [
                                { text: "Secretary-Treasurer for 2024-2026 academic years", useBullet: true },
                                { text: "Member since October 2023, promoted to officer role", useBullet: true },
                            ]
                        },
                        {
                            title: "The Experience",
                            icon: <IconUsers size={16} />,
                            content: [
                                "I've been a member since October of 2023, but recently was chosen as an officer (Secretary-Treasurer) for the 2024-2025 school year.",
                                "I'm looking forward to doing more for the club and helping out in any way I can."
                            ]
                        }
                    ]}
                />
                <Item
                    title="Finalist in Backdrop Build v3"
                    dateRange="March 2024"
                    sections={[
                        {
                            title: "Achievement",
                            icon: <IconTrophy size={16} />,
                            bgColor: "gray.700",
                            textColor: "cyan.200",
                            content: [
                                { text: "Kudasai selected as finalist in Backdrop Build v3 competition", useBullet: true },
                                { text: "First major hackathon/competition experience", useBullet: true },
                                { text: "Made industry connections and networking opportunities", useBullet: true },
                                { text: "Significant motivation boost for continued Kudasai development", useBullet: true }
                            ]
                        },
                        {
                            title: "The Story",
                            icon: <IconInfoCircle size={16} />,
                            content: [
                                "I entered Kudasai into the Backdrop Build v3 contest and made it to the finalists.",
                                "It was a fun experience and It gave me a lot of motivation to keep working on Kudasai.",
                                "I got to meet a lot of cool people and got some connections in the industry which was pretty cool.",
                                "It was basically my first hackathon experience and while I can't say too much came out about it, it was a lot of fun."
                            ]
                        }
                    ]}
                    websiteUrl="https://backdropbuild.com/builds/kudasai"
                />
            </Card>
        </Box>
    );
}

export default Accomplishments;