// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file

// react
import { useState } from 'react';

// chakra-ui
import { Box, Text, Button } from "@chakra-ui/react";

// components
import BlogBackground from "../components/BlogBackground";
import Login from "../components/Login";
import MakePost from "../components/MakePost";

const BlogPage: React.FC = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const handleLogin = () => {
        setIsLoggedIn(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
        setIsLoggedIn(false);
    };

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
            >
                <Text fontSize="4xl" color="yellow">Coming Soon</Text>
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