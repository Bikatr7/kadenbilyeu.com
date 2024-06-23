// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by a GNU General Public License v3.0
// license that can be found in the LICENSE file.

// react
import {createBrowserRouter, RouterProvider} from 'react-router-dom';

// pages
import HomePage from './pages/HomePage';

const routes = [
    { path: '/', element: <HomePage/> },
];

const router = createBrowserRouter(routes);

function Router() 
{
    return <RouterProvider router={router}/>;
}

export default Router;
