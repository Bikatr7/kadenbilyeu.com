// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file.

// maintain allman bracket style for consistency

// react
import { createBrowserRouter, RouterProvider, Outlet, useLocation } from 'react-router-dom';

// chakra-ui
import { Container, Box, Spinner } from '@chakra-ui/react';

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
import { useAuth } from './contexts/AuthContext';
import { useSiteSettings } from './contexts/SiteSettingsContext';

function MinimalModeGate({ children }: { children: JSX.Element }) {
    const { isLoggedIn } = useAuth();
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

    if (settings.minimal_mode && !isLoggedIn) {
        return <MinimalModePage />;
    }

    return children;
}

function Layout() {
    const location = useLocation();
    const { isLoggedIn } = useAuth();
    const { settings, isLoading } = useSiteSettings();
    const isBlogPage = location.pathname.startsWith('/blog');
    const isTerminalPage = location.pathname === '/admin/terminal';
    const isPublicMinimal = !isLoading && settings.minimal_mode && !isLoggedIn;

    return (
        <>
            <Navbar />
            <Box position="relative" flex="1" zIndex="1" overflow="hidden">
                {isBlogPage && !isPublicMinimal && <BlogBackground />}
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
