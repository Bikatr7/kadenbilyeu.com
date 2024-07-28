// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file

import { useState } from 'react';
import { Box, Button, Input, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Textarea, useDisclosure } from "@chakra-ui/react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { getURL } from '../utils';

const MakePost: React.FC = () => {
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
        } catch (error) {
            setError('An error occurred. Please try again.');
        }
    };

    return (
        <>
            <Button onClick={onOpen} zIndex="2">
                Make Post
            </Button>
            <Modal isOpen={isOpen} onClose={handleClose} isCentered size="4xl">
                <ModalOverlay />
                <ModalContent bg="black" color="gray.500" border="2px solid gray.500">
                    <ModalHeader borderBottom="1px solid gray.500">Create Post</ModalHeader>
                    <ModalCloseButton onClick={handleClose} />
                    <ModalBody>
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
                                    placeholder="Content"
                                    mb={4}
                                    borderColor="gray.500"
                                    focusBorderColor="gray.500"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    height="300px"
                                />
                            </Box>
                            <Box flex="1" ml={[0, 0, 4]} mt={[4, 4, 0]} bg="gray.800" p={4} borderRadius="md">
                                <Box overflowY="auto" height="300px">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
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