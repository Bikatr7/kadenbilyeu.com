// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file

// chakra-ui imports
import { Box, Flex, Text } from '@chakra-ui/react';

// react imports
import React from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/opacity.css';

// icons
import { IconCode } from '@tabler/icons-react';

interface SkillProps {
    name: string;
    image?: string | React.ReactNode;
}

const Skill: React.FC<SkillProps> = ({ name, image }) => {
    const imageSize = "30px";

    return (
        <Flex
            direction="row"
            align="center"
            bg="gray.800"
            color="white"
            p={4}
            borderRadius="full"
            boxShadow="lg"
            m={2}
            maxWidth="200px"
            width="100%"
            _hover={{ bg: "gray.700", transform: 'scale(1.05)' }}
        >
            <Box
                width={imageSize}
                height={imageSize}
                mr={3}
                display="flex"
                alignItems="center"
                justifyContent="center"
                overflow="hidden"
            >
                {image ? (
                    typeof image === 'string' ? (
                        <LazyLoadImage
                            src={image}
                            alt={`${name} logo`}
                            effect="opacity"
                            loading="eager"
                            width={imageSize}
                            height={imageSize}
                            style={{
                                objectFit: 'contain',
                            }}
                        />
                    ) : (
                        <Box width={imageSize} height={imageSize} display="flex" alignItems="center" justifyContent="center">
                            {React.cloneElement(image as React.ReactElement, { size: imageSize })}
                        </Box>
                    )
                ) : (
                    <IconCode size={imageSize} stroke={1.5} />
                )}
            </Box>
            <Text fontSize="md" fontWeight="bold" textAlign="left" flex={1}>
                {name}
            </Text>
        </Flex>
    );
};

export default Skill;