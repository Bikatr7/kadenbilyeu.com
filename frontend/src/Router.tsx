// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file.

// maintain allman bracket style for consistency

// react
import { createBrowserRouter, RouterProvider, Outlet, useLocation } from 'react-router-dom';

// chakra-ui
import { Container, Box } from '@chakra-ui/react';

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

function Layout() {
    const location = useLocation();
    const isBlogPage = location.pathname.startsWith('/blog');

    return (
        <>
            <Navbar />
            <Box position="relative" flex="1" zIndex="1" overflow="hidden">
                {isBlogPage && <BlogBackground />}
                <Container maxW="6xl" flex="1" position="relative" zIndex="2">
                    <Outlet />
                </Container>
            </Box>
            <Footer />
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
                { path: 'portfolio', element: <PortfolioPage /> },
                { path: 'blog', element: <BlogPage /> },
                { path: 'blog/directory', element: <BlogDirectoryPage /> },
                { path: 'blog/:id', element: <BlogPostPage /> },
                { path: 'admin', element: <AdminPage /> },
                { path: 'admin/terminal', element: <TerminalPage /> },
            ]
        }
    ];

    const router = createBrowserRouter(routes);

    return <RouterProvider router={router} />;
}

export default Router;
