// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file

// react
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// chakra-ui
import { Box, Button, VStack, Text, Flex } from "@chakra-ui/react";

// components
import BlogBackground from "../components/BlogBackground";
import Login from "../components/Login";
import MakePost from "../components/MakePost";

// util
import { getURL } from '../utils';

const BlogPage: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [blogPosts, setBlogPosts] = useState<
        { id: string; title: string; created_at: string; author: string }[]
    >([]);
    const [postCount, setPostCount] = useState(0);

    const handleLogin = () => {
        setIsLoggedIn(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
        setIsLoggedIn(false);
    };

    const fetchBlogPosts = async () => {
        const response = await fetch(getURL("/latest-blogs?limit=5"));
        const data = await response.json();
        setBlogPosts(data);
        localStorage.setItem('blogPosts', JSON.stringify(data));
        localStorage.setItem('postCount', data.length.toString());
    };

    const fetchPostCount = async () => {
        const response = await fetch(getURL("/blog-count"));
        const count = await response.json();
        setPostCount(count);
    };

    useEffect(() => {
        const cachedBlogPosts = localStorage.getItem('blogPosts');
        const cachedPostCount = localStorage.getItem('postCount');

        if (cachedBlogPosts && cachedPostCount) {
            setBlogPosts(JSON.parse(cachedBlogPosts));
            fetchPostCount().then(() => {
                if (postCount != parseInt(cachedPostCount, 10)) {
                    fetchBlogPosts();
                }
            });
        } else {
            fetchBlogPosts();
        }
    }, [postCount]);

    const handleNewPost = () => {
        fetchBlogPosts();
    };

    return (
        <Box bg="black" color="white" minHeight="83vh" position="relative" overflow="hidden">
            <BlogBackground />
            <Box 
                position="absolute" 
                top="20%" 
                left="50%" 
                transform="translate(-50%, -20%)" 
                width="80%" 
                height="270px"  // Fixed height to accommodate 5 links
                border="2px solid darkgrey"
                display="flex"
                justifyContent="flex-start"
                alignItems="center"
                zIndex="1"
                p="1rem"
                pt="2rem"
                overflowY="auto"  // Ensure overflow content can be scrolled
            >
                <VStack spacing="1rem" align="flex-start" width="100%">
                    {blogPosts.map(post => (
                        <Link to={`/blog/${post.id}`} key={post.id} style={{ width: '100%' }}>
                            <Flex justify="space-between" align="center" width="100%">
                                <Text fontSize="xl" color="yellow">{post.title}</Text>
                                <Text fontSize="md" color="gray.300">{new Date(post.created_at).toLocaleString()} by {post.author}</Text>
                            </Flex>
                        </Link>
                    ))}
                </VStack>
            </Box>
            {isLoggedIn ? (
                <Box position="absolute" top="1rem" right="1rem" zIndex="2" display="flex" gap="1rem">
                    <MakePost onPost={handleNewPost} />
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