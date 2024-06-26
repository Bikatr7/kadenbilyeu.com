// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by a GNU General Public License v3.0
// license that can be found in the LICENSE file.

// chakra-ui imports
import {
    Box,
    Button,
    Collapse,
    Container,
    Flex,
    Heading,
    Icon,
    IconButton,
    Image,
    Link,
    Popover,
    PopoverContent,
    PopoverTrigger,
    Stack,
    Text,
    useDisclosure,
} from '@chakra-ui/react';

// icons and images
import { ChevronDownIcon, ChevronRightIcon, CloseIcon, HamburgerIcon } from '@chakra-ui/icons';

import logo from '../assets/images/personals/bikatr7_logo.png';

export default function Navbar() {
    const { isOpen, onToggle } = useDisclosure();

    return (
        <Box>
            <Flex
                bg="black"
                color="white"
                minH={'60px'}
                py={{ base: 2 }}
                px={{ base: 4 }}
                borderBottom={1}
                borderStyle={'solid'}
                borderColor={'gray.800'}
                align={'center'}>
                <Container maxW={'6xl'}>
                    <Flex
                        flex={{ base: 1, md: 'auto' }}
                        ml={{ base: -2 }}
                        display={{ base: 'flex', md: 'none' }}
                        alignItems={'center'}
                        justifyContent={'space-between'}
                        width={'100%'}
                    >
                        <Flex alignItems={'center'}>
                            <IconButton
                                onClick={onToggle}
                                icon={
                                    isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />
                                }
                                variant={'ghost'}
                                aria-label={'Toggle Navigation'}
                            />

                            <Image src={logo} boxSize='30px' ml={2} />
                        </Flex>
                        
                        <Button
                            as="a"
                            bg="red.900"
                            href="/assets/pdfs/May_2024_Kaden_Bilyeu_Resume.pdf"
                            download="Kaden_Bilyeu_Resume_May_2024.pdf"
                            rounded="full"
                            _hover={{ color: 'yellow', transform: 'scale(1.01)' }}
                            _active={{ bg: 'red.900', transform: 'scale(0.98)' }}
                            ml={5}>
                            Resume
                        </Button>
                    </Flex>
                    <Flex flex={{ base: 1 }} justify={{ base: 'center', md: 'start' }} align={'center'}>
                        <Image src={logo} boxSize='30px' display={{ base: 'none', md: 'block' }} />

                        <Flex display={{ base: 'none', md: 'flex' }} ml={10} align={'center'}>
                            <DesktopNav />
                        </Flex>

                        <Flex display={{ base: 'none', md: 'flex' }} ml='auto' align={'center'}>
                            <Button
                                as="a"
                                bg="red.900"
                                href="/assets/pdfs/May_2024_Kaden_Bilyeu_Resume.pdf"
                                download="Kaden_Bilyeu_Resume_May_2024.pdf"
                                rounded="full"
                                _hover={{ color: 'yellow', transform: 'scale(1.01)' }}
                                _active={{ bg: 'red.900', transform: 'scale(0.98)' }}
                                ml={5}>
                                Resume
                            </Button>
                        </Flex>
                    </Flex>
                </Container>
            </Flex>

            <Collapse in={isOpen} animateOpacity>
                <MobileNav />
            </Collapse>
        </Box>
    );
}

const DesktopNav = () => {
    const linkColor = "white"
    const linkHoverColor = "yellow"
    const popoverContentBgColor = "black"
    return (
        <Stack direction={'row'} spacing={4} align={'center'}>
            {NAV_ITEMS.map((navItem) => (
                <Box key={navItem.label}>
                    <Popover trigger={'hover'} placement={'bottom-start'}>
                        <PopoverTrigger>
                            <Link
                                p={2}
                                href={navItem.href ?? '#'}
                                _hover={{
                                    textDecoration: 'none',
                                }}
                                onClick={(e) => navItem.children && e.preventDefault()}>
                                <Heading
                                    as="h2"
                                    fontSize={'md'}
                                    fontWeight={500}
                                    color={linkColor}
                                    _hover={{
                                        color: linkHoverColor,
                                        transform: 'scale(1.1)',
                                    }}>
                                    {navItem.label}
                                </Heading>
                            </Link>
                        </PopoverTrigger>

                        {navItem.children && (
                            <PopoverContent
                                border={0}
                                boxShadow={'xl'}
                                bg={popoverContentBgColor}
                                p={4}
                                rounded={'xl'}
                                minW={'sm'}>
                                <Stack>
                                    {navItem.children.map((child) => (
                                        <DesktopSubNav key={child.label} {...child} />
                                    ))}
                                </Stack>
                            </PopoverContent>
                        )}
                    </Popover>
                </Box>
            ))}
        </Stack>
    );
};

const DesktopSubNav = ({ label, href, subLabel }: NavItem) => {
    return (
        <Link
            href={href}
            role={'group'}
            display={'block'}
            p={2}
            rounded={'md'}
            _hover={{ bg: "gray.700"}}>
            <Stack direction={'row'} align={'center'}>
                <Box>
                    <Text
                        transition={'all .3s ease'}
                        _groupHover={{ color: 'yellow' }}
                        fontWeight={500}>
                        {label}
                    </Text>
                    <Text fontSize={'sm'}>{subLabel}</Text>
                </Box>
                <Flex
                    transition={'all .3s ease'}
                    transform={'translateX(-10px)'}
                    opacity={0}
                    _groupHover={{ opacity: '100%', transform: 'translateX(0)' }}
                    justify={'flex-end'}
                    align={'center'}
                    flex={1}>
                    <Icon color={'yellow'} w={5} h={5} as={ChevronRightIcon} />
                </Flex>
            </Stack>
        </Link>
    );
};

const MobileNav = () => {
    return (
        <Stack
            bg="black"
            p={4}
            display={{ md: 'none' }}>
            {NAV_ITEMS.map((navItem) => (
                <MobileNavItem key={navItem.label} {...navItem} />
            ))}
        </Stack>
    );
};

const MobileNavItem = ({ label, children, href }: NavItem) => {
    const { isOpen, onToggle } = useDisclosure();

    return (
        <Stack spacing={4} onClick={children && onToggle}>
            <Flex
                py={2}
                as={Link}
                href={href ?? '#'}
                justify={'space-between'}
                align={'center'}
                _hover={{
                    textDecoration: 'none',
                }}
                onClick={(e) => children && e.preventDefault()}>
                <Heading
                    as="h2"
                    fontSize={'lg'}
                    fontWeight={600}
                    color="white"
                    _hover={{ transform: 'scale(1.1)', color: 'yellow' }}>
                    {label}
                </Heading>
                {children && (
                    <Icon
                        as={ChevronDownIcon}
                        transition={'all .25s ease-in-out'}
                        transform={isOpen ? 'rotate(180deg)' : ''}
                        w={6}
                        h={6}
                    />
                )}
            </Flex>

            <Collapse in={isOpen} animateOpacity style={{ marginTop: '0!important' }}>
                <Stack
                    mt={2}
                    pl={4}
                    borderLeft={1}
                    borderStyle={'solid'}
                    borderColor={'gray.700'}
                    align={'start'}>
                    {children &&
                        children.map((child) => (
                            <Link key={child.label} py={2} href={child.href} _hover={{color: 'yellow', textDecoration: 'none'}}>
                                {child.label}
                            </Link>
                        ))}
                </Stack>
            </Collapse>
        </Stack>
    );
};

interface NavItem {
    label: string;
    subLabel?: string;
    children?: Array<NavItem>;
    href?: string;
}

const NAV_ITEMS: Array<NavItem> = [
    {
        label: 'Home',
        href: '#home',
    },
    {
        label: 'Projects',
        href: '#projects',

    },
    {
        label: 'Skills',
        href: '#skills',
    },
    {
        label: 'About',
        children: [
        {
            label: 'About Me',
            subLabel: 'Some information about me',
            href: '#aboutme',
        },
        {
            label: 'About the Site',
            subLabel: 'Some information about the site',
            href: '#aboutsite',
        },
        ],
    },
    {
        label: 'Contact',
        href: '#contact',
    }
];