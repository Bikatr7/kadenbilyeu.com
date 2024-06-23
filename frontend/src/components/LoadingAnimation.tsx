// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by a GNU General Public License v3.0
// license that can be found in the LICENSE file

import { Box, Text, keyframes } from '@chakra-ui/react';

const textFadeIn = keyframes`
  0% { color: black; }
  100% { color: white; }
`;

const LoadingAnimation: React.FC = () => {
  return (
    <Box 
      position="absolute" 
      top="50%" 
      left="50%" 
      transform="translate(-50%, -50%)" 
      textAlign="center"
      bg="black"
      width="100vw"
      height="100vh"
    >
      <Text 
        fontSize="4xl" 
        animation={`${textFadeIn} 2s linear forwards`}
      >
        Kaden Bilyeu
      </Text>
    </Box>
  );
};

export default LoadingAnimation;