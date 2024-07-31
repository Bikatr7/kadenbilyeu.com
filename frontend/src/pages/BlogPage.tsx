// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file.

import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Box, Button, VStack, Text, Flex, Spinner } from "@chakra-ui/react";
import BlogBackground from "../components/BlogBackground";
import Login from "../components/Login";
import MakePost from "../components/MakePost";
import EditPost from "../components/EditPost";
import { getURL } from '../utils';

interface BlogPost {
  id: string;
  title: string;
  created_at: string;
  author: string;
  content: string;
}

const BlogPage: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, postId: string | null }>({ x: 0, y: 0, postId: null });
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const contextMenuRef = useRef<HTMLDivElement | null>(null);

  const fetchBlogPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const postsResponse = await fetch(getURL("/latest-blogs?limit=5"));
      const newPosts = await postsResponse.json();
      setBlogPosts(newPosts);
      localStorage.setItem('blogPageBlogPosts', JSON.stringify(newPosts));
      localStorage.setItem('blogPagePostCount', newPosts.length.toString());
    } catch (error) {
      console.error("Error fetching blog data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlogPosts();
  }, [fetchBlogPosts]);

  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => {
    localStorage.removeItem('token');
    document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    setIsLoggedIn(false);
  };
  const handleNewPost = () => fetchBlogPosts();

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
      const token = localStorage.getItem('token');
      const response = await fetch(getURL(`/blog/${postId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchBlogPosts();
        setContextMenu({ x: 0, y: 0, postId: null }); 
      } else {
        const errorData = await response.json();
        console.error("Error deleting blog post:", errorData.detail);
      }
    } catch (error) {
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
    <Box bg="black" color="white" minHeight="83vh" display="flex" flexDirection="column" alignItems="center" position="relative" overflow={'hidden'} maxHeight={'83vh'}>
      <BlogBackground />

      <Flex justify="space-between" p="1rem" bg="black" width="100%">
        {isLoggedIn ? (
          <>
            <MakePost onPost={handleNewPost} />
            <Button onClick={handleLogout} _hover={{ color: 'yellow', transform: 'scale(1.01)' }} _active={{ transform: 'scale(0.99)' }}>
              Logout
            </Button>
          </>
        ) : (
          <Login onLogin={handleLogin} onLogout={handleLogout} />
        )}
      </Flex>

      {isLoading ? (
        <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 1000 }}>
          <Spinner size="xl" color="yellow" thickness="4px" />
        </div>
      ) : (
        <>
          <Box
            mt="15vh"
            width="80%"
            maxWidth="800px"
            maxHeight="400px"
            border="2px solid darkgrey"
            bg="rgba(0, 0, 0, 0.7)"
            position="relative"
            overflow="hidden"
          >
            <VStack spacing="0.5rem" align="stretch" width="100%" height="100%" overflowY="auto" p="1rem">
              {blogPosts.map(post => (
                <Link
                  to={`/blog/${post.id}`}
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
                    _hover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', cursor: 'pointer' }}
                    transition="background-color 0.2s"
                  >
                    <Text fontSize="xl" color="yellow" isTruncated>{post.title}</Text>
                    <Text fontSize="sm" color="gray.300" whiteSpace="nowrap">{new Date(post.created_at).toLocaleString()} by {post.author}</Text>
                  </Flex>
                </Link>
              ))}
            </VStack>
          </Box>

          <Button
            as="a"
            href="/blog/directory"
            rounded="full"
            _hover={{ color: 'yellow', transform: 'scale(1.01)' }}
            _active={{ transform: 'scale(0.99)' }}
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

export default BlogPage;