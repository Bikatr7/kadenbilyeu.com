// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file

// react
import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';

// chakra-ui
import { Box, Text, Button, Flex } from "@chakra-ui/react";
import { ArrowBackIcon } from '@chakra-ui/icons';

// components
import BlogBackground from "../components/BlogBackground";

// util
import { getURL } from '../utils';

// markdown
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

const BlogPostPage: React.FC = () => {
    const { id } = useParams();
    const location = useLocation();
    const [blogPost, setBlogPost] = useState<{ title: string, content: string } | null>(null);

    useEffect(() => {
        const fetchBlogPost = async () => {
            const response = await fetch(getURL(`/blog/${id}`));
            const data = await response.json();
            setBlogPost(data);
        };
        fetchBlogPost();
    }, [id]);

    const getBackLink = () => {
        if (location.state?.from === '/blog' || location.state?.from === '/blog/directory') {
            return location.state.from;
        }
        return '/blog/';
    };

    return (
        <Box bg="black" color="white" minHeight="83vh" display="flex" flexDirection="column" position="relative">
            <BlogBackground />
            
            <Flex 
                justify="space-between" 
                p="1rem" 
                bg="black"
            >
                <Button 
                    leftIcon={<ArrowBackIcon />} 
                    as="a" 
                    href={getBackLink()} 
                    rounded="full" 
                    _hover={{ color: 'yellow', transform: 'scale(1.01)' }} 
                    _active={{ transform: 'scale(0.99)' }}
                >
                    Go Back
                </Button>
            </Flex>
            
            <Box
                flex="1" 
                position="relative"
                overflowY="auto"
                p={6}
                zIndex="1"
                sx={{
                    /* Hide scrollbar for Webkit-based browsers */
                    '::-webkit-scrollbar': {
                        display: 'none',
                    },
                    /* Hide scrollbar for other browsers */
                    '-ms-overflow-style': 'none',  /* IE and Edge */
                    'scrollbar-width': 'none'  /* Firefox */
                }}
            >
                {blogPost ? (
                    <Box
                        width="80%"
                        maxWidth="800px"
                        margin="0 auto"
                        bg="rgba(0, 0, 0, 0.7)"
                        borderRadius="md"
                        boxShadow="lg"
                        p={6}
                        overflow="hidden"
                        border={`2px solid darkgrey`}
                    >
                        <Text fontSize="3xl" mb={4} textAlign="center">{blogPost.title}</Text>
                        <Box 
                            fontSize="lg" 
                            className="markdown-body"
                            sx={{
                                'h1, h2, h3, h4, h5, h6': {
                                    marginTop: '1em',
                                    marginBottom: '0.5em',
                                    fontWeight: 'bold',
                                },
                                'h1': { fontSize: '2em' },
                                'h2': { fontSize: '1.5em' },
                                'p': { marginBottom: '1em' },
                                'ul, ol': { 
                                    marginLeft: '2em',
                                    marginBottom: '1em',
                                },
                                'li': { marginBottom: '0.5em' },
                                'code': {
                                    backgroundColor: 'gray.700',
                                    padding: '0.2em 0.4em',
                                    borderRadius: '3px',
                                },
                                'pre': {
                                    backgroundColor: 'gray.700',
                                    padding: '1em',
                                    overflowX: 'auto',
                                    marginBottom: '1em',
                                },
                                'blockquote': {
                                    borderLeft: '4px solid',
                                    borderColor: 'gray.500',
                                    paddingLeft: '1em',
                                    marginLeft: '0',
                                    fontStyle: 'italic',
                                },
                                'a': {
                                    color: 'blue.300',
                                    textDecoration: 'underline',
                                },
                                'img': {
                                    maxWidth: '100%',
                                    height: 'auto',
                                },
                            }}
                        >
                            <ReactMarkdown 
                                remarkPlugins={[remarkGfm]} 
                                rehypePlugins={[rehypeRaw]}
                            >
                                {blogPost.content}
                            </ReactMarkdown>
                        </Box>
                    </Box>
                ) : (
                    <Text textAlign="center">Loading...</Text>
                )}
            </Box>
        </Box>
    );
};

export default BlogPostPage;