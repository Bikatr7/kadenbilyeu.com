// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file.

// maintain allman bracket style for consistency

// react
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';

// chakra-ui
import { Container } from '@chakra-ui/react';

// components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// pages
import HomePage from './pages/HomePage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import BlogDirectoryPage from './pages/BlogDirectoryPage';
import PortfolioPage from './pages/PortfolioPage';

function Layout() {
    return (
        <>
            <Navbar />
            <Container maxW="6xl" flex="1">
                <Outlet />
            </Container>
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
            ]
        }
    ];

    const router = createBrowserRouter(routes);

    return <RouterProvider router={router} />;
}

export default Router;
