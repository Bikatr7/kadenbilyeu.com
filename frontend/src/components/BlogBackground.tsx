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

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const baseDotSpacing = 35;
            const time = animationTime;
            const waveMultiplier = 0.005;
            const waveAmplitude = 0.3;

            // Batch path operations
            ctx.beginPath();

            for (let x = 0; x < width; x += baseDotSpacing) {
                for (let y = 0; y < height; y += baseDotSpacing) {
                    const waveOffset = Math.sin(time + x * waveMultiplier + y * waveMultiplier) * waveAmplitude;
                    const offsetX = x + waveOffset * 1.5;
                    const offsetY = y + waveOffset * 1.5;
                    const radius = 1 + waveOffset * 0.3;

                    // Use arc for each dot but batch the drawing
                    ctx.moveTo(offsetX + Math.max(0.3, radius), offsetY);
                    ctx.arc(offsetX, offsetY, Math.max(0.3, radius), 0, 6.283185307179586);
                }
            }

            // Single fill operation for all dots
            ctx.fillStyle = `rgba(128,128,128,0.5)`;
            ctx.fill();

            // Second pass for variable opacity dots
            for (let x = 0; x < width; x += baseDotSpacing) {
                for (let y = 0; y < height; y += baseDotSpacing) {
                    const waveOffset = Math.sin(time + x * waveMultiplier + y * waveMultiplier) * waveAmplitude;
                    const opacity = 0.5 + waveOffset * 0.3;
                    const offsetX = x + waveOffset * 1.5;
                    const offsetY = y + waveOffset * 1.5;
                    const radius = 1 + waveOffset * 0.3;

                    if (Math.abs(opacity - 0.5) > 0.1) {
                        ctx.fillStyle = `rgba(128,128,128,${Math.max(0.3, opacity)})`;
                        ctx.beginPath();
                        ctx.arc(offsetX, offsetY, Math.max(0.3, radius), 0, 6.283185307179586);
                        ctx.fill();
                    }
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