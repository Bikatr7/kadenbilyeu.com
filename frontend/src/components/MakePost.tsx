// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file

import { useState } from 'react';
import { Box, Button, Input, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Textarea, useDisclosure } from "@chakra-ui/react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { getURL } from '../utils';

interface MakePostProps {
    onPost: () => void;
}

const MakePost: React.FC<MakePostProps> = ({ onPost }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [error, setError] = useState('');

    const handleClose = () => {
        setTitle('');
        setContent('');
        setError('');
        onClose();
    };

    const handleSubmit = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setError('You must be logged in to make a post.');
            return;
        }

        try {
            const response = await fetch(getURL('/blog'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ title, content, author: 'Kaden Bilyeu (Bikatr7)' }),
            });

            if (!response.ok) {
                throw new Error('Failed to create post');
            }

            handleClose();
            onPost(); // Call the onPost callback to refresh the blog posts
        } catch (error) {
            setError('An error occurred. Please try again.');
        }
    };

    return (
        <>
            <Button onClick={onOpen} zIndex="2" _hover={{ color: 'yellow', transform: 'scale(1.01)' }} _active={{ transform: 'scale(0.99)' }}>
                Make Post
            </Button>
            <Modal isOpen={isOpen} onClose={handleClose} isCentered size="6xl">
                <ModalOverlay />
                <ModalContent bg="black" color="gray.500" border="2px solid gray.500" maxHeight="90vh" boxShadow="0 0 10px 5px rgba(255, 255, 255, 0.5)">
                    <ModalHeader borderBottom="1px solid gray.500">Create Post</ModalHeader>
                    <ModalCloseButton onClick={handleClose} />
                    <ModalBody overflowY="auto">
                        <Box display="flex" flexDirection={["column", "column", "row"]}>
                            <Box flex="1" mr={4}>
                                <Input
                                    placeholder="Title"
                                    mb={4}
                                    borderColor="gray.500"
                                    focusBorderColor="gray.500"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                />
                                <Textarea
                                    placeholder="Content (Markdown supported)"
                                    mb={4}
                                    borderColor="gray.500"
                                    focusBorderColor="gray.500"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    height="500px"
                                />
                            </Box>
                            <Box
                                flex="1"
                                ml={[0, 0, 4]}
                                mt={[4, 4, 0]}
                                bg="rgba(0, 0, 0, 0.7)"
                                p={4}
                                borderRadius="md"
                                border="1px solid gray.500"
                                overflowY="auto"
                                height="570px"
                            >
                                <Box
                                    className="markdown-preview"
                                    sx={{
                                        'h1, h2, h3, h4, h5, h6': {
                                            marginTop: '1em',
                                            marginBottom: '0.5em',
                                            fontWeight: 'bold',
                                            color: 'white',
                                        },
                                        'h1': { fontSize: '2em' },
                                        'h2': { fontSize: '1.5em' },
                                        'p': { marginBottom: '1em', color: 'gray.300' },
                                        'ul, ol': {
                                            marginLeft: '2em',
                                            marginBottom: '1em',
                                            color: 'gray.300',
                                        },
                                        'li': { marginBottom: '0.5em' },
                                        'code': {
                                            backgroundColor: 'gray.700',
                                            padding: '0.2em 0.4em',
                                            borderRadius: '3px',
                                            color: 'yellow.200',
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
                                            color: 'gray.400',
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
                                        {content}
                                    </ReactMarkdown>
                                </Box>
                            </Box>
                        </Box>
                        {error && <Box color="red.500" mt={4}>{error}</Box>}
                    </ModalBody>
                    <ModalFooter borderTop="1px solid gray.500">
                        <Button colorScheme="gray" mr={3} onClick={handleClose}>
                            Close
                        </Button>
                        <Button variant="outline" borderColor="gray.500" color="gray.500" onClick={handleSubmit}>
                            Post
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default MakePost;