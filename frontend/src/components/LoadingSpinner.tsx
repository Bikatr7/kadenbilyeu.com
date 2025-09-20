// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file.

// maintain allman bracket style for consistency

// react
import { Flex, Text, Spinner } from "@chakra-ui/react";

// contexts
import { useTheme } from '../contexts/ThemeContext';

interface LoadingSpinnerProps {
    message?: string;
    size?: "xs" | "sm" | "md" | "lg" | "xl";
    height?: string;
    showMessage?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    message,
    size = "xl",
    height = "60vh",
    showMessage = true
}) => {
    const { isRetro } = useTheme();

    return (
        <Flex
            justifyContent="center"
            alignItems="center"
            height={height}
            flexDirection="column"
            gap={4}
        >
            <Spinner
                size={size}
                color={isRetro ? "purple.400" : "yellow"}
                thickness="4px"
            />
            {showMessage && (
                <Text
                    color={isRetro ? "purple.400" : "yellow"}
                    fontSize="lg"
                    fontFamily={isRetro ? "'Press Start 2P', monospace" : "inherit"}
                    textAlign="center"
                    maxWidth="400px"
                >
                    {message || "Just a sec, homelab wifi is slow"}
                </Text>
            )}
        </Flex>
    );
};

export default LoadingSpinner;