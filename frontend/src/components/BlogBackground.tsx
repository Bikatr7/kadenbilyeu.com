// Copyright 2024 Kaden Bilyeu (Bikatr7) (https://github.com/Bikatr7) (https://github.com/Bikatr7/kadenbilyeu.com) (https://kadenbilyeu.com)
// Use of this source code is governed by an GNU Affero General Public License v3.0
// license that can be found in the LICENSE file.

// maintain allman bracket style for consistency

// react
import { useEffect, useRef } from 'react';

const BlogBackground: React.FC = () =>
{
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() =>
    {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const setCanvasSize = () =>
        {
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();

            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;

            ctx.scale(dpr, dpr);

            canvas.style.width = `${rect.width}px`;
            canvas.style.height = `${rect.height}px`;
        };

        setCanvasSize();
        window.addEventListener('resize', setCanvasSize);

        const animate = () =>
        {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const baseDotSpacing = 35;
            const dpr = window.devicePixelRatio || 1;
            const adjustedDotSpacing = baseDotSpacing * (dpr > 1 ? 2 : 1);

            ctx.fillStyle = 'rgba(128, 128, 128, 0.5)';

            for (let x = 0; x < canvas.width / dpr; x += adjustedDotSpacing)
            {
                for (let y = 0; y < canvas.height / dpr; y += adjustedDotSpacing)
                {
                    ctx.beginPath();
                    ctx.arc(x, y, 1, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            requestAnimationFrame(animate);
        };

        animate();

        return () =>
        {
            window.removeEventListener('resize', setCanvasSize);
        };
    }, []);

    return (
        <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
    );
};

export default BlogBackground;