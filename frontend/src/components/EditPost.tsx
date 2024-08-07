// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file.

// maintain allman bracket style for consistency

// react
import { useState, useEffect } from 'react';

// chakra-ui
import { Box, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure} from "@chakra-ui/react";

// components
import PostEditor from './PostEditor';

// utils
import { getURL } from '../utils';

interface EditPostProps 
{
    postId: string;
    onEdit: () => void;
    onClose: () => void; 
    initialTitle: string;
    initialContent: string;
    initialAuthor: string;
    isOpen: boolean;
}

const EditPost: React.FC<EditPostProps> = ({ postId, onEdit, onClose, initialTitle, initialContent, initialAuthor, isOpen }) => 
{
    const { onClose: chakraOnClose } = useDisclosure();
    const [title, setTitle] = useState(initialTitle);
    const [content, setContent] = useState(initialContent);
    const [author, setAuthor] = useState(initialAuthor);
    const [error, setError] = useState('');

    useEffect(() => 
    {
        setTitle(initialTitle);
        setContent(initialContent);
        setAuthor(initialAuthor);
    }, [initialTitle, initialContent, initialAuthor]);

    const handleClose = () => 
    {
        setTitle('');
        setContent('');
        setError('');
        chakraOnClose();
        onClose(); 
    };

    const handleSubmit = async () => 
    {
        const token = localStorage.getItem('token');
        if (!token) 
        {
            setError('You must be logged in to edit a post.');
            return;
        }

        try 
        {
            const response = await fetch(getURL(`/blog/${postId}`), 
            {
                method: 'PUT',
                headers: 
                {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ title, content, author }),
            });

            if (!response.ok) 
            {
                throw new Error('Failed to update post');
            }

            handleClose();
            onEdit(); 
        } 
        catch (error) 
        {
            setError('An error occurred. Please try again.');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose} isCentered size="6xl">
            <ModalOverlay />
            <ModalContent bg="black" color="gray.500" border="2px solid gray.500" maxHeight="90vh" boxShadow="0 0 10px 5px rgba(255, 255, 255, 0.5)">
                <ModalHeader borderBottom="1px solid gray.500">Edit Post</ModalHeader>
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
                        Save Changes
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default EditPost;