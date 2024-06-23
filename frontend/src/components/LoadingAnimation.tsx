import { Box, Text, keyframes } from '@chakra-ui/react';

const textFadeIn = keyframes`
  0% { color: grey; }
  100% { color: white; }
`;

const backgroundTransition = keyframes`
  0% { background-color: white; }
  100% { background-color: black; }
`;

const LoadingAnimation: React.FC = () => {
  return (
    <Box 
      position="absolute" 
      top="50%" 
      left="50%" 
      transform="translate(-50%, -50%)" 
      textAlign="center"
      animation={`${backgroundTransition} 0.1s linear forwards, ${textFadeIn} 2s linear 0.1s forwards`}
      width="100vw"
      height="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
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