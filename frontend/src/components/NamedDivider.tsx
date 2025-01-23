// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file.

// maintain allman bracket style for consistency

// chakra-ui
import { AbsoluteCenter, Box, Text, Divider } from "@chakra-ui/react";
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import { useTheme } from '../contexts/ThemeContext';
import { keyframes } from '@emotion/react';

// Update animations
const pulseKeyframes = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.4; }
  100% { opacity: 1; }
`;

const leftArrow1 = keyframes`
  0%, 100% { opacity: 0.3; }
  10%, 20% { opacity: 0.8; }
`;

const leftArrow2 = keyframes`
  0%, 100% { opacity: 0.3; }
  20%, 30% { opacity: 0.8; }
`;

const leftArrow3 = keyframes`
  0%, 100% { opacity: 0.3; }
  30%, 40% { opacity: 0.8; }
`;

const rightArrow1 = keyframes`
  0%, 100% { opacity: 0.3; }
  60%, 70% { opacity: 0.8; }
`;

const rightArrow2 = keyframes`
  0%, 100% { opacity: 0.3; }
  70%, 80% { opacity: 0.8; }
`;

const rightArrow3 = keyframes`
  0%, 100% { opacity: 0.3; }
  80%, 90% { opacity: 0.8; }
`;

const hoverGlitch = keyframes`
  0% { 
    transform: translate(0);
    text-shadow: 0 0 0 transparent;
  }
  25% { 
    transform: translate(-1px, 1px);
    text-shadow: -3px 2px purple, 3px -2px #ff00ea;
  }
  50% { 
    transform: translate(1px, -1px);
    text-shadow: 3px -2px #ff00ea, -3px 2px #9f00ff;
  }
  75% { 
    transform: translate(-1px, -1px);
    text-shadow: -3px -2px purple, 3px 2px #ff00ea;
  }
  100% { 
    transform: translate(0);
    text-shadow: 0 0 0 transparent;
  }
`;

interface NamedDividerProps 
{
  name?: string;
  id: string;
  isExpandable?: boolean;
  isExpanded?: boolean;
  onToggle?: () => void;
}

function NamedDivider({ name, id, isExpandable = false, isExpanded = false, onToggle }: NamedDividerProps) 
{
  const { isRetro } = useTheme();

  return (
    <Box 
      id={id} 
      position="relative" 
      py={6}
      cursor={isExpandable && !isRetro ? "pointer" : "default"} 
      onClick={isExpandable && !isRetro ? onToggle : undefined}
    >
      {isRetro ? (
        <Box 
          width="fit-content"
          mx="auto"
          _hover={{
            '& .divider-content': {
              animation: `${hoverGlitch} 0.3s infinite linear`
            }
          }}
        >
          <Box 
            display="flex"
            alignItems="center"
            justifyContent="center"
            gap={1}
            className="divider-content"
          >
            <Box display="flex" gap={1}>
              <Text
                color="purple.400"
                fontSize="lg"
                animation={`${leftArrow1} 3s infinite ease-in-out`}
              >
                {'<'}
              </Text>
              <Text
                color="purple.400"
                fontSize="lg"
                animation={`${leftArrow2} 3s infinite ease-in-out`}
              >
                {'<'}
              </Text>
              <Text
                color="purple.400"
                fontSize="lg"
                animation={`${leftArrow3} 3s infinite ease-in-out`}
              >
                {'<'}
              </Text>
            </Box>
            {name && (
              <Text
                display="inline-block"
                px={4}
                fontSize="xs"
                color="purple.400"
                fontFamily="'Press Start 2P', monospace"
                bg="black"
                animation={`${pulseKeyframes} 2s infinite ease-in-out`}
                letterSpacing="2px"
              >
                [{name}]
              </Text>
            )}
            <Box display="flex" gap={1}>
              <Text
                color="purple.400"
                fontSize="lg"
                animation={`${rightArrow1} 3s infinite ease-in-out`}
              >
                {'>'}
              </Text>
              <Text
                color="purple.400"
                fontSize="lg"
                animation={`${rightArrow2} 3s infinite ease-in-out`}
              >
                {'>'}
              </Text>
              <Text
                color="purple.400"
                fontSize="lg"
                animation={`${rightArrow3} 3s infinite ease-in-out`}
              >
                {'>'}
              </Text>
            </Box>
          </Box>
        </Box>
      ) : (
        <Box position="relative">
          <Divider />
          <AbsoluteCenter bg="black" px="4">
            <Text display="flex" alignItems="center">
              {name}
              {isExpandable && (
                isExpanded ? <ChevronUpIcon ml={2} /> : <ChevronDownIcon ml={2} />
              )}
            </Text>
          </AbsoluteCenter>
        </Box>
      )}
    </Box>
  );
}

export default NamedDivider;