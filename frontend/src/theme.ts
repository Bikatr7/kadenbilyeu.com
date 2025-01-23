// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file.

// chakra-ui
import { extendTheme, type ThemeConfig } from '@chakra-ui/react'

const config: ThemeConfig = 
{
    initialColorMode: 'dark',
    useSystemColorMode: false,
}

const theme = extendTheme({
    config,
    styles: {
        global: {
            'html, body': {
                bg: 'black',
            },
            '.retro-mode': {
                fontFamily: "'Press Start 2P', monospace",
                bg: 'black',
                button: {
                    borderRadius: '0',
                    border: '2px solid',
                    borderColor: 'purple.400',
                    bg: 'purple.900',
                    color: 'purple.200',
                    _hover: {
                        bg: 'purple.800',
                        transform: 'scale(1.05)',
                    },
                    _active: {
                        bg: 'purple.700',
                    },
                },
                '.chakra-heading': {
                    color: 'purple.200',
                },
                '.chakra-text': {
                    color: 'purple.300',
                },
            }
        },
    },
})

export default theme