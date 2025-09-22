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
import EditPost from "../components/EditPost";
import { getURL, parseSlugOrId, createSlug, authenticatedFetch } from '../utils';
import EmbedSEO from '../components/EmbedSEO';
import LoadingSpinner from '../components/LoadingSpinner';

// markdown
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

// context
import { useTheme } from '../contexts/ThemeContext';
import { useCache } from '../contexts/CacheContext';

interface BlogPost {
    id: string;
    title: string;
    content: string;
    author: string;
    view_count: number;
    created_at: string;
    updated_at?: string;
}

const BlogPostPage: React.FC = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const toast = useToast();
    const [blogPost, setBlogPost] = useState<BlogPost | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [_, setIsLoading] = useState(false);
    const { isRetro } = useTheme();
    const { getCache, setCache } = useCache();

    useEffect(() => {
        const fetchBlogPost = async () => {
            if (!id) return;

            const cacheKey = `blogPost_${id}`;
            const cachedData = getCache(cacheKey);

            if (cachedData) {
                setBlogPost(cachedData);
                setError(null);
                return;
            }
            setIsLoading(true);

            const { isSlug, value } = parseSlugOrId(id);
            const endpoint = isSlug ? `/blog/slug/${encodeURIComponent(value)}` : `/blog/${value}`;

            const response = await authenticatedFetch(getURL(endpoint));

            if (!response.ok) {
                if (response.status === 404) {
                    setError('Blog post not found');
                } else if (response.status === 422) {
                    setError('Invalid blog post URL');
                } else {
                    setError('Failed to load blog post');
                }
                return;
            }

            const data = await response.json();
            setError(null);
            setBlogPost(data);

            setCache(cacheKey, data, 5 * 60 * 1000); // 5 minutes
            setIsLoading(false);
        };

        const checkLoginStatus = async () => {
            try {
                const response = await fetch(getURL('/auth/check'), {
                    method: 'GET',
                    credentials: 'include'
                });
                const data = await response.json();
                setIsLoggedIn(data.authenticated);
            } catch (error) {
                setIsLoggedIn(false);
            }
        };

        fetchBlogPost();
        checkLoginStatus();
    }, [id]);

    const getBackLink = () => {
        if (location.state?.from === '/blog' || location.state?.from === '/blog/directory') {
            return location.state.from;
        }
        return '/blog/';
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleEditSubmit = async () => {
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

    const handleDelete = async () => {
        try {
            const response = await authenticatedFetch(getURL(`/blog/${id}`),
                {
                    method: 'DELETE'
                });

            if (response.ok) {
                toast({
                    title: "Post deleted",
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                });
                navigate('/blog');
            }
            else {
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
        catch (error) {
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
        <Box
            bg="transparent"
            color={isRetro ? "purple.400" : "white"}
            minHeight="83vh"
            display="flex"
            flexDirection="column"
            position="relative"
            className={isRetro ? 'retro-mode' : ''}
        >
            {blogPost && (
                <EmbedSEO
                    title={`${blogPost.title} | Kaden Bilyeu's Blog`}
                    description={blogPost.content.replace(/[#*`\[\]]/g, '').substring(0, 160).trim() + (blogPost.content.length > 160 ? '...' : '')}
                    url={`${window.location.origin}/blog/${createSlug(blogPost.title)}`}
                    image={`${window.location.origin}/kb.webp`}
                    imageAlt="Kaden Bilyeu (Bikatr7) Profile Picture"
                    type="article"
                    author={blogPost.author}
                    publishedTime={blogPost.created_at}
                    modifiedTime={blogPost.updated_at}
                    tags={blogPost.title.split(' ').filter(word => word.length > 3).slice(0, 5)}
                />
            )}

            {/* Header Bar */}
            <Box bg="black" p="1rem" borderBottom="1px solid" borderColor={isRetro ? "purple.400" : "darkgrey"}>
                <Flex justify="space-between" align="center" flexWrap="wrap" gap="1rem">
                    {/* Left side - Back button and title */}
                    <Flex align="center" gap="1rem" flexWrap="wrap">
                        <Button
                            leftIcon={<ArrowBackIcon />}
                            onClick={() => navigate(getBackLink())}
                            rounded={isRetro ? "none" : "full"}
                            border={isRetro ? "2px solid" : "none"}
                            borderColor="purple.400"
                            bg={isRetro ? "black" : undefined}
                            color={isRetro ? "purple.200" : undefined}
                            fontFamily={isRetro ? "'Press Start 2P', monospace" : "inherit"}
                            _hover={{
                                color: isRetro ? 'purple.400' : 'yellow',
                                transform: 'scale(1.01)'
                            }}
                        >
                            Go Back
                        </Button>
                        {blogPost && (
                            <Text
                                fontSize="lg"
                                color={isRetro ? "purple.400" : "white"}
                                fontFamily={isRetro ? "'Press Start 2P', monospace" : "inherit"}
                                fontWeight="bold"
                            >
                                {blogPost.title}
                            </Text>
                        )}
                    </Flex>

                    {/* Right side - Admin controls */}
                    <Flex gap="1rem" align="center" flexWrap="wrap">
                        {isLoggedIn && blogPost && (
                            <Text
                                fontSize="sm"
                                color={isRetro ? "purple.200" : "gray.300"}
                                fontFamily={isRetro ? "'Press Start 2P', monospace" : "inherit"}
                                whiteSpace="nowrap"
                            >
                                Views: {blogPost.view_count}
                            </Text>
                        )}
                        {isLoggedIn && (
                            <>
                                <Button
                                    leftIcon={<EditIcon />}
                                    onClick={handleEdit}
                                    rounded={isRetro ? "none" : "full"}
                                    border={isRetro ? "2px solid" : "none"}
                                    borderColor="purple.400"
                                    bg={isRetro ? "black" : undefined}
                                    color={isRetro ? "purple.200" : undefined}
                                    fontFamily={isRetro ? "'Press Start 2P', monospace" : "inherit"}
                                    _hover={{
                                        color: isRetro ? 'purple.400' : 'yellow',
                                        transform: 'scale(1.01)'
                                    }}
                                >
                                    Edit
                                </Button>
                                <Button
                                    leftIcon={<DeleteIcon />}
                                    onClick={handleDelete}
                                    rounded={isRetro ? "none" : "full"}
                                    border={isRetro ? "2px solid" : "none"}
                                    borderColor="purple.400"
                                    bg={isRetro ? "black" : undefined}
                                    color={isRetro ? "purple.200" : undefined}
                                    fontFamily={isRetro ? "'Press Start 2P', monospace" : "inherit"}
                                    _hover={{
                                        color: isRetro ? 'purple.400' : 'yellow',
                                        transform: 'scale(1.01)'
                                    }}
                                >
                                    Delete
                                </Button>
                            </>
                        )}
                    </Flex>
                </Flex>
            </Box>

            <Box
                flex="1"
                position="relative"
                overflowY="auto"
                p={{ base: 1, md: 6 }}
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
                            width={{ base: "100%", md: "85%" }}
                            maxWidth="1000px"
                            margin="0 auto"
                            bg={isRetro ? "black" : "rgba(0, 0, 0, 0.7)"}
                            p={{ base: 2, md: 6 }}
                            overflow="hidden"
                            border="2px solid"
                            borderColor={isRetro ? "purple.400" : "darkgrey"}
                        >
                            <Text
                                fontSize={{ base: "2xl", md: "3xl" }}
                                mb={4}
                                textAlign="center"
                                color={isRetro ? "purple.400" : "white"}
                                fontFamily={isRetro ? "'Press Start 2P', monospace" : "inherit"}
                            >
                                {blogPost.title}
                            </Text>
                            <Box
                                fontSize={{ base: "md", md: "lg" }}
                                className={`markdown-body ${isRetro ? 'retro-markdown' : ''}`}
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
                                        backgroundColor: '#1e1e1e',
                                        padding: '0.2em 0.4em',
                                        borderRadius: '3px',
                                        fontSize: '85%',
                                        fontFamily: 'monospace'
                                    },
                                    'pre': {
                                        padding: '0 !important',
                                        margin: '1em 0 !important',
                                        backgroundColor: 'transparent !important',
                                        border: '1px solid #333',
                                        borderRadius: '4px',
                                        overflow: 'hidden',
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
                                        margin: '1em auto',
                                        display: 'block'
                                    },
                                    ...(isRetro && {
                                        'h1, h2, h3, h4, h5, h6': {
                                            color: 'purple.400',
                                            fontFamily: "'Press Start 2P', monospace",
                                            marginTop: '1.5em',
                                            marginBottom: '0.8em'
                                        },
                                        'p': {
                                            color: 'purple.200',
                                            fontFamily: "'Press Start 2P', monospace",
                                            marginBottom: '1.5em',
                                            lineHeight: '1.8'
                                        },
                                        'blockquote': {
                                            borderColor: 'purple.400',
                                            color: 'purple.200',
                                            margin: '1.5em 0',
                                            padding: '0.8em'
                                        },
                                        'a': {
                                            color: 'purple.400',
                                            padding: '0.3em 0'
                                        },
                                        'ul, ol': {
                                            marginBottom: '1.5em',
                                            marginLeft: '2em'
                                        },
                                        'li': {
                                            marginBottom: '0.8em'
                                        }
                                    })
                                }}
                            >
                                <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    rehypePlugins={[rehypeRaw]}
                                    components={{
                                        code({ className, children, ...props }: any) {
                                            const match = /language-(\w+)/.exec(className || '');
                                            const language = match ? match[1] : '';

                                            if (className) {
                                                return (
                                                    <SyntaxHighlighter
                                                        language={language}
                                                        PreTag="div"
                                                        style={oneDark as any}
                                                        customStyle={{
                                                            margin: '0',
                                                            width: '100%',
                                                            backgroundColor: '#282c34',
                                                        }}
                                                        {...props}
                                                    >
                                                        {String(children).replace(/\n$/, '')}
                                                    </SyntaxHighlighter>
                                                );
                                            }
                                            return <code className={className} {...props}>{children}</code>;
                                        }
                                    }}
                                >
                                    {blogPost.content}
                                </ReactMarkdown>
                            </Box>
                        </Box>
                    )
                ) : (
                    <Flex justify="center" align="center" height="60vh" flexDirection="column" gap={4}>
                        {error ? (
                            <>
                                <Text
                                    color={isRetro ? "purple.400" : "red.400"}
                                    fontSize="xl"
                                    fontFamily={isRetro ? "'Press Start 2P', monospace" : "inherit"}
                                    textAlign="center"
                                >
                                    {error}
                                </Text>
                                <Button
                                    onClick={() => navigate('/blog')}
                                    rounded={isRetro ? "none" : "full"}
                                    border={isRetro ? "2px solid" : "none"}
                                    borderColor={isRetro ? "purple.400" : "transparent"}
                                    bg={isRetro ? "black" : undefined}
                                    color={isRetro ? "purple.200" : undefined}
                                    fontFamily={isRetro ? "'Press Start 2P', monospace" : "inherit"}
                                    _hover={{
                                        color: isRetro ? 'purple.400' : 'yellow',
                                        transform: 'scale(1.01)'
                                    }}
                                >
                                    Back to Blog
                                </Button>
                            </>
                        ) : (
                            <LoadingSpinner />
                        )}
                    </Flex>
                )}
            </Box>
        </Box>
    );
};

export default BlogPostPage;