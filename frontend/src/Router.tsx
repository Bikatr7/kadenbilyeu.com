// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file.

// react
import {createBrowserRouter, RouterProvider} from 'react-router-dom';

// pages
import HomePage from './pages/HomePage';
import BlogPage from './pages/BlogPage';

function Router({ showContent, toggleContent, contentLoaded }: { showContent: any, toggleContent: any, contentLoaded: any }) 
{
    const routes = [
        { path: '/', element: <HomePage showContent={showContent} toggleContent={toggleContent} contentLoaded={contentLoaded} /> },
        { path: '/blog', element: <BlogPage /> },
    ];

    const router = createBrowserRouter(routes);

    return <RouterProvider router={router} />;
}

export default Router;