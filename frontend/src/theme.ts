// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by a GNU General Public License v3.0
// license that can be found in the LICENSE file.

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
        },
    },
})

export default theme