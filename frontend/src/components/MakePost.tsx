// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file.

// maintain allman bracket style for consistency

// react
import { useState } from 'react';

// chakra-ui
import { Box, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure } from "@chakra-ui/react";

// components
import PostEditor from './PostEditor';

// utils
import { getURL } from '../utils';

interface MakePostProps 
{
    onPost: () => void;
}

const MakePost: React.FC<MakePostProps> = ({ onPost }) => 
{
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [error, setError] = useState('');

    const handleClose = () => 
    {
        setTitle('');
        setContent('');
        setError('');
        onClose();
    };

    const handleSubmit = async () => 
    {
        const token = localStorage.getItem('token');
        if (!token) 
        {
            setError('You must be logged in to make a post.');
            return;
        }

        try 
        {
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
                        <PostEditor title={title} content={content} setTitle={setTitle} setContent={setContent} />
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