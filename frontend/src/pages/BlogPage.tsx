// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file

// react
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// chakra-ui
import { Box, Button, VStack, Text } from "@chakra-ui/react";

// components
import BlogBackground from "../components/BlogBackground";
import Login from "../components/Login";
import MakePost from "../components/MakePost";

// util
import { getURL } from '../utils';

const BlogPage: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [blogPosts, setBlogPosts] = useState<{ id: string; title: string }[]>([]);

    const handleLogin = () => {
        setIsLoggedIn(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
        setIsLoggedIn(false);
    };

    useEffect(() => {
        const fetchBlogPosts = async () => {
            const response = await fetch(getURL("/latest-blogs?limit=5"));
            const data = await response.json();
            setBlogPosts(data);
        };
        fetchBlogPosts();
    }, []);

    return (
        <Box bg="black" color="white" minHeight="100vh" position="relative" overflow="hidden">
            <BlogBackground />
            <Box 
                position="absolute" 
                top="50%" 
                left="50%" 
                transform="translate(-50%, -50%)" 
                width="100%" 
                height="70%" 
                border="2px solid yellow"
                display="flex"
                justifyContent="center"
                alignItems="center"
                zIndex="1"
                p="1rem"
            >
                <VStack spacing="1rem">
                    {blogPosts.map(post => (
                        <Link to={`/blog/${post.id}`} key={post.id}>
                            <Text fontSize="xl" color="yellow">{post.title}</Text>
                        </Link>
                    ))}
                </VStack>
            </Box>
            {isLoggedIn ? (
                <Box position="absolute" top="1rem" right="1rem" zIndex="2" display="flex" gap="1rem">
                    <MakePost />
                    <Button onClick={handleLogout}>
                        Logout
                    </Button>
                </Box>
            ) : (
                <Login onLogin={handleLogin} />
            )}
        </Box>
    );
};

export default BlogPage;