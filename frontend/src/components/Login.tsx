// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file.

// maintain allman bracket style for consistency

// react
import { useState, useEffect } from 'react';

// chakra-ui
import { Button, Modal, ModalOverlay, ModalContent, ModalBody, Text, useDisclosure, Spinner, VStack, Alert, AlertIcon, Box, Icon, HStack, Input, FormControl, FormLabel, IconButton } from "@chakra-ui/react";
import { LockIcon, AddIcon } from '@chakra-ui/icons';

// util
import { getURL } from '../utils';

// context
import { useTheme } from '../contexts/ThemeContext';

interface LoginProps {
    onLogin: () => void;
    onLogout: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onLogout }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isRegisterOpen, onOpen: onRegisterOpen, onClose: onRegisterClose } = useDisclosure();
    const { isOpen: isSuccessOpen, onOpen: onSuccessOpen, onClose: onSuccessClose } = useDisclosure();
    const { isRetro } = useTheme();
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [error, setError] = useState('');
    const [registerPassword, setRegisterPassword] = useState('');
    const [registerError, setRegisterError] = useState('');

    const slideInStyle = {
        animation: 'slideIn 0.3s ease-out'
    };

    const pulseStyle = {
        animation: 'pulse 2s ease-in-out infinite'
    };

    const glowStyle = {
        animation: 'glow 2s ease-in-out infinite'
    };

    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateY(-50px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
            @keyframes glow {
                0% { box-shadow: 0 0 5px ${isRetro ? 'rgba(147, 51, 234, 0.5)' : 'rgba(255, 215, 0, 0.3)'}; }
                50% { box-shadow: 0 0 15px ${isRetro ? 'rgba(147, 51, 234, 0.8)' : 'rgba(255, 215, 0, 0.5)'}; }
                100% { box-shadow: 0 0 5px ${isRetro ? 'rgba(147, 51, 234, 0.5)' : 'rgba(255, 215, 0, 0.3)'}; }
            }
            @keyframes success {
                0% { transform: scale(0.8); opacity: 0; }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        return () => {
            document.head.removeChild(style);
        };
    }, [isRetro]);

    const base64UrlToUint8Array = (base64UrlString: string): Uint8Array => {
        let base64 = base64UrlString.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) {
            base64 += '=';
        }
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    };

    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const response = await fetch(getURL('/auth/check'), {
                    credentials: 'include'
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.authenticated) {
                        onLogin();
                    } else {
                        onLogout();
                    }
                } else {
                    onLogout();
                }
            } catch (error) {
                onLogout();
            }
            setIsLoading(false);
        };

        checkLoginStatus();
    }, []);

    const handleClose = () => {
        setError('');
        onClose();
    };

    const handleRegisterClose = () => {
        setRegisterError('');
        setRegisterPassword('');
        onRegisterClose();
    };

    const startAuthentication = async () => {
        try {
            setIsAuthenticating(true);
            setError('');

            const response = await fetch(getURL('/webauthn/authenticate/start'), {
                method: 'POST',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Failed to start authentication');
            }

            const data = await response.json();

            const options = { ...data.options };

            if (options.challenge) {
                options.challenge = base64UrlToUint8Array(options.challenge);
            }

            if (options.allowCredentials) {
                options.allowCredentials = options.allowCredentials.map((cred: any) => ({
                    ...cred,
                    id: base64UrlToUint8Array(cred.id)
                }));
            }


            const credential = await navigator.credentials.get({
                publicKey: options
            }) as PublicKeyCredential;

            const assertionResponse = credential.response as AuthenticatorAssertionResponse;

            const completeResponse = await fetch(getURL('/webauthn/authenticate/complete'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    challenge_id: data.challenge_id,
                    credential: {
                        id: credential.id,
                        rawId: arrayBufferToBase64(credential.rawId),
                        type: credential.type,
                        response: {
                            authenticatorData: arrayBufferToBase64(assertionResponse.authenticatorData),
                            clientDataJSON: arrayBufferToBase64(assertionResponse.clientDataJSON),
                            signature: arrayBufferToBase64(assertionResponse.signature),
                            userHandle: assertionResponse.userHandle ? arrayBufferToBase64(assertionResponse.userHandle) : null
                        }
                    }
                })
            });

            if (completeResponse.ok) {
                onLogin();
                handleClose();
            } else {
                setError('Unauthorized');
            }

        } catch (error) {
            console.error('Authentication error:', error);
            setError('Unauthorized');
        } finally {
            setIsAuthenticating(false);
        }
    };

    const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    };

    const startRegistration = async () => {
        if (!registerPassword.trim()) {
            setRegisterError('Password is required');
            return;
        }

        try {
            setIsRegistering(true);
            setRegisterError('');

            const response = await fetch(getURL('/webauthn/register/start'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    password: registerPassword
                })
            });

            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error('Invalid registration password');
                }
                throw new Error('Failed to start registration');
            }

            const data = await response.json();
            const options = { ...data.options };

            if (options.challenge) {
                options.challenge = base64UrlToUint8Array(options.challenge);
            }

            if (options.user?.id) {
                options.user.id = base64UrlToUint8Array(options.user.id);
            }

            if (options.excludeCredentials) {
                options.excludeCredentials = options.excludeCredentials.map((cred: any) => ({
                    ...cred,
                    id: base64UrlToUint8Array(cred.id)
                }));
            }

            const credential = await navigator.credentials.create({
                publicKey: options
            }) as PublicKeyCredential;

            const attestationResponse = credential.response as AuthenticatorAttestationResponse;

            const completeResponse = await fetch(getURL('/webauthn/register/complete'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    challenge_id: data.challenge_id,
                    credential: {
                        id: credential.id,
                        rawId: arrayBufferToBase64(credential.rawId),
                        type: credential.type,
                        response: {
                            attestationObject: arrayBufferToBase64(attestationResponse.attestationObject),
                            clientDataJSON: arrayBufferToBase64(attestationResponse.clientDataJSON)
                        }
                    }
                })
            });

            if (completeResponse.ok) {
                handleRegisterClose();
                setError('');
                onSuccessOpen();
            } else {
                setRegisterError('Registration failed');
            }

        } catch (error: any) {
            console.error('Registration error:', error);
            if (error.message.includes('Invalid registration password')) {
                setRegisterError('Invalid registration password');
            } else {
                setRegisterError('Registration failed: ' + (error.message || 'Unknown error'));
            }
        } finally {
            setIsRegistering(false);
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
                _hover={{ color: 'yellow', transform: 'scale(1.01)' }}
                _active={{ transform: 'scale(0.99)' }}
                minWidth="70px"
                height="40px"
                bg={isRetro ? "black" : "transparent"}
                border={isRetro ? "2px solid" : "none"}
                borderColor="purple.400"
                rounded={isRetro ? "none" : "full"}
                color={isRetro ? "purple.200" : undefined}
                fontFamily={isRetro ? "'Press Start 2P', monospace" : "inherit"}
            >
                {isLoading ? <Spinner size="sm" /> : 'Login'}
            </Button>

            <Modal isOpen={isOpen} onClose={handleClose} isCentered size="lg">
                <ModalOverlay bg="rgba(0, 0, 0, 0.9)" />
                <ModalContent
                    bg={isRetro ? "black" : "rgba(0, 0, 0, 0.7)"}
                    border={isRetro ? "2px solid" : "none"}
                    borderColor="purple.400"
                    borderRadius={isRetro ? "none" : "12px"}
                    color={isRetro ? "purple.200" : "white"}
                    style={slideInStyle}
                    boxShadow="0 20px 40px rgba(0, 0, 0, 0.5)"
                    position="relative"
                    overflow="hidden"
                    _before={{
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        bg: isRetro ? 'purple.400' : 'rgba(255, 215, 0, 0.6)',
                        style: glowStyle
                    }}
                >
                    <ModalBody p={8}>
                        <VStack spacing={6} align="center">
                            <Box
                                style={pulseStyle}
                                p={4}
                                borderRadius="full"
                                bg={isRetro ? "rgba(147, 51, 234, 0.2)" : "rgba(255, 215, 0, 0.05)"}
                                border={isRetro ? "2px solid" : "1px solid"}
                                borderColor={isRetro ? "purple.400" : "rgba(255, 215, 0, 0.4)"}
                            >
                                <Icon
                                    as={LockIcon}
                                    w={8}
                                    h={8}
                                    color={isRetro ? "purple.400" : "rgba(255, 215, 0, 0.8)"}
                                />
                            </Box>

                            <Text
                                fontSize="xl"
                                fontWeight="bold"
                                textAlign="center"
                                fontFamily={isRetro ? "'Press Start 2P', monospace" : "inherit"}
                                color={isRetro ? "purple.400" : "rgba(255, 215, 0, 0.9)"}
                            >
                                Welcome Back
                            </Text>

                            <HStack spacing={3} width="full">
                                <Button
                                    onClick={startAuthentication}
                                    isLoading={isAuthenticating}
                                    loadingText={isRetro ? "Authenticating..." : "Verifying..."}
                                    size="lg"
                                    flex="1"
                                    bg={isRetro ? "black" : "rgba(255, 215, 0, 0.05)"}
                                    border={isRetro ? "2px solid" : "1px solid"}
                                    borderColor={isRetro ? "purple.400" : "rgba(255, 215, 0, 0.3)"}
                                    color={isRetro ? "purple.200" : "rgba(255, 215, 0, 0.8)"}
                                    fontFamily={isRetro ? "'Press Start 2P', monospace" : "inherit"}
                                    fontSize={isRetro ? "sm" : "md"}
                                    _hover={{
                                        bg: isRetro ? "rgba(147, 51, 234, 0.2)" : "rgba(255, 215, 0, 0.1)",
                                        transform: 'translateY(-2px)',
                                        boxShadow: isRetro ? '0 0 10px rgba(147, 51, 234, 0.5)' : '0 0 8px rgba(255, 215, 0, 0.3)'
                                    }}
                                    _active={{
                                        transform: 'translateY(0)',
                                        boxShadow: isRetro ? '0 0 5px rgba(147, 51, 234, 0.3)' : '0 0 4px rgba(255, 215, 0, 0.2)'
                                    }}
                                    transition="all 0.2s ease"
                                    rounded={isRetro ? "none" : "8px"}
                                    py={3}
                                >
                                    {isRetro ? "AUTHENTICATE" : "Authenticate"}
                                </Button>

                                <IconButton
                                    onClick={onRegisterOpen}
                                    aria-label="Register new credential"
                                    icon={<AddIcon />}
                                    size="lg"
                                    bg={isRetro ? "black" : "rgba(0, 255, 0, 0.05)"}
                                    border={isRetro ? "2px solid" : "1px solid"}
                                    borderColor={isRetro ? "green.400" : "rgba(0, 255, 0, 0.3)"}
                                    color={isRetro ? "green.200" : "rgba(0, 255, 0, 0.8)"}
                                    _hover={{
                                        bg: isRetro ? "rgba(0, 255, 0, 0.2)" : "rgba(0, 255, 0, 0.1)",
                                        transform: 'translateY(-2px)',
                                        boxShadow: isRetro ? '0 0 10px rgba(0, 255, 0, 0.5)' : '0 0 8px rgba(0, 255, 0, 0.3)'
                                    }}
                                    _active={{
                                        transform: 'translateY(0)',
                                        boxShadow: isRetro ? '0 0 5px rgba(0, 255, 0, 0.3)' : '0 0 4px rgba(0, 255, 0, 0.2)'
                                    }}
                                    transition="all 0.2s ease"
                                    rounded={isRetro ? "none" : "8px"}
                                />
                            </HStack>

                            {error && (
                                <Alert
                                    status="error"
                                    borderRadius={isRetro ? "none" : "8px"}
                                    bg={isRetro ? "rgba(255, 0, 0, 0.2)" : "rgba(255, 0, 0, 0.1)"}
                                    border={isRetro ? "1px solid" : "none"}
                                    borderColor="red.400"
                                >
                                    <AlertIcon />
                                    <Text fontSize="sm" fontFamily={isRetro ? "'Press Start 2P', monospace" : "inherit"}>
                                        {error}
                                    </Text>
                                </Alert>
                            )}
                        </VStack>
                    </ModalBody>
                </ModalContent>
            </Modal>

            {/* Registration Modal */}
            <Modal isOpen={isRegisterOpen} onClose={handleRegisterClose} isCentered size="md">
                <ModalOverlay bg="rgba(0, 0, 0, 0.9)" />
                <ModalContent
                    bg={isRetro ? "black" : "rgba(0, 0, 0, 0.7)"}
                    border={isRetro ? "2px solid" : "none"}
                    borderColor="green.400"
                    borderRadius={isRetro ? "none" : "12px"}
                    color={isRetro ? "green.200" : "white"}
                    style={slideInStyle}
                    boxShadow="0 20px 40px rgba(0, 0, 0, 0.5)"
                    position="relative"
                    overflow="hidden"
                    _before={{
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        bg: isRetro ? 'green.400' : 'rgba(0, 255, 0, 0.6)',
                        style: glowStyle
                    }}
                >
                    <ModalBody p={8}>
                        <VStack spacing={6} align="center">
                            <Box
                                style={pulseStyle}
                                p={4}
                                borderRadius="full"
                                bg={isRetro ? "rgba(0, 255, 0, 0.2)" : "rgba(0, 255, 0, 0.05)"}
                                border={isRetro ? "2px solid" : "1px solid"}
                                borderColor={isRetro ? "green.400" : "rgba(0, 255, 0, 0.4)"}
                            >
                                <Icon
                                    as={AddIcon}
                                    w={8}
                                    h={8}
                                    color={isRetro ? "green.400" : "rgba(0, 255, 0, 0.8)"}
                                />
                            </Box>

                            <Text
                                fontSize="xl"
                                fontWeight="bold"
                                textAlign="center"
                                fontFamily={isRetro ? "'Press Start 2P', monospace" : "inherit"}
                                color={isRetro ? "green.400" : "rgba(0, 255, 0, 0.9)"}
                            >
                                {isRetro ? "REGISTER NEW KEY" : "Register New Key"}
                            </Text>

                            <FormControl>
                                <FormLabel
                                    fontFamily={isRetro ? "'Press Start 2P', monospace" : "inherit"}
                                    fontSize={isRetro ? "xs" : "sm"}
                                    color={isRetro ? "green.200" : "rgba(0, 255, 0, 0.7)"}
                                >
                                    {isRetro ? "PASSWORD" : "Registration Password"}
                                </FormLabel>
                                <Input
                                    type="password"
                                    value={registerPassword}
                                    onChange={(e) => setRegisterPassword(e.target.value)}
                                    placeholder={isRetro ? "ENTER PASSWORD" : "Enter password"}
                                    bg={isRetro ? "black" : "rgba(0, 0, 0, 0.3)"}
                                    border={isRetro ? "2px solid" : "1px solid"}
                                    borderColor={isRetro ? "green.400" : "rgba(0, 255, 0, 0.3)"}
                                    color={isRetro ? "green.200" : "rgba(0, 255, 0, 0.8)"}
                                    fontFamily={isRetro ? "'Press Start 2P', monospace" : "inherit"}
                                    fontSize={isRetro ? "xs" : "sm"}
                                    _placeholder={{
                                        color: isRetro ? "green.600" : "rgba(0, 255, 0, 0.4)"
                                    }}
                                    _focus={{
                                        borderColor: isRetro ? "green.400" : "rgba(0, 255, 0, 0.6)",
                                        boxShadow: isRetro ? '0 0 5px rgba(0, 255, 0, 0.5)' : '0 0 3px rgba(0, 255, 0, 0.3)'
                                    }}
                                    rounded={isRetro ? "none" : "6px"}
                                    onKeyPress={(e) => e.key === 'Enter' && startRegistration()}
                                />
                            </FormControl>

                            <Button
                                onClick={startRegistration}
                                isLoading={isRegistering}
                                loadingText={isRetro ? "Registering..." : "Registering..."}
                                size="lg"
                                width="full"
                                bg={isRetro ? "black" : "rgba(0, 255, 0, 0.05)"}
                                border={isRetro ? "2px solid" : "1px solid"}
                                borderColor={isRetro ? "green.400" : "rgba(0, 255, 0, 0.3)"}
                                color={isRetro ? "green.200" : "rgba(0, 255, 0, 0.8)"}
                                fontFamily={isRetro ? "'Press Start 2P', monospace" : "inherit"}
                                fontSize={isRetro ? "sm" : "md"}
                                _hover={{
                                    bg: isRetro ? "rgba(0, 255, 0, 0.2)" : "rgba(0, 255, 0, 0.1)",
                                    transform: 'translateY(-2px)',
                                    boxShadow: isRetro ? '0 0 10px rgba(0, 255, 0, 0.5)' : '0 0 8px rgba(0, 255, 0, 0.3)'
                                }}
                                _active={{
                                    transform: 'translateY(0)',
                                    boxShadow: isRetro ? '0 0 5px rgba(0, 255, 0, 0.3)' : '0 0 4px rgba(0, 255, 0, 0.2)'
                                }}
                                transition="all 0.2s ease"
                                rounded={isRetro ? "none" : "8px"}
                                py={3}
                            >
                                {isRetro ? "REGISTER" : "Register"}
                            </Button>

                            {registerError && (
                                <Alert
                                    status="error"
                                    borderRadius={isRetro ? "none" : "8px"}
                                    bg={isRetro ? "rgba(255, 0, 0, 0.2)" : "rgba(255, 0, 0, 0.1)"}
                                    border={isRetro ? "1px solid" : "none"}
                                    borderColor="red.400"
                                >
                                    <AlertIcon />
                                    <Text fontSize="sm" fontFamily={isRetro ? "'Press Start 2P', monospace" : "inherit"}>
                                        {registerError}
                                    </Text>
                                </Alert>
                            )}
                        </VStack>
                    </ModalBody>
                </ModalContent>
            </Modal>

            {/* Success Modal */}
            <Modal isOpen={isSuccessOpen} onClose={onSuccessClose} isCentered size="md">
                <ModalOverlay bg="rgba(0, 0, 0, 0.9)" />
                <ModalContent
                    bg={isRetro ? "black" : "rgba(0, 0, 0, 0.7)"}
                    border={isRetro ? "2px solid" : "none"}
                    borderColor="green.400"
                    borderRadius={isRetro ? "none" : "12px"}
                    color={isRetro ? "green.200" : "white"}
                    style={slideInStyle}
                    boxShadow="0 20px 40px rgba(0, 0, 0, 0.5)"
                    position="relative"
                    overflow="hidden"
                    _before={{
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: '4px',
                        bg: isRetro ? 'green.400' : 'rgba(0, 255, 0, 0.6)',
                        style: glowStyle
                    }}
                >
                    <ModalBody p={8}>
                        <VStack spacing={6} align="center">
                            <Box
                                p={4}
                                borderRadius="full"
                                bg={isRetro ? "rgba(0, 255, 0, 0.2)" : "rgba(0, 255, 0, 0.05)"}
                                border={isRetro ? "2px solid" : "1px solid"}
                                borderColor={isRetro ? "green.400" : "rgba(0, 255, 0, 0.4)"}
                                style={{
                                    animation: 'success 0.6s ease-out'
                                }}
                            >
                                <Text
                                    fontSize="3xl"
                                    color={isRetro ? "green.400" : "rgba(0, 255, 0, 0.8)"}
                                    textAlign="center"
                                >
                                    ✓
                                </Text>
                            </Box>

                            <Text
                                fontSize="xl"
                                fontWeight="bold"
                                textAlign="center"
                                fontFamily={isRetro ? "'Press Start 2P', monospace" : "inherit"}
                                color={isRetro ? "green.400" : "rgba(0, 255, 0, 0.9)"}
                            >
                                {isRetro ? "SUCCESS!" : "Registration Successful!"}
                            </Text>

                            <Text
                                fontSize={isRetro ? "xs" : "sm"}
                                textAlign="center"
                                fontFamily={isRetro ? "'Press Start 2P', monospace" : "inherit"}
                                color={isRetro ? "green.200" : "rgba(0, 255, 0, 0.7)"}
                                lineHeight="1.6"
                            >
                                {isRetro
                                    ? "WebAuthn credential registered successfully! You can now use it to login."
                                    : "Your WebAuthn credential has been registered successfully! You can now use it to login."
                                }
                            </Text>

                            <Button
                                onClick={onSuccessClose}
                                size="lg"
                                width="full"
                                bg={isRetro ? "black" : "rgba(0, 255, 0, 0.05)"}
                                border={isRetro ? "2px solid" : "1px solid"}
                                borderColor={isRetro ? "green.400" : "rgba(0, 255, 0, 0.3)"}
                                color={isRetro ? "green.200" : "rgba(0, 255, 0, 0.8)"}
                                fontFamily={isRetro ? "'Press Start 2P', monospace" : "inherit"}
                                fontSize={isRetro ? "sm" : "md"}
                                _hover={{
                                    bg: isRetro ? "rgba(0, 255, 0, 0.2)" : "rgba(0, 255, 0, 0.1)",
                                    transform: 'translateY(-2px)',
                                    boxShadow: isRetro ? '0 0 10px rgba(0, 255, 0, 0.5)' : '0 0 8px rgba(0, 255, 0, 0.3)'
                                }}
                                _active={{
                                    transform: 'translateY(0)',
                                    boxShadow: isRetro ? '0 0 5px rgba(0, 255, 0, 0.3)' : '0 0 4px rgba(0, 255, 0, 0.2)'
                                }}
                                transition="all 0.2s ease"
                                rounded={isRetro ? "none" : "8px"}
                                py={3}
                            >
                                {isRetro ? "OK" : "Got it!"}
                            </Button>
                        </VStack>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    );
};

export default Login;