// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by a GNU General Public License v3.0
// license that can be found in the LICENSE file

// chakra-ui imports
import {
    AbsoluteCenter,
    Box,
    Divider
} from "@chakra-ui/react";

function NamedDivider({ name, id }: { name: string; id: string }) {
    return (
        <Box id={id} position="relative" padding="10">
            <Divider />
            <AbsoluteCenter bg="black" px="4">
                {name}
            </AbsoluteCenter>
        </Box>
    );
}

export default NamedDivider;