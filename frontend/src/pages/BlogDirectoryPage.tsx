// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file

// react
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

// chakra-ui
import { Box, Button, VStack, Text, Flex } from "@chakra-ui/react";
import { ArrowBackIcon } from '@chakra-ui/icons';

// components
import Login from "../components/Login";

// util
import { getURL } from '../utils';

const BlogDirectoryPage: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [blogPosts, setBlogPosts] = useState<
        { id: string; title: string; created_at: string; author: string }[]
    >([]);

    const fetchBlogPosts = useCallback(async () => {
        try {
            const countResponse = await fetch(getURL("/blog-count"));
            const newCount = await countResponse.json();

            const cachedCount = localStorage.getItem('blogDirectoryPostCount');

            if (!cachedCount || newCount !== parseInt(cachedCount, 10)) {
                const postsResponse = await fetch(getURL("/all-blogs"));
                const newPosts = await postsResponse.json();

                setBlogPosts(newPosts);
                localStorage.setItem('blogDirectoryPosts', JSON.stringify(newPosts));
                localStorage.setItem('blogDirectoryPostCount', newCount.toString());
            } else {
                const cachedPosts = localStorage.getItem('blogDirectoryPosts');
                if (cachedPosts) {
                    setBlogPosts(JSON.parse(cachedPosts));
                }
            }
        } catch (error) {
            console.error("Error fetching blog data:", error);
        }
    }, []);

    useEffect(() => {
        fetchBlogPosts();
    }, [fetchBlogPosts]);

    const handleLogin = () => {
        setIsLoggedIn(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
        setIsLoggedIn(false);
    };

    return (
        <Box bg="black" color="white" minHeight="100vh" display="flex" flexDirection="column">
            <Flex 
                justify="space-between" 
                p="1rem" 
                bg="black"
            >
                <Button leftIcon={<ArrowBackIcon />} as="a" href="/blog/" rounded="full" _hover={{ color: 'yellow', transform: 'scale(1.01)'}} _active={{ transform: 'scale(0.99)'}}>Go Back</Button>
                {isLoggedIn ? (
                    <Button onClick={handleLogout} _hover={{ color: 'yellow', transform: 'scale(1.01)'}} _active={{ transform: 'scale(0.99)'}}>Logout</Button>
                ) : (
                    <Login onLogin={handleLogin} />
                )}
            </Flex>

            <Box
                flex="1" 
                display="flex"
                justifyContent="center"
                alignItems="flex-start"
                p="1rem"
                overflowY="auto"
            >
                <VStack spacing="1rem" align="flex-start" width="100%">
                    {blogPosts.map(post => (
                        <Link to={`/blog/${post.id}`} key={post.id} style={{ width: '100%' }}>
                            <Flex 
                                justify="space-between" 
                                align="center" 
                                width="100%" 
                                paddingLeft="0.5rem"
                                paddingRight="0.5rem"
                                _hover={{ backgroundColor: 'gray.700', cursor: 'pointer' }} // Hover effect added here
                            >
                                <Text fontSize="xl" color="yellow">{post.title}</Text>
                                <Text fontSize="md" color="gray.300">{new Date(post.created_at).toLocaleString()} by {post.author}</Text>
                            </Flex>
                        </Link>
                    ))}
                </VStack>
            </Box>
        </Box>
    );
};

export default BlogDirectoryPage;