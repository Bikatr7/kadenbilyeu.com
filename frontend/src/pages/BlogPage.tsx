// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file.

// maintain allman bracket style for consistency

// react
import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';

// chakra-ui
import { Box, Button, VStack, Text, Flex, Spinner, useToast } from "@chakra-ui/react";

// components
import BlogBackground from "../components/BlogBackground";
import Login from "../components/Login";
import MakePost from "../components/MakePost";
import EditPost from "../components/EditPost";
import EmbedSEO from '../components/EmbedSEO';

// utils
import { getURL, formatDate, createSlug } from '../utils';

// contexts
import { useTheme } from '../contexts/ThemeContext';

interface BlogPost 
{
    id: string;
    title: string;
    created_at: string;
    author: string;
    content: string;
}

const BlogPage: React.FC = () => 
{
    const { isRetro } = useTheme();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, postId: string | null }>({ x: 0, y: 0, postId: null });
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
    const contextMenuRef = useRef<HTMLDivElement | null>(null);
    const toast = useToast();

    const fetchBlogPosts = useCallback(async () => 
    {
        setIsLoading(true);
        try 
        {
            const postsResponse = await fetch(getURL("/latest-blogs?limit=5"));
            const newPosts = await postsResponse.json();
            setBlogPosts(newPosts);
            localStorage.setItem('blogPageBlogPosts', JSON.stringify(newPosts));
            localStorage.setItem('blogPagePostCount', newPosts.length.toString());
        } 
        catch (error) 
        {
            console.error("Error fetching blog data:", error);
        } 
        finally 
        {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => 
    {
        fetchBlogPosts();
    }, [fetchBlogPosts]);

    const handleLogin = () => setIsLoggedIn(true);
    const handleLogout = () => 
    {
        localStorage.removeItem('token');
        document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
        setIsLoggedIn(false);
    };
    const handleNewPost = () => 
    {
        fetchBlogPosts();
        toast({
            title: "New post created.",
            description: "Your new post has been successfully created.",
            status: "success",
            duration: 5000,
            isClosable: true,
        });
    };

    const handleRightClick = (e: React.MouseEvent, postId: string) => 
    {
        if (isLoggedIn) 
        {
            e.preventDefault();
            const linkElement = e.currentTarget as HTMLElement;
            const rect = linkElement.getBoundingClientRect();
            setContextMenu({ x: rect.left + window.scrollX - 390, y: rect.bottom + window.scrollY - 85, postId });
        }
    };

    const handleClickOutside = (e: MouseEvent) => 
    {
        if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) 
        {
            setContextMenu({ x: 0, y: 0, postId: null });
        }
    };

    const handleMouseLeave = () => 
    {
        setContextMenu({ x: 0, y: 0, postId: null });
    };

    useEffect(() => 
    {
        document.addEventListener('click', handleClickOutside);
        return () => 
        {
            document.removeEventListener('click', handleClickOutside);
        };
    }, []);

    const handleDelete = async (postId: string) => 
    {
        try 
        {
            const token = localStorage.getItem('token');
            const response = await fetch(getURL(`/blog/${postId}`), 
            {
                method: 'DELETE',
                headers: 
                {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) 
            {
                fetchBlogPosts();
                setContextMenu({ x: 0, y: 0, postId: null }); 
            } 
            else 
            {
                const errorData = await response.json();
                console.error("Error deleting blog post:", errorData.detail);
            }
        } 
        catch (error) 
        {
            console.error("An error occurred while deleting the blog post:", error);
        }
    };

    const handleEditPost = () => 
    {
        fetchBlogPosts();
        setEditingPost(null);
        setContextMenu({ x: 0, y: 0, postId: null }); 
    };

    const handleCloseEditPost = () => 
    {
        setEditingPost(null);
        setContextMenu({ x: 0, y: 0, postId: null }); 
    };

    const handleFileUpload = async (file: File) => 
    {
        const formData = new FormData();
        formData.append('file', file);
        const token = localStorage.getItem('token');

        try 
        {
            const response = await fetch(getURL('/replace-database/'), 
            {
                method: 'POST',
                headers: 
                {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) 
            {
                console.log('Database replaced successfully');
                toast({
                    title: "Database replaced.",
                    description: "The database has been successfully replaced.",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
            } 
            else 
            {
                const errorData = await response.json();
                console.error('Error replacing database:', errorData.detail);
                toast({
                    title: "Error replacing database.",
                    description: errorData.detail,
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        } 
        catch (error) 
        {
            console.error('An error occurred while uploading the file:', error);
            toast({
                title: "Error replacing database.",
                description: "An error occurred while uploading the file.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => 
    {
        const file = event.target.files?.[0];
        if (file) 
        {
            handleFileUpload(file);
        }
    };

    const handleForceBackup = async () => 
    {
        const token = localStorage.getItem('token');

        try 
        {
            const response = await fetch(getURL('/force-backup'), 
            {
                method: 'POST',
                headers: 
                {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) 
            {
                console.log('Backup forced successfully');
                toast({
                    title: "Backup forced.",
                    description: "The backup has been successfully forced.",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
            } 
            else 
            {
                const errorData = await response.json();
                console.error('Error forcing backup:', errorData.detail);
                toast({
                    title: "Error forcing backup.",
                    description: errorData.detail,
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        } 
        catch (error) 
        {
            console.error('An error occurred while forcing the backup:', error);
            toast({
                title: "Error forcing backup.",
                description: "An error occurred while forcing the backup.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    return (
        <Box 
            bg="black" 
            color={isRetro ? "purple.400" : "white"} 
            minHeight="83vh" 
            display="flex" 
            flexDirection="column" 
            alignItems="center" 
            position="relative" 
            overflow="hidden"
            className={isRetro ? 'retro-mode' : ''}
        >
            {!isRetro && <BlogBackground />}

            <EmbedSEO
                title={isRetro ? "Bikatr7's Blog" : "Kaden Bilyeu's Blog"}
                description="Explore Kaden Bilyeu's latest blog posts on various topics including technology, programming, personal projects, and more."
                image={`${window.location.origin}/kb.webp`}
                imageAlt="Kaden Bilyeu (Bikatr7) Profile Picture"
            />

            <Flex justify="flex-end" p="1rem" bg="black" width="100%" gap="1rem" flexWrap="wrap">
                {isLoggedIn ? (
                    <>
                        <MakePost onPost={handleNewPost} />
                        <Button 
                            onClick={handleForceBackup} 
                            rounded={isRetro ? "none" : "full"}
                            border={isRetro ? "2px solid" : "none"}
                            borderColor="purple.400"
                            bg={isRetro ? "black" : undefined}
                            _hover={{ 
                                color: isRetro ? 'purple.400' : 'yellow', 
                                transform: 'scale(1.01)'
                            }}
                        >
                            Force Backup
                        </Button>
                        <Button as="label" _hover={{ color: 'yellow', transform: 'scale(1.01)' }} _active={{ transform: 'scale(0.99)' }}>
                            Upload Database
                            <input type="file" accept=".pgp" style={{ display: 'none' }} onChange={handleFileChange} />
                        </Button>
                        <Button onClick={handleLogout} _hover={{ color: 'yellow', transform: 'scale(1.01)' }} _active={{ transform: 'scale(0.99)' }}>
                            Logout
                        </Button>
                    </>
                ) : (
                    <Login onLogin={handleLogin} onLogout={handleLogout} />
                )}
            </Flex>

            {isLoading ? (
                <Flex justifyContent="center" alignItems="center" height="60vh" flexDirection="column" gap={4}>
                    <Spinner 
                        size="xl" 
                        color={isRetro ? "purple.400" : "yellow"} 
                        thickness="4px" 
                    />
                    <Text 
                        color={isRetro ? "purple.400" : "yellow"} 
                        fontSize="lg"
                        fontFamily={isRetro ? "'Press Start 2P', monospace" : "inherit"}
                    >
                        Sorry for the wait, I don't pay for 100% uptime.
                    </Text>
                </Flex>
            ) : (
                <>
                    <Box
                        mt={["7rem", "8rem", "10vh", "15vh"]}
                        width={["95%", "90%", "80%"]}
                        maxWidth="800px"
                        border={isRetro ? "2px solid" : "2px solid darkgrey"}
                        borderColor={isRetro ? "purple.400" : "darkgrey"}
                        bg={isRetro ? "black" : "rgba(0, 0, 0, 0.7)"}
                        position="relative"
                        overflow="hidden"
                    >
                        <VStack spacing="0.5rem" align="stretch" width="100%" maxHeight={["50vh", "55vh", "50vh"]} overflowY="auto" p="1rem">
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
                                <Flex justify="center" align="center" height="100%">
                                    <Text 
                                        fontSize="xl" 
                                        color={isRetro ? "purple.400" : "yellow"}
                                        fontFamily={isRetro ? "'Press Start 2P', monospace" : "inherit"}
                                    >
                                        No Current Posts
                                    </Text>
                                </Flex>
                            )}
                        </VStack>
                    </Box>

                    <Button
                        as="a"
                        href="/blog/directory"
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
                        mt="2rem"
                        mb="2rem"
                        width="auto"
                    >
                        All Posts
                    </Button>
                </>
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
                            onClick={() => 
                            {
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

export default BlogPage;