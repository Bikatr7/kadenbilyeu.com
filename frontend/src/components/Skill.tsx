// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by a GNU General Public License v3.0
// license that can be found in the LICENSE file

// chakra-ui imports
import { Box, Flex, Text } from '@chakra-ui/react';

interface SkillProps {
    name: string;
    image: string | React.ReactNode;
}

const Skill: React.FC<SkillProps> = ({ name, image }) => {
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
            maxWidth="150px"
            width="100%"
            _hover={{ bg: "gray.700" }}
        >
            <Box mr={3}>
                {typeof image === 'string' ? (
                    <img src={image} alt={`${name} logo`} style={{ width: '30px', height: '30px' }} />
                ) : (
                    <Box style={{ width: '30px', height: '30px' }}>{image}</Box>
                )}
            </Box>
            <Text fontSize="md" fontWeight="bold">
                {name}
            </Text>
        </Flex>
    );
};

export default Skill;
