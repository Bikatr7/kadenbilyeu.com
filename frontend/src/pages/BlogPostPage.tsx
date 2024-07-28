// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file

// react
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

// chakra-ui
import { Box, Text } from "@chakra-ui/react";

// components
import BlogBackground from "../components/BlogBackground";

// util
import { getURL } from '../utils';

const BlogPostPage: React.FC = () => {
    const { id } = useParams();
    const [blogPost, setBlogPost] = useState<{ title: string, content: string } | null>(null);

    useEffect(() => {
        const fetchBlogPost = async () => {
            const response = await fetch(getURL(`/blog/${id}`));
            const data = await response.json();
            setBlogPost(data);
        };
        fetchBlogPost();
    }, [id]);

    return (
        <Box bg="black" color="white" minHeight="100vh" position="relative" overflow="hidden">
            <BlogBackground />
            <Box
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%)"
                width="80%"
                maxWidth="800px"
                bg="rgba(0, 0, 0, 0.7)"
                borderRadius="md"
                boxShadow="lg"
                p={6}
                zIndex="1"
            >
                {blogPost ? (
                    <>
                        <Text fontSize="3xl" mb={4} textAlign="center">{blogPost.title}</Text>
                        <Text fontSize="lg">{blogPost.content}</Text>
                    </>
                ) : (
                    <Text textAlign="center">Loading...</Text>
                )}
            </Box>
        </Box>
    );
};

export default BlogPostPage;