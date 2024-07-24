// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file.

import { useState } from 'react';
import { Box, Text, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Input, useDisclosure } from "@chakra-ui/react";
import BlogBackground from "../components/BlogBackground";

const BlogPage: React.FC = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async () => {
        try {
            const response = await fetch('http://localhost:5000/verify-credentials', {
                method: 'POST',
                headers: {
                    'Authorization': 'Basic ' + btoa(username + ':' + password),
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.message === 'Credentials are valid') {
                    alert('Login successful!');
                    onClose();
                }
            } else {
                setError('Incorrect username or password');
            }
        } catch (error) {
            setError('An error occurred. Please try again.');
        }
    };

    return (
        <Box bg="black" color="white" minHeight="100vh" position="relative" overflow="hidden">
            <BlogBackground />
            <Box 
                position="absolute" 
                top="50%" 
                left="50%" 
                transform="translate(-50%, -50%)" 
                width="100%" 
                height="70%" 
                border="2px solid yellow"
                display="flex"
                justifyContent="center"
                alignItems="center"
                zIndex="1"
            >
                <Text fontSize="4xl" color="yellow">Coming Soon</Text>
            </Box>
            <Button position="absolute" top="1rem" right="1rem" onClick={onOpen} zIndex="2">
                Login
            </Button>
            <Modal isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay />
                <ModalContent bg="black" color="gray.500" border="2px solid gray.500">
                    <ModalHeader borderBottom="1px solid gray.500">Login</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Input
                            placeholder="Username"
                            mb={4}
                            borderColor="gray.500"
                            focusBorderColor="gray.500"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <Input
                            placeholder="Password"
                            type="password"
                            borderColor="gray.500"
                            focusBorderColor="gray.500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        {error && <Text color="red.500" mt={2}>{error}</Text>}
                    </ModalBody>
                    <ModalFooter borderTop="1px solid gray.500">
                        <Button colorScheme="gray" mr={3} onClick={onClose}>
                            Close
                        </Button>
                        <Button variant="outline" borderColor="gray.500" color="gray.500" onClick={handleLogin}>
                            Login
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </Box>
    );
}

export default BlogPage;