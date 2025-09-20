// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file.

// maintain allman bracket style for consistency

// react
import { useEffect, useRef } from 'react';

const BlogBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const setCanvasSize = () => {
            const dpr = window.devicePixelRatio || 1;
            const parentElement = canvas.parentElement;
            if (!parentElement) return;

            const width = parentElement.clientWidth;
            const height = parentElement.clientHeight;

            canvas.width = width * dpr;
            canvas.height = height * dpr;

            ctx.scale(dpr, dpr);

            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;
        };

        setCanvasSize();
        window.addEventListener('resize', setCanvasSize);

        // Update canvas size when content changes
        const resizeObserver = new ResizeObserver(() => {
            setCanvasSize();
        });
        resizeObserver.observe(document.body);

        let animationTime = 0;

        const animate = () => {
            animationTime += 0.01;

            const parentElement = canvas.parentElement;
            if (!parentElement) {
                requestAnimationFrame(animate);
                return;
            }

            const width = parentElement.clientWidth;
            const height = parentElement.clientHeight;

            const baseDotSpacing = 35;
            const time = animationTime;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let x = 0; x < width; x += baseDotSpacing) {
                for (let y = 0; y < height; y += baseDotSpacing) {
                    // Multi-layered wave patterns
                    const primaryWave = Math.sin(time + x * 0.008 + y * 0.006) * 0.4;
                    const secondaryWave = Math.cos(time * 0.7 + x * 0.004 + y * 0.003) * 0.3;
                    const rippleEffect = Math.sin(time * 1.5 + Math.sqrt(x * x + y * y) * 0.01) * 0.2;

                    // Combine wave effects
                    const combinedWave = primaryWave + secondaryWave * 0.5 + rippleEffect * 0.3;

                    // Floating motion
                    const floatX = Math.sin(time * 0.5 + x * 0.002) * 2;
                    const floatY = Math.cos(time * 0.3 + y * 0.003) * 1.5;

                    // Dynamic properties
                    const opacity = 0.4 + combinedWave * 0.4 + Math.sin(time + x * 0.01) * 0.2;
                    const size = 1 + combinedWave * 0.8 + Math.cos(time * 1.2 + y * 0.01) * 0.4;
                    const finalX = x + combinedWave * 3 + floatX;
                    const finalY = y + combinedWave * 2.5 + floatY;

                    // Pulsing brightness
                    const brightness = 128 + Math.sin(time * 2 + x * 0.02 + y * 0.015) * 30;

                    // Gradient effect based on position
                    const distanceFromCenter = Math.sqrt(Math.pow(x - width/2, 2) + Math.pow(y - height/2, 2));
                    const gradientFactor = 1 - Math.min(distanceFromCenter / Math.max(width, height), 0.5);

                    ctx.fillStyle = `rgba(${Math.floor(brightness)},${Math.floor(brightness)},${Math.floor(brightness)},${Math.max(0.1, Math.min(0.8, opacity * gradientFactor))})`;
                    ctx.beginPath();
                    ctx.arc(finalX, finalY, Math.max(0.3, size), 0, 6.283185307179586);
                    ctx.fill();
                }
            }

            requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', setCanvasSize);
            resizeObserver.disconnect();
        };
    }, []);

    return (
        <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', pointerEvents: 'none' }} />
    );
};

export default BlogBackground;