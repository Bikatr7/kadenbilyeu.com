// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file.

// maintain allman bracket style for consistency

// react
import { useState, useEffect } from 'react';

// chakra-ui
import { Box, Button, Input, Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Text, useDisclosure, Spinner } from "@chakra-ui/react";

// util
import { getURL } from '../utils';

// jwt-decode
import { jwtDecode } from 'jwt-decode';

interface LoginProps 
{
    onLogin: () => void;
    onLogout: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onLogout }) => 
{
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [totp, setTotp] = useState('');
    const [error, setError] = useState('');
    const [step, setStep] = useState(1); // 1: login, 2: TOTP verification
    const [isLoading, setIsLoading] = useState(true);

    const isTokenExpired = (token: string) => 
    {
        try 
        {
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000;
            return decoded.exp ? decoded.exp < currentTime : true;
        } 
        catch (error) 
        {
            return true;
        }
    };

    useEffect(() => 
    {
        const checkLoginStatus = async () => 
        {
            const token = localStorage.getItem('token');
            if (token && !isTokenExpired(token)) 
            {
                onLogin();
            } 
            else 
            {
                onLogout();
            }
            setIsLoading(false);
        };

        checkLoginStatus();
    }, [onLogin, onLogout]);

    const handleNext = () => 
    {
        setStep(2);
    };

    const handleBack = () => 
    {
        setStep(1);
    };

    const handleClose = () => 
    {
        setUsername('');
        setPassword('');
        setTotp('');
        setError('');
        setStep(1);
        onClose();
    };

    const handleLogin = async () => 
    {
        try 
        {
            const response = await fetch(getURL('/login'), 
            {
                method: 'POST',
                headers: 
                {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password, totp })
            });

            if (response.ok) 
            {
                const data = await response.json();
                if (data.access_token) 
                {
                    localStorage.setItem('token', data.access_token);
                    document.cookie = `refresh_token=${data.refresh_token}; path=/; secure; HttpOnly`;
                    onLogin();
                    handleClose();
                } 
                else 
                {
                    setError('Invalid credentials or TOTP code');
                }
            } 
            else
            {
                const errorData = await response.json();
                setError(`Error: ${errorData.detail || 'Invalid credentials or TOTP code'}`);
            }
        } 
        catch (error) 
        {
            setError('An error occurred. Please try again.');
        }
    };

    const handleKeyPress = (event: React.KeyboardEvent) => 
    {
        if (event.key === 'Enter') 
        {
            if (step === 1) 
            {
                handleNext();
            } 
            else 
            {
                handleLogin();
            }
        }
    };

    return (
        <>
            <Button 
                position="absolute" 
                top="1rem" 
                right="1rem" 
                onClick={onOpen} 
                zIndex="2" 
                _hover={{ color: 'yellow', transform: 'scale(1.01)'}} 
                _active={{ transform: 'scale(0.99)'}}
                minWidth="70px" 
                height="40px"    
            >
                {isLoading ? <Spinner size="sm" /> : 'Login'}
            </Button>
            <Modal isOpen={isOpen} onClose={handleClose} isCentered>
                <ModalOverlay />
                <ModalContent bg="black" color="gray.500" border="2px solid darkgrey">
                    <ModalHeader>Login</ModalHeader>
                    <ModalCloseButton onClick={handleClose} />
                    <ModalBody>
                        {step === 1 ? (
                            <>
                                <Input
                                    placeholder="Username"
                                    mb={4}
                                    borderColor="gray.500"
                                    focusBorderColor="gray.500"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    autoComplete="username"
                                />
                                <Input
                                    placeholder="Password"
                                    type="password"
                                    mb={4}
                                    borderColor="gray.500"
                                    focusBorderColor="gray.500"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    autoComplete="current-password"
                                />
                            </>
                        ) : (
                            <>
                                <Text mb={4}>Enter your TOTP code</Text>
                                <Input
                                    placeholder="Enter 6-digit code"
                                    mb={4}
                                    borderColor="gray.500"
                                    focusBorderColor="gray.500"
                                    value={totp}
                                    onChange={(e) => setTotp(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    autoComplete="off"
                                    inputMode="numeric"
                                    pattern="\d{6}"
                                    maxLength={6}
                                    name="totp"
                                    aria-label="Time-based One-time Password"
                                    type="text"
                                />
                            </>
                        )}
                        {error && (
                            <Text color="red.500" mt={2}>
                                {error}
                            </Text>
                        )}
                    </ModalBody>
                    <ModalFooter borderTop="1px solid gray.500" display="flex" justifyContent="space-between">
                        <Button colorScheme="gray" mr={3} onClick={handleClose}>
                            Close
                        </Button>
                        <Box>
                            {step === 2 && (
                                <Button variant="outline" borderColor="gray.500" color="gray.500" mr={3} onClick={handleBack}>
                                    Back
                                </Button>
                            )}
                            {step === 1 ? (
                                <Button variant="outline" borderColor="gray.500" color="gray.500" onClick={handleNext}>
                                    Next
                                </Button>
                            ) : (
                                <Button variant="outline" borderColor="gray.500" color="gray.500" onClick={handleLogin}>
                                    Verify TOTP
                                </Button>
                            )}
                        </Box>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default Login;