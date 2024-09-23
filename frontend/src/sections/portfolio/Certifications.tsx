// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file.

// maintain allman bracket style for consistency

// chakra-ui
import { Box, Text } from "@chakra-ui/react";

// components
import { Card, Item } from "../../components/Card"

// images
import ibm from '../../assets/images/logos/portfolio/ibm_logo.webp';

function Certifications()
{
    return (
        <Box>
            <Text fontSize="md" marginBottom="4" color="gray.500">
                I'm working on getting some certifications, currently aiming for Cybersecurity ones. However, progress is slow as I'm working part time and going to school full time.
            </Text>
            <Card title="Certifications">
                <Item
                    title="Getting Started with Cybersecurity (IBM)"
                    dateRange="Issued August 2024"
                    imageUrl={ibm}
                    useBulletPoints={false}
                />
                <Item
                    title="Getting Started with Threat Intelligence and Hunting (IBM)"
                    dateRange="Issued September 2024"
                    imageUrl={ibm}
                    useBulletPoints={false}
                />
            </Card>
        </Box>
    );
}

export default Certifications;