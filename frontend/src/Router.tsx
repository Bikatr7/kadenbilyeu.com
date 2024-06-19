import {createBrowserRouter, RouterProvider} from 'react-router-dom';

const routes = [
    {}
];

const router = createBrowserRouter(routes);

function Router() 
{
    return <RouterProvider router={router}/>;
}

export default Router;
