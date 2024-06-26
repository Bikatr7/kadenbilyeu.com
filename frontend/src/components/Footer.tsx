// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by a GNU General Public License v3.0
// license that can be found in the LICENSE file.

// chakra-ui imports
import { Box, Container,Divider, Flex, IconButton, Image, Stack, Text } from '@chakra-ui/react';

// icons and images
import { IconBrandGithub } from '@tabler/icons-react';

import logo from '../assets/images/personals/bikatr7_logo.png'

function Footer() {
    return (
        <Box
            bg="black"
            color="white"
            width="100%">
            <Divider />
            <Container
                as={Stack}
                maxW={'6xl'}
                py={4}
                direction={{ base: 'column', md: 'row' }}
                spacing={4}
                justify={{ base: 'space-between', md: 'space-between' }}
                align={{ base: 'center', md: 'center' }}>
                <Flex display={{ base: 'flex', md: 'none' }} width="100%" justify="space-between" align="center">
                    <IconButton as='a' href='https://github.com/Bikatr7' aria-label='Github' icon={<IconBrandGithub />} />
                    <Text textAlign="center">© 2024 Kaden Bilyeu (Bikatr7). All rights reserved</Text>
                    <Image src={logo} boxSize='30px' />
                </Flex>
                <Flex display={{ base: 'none', md: 'flex' }} width="100%" justify="space-between" align="center">
                    <Image src={logo} boxSize='30px' />
                    <Text textAlign="center" flex="1">© 2024 Kaden Bilyeu (Bikatr7). All rights reserved</Text>
                    <IconButton as='a' href='https://github.com/Bikatr7' aria-label='Github' icon={<IconBrandGithub />} />
                </Flex>
            </Container>
        </Box>
    );
}

export default Footer;