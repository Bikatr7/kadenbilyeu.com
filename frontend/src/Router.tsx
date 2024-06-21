import {createBrowserRouter, RouterProvider} from 'react-router-dom';

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
