// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file.

// maintain allman bracket style for consistency

// react
import { useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';

// chakra-ui
import { Box, Button, VStack, Text, Heading, useToast, Divider, FormControl, FormLabel, HStack, Switch } from "@chakra-ui/react";

// components
import EmbedSEO from '../components/EmbedSEO';
import MakePost from '../components/MakePost';

// utils
import { getURL, authenticatedFetch } from '../utils';

// contexts
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useSiteSettings } from '../contexts/SiteSettingsContext';

const AdminPage: React.FC = () => {
    const { isRetro } = useTheme();
    const { isLoggedIn } = useAuth();
    const { settings, isLoading: settingsLoading, updateMinimalMode } = useSiteSettings();
    const navigate = useNavigate();
    const toast = useToast();
    const [isUpdatingMinimalMode, setIsUpdatingMinimalMode] = useState(false);

    // Redirect if not logged in
    if (!isLoggedIn) {
        navigate('/');
        return null;
    }

    const handleForceBackup = async () => {
        try {
            const response = await authenticatedFetch(getURL('/force-backup'),
                {
                    method: 'POST'
                });

            if (response.ok) {
                toast({
                    title: "Backup forced.",
                    description: "The backup has been successfully forced.",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
            }
            else {
                const errorData = await response.json();
                toast({
                    title: "Error forcing backup.",
                    description: errorData.detail,
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        }
        catch (error) {
            toast({
                title: "Error forcing backup.",
                description: "An error occurred while forcing the backup.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const handleFileUpload = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await authenticatedFetch(getURL('/replace-database/'),
                {
                    method: 'POST',
                    body: formData
                });

            if (response.ok) {
                toast({
                    title: "Database replaced.",
                    description: "The database has been successfully replaced.",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
            }
            else {
                const errorData = await response.json();
                toast({
                    title: "Error replacing database.",
                    description: errorData.detail,
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        }
        catch (error) {
            toast({
                title: "Error replacing database.",
                description: "An error occurred while uploading the file.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            handleFileUpload(file);
        }
    };

    const handleNewPost = () => {
        toast({
            title: "New post created.",
            description: "Your new post has been successfully created.",
            status: "success",
            duration: 5000,
            isClosable: true,
        });
    };

    const handleMinimalModeChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const minimalMode = event.target.checked;
        setIsUpdatingMinimalMode(true);

        try {
            await updateMinimalMode(minimalMode);
            toast({
                title: minimalMode ? "Minimal mode enabled." : "Minimal mode disabled.",
                status: "success",
                duration: 3000,
                isClosable: true,
            });
        }
        catch (error) {
            toast({
                title: "Error updating minimal mode.",
                description: "The website mode could not be updated.",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
        finally {
            setIsUpdatingMinimalMode(false);
        }
    };

    return (
        <Box
            bg="transparent"
            color={isRetro ? "purple.400" : "white"}
            minHeight="83vh"
            display="flex"
            flexDirection="column"
            alignItems="center"
            position="relative"
            overflow="hidden"
            className={isRetro ? 'retro-mode' : ''}
            p={6}
        >
            <EmbedSEO
                title={isRetro ? "Bikatr7's Admin Panel" : "Kaden Bilyeu's Admin Panel"}
                description="Admin control panel for managing the website"
            />

            <VStack spacing={8} width="100%" maxW="800px" align="stretch">
                <Heading
                    fontSize={{ base: "2xl", md: "3xl" }}
                    textAlign="center"
                    color={isRetro ? "purple.400" : "yellow"}
                    fontFamily={isRetro ? "'Press Start 2P', monospace" : "inherit"}
                >
                    {isRetro ? "ADMIN PANEL" : "Admin Panel"}
                </Heading>

                {/* Website Settings Section */}
                <Box
                    border="2px solid"
                    borderColor={isRetro ? "purple.400" : "gray.600"}
                    p={6}
                    bg={isRetro ? "black" : "rgba(0, 0, 0, 0.5)"}
                    borderRadius={isRetro ? "none" : "md"}
                >
                    <Heading
                        fontSize={{ base: "xl", md: "2xl" }}
                        mb={4}
                        color={isRetro ? "purple.300" : "yellow"}
                        fontFamily={isRetro ? "'Press Start 2P', monospace" : "inherit"}
                    >
                        {isRetro ? "WEBSITE MODE" : "Website Mode"}
                    </Heading>
                    <FormControl display="flex" alignItems="center" justifyContent="space-between">
                        <FormLabel
                            htmlFor="minimal-mode"
                            mb="0"
                            color={isRetro ? "purple.200" : "white"}
                            fontFamily={isRetro ? "'Press Start 2P', monospace" : "inherit"}
                        >
                            {isRetro ? "MINIMAL MODE" : "Minimal Mode"}
                        </FormLabel>
                        <HStack spacing={3}>
                            <Text
                                color={settings.minimal_mode ? "green.300" : "gray.400"}
                                fontSize={isRetro ? "xs" : "sm"}
                                fontFamily={isRetro ? "'Press Start 2P', monospace" : "inherit"}
                            >
                                {settings.minimal_mode ? "Enabled" : "Disabled"}
                            </Text>
                            <Switch
                                id="minimal-mode"
                                isChecked={settings.minimal_mode}
                                isDisabled={settingsLoading || isUpdatingMinimalMode}
                                onChange={handleMinimalModeChange}
                                colorScheme={isRetro ? "purple" : "yellow"}
                            />
                        </HStack>
                    </FormControl>
                </Box>

                <Divider borderColor={isRetro ? "purple.400" : "gray.600"} />

                {/* Blog Management Section */}
                <Box
                    border="2px solid"
                    borderColor={isRetro ? "purple.400" : "gray.600"}
                    p={6}
                    bg={isRetro ? "black" : "rgba(0, 0, 0, 0.5)"}
                    borderRadius={isRetro ? "none" : "md"}
                >
                    <Heading
                        fontSize={{ base: "xl", md: "2xl" }}
                        mb={4}
                        color={isRetro ? "purple.300" : "yellow"}
                        fontFamily={isRetro ? "'Press Start 2P', monospace" : "inherit"}
                    >
                        {isRetro ? "BLOG MANAGEMENT" : "Blog Management"}
                    </Heading>
                    <VStack spacing={4} align="stretch">
                        <MakePost onPost={handleNewPost} />
                        <Button
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
                            {isRetro ? "MANAGE POSTS" : "Manage Posts"}
                        </Button>
                        <Button
                            onClick={() => navigate('/blog/directory')}
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
                            {isRetro ? "VIEW ALL POSTS" : "View All Posts"}
                        </Button>
                    </VStack>
                </Box>

                <Divider borderColor={isRetro ? "purple.400" : "gray.600"} />

                {/* Database Management Section */}
                <Box
                    border="2px solid"
                    borderColor={isRetro ? "purple.400" : "gray.600"}
                    p={6}
                    bg={isRetro ? "black" : "rgba(0, 0, 0, 0.5)"}
                    borderRadius={isRetro ? "none" : "md"}
                >
                    <Heading
                        fontSize={{ base: "xl", md: "2xl" }}
                        mb={4}
                        color={isRetro ? "purple.300" : "yellow"}
                        fontFamily={isRetro ? "'Press Start 2P', monospace" : "inherit"}
                    >
                        {isRetro ? "DATABASE MANAGEMENT" : "Database Management"}
                    </Heading>
                    <VStack spacing={4} align="stretch">
                        <Button
                            onClick={handleForceBackup}
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
                            {isRetro ? "FORCE BACKUP" : "Force Backup"}
                        </Button>
                        <Button
                            as="label"
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
                            cursor="pointer"
                        >
                            {isRetro ? "UPLOAD DATABASE" : "Upload Database"}
                            <input type="file" accept=".pgp" style={{ display: 'none' }} onChange={handleFileChange} />
                        </Button>
                    </VStack>
                </Box>

                <Divider borderColor={isRetro ? "purple.400" : "gray.600"} />

                {/* Terminal Section */}
                <Box
                    border="2px solid"
                    borderColor={isRetro ? "purple.400" : "gray.600"}
                    p={6}
                    bg={isRetro ? "black" : "rgba(0, 0, 0, 0.5)"}
                    borderRadius={isRetro ? "none" : "md"}
                >
                    <Heading
                        fontSize={{ base: "xl", md: "2xl" }}
                        mb={4}
                        color={isRetro ? "purple.300" : "yellow"}
                        fontFamily={isRetro ? "'Press Start 2P', monospace" : "inherit"}
                    >
                        {isRetro ? "SYSTEM ACCESS" : "System Access"}
                    </Heading>
                    <VStack spacing={4} align="stretch">
                        <Button
                            onClick={() => navigate('/admin/terminal')}
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
                            {isRetro ? "OPEN TERMINAL" : "Open Terminal"}
                        </Button>
                        <Text
                            fontSize="sm"
                            color={isRetro ? "purple.200" : "gray.400"}
                            fontFamily={isRetro ? "'Press Start 2P', monospace" : "inherit"}
                            textAlign="center"
                        >
                            {isRetro ? "SSH ACCESS TO SERVER" : "SSH access to server"}
                        </Text>
                    </VStack>
                </Box>
            </VStack>
        </Box>
    );
};

export default AdminPage;
