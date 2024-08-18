// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file.

// maintain allman bracket style for consistency

// emotion
import { keyframes } from '@emotion/react';

const textFadeIn = keyframes`
  0% { color: grey; }
  100% { color: white; }
`;

const backgroundTransition = keyframes`
  0% { background-color: white; }
  100% { background-color: black; }
`;

export { textFadeIn, backgroundTransition };