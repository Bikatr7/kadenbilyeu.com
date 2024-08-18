// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file.

// maintain allman bracket style for consistency

// chakra-ui
import { Box, Link, Text } from "@chakra-ui/react";

function AboutSite() {
    return (
        <Box padding="5">
            <Text fontSize="md" marginBottom="4" color="gray.500">
                This site was designed with the purpose to replace my old site <Link href="https://bikatr7.github.io" color={"gray.300"} _hover={{ color: "yellow" }} isExternal>bikatr7.github.io</Link> (it's a redirect now so take a look at the <Link href="https://github.com/Bikatr7/bikatr7.github.io" color={"gray.300"} _hover={{ color: "yellow" }} isExternal>GitHub Repository</Link>), which was a simple HTML/CSS/JS site. Frankly, it looked terrible, but it was my first exploration into web development.
            </Text>
            <Text fontSize="md" marginBottom="4" color="gray.500">
                Thankfully, after a few months and making a site for my LLC (<Link href="https://kakusui.org" color={"gray.300"} _hover={{ color: "yellow" }} isExternal>kakusui.org</Link> btw for those interested), I learned a lot about React and proper web design. This site is the result of that learning and I'm quite proud of it.
            </Text>
            <Text fontSize="md" marginBottom="4" color="gray.500">
                So this one is made with Vite and React. A nice and simple site that I can easily update and maintain.
            </Text>
        </Box>
    );
}

export default AboutSite;