// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file.

// maintain allman bracket style for consistency

// chakra-ui
import { AbsoluteCenter, Box, Divider, Text } from "@chakra-ui/react";
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';

interface NamedDividerProps 
{
  name: string;
  id: string;
  isExpandable?: boolean;
  isExpanded?: boolean;
  onToggle?: () => void;
}

function NamedDivider({ name, id, isExpandable = false, isExpanded = false, onToggle }: NamedDividerProps) 
{
  return (
    <Box id={id} position="relative" padding="10" cursor={isExpandable ? "pointer" : "default"} onClick={isExpandable ? onToggle : undefined}>
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
  );
}

export default NamedDivider;