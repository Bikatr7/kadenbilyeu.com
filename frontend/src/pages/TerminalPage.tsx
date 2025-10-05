// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file.

// maintain allman bracket style for consistency

// react
import { useEffect, useRef, useState } from 'react';

// chakra-ui
import { Box, Spinner, Alert, AlertIcon, Text } from "@chakra-ui/react";

// xterm
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import '@xterm/xterm/css/xterm.css';

// components
import Login from '../components/Login';

// utils
import { getURL } from '../utils';

// contexts
import { useTheme } from '../contexts/ThemeContext';

function TerminalPage() {
    const { isRetro } = useTheme();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const terminalRef = useRef<HTMLDivElement>(null);
    const xtermRef = useRef<Terminal | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const fitAddonRef = useRef<FitAddon | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string>('');
    const [isAuthChecking, setIsAuthChecking] = useState(true);

    useEffect(() => {
        // Check authentication first
        const checkAuth = async () => {
            try {
                const response = await fetch(getURL('/auth/check'), {
                    credentials: 'include'
                });

                const data = await response.json();
                if (response.ok && data.authenticated) {
                    setIsLoggedIn(true);
                } else {
                    setIsLoggedIn(false);
                }
            } catch (err) {
                setIsLoggedIn(false);
            } finally {
                setIsAuthChecking(false);
            }
        };

        checkAuth();
    }, []);

    useEffect(() => {
        if (isAuthChecking || !isLoggedIn || !terminalRef.current) return;

        // Create terminal instance
        const term = new Terminal({
            cursorBlink: true,
            fontSize: 14,
            fontFamily: 'Menlo, Monaco, "Courier New", monospace',
            theme: {
                background: '#000000',
                foreground: '#ffffff',
                cursor: isRetro ? '#9333ea' : '#ffd700',
            },
            rows: 24,
            cols: 80,
        });

        // Add fit addon
        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        term.loadAddon(new WebLinksAddon());

        // Open terminal in DOM
        term.open(terminalRef.current);
        fitAddon.fit();

        // Focus the terminal so user can type immediately
        term.focus();

        xtermRef.current = term;
        fitAddonRef.current = fitAddon;

        // Connect WebSocket
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = getURL('/admin/terminal/ws').replace(/^https?:/, wsProtocol);

        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log('[TERMINAL] WebSocket connected');
            setIsConnected(true);
            setError('');
            term.focus(); // Focus again after connection
        };

        ws.onmessage = (event) => {
            console.log('[TERMINAL] Received from server:', event.data);
            term.write(event.data);
        };

        ws.onerror = (error) => {
            console.error('[TERMINAL] WebSocket error:', error);
            setError('WebSocket connection error');
            setIsConnected(false);
        };

        ws.onclose = () => {
            console.log('[TERMINAL] WebSocket closed');
            setIsConnected(false);
            term.writeln('\r\n\x1b[31mConnection closed\x1b[0m');
        };

        // Send input to WebSocket
        term.onData((data) => {
            console.log('[TERMINAL] User typed:', data, 'WebSocket state:', ws.readyState);
            if (ws.readyState === WebSocket.OPEN) {
                console.log('[TERMINAL] Sending to server');
                ws.send(data);
            } else {
                console.error('[TERMINAL] Cannot send - WebSocket not open');
            }
        });

        // Handle terminal resize
        const handleResize = () => {
            if (fitAddonRef.current && xtermRef.current) {
                fitAddonRef.current.fit();
                const dims = fitAddonRef.current.proposeDimensions();
                if (dims && ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({
                        type: 'resize',
                        rows: dims.rows,
                        cols: dims.cols
                    }));
                }
            }
        };

        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            ws.close();
            term.dispose();
        };
    }, [isAuthChecking, isLoggedIn, isRetro]);

    const handleLogin = () => {
        setIsLoggedIn(true);
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
    };

    if (isAuthChecking) {
        return (
            <Box
                bg="black"
                color="white"
                minHeight="100vh"
                display="flex"
                alignItems="center"
                justifyContent="center"
            >
                <Spinner size="xl" color={isRetro ? 'purple.400' : 'yellow.400'} />
            </Box>
        );
    }

    if (!isLoggedIn) {
        return (
            <Box
                bg="black"
                color="white"
                height="100vh"
                overflow="hidden"
                display="flex"
                alignItems="center"
                justifyContent="center"
                position="fixed"
                top={0}
                left={0}
                right={0}
                bottom={0}
            >
                <Login onLogin={handleLogin} onLogout={handleLogout} isLoggedIn={false} />
            </Box>
        );
    }

    return (
        <Box
            bg="black"
            color="white"
            height="100vh"
            overflow="hidden"
            className={isRetro ? 'retro-mode' : ''}
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
        >
            <Box position="absolute" top="1rem" right="1rem" zIndex={10}>
                <Login onLogin={handleLogin} onLogout={handleLogout} isLoggedIn={isLoggedIn} />
            </Box>

            {error && (
                <Box position="absolute" top="5rem" left="50%" transform="translateX(-50%)" zIndex={10} maxW="md">
                    <Alert
                        status="error"
                        bg={isRetro ? 'rgba(255, 0, 0, 0.2)' : 'rgba(255, 0, 0, 0.1)'}
                        border={isRetro ? '2px solid' : '1px solid'}
                        borderColor="red.400"
                        borderRadius={isRetro ? 'none' : '8px'}
                    >
                        <AlertIcon />
                        <Text fontFamily={isRetro ? "'Press Start 2P', monospace" : "inherit"} fontSize={isRetro ? 'xs' : 'sm'}>
                            {error}
                        </Text>
                    </Alert>
                </Box>
            )}

            <Box
                ref={terminalRef}
                height="100%"
                width="100%"
                p={2}
            />

            {!isConnected && (
                <Box
                    position="absolute"
                    top="50%"
                    left="50%"
                    transform="translate(-50%, -50%)"
                    zIndex={5}
                >
                    <Spinner size="xl" color={isRetro ? 'purple.400' : 'yellow.400'} />
                </Box>
            )}
        </Box>
    );
}

export default TerminalPage;
