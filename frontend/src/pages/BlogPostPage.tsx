// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file.

// maintain allman bracket style for consistency

// react
import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';

// chakra-ui
import { Box, Text, Button, Flex, useToast } from "@chakra-ui/react";
import { ArrowBackIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';

// components
import BlogBackground from "../components/BlogBackground";
import EditPost from "../components/EditPost";
import { getURL } from '../utils';
import EmbedSEO from '../components/EmbedSEO';

// markdown
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';

interface BlogPost 
{
    id: string;
    title: string;
    content: string;
    author: string;
    view_count: number;
}

const BlogPostPage: React.FC = () =>
{
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const toast = useToast();
    const [blogPost, setBlogPost] = useState<BlogPost | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => 
    {
        const fetchBlogPost = async () => 
        {
            const token = localStorage.getItem('token');
            const headers: HeadersInit = {};
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(getURL(`/blog/${id}`), {
                headers: headers
            });
            const data = await response.json();
            setBlogPost(data);
        };
        fetchBlogPost();

        const token = localStorage.getItem('token');
        setIsLoggedIn(!!token);
    }, [id]);

    const getBackLink = () => 
    {
        if (location.state?.from === '/blog' || location.state?.from === '/blog/directory')
        {
            return location.state.from;
        }
        return '/blog/';
    };

    const handleEdit = () => 
    {
        setIsEditing(true);
    };

    const handleEditSubmit = async () => 
    {
        const response = await fetch(getURL(`/blog/${id}`));
        const data = await response.json();
        setBlogPost(data);
        setIsEditing(false);
        toast({
            title: "Post updated",
            status: "success",
            duration: 3000,
            isClosable: true,
        });
    };

    const handleDelete = async () => 
    {
        try 
        {
            const token = localStorage.getItem('token');
            const response = await fetch(getURL(`/blog/${id}`), 
            {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) 
            {
                toast({
                    title: "Post deleted",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
                navigate('/blog');
            } 
            else 
            {
                const errorData = await response.json();
                toast({
                    title: "Error deleting post",
                    description: errorData.detail,
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
        } 
        catch (error) 
        {
            console.error("An error occurred while deleting the blog post:", error);
            toast({
                title: "Error",
                description: "An error occurred while deleting the post",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    return (
        <Box bg="black" color="white" minHeight="83vh" display="flex" flexDirection="column" position="relative">
            <BlogBackground />

            {blogPost && (
                <EmbedSEO
                    title={`${blogPost.title} | Kaden Bilyeu's Blog`}
                    description={`Read '${blogPost.title}' by ${blogPost.author} on Kaden Bilyeu's blog. ${blogPost.content.substring(0, 50)}...`}
                />
            )}
            
            <Flex justify="space-between" p="1rem" bg="black">
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
                <Flex align="center">

                    {isLoggedIn && (
                        <>
                            {blogPost && (
                                <Text mr={4} fontSize="sm" color="gray.300">
                                    Views: {blogPost.view_count}
                                </Text>
                            )}
                            <Button 
                                leftIcon={<EditIcon />} 
                                onClick={handleEdit}
                                rounded="full" 
                                mr={2}
                                _hover={{ color: 'yellow', transform: 'scale(1.01)' }} 
                                _active={{ transform: 'scale(0.99)' }}
                            >
                                Edit
                            </Button>
                            <Button 
                                leftIcon={<DeleteIcon />} 
                                onClick={handleDelete}
                                rounded="full" 
                                _hover={{ color: 'yellow', transform: 'scale(1.01)' }} 
                                _active={{ transform: 'scale(0.99)' }}
                            >
                                Delete
                            </Button>
                        </>
                    )}
                </Flex>
            </Flex>
            
            <Box
                flex="1" 
                position="relative"
                overflowY="auto"
                p={6}
                zIndex="1"
                sx={{
                    '::-webkit-scrollbar': {
                        display: 'none',
                    },
                    '-ms-overflow-style': 'none',
                    'scrollbar-width': 'none'
                }}
            >
                {blogPost ? (
                    isEditing ? (
                        <EditPost
                            postId={blogPost.id}
                            onEdit={handleEditSubmit}
                            onClose={() => setIsEditing(false)}
                            initialTitle={blogPost.title}
                            initialContent={blogPost.content}
                            initialAuthor={blogPost.author}
                            isOpen={true}
                        />
                    ) : (
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
                    )
                ) : (
                    <Text textAlign="center">Loading...</Text>
                )}
            </Box>
        </Box>
    );
};

export default BlogPostPage;