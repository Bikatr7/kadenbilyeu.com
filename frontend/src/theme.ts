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