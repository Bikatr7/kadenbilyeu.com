// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file.

// maintain allman bracket style for consistency

// react
import { createBrowserRouter, RouterProvider, Outlet, useLocation } from 'react-router-dom';

// chakra-ui
import { Container, Box, Spinner, Heading, Text, VStack, Button } from '@chakra-ui/react';

// components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BlogBackground from './components/BlogBackground';

// pages
import HomePage from './pages/HomePage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import BlogDirectoryPage from './pages/BlogDirectoryPage';
import PortfolioPage from './pages/PortfolioPage';
import TerminalPage from './pages/TerminalPage';
import AdminPage from './pages/AdminPage';
import MinimalModePage from './pages/MinimalModePage';

// contexts
import { useSiteSettings } from './contexts/SiteSettingsContext';

function UnavailablePage() {
    return (
        <Box
            bg="black"
            color="white"
            minHeight="83vh"
            display="flex"
            alignItems="center"
            justifyContent="center"
            px={6}
        >
            <VStack spacing={5} textAlign="center" maxW="520px">
                <Heading fontSize={{ base: "2xl", md: "3xl" }} color="yellow">
                    Not Found
                </Heading>
                <Text fontSize={{ base: "md", md: "lg" }} color="gray.300" lineHeight="1.8">
                    This page is unavailable.
                </Text>
                <Button
                    as="a"
                    href="/"
                    rounded="full"
                    _hover={{ color: 'yellow', transform: 'scale(1.01)' }}
                    _active={{ transform: 'scale(0.99)' }}
                >
                    Home
                </Button>
            </VStack>
        </Box>
    );
}

function MinimalModeGate({ children }: { children: JSX.Element }) {
    const { settings, isLoading } = useSiteSettings();

    if (isLoading) {
        return (
            <Box
                bg="black"
                color="white"
                minHeight="83vh"
                display="flex"
                alignItems="center"
                justifyContent="center"
            >
                <Spinner size="xl" color="yellow.400" />
            </Box>
        );
    }

    if (settings.minimal_mode) {
        return <UnavailablePage />;
    }

    return children;
}

function Layout() {
    const location = useLocation();
    const { settings, isLoading } = useSiteSettings();
    const isBlogPage = location.pathname.startsWith('/blog');
    const isTerminalPage = location.pathname === '/admin/terminal';
    const isMinimal = isLoading || settings.minimal_mode;

    return (
        <>
            <Navbar />
            <Box position="relative" flex="1" zIndex="1" overflow="hidden">
                {isBlogPage && !isMinimal && <BlogBackground />}
                <Container maxW="6xl" flex="1" position="relative" zIndex="2">
                    <Outlet />
                </Container>
            </Box>
            {!isTerminalPage && <Footer />}
        </>
    );
}

function Router({ showContent, toggleContent, contentLoaded }: { showContent: any, toggleContent: any, contentLoaded: any }) {

    const routes = [
        {
            path: '/',
            element: <Layout />,
            children: [
                {
                    index: true,
                    element: <HomePage
                        showContent={showContent}
                        toggleContent={toggleContent}
                        contentLoaded={contentLoaded}
                    />
                },
                { path: 'portfolio', element: <MinimalModeGate><PortfolioPage /></MinimalModeGate> },
                { path: 'blog', element: <MinimalModeGate><BlogPage /></MinimalModeGate> },
                { path: 'blog/directory', element: <MinimalModeGate><BlogDirectoryPage /></MinimalModeGate> },
                { path: 'blog/:id', element: <MinimalModeGate><BlogPostPage /></MinimalModeGate> },
                { path: 'resume', element: <MinimalModePage /> },
                { path: 'admin', element: <AdminPage /> },
                { path: 'admin/terminal', element: <TerminalPage /> },
            ]
        }
    ];

    const router = createBrowserRouter(routes);

    return <RouterProvider router={router} />;
}

export default Router;
