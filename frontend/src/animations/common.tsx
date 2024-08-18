// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file.

// maintain allman bracket style for consistency

// emotion
import { keyframes } from '@emotion/react';
import { css } from '@emotion/react';

// Define keyframes for bulge and shake animation for icons
const bulgeShake = keyframes`
  0% { transform: scale(1) translateX(0); }
  20% { transform: scale(1.1) translateX(-2px); }
  40% { transform: scale(1.1) translateX(2px); }
  60% { transform: scale(1.1) translateX(-2px); }
  80% { transform: scale(1.1) translateX(2px); }
  100% { transform: scale(1) translateX(0); }
`;

// CSS for the icon animation
const iconAnimation = css`
  &:hover {
    animation: ${bulgeShake} 0.5s ease-in-out;
  }
`;

// Define keyframes for expand and rotate animation for tags
const expandRotate = keyframes`
  0% { transform: scale(1) rotate(0deg); }
  25% { transform: scale(1.01) rotate(5deg); }
  50% { transform: scale(1.01) rotate(0deg); }
  75% { transform: scale(1.01) rotate(-5deg); }
  100% { transform: scale(1) rotate(0deg); }
`;

// CSS for the tag animation
const tagAnimation = css`
  &:hover {
    animation: ${expandRotate} 0.5s ease-in-out;
  }
`;

// CSS for the image animation
const imageAnimation = css`
  border-radius: 50%;
  transition: transform 0.3s ease-in-out;
  &:hover {
    transform: translateY(-10px);
  }
`;

export { iconAnimation, tagAnimation, imageAnimation };