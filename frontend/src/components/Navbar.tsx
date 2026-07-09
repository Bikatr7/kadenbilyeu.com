// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file.

// maintain allman bracket style for consistency

// react
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

// chakra-ui
import { Box, Flex, Text, Button, useDisclosure, Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, VStack, HStack, IconButton } from "@chakra-ui/react";
import { HamburgerIcon } from '@chakra-ui/icons';
import { IconDeviceGamepad2 } from '@tabler/icons-react';

// custom components
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useSiteSettings } from '../contexts/SiteSettingsContext';
import Login from './Login';

// assets
import resume from '../assets/pdfs/Kaden_Truett_Bilyeu_Resume_July_2025.pdf';

function Navbar() {
    const { isRetro, toggleRetro } = useTheme();
    const { isLoggedIn } = useAuth();
    const { settings, isLoading: settingsLoading } = useSiteSettings();
    const location = useLocation();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [activeHover, setActiveHover] = useState<string | null>(null);
    const isPublicMinimal = (settingsLoading || settings.minimal_mode) && !isLoggedIn;
    const resumeHref = isPublicMinimal ? "/resume" : resume;
    const resumeDownload = isPublicMinimal ? undefined : "Kaden_Truett_Bilyeu_Resume_July_2025.pdf";

    const isActiveRoute = (path: string) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };

    const handleNavHover = (path: string) => {
        setActiveHover(path);
    };

    const NavLink = ({ to, children, mobile = false }: { to: string, children: React.ReactNode, mobile?: boolean }) => {
        const isActive = isActiveRoute(to);
        const isHovered = activeHover === to;

        return (
            <Text
                as={Link}
                to={to}
                onMouseEnter={() => handleNavHover(to)}
                onMouseLeave={() => setActiveHover(null)}
                onClick={mobile ? onClose : undefined}
                fontSize={mobile ? "lg" : "md"}
                fontWeight="bold"
                color={
                    isRetro
                        ? (isActive ? "purple.200" : (isHovered ? "purple.300" : "purple.400"))
                        : (isActive ? "yellow.400" : (isHovered ? "yellow.200" : "white"))
                }
                _hover={{
                    color: isRetro ? "purple.300" : "yellow.200",
                    transform: 'scale(1.05)',
                    textShadow: isRetro ? '0 0 10px rgba(147, 51, 234, 0.8)' : '0 0 10px rgba(255, 255, 0, 0.8)',
                    textDecoration: 'none'
                }}
                transition="all 0.2s ease"
                fontFamily={isRetro ? "'Press Start 2P', monospace" : "inherit"}
                letterSpacing={isRetro ? "0.1em" : "normal"}
                cursor="pointer"
                textDecoration="none"
            >
                {children}
            </Text>
        );
    };

    const getHomeText = () => {
        const isHome = location.pathname === '/';
        if (isRetro) {
            return isHome ? "BIKATR7" : "HOME";
        } else {
            return isHome ? "Kaden Bilyeu" : "HOME";
        }
    };

    return (
        <Box
            bg={isRetro ? "black" : "black"}
            px={4}
            py={3}
            position="sticky"
            top="0"
            zIndex="1000"
            borderBottom={isRetro ? "2px solid" : "1px solid"}
            borderColor={isRetro ? "purple.600" : "gray.700"}
            boxShadow={isRetro ? "none" : "0 2px 4px rgba(0,0,0,0.1)"}
        >
            <Flex justify="space-between" align="center" maxW="6xl" mx="auto">
                {/* Logo/Home - Mobile and Desktop */}
                <Text
                    as={Link}
                    to="/"
                    fontSize="xl"
                    fontWeight="bold"
                    color={isRetro ? "purple.400" : "white"}
                    fontFamily={isRetro ? "'Press Start 2P', monospace" : "inherit"}
                    letterSpacing={isRetro ? "0.1em" : "normal"}
                    _hover={{
                        color: isRetro ? "purple.200" : "yellow.200",
                        textDecoration: 'none'
                    }}
                    textDecoration="none"
                >
                    {getHomeText()}
                </Text>

                {/* Desktop Navigation */}
                <HStack spacing={6} display={{ base: "none", md: "flex" }} flex="1" ml={8}>
                    {!isPublicMinimal && (
                        <>
                            <NavLink to="/portfolio">PORTFOLIO</NavLink>
                            <NavLink to="/blog">BLOG</NavLink>
                        </>
                    )}
                </HStack>

                {/* Desktop Controls */}
                <HStack spacing={3} display={{ base: "none", md: "flex" }}>
                    <IconButton
                        aria-label="Toggle retro theme"
                        icon={<IconDeviceGamepad2 />}
                        variant="ghost"
                        onClick={toggleRetro}
                        color={isRetro ? "purple.400" : "white"}
                        _hover={{
                            color: isRetro ? "purple.200" : "yellow",
                            transform: 'scale(1.1)'
                        }}
                        size="sm"
                    />

                    <Button
                        as="a"
                        href={resumeHref}
                        download={resumeDownload}
                        size="sm"
                        bg={isRetro ? "black" : "red.900"}
                        color={isRetro ? "purple.200" : "white"}
                        _hover={{
                            color: isRetro ? 'purple.400' : 'yellow',
                            bg: isRetro ? 'purple.800' : 'red.900',
                            transform: 'scale(1.01)'
                        }}
                        _active={{
                            bg: isRetro ? 'purple.700' : 'red.900',
                            transform: 'scale(0.98)'
                        }}
                        borderRadius={isRetro ? "none" : "md"}
                        border={isRetro ? "2px solid" : "none"}
                        borderColor={isRetro ? "purple.400" : "transparent"}
                        fontFamily={isRetro ? "'Press Start 2P', monospace" : "inherit"}
                        fontSize={isRetro ? "xs" : "sm"}
                    >
                        RESUME
                    </Button>

                    {isLoggedIn && (
                        <Button
                            as={Link}
                            to="/admin"
                            size="sm"
                            bg={isRetro ? "black" : "blue.900"}
                            color={isRetro ? "blue.200" : "white"}
                            _hover={{
                                color: isRetro ? 'blue.400' : 'yellow',
                                bg: isRetro ? 'blue.800' : 'blue.900',
                                transform: 'scale(1.01)'
                            }}
                            _active={{
                                bg: isRetro ? 'blue.700' : 'blue.900',
                                transform: 'scale(0.98)'
                            }}
                            borderRadius={isRetro ? "none" : "md"}
                            border={isRetro ? "2px solid" : "none"}
                            borderColor={isRetro ? "blue.400" : "transparent"}
                            fontFamily={isRetro ? "'Press Start 2P', monospace" : "inherit"}
                            fontSize={isRetro ? "xs" : "sm"}
                        >
                            ADMIN
                        </Button>
                    )}

                    <Login />
                </HStack>

                {/* Mobile Menu Button - Top Right */}
                <IconButton
                    display={{ base: "flex", md: "none" }}
                    onClick={onOpen}
                    icon={<HamburgerIcon />}
                    variant="ghost"
                    color={isRetro ? "purple.400" : "white"}
                    _hover={{
                        bg: isRetro ? "purple.900" : "gray.700",
                        color: isRetro ? "purple.200" : "yellow.200"
                    }}
                    size="md"
                    borderRadius={isRetro ? "none" : "md"}
                    border={isRetro ? "1px solid" : "none"}
                    borderColor={isRetro ? "purple.400" : "transparent"}
                    aria-label="Open menu"
                />

                {/* Mobile Drawer */}
                <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
                    <DrawerOverlay />
                    <DrawerContent
                        bg={isRetro ? "black" : "black"}
                        color={isRetro ? "purple.400" : "white"}
                        border={isRetro ? "2px solid" : "none"}
                        borderColor={isRetro ? "purple.600" : "transparent"}
                    >
                        <DrawerHeader
                            borderBottomWidth="1px"
                            borderColor={isRetro ? "purple.600" : "gray.700"}
                            color={isRetro ? "purple.400" : "white"}
                            fontFamily={isRetro ? "'Press Start 2P', monospace" : "inherit"}
                            display="flex"
                            justifyContent="space-between"
                            alignItems="center"
                        >
                            <Text fontSize={isRetro ? "sm" : "lg"}>
                                {isRetro ? "NAVIGATION" : "Navigation"}
                            </Text>
                            <IconButton
                                aria-label="Toggle retro theme"
                                icon={<IconDeviceGamepad2 />}
                                variant="ghost"
                                onClick={() => {
                                    toggleRetro();
                                }}
                                color={isRetro ? "purple.400" : "white"}
                                _hover={{
                                    color: isRetro ? "purple.200" : "yellow",
                                    transform: 'scale(1.1)'
                                }}
                                size="sm"
                            />
                        </DrawerHeader>

                        <DrawerBody display="flex" flexDirection="column" justifyContent="space-between" p={0}>
                            {/* Navigation Links */}
                            <VStack spacing={6} align="start" p={6}>
                                <NavLink to="/" mobile>HOME</NavLink>
                                {!isPublicMinimal && (
                                    <>
                                        <NavLink to="/portfolio" mobile>PORTFOLIO</NavLink>
                                        <NavLink to="/blog" mobile>BLOG</NavLink>
                                    </>
                                )}
                                {isLoggedIn && (
                                    <NavLink to="/admin" mobile>ADMIN</NavLink>
                                )}
                            </VStack>

                            {/* Login and Resume Buttons at Bottom */}
                            <VStack spacing={3} p={6}>
                                <Login buttonWidth="full" onLogoutComplete={onClose} />
                                <Button
                                    as="a"
                                    href={resumeHref}
                                    download={resumeDownload}
                                    w="full"
                                    bg={isRetro ? "black" : "red.900"}
                                    color={isRetro ? "purple.200" : "white"}
                                    _hover={{
                                        color: isRetro ? 'purple.400' : 'yellow',
                                        bg: isRetro ? 'purple.800' : 'red.900'
                                    }}
                                    _active={{
                                        bg: isRetro ? 'purple.700' : 'red.900'
                                    }}
                                    borderRadius={isRetro ? "none" : "md"}
                                    border={isRetro ? "2px solid" : "none"}
                                    borderColor={isRetro ? "purple.400" : "transparent"}
                                    fontFamily={isRetro ? "'Press Start 2P', monospace" : "inherit"}
                                    fontSize={isRetro ? "xs" : "sm"}
                                    size="md"
                                    onClick={onClose}
                                >
                                    RESUME
                                </Button>
                            </VStack>
                        </DrawerBody>
                    </DrawerContent>
                </Drawer>
            </Flex>
        </Box>
    );
}

export default Navbar;
