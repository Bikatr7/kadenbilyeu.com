// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file.

// maintain allman bracket style for consistency

// react
import { useState, useEffect, useCallback, useRef } from 'react';

// react
import { Link, useNavigate } from 'react-router-dom';

// chakra-ui
import { Box, Button, VStack, Text, Flex } from "@chakra-ui/react";
import { ArrowBackIcon } from '@chakra-ui/icons';

// components
import EditPost from "../components/EditPost";
import EmbedSEO from "../components/EmbedSEO";
import LoadingSpinner from '../components/LoadingSpinner';

// utils
import { getURL, formatDate, createSlug, authenticatedFetch } from '../utils';

// context
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

interface BlogPost {
    id: string;
    title: string;
    created_at: string;
    author: string;
    content: string;
}

const BlogDirectoryPage: React.FC = () => {
    const { isRetro } = useTheme();
    const { isLoggedIn } = useAuth();
    const navigate = useNavigate();
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, postId: string | null }>({ x: 0, y: 0, postId: null });
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
    const contextMenuRef = useRef<HTMLDivElement | null>(null);

    const fetchBlogPosts = useCallback(async () => {
        setIsLoading(true);
        try {
            const cacheKey = 'blogDirectoryPosts';
            const timestampKey = 'blogDirectoryPosts_timestamp';
            const cachedData = localStorage.getItem(cacheKey);
            const cacheTimestamp = localStorage.getItem(timestampKey);
            const cacheExpiry = 3 * 60 * 1000; // 3 minutes for directory

            if (cachedData && cacheTimestamp && Date.now() - parseInt(cacheTimestamp) < cacheExpiry) {
                setBlogPosts(JSON.parse(cachedData));
                setIsLoading(false);
                return;
            }


            const postsResponse = await fetch(getURL("/all-blogs"));
            const newPosts = await postsResponse.json();
            setBlogPosts(newPosts);
            localStorage.setItem(cacheKey, JSON.stringify(newPosts));
            localStorage.setItem(timestampKey, Date.now().toString());
            localStorage.setItem('blogDirectoryPostCount', newPosts.length.toString());
        }
        catch (error) {
            console.error("Error fetching blog data:", error);
        }
        finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBlogPosts();
    }, [fetchBlogPosts]);

    const handleRightClick = (e: React.MouseEvent, postId: string) => {
        if (isLoggedIn) {
            e.preventDefault();
            const linkElement = e.currentTarget as HTMLElement;
            const rect = linkElement.getBoundingClientRect();
            setContextMenu({ x: rect.left + window.scrollX - 390, y: rect.bottom + window.scrollY - 85, postId });
        }
    };

    const handleClickOutside = (e: MouseEvent) => {
        if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
            setContextMenu({ x: 0, y: 0, postId: null });
        }
    };

    const handleMouseLeave = () => {
        setContextMenu({ x: 0, y: 0, postId: null });
    };

    useEffect(() => {
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    const handleDelete = async (postId: string) => {
        try {
            const response = await authenticatedFetch(getURL(`/blog/${postId}`),
                {
                    method: 'DELETE'
                });

            if (response.ok) {
                fetchBlogPosts();
                setContextMenu({ x: 0, y: 0, postId: null });
            }
            else {
                const errorData = await response.json();
                console.error("Error deleting blog post:", errorData.detail);
            }
        }
        catch (error) {
            console.error("An error occurred while deleting the blog post:", error);
        }
    };

    const handleEditPost = () => {
        fetchBlogPosts();
        setEditingPost(null);
        setContextMenu({ x: 0, y: 0, postId: null });
    };

    const handleCloseEditPost = () => {
        setEditingPost(null);
        setContextMenu({ x: 0, y: 0, postId: null });
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
            <EmbedSEO
                title={isRetro ? "Bikatr7's Blog Directory" : "Kaden Bilyeu's Blog Directory"}
                description="View all blog posts in one place."
            />

            {/* Header Bar */}
            <Box bg="black" p="1rem" borderBottom="1px solid" borderColor={isRetro ? "purple.400" : "darkgrey"}>
                <Flex justify="space-between" align="center" flexWrap="wrap" gap="1rem">
                    {/* Left side - Back button and title */}
                    <Flex align="center" gap="1rem" flexWrap="wrap">
                        <Button
                            leftIcon={<ArrowBackIcon />}
                            onClick={() => navigate('/blog')}
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
                        <Text
                            fontSize="lg"
                            color={isRetro ? "purple.400" : "white"}
                            fontFamily={isRetro ? "'Press Start 2P', monospace" : "inherit"}
                            fontWeight="bold"
                        >
                            Blog Directory
                        </Text>
                    </Flex>

                </Flex>
            </Box>

            {isLoading ? (
                <LoadingSpinner height="flex-1" />
            ) : (
                <Box
                    flex="1"
                    display="flex"
                    justifyContent="center"
                    alignItems="flex-start"
                    p="1rem"
                    overflowY="auto"
                    zIndex="1"
                >
                    <VStack
                        spacing="1rem"
                        align="stretch"
                        width="100%"
                        maxWidth="800px"
                        border={isRetro ? "2px solid" : "none"}
                        borderColor="purple.400"
                        p={isRetro ? 4 : 0}
                    >
                        {blogPosts.length > 0 ? (
                            blogPosts.map(post => (
                                <Link
                                    to={`/blog/${createSlug(post.title)}`}
                                    key={post.id}
                                    style={{ width: '100%' }}
                                    state={{ from: location.pathname }}
                                    onContextMenu={isLoggedIn ? (e) => handleRightClick(e, post.id) : undefined}
                                >
                                    <Flex
                                        justify="space-between"
                                        align="center"
                                        width="100%"
                                        p="0.5rem"
                                        _hover={{
                                            backgroundColor: isRetro ? 'rgba(147, 51, 234, 0.1)' : 'rgba(255, 255, 255, 0.1)',
                                            cursor: 'pointer'
                                        }}
                                        transition="background-color 0.2s"
                                        flexDirection={["column", "row"]}
                                        gap={["0.5rem", "0"]}
                                    >
                                        <Text
                                            fontSize={["lg", "xl"]}
                                            color={isRetro ? "purple.400" : "yellow"}
                                            isTruncated
                                            width={["100%", "auto"]}
                                            fontFamily={isRetro ? "'Press Start 2P', monospace" : "inherit"}
                                        >
                                            {post.title}
                                        </Text>
                                        <Text
                                            fontSize="sm"
                                            color={isRetro ? "purple.200" : "gray.300"}
                                            whiteSpace="nowrap"
                                            fontFamily={isRetro ? "'Press Start 2P', monospace" : "inherit"}
                                        >
                                            {formatDate(post.created_at)} by {isRetro ? "Bikatr7" : post.author}
                                        </Text>
                                    </Flex>
                                </Link>
                            ))
                        ) : (
                            <Flex justify="center" align="center" width="100%" height="100%">
                                <Text
                                    fontSize="xl"
                                    color={isRetro ? "purple.400" : "yellow"}
                                    fontFamily={isRetro ? "'Press Start 2P', monospace" : "inherit"}
                                >
                                    No Posts Available
                                </Text>
                            </Flex>
                        )}
                    </VStack>
                </Box>
            )}

            {contextMenu.postId && isLoggedIn && (
                <Box
                    ref={contextMenuRef}
                    position="absolute"
                    top={contextMenu.y}
                    left={contextMenu.x}
                    bg="black"
                    color="white"
                    p="0.5rem"
                    boxShadow="md"
                    zIndex={1000}
                    onMouseLeave={handleMouseLeave}
                    border={'1px solid darkgrey'}
                >
                    <VStack align="stretch">
                        <Text
                            cursor="pointer"
                            _hover={{ color: 'yellow' }}
                            onClick={() => setEditingPost(blogPosts.find(post => post.id === contextMenu.postId) || null)}
                        >
                            Edit
                        </Text>
                        <Text
                            cursor="pointer"
                            _hover={{ color: 'yellow' }}
                            onClick={() => {
                                handleDelete(contextMenu.postId!);
                                setContextMenu({ x: 0, y: 0, postId: null });
                            }}
                        >
                            Delete
                        </Text>
                    </VStack>
                </Box>
            )}

            {editingPost && (
                <EditPost
                    postId={editingPost.id}
                    onEdit={handleEditPost}
                    onClose={handleCloseEditPost}
                    initialTitle={editingPost.title}
                    initialContent={editingPost.content}
                    initialAuthor={editingPost.author}
                    isOpen={true}
                />
            )}
        </Box>
    );
};

export default BlogDirectoryPage;