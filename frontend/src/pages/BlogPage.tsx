import { useEffect, useRef } from 'react';
import { Box, Text } from "@chakra-ui/react";

function BlogPage() {
    useEffect(() => {
        document.title = 'Kaden Bilyeu | Blog';
    }, []);

    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const setCanvasSize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        setCanvasSize();
        window.addEventListener('resize', setCanvasSize);

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw dots
            const dotSpacing = 35;
            ctx.fillStyle = 'rgba(128, 128, 128, 0.5)';
            for (let x = 0; x < canvas.width; x += dotSpacing) {
                for (let y = 0; y < canvas.height; y += dotSpacing) {
                    ctx.beginPath();
                    ctx.arc(x, y, 1, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', setCanvasSize);
        };
    }, []);

    return (
        <Box bg="black" color="white" minHeight="100vh" position="relative" overflow="hidden">
            <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
            <Box 
                position="absolute" 
                top="50%" 
                left="50%" 
                transform="translate(-50%, -50%)" 
                width="100%" 
                height="70%" 
                border="2px solid yellow"
                display="flex"
                justifyContent="center"
                alignItems="center"
                zIndex="1"
            >
                <Text fontSize="4xl" color="yellow">Coming Soon</Text>
            </Box>
        </Box>
    );
}

export default BlogPage;