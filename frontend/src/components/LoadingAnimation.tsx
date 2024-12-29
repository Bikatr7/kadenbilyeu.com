// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file.

// maintain allman bracket style for consistency

// react
import { useEffect, useState } from 'react';

// chakra-ui
import { Box, Text } from '@chakra-ui/react';

// animations
import { textFadeIn, backgroundTransition } from '../animations/background';

// utils
import { isBikatr7URL } from '../utils';


const LoadingAnimation: React.FC<{ onLoadingComplete: () => void }> = ({ onLoadingComplete }) => 
{

  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => 
  {
    const today = new Date().toISOString().split('T')[0];
    const lastVisit = localStorage.getItem('lastVisit');

    if (lastVisit !== today) 
    {
      setShowAnimation(true);
      localStorage.setItem('lastVisit', today);
      const timer = setTimeout(() => 
      {
        setShowAnimation(false);
        onLoadingComplete();
      }, 2000);

      return () => clearTimeout(timer);
    } 
    else 
    {
      onLoadingComplete();
    }
  }, [onLoadingComplete]);

  if (!showAnimation) 
  {
    return null;
  }

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
        {isBikatr7URL() ? "Bikatr7" : "Kaden Bilyeu"}
      </Text>
    </Box>
  );
};

export default LoadingAnimation;
