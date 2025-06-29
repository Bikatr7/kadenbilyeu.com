// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file.

// maintain allman bracket style for consistency

// react
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { Box, Spinner } from '@chakra-ui/react';

const HomePage = lazy(() => import('./pages/HomePage'));
const BlogPage = lazy(() => import('./pages/BlogPage'));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'));
const BlogDirectoryPage = lazy(() => import('./pages/BlogDirectoryPage'));
const PortfolioPage = lazy(() => import('./pages/PortfolioPage'));

const PageLoader = () => (
    <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
    >
        <Spinner size="xl" color="teal.500" />
    </Box>
);

function Router({ showContent, toggleContent, contentLoaded }: { showContent: any, toggleContent: any, contentLoaded: any }) {

    const routes = [
        {
            path: '/',
            element: (
                <Suspense fallback={<PageLoader />}>
                    <HomePage
                        showContent={showContent}
                        toggleContent={toggleContent}
                        contentLoaded={contentLoaded}
                    />
                </Suspense>
            )
        },
        {
            path: '/portfolio',
            element: (
                <Suspense fallback={<PageLoader />}>
                    <PortfolioPage />
                </Suspense>
            )
        },
        {
            path: '/blog',
            element: (
                <Suspense fallback={<PageLoader />}>
                    <BlogPage />
                </Suspense>
            )
        },
        {
            path: '/blog/directory',
            element: (
                <Suspense fallback={<PageLoader />}>
                    <BlogDirectoryPage />
                </Suspense>
            )
        },
        {
            path: '/blog/:id',
            element: (
                <Suspense fallback={<PageLoader />}>
                    <BlogPostPage />
                </Suspense>
            )
        },
    ];

    const router = createBrowserRouter(routes);

    return <RouterProvider router={router} />;
}

export default Router;
