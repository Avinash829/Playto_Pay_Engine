import { useEffect, useRef } from "react";

export default function CustomCursor() {
    const cursorRef = useRef(null);
    const requestRef = useRef(null);

    const mouse = useRef({ x: 0, y: 0 });
    const delayed = useRef({ x: 0, y: 0 });
    const currentRotation = useRef(0);

    const LERP_FACTOR = 0.08;
    const ROTATION_SMOOTH = 0.15;

    useEffect(() => {
        const handleMouseMove = (e) => {
            mouse.current = {
                x: e.clientX,
                y: e.clientY,
            };
        };

        const animate = () => {
            delayed.current.x +=
                (mouse.current.x - delayed.current.x) * LERP_FACTOR;

            delayed.current.y +=
                (mouse.current.y - delayed.current.y) * LERP_FACTOR;

            const dx = mouse.current.x - delayed.current.x;
            const dy = mouse.current.y - delayed.current.y;

            if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
                const targetRotation = Math.atan2(dy, dx) * (180 / Math.PI);

                let deltaRotation = targetRotation - currentRotation.current;

                if (deltaRotation > 180) deltaRotation -= 360;
                if (deltaRotation < -180) deltaRotation += 360;

                currentRotation.current += deltaRotation * ROTATION_SMOOTH;
            }

            if (cursorRef.current) {
                cursorRef.current.style.transform = `
                    translate3d(${delayed.current.x}px, ${delayed.current.y}px, 0)
                    translate(-50%, -50%)
                    rotate(${currentRotation.current}deg)
                `;
            }

            requestRef.current = requestAnimationFrame(animate);
        };

        window.addEventListener("mousemove", handleMouseMove);
        requestRef.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);

            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, []);

    return (
        <div
            ref={cursorRef}
            className="
                pointer-events-none fixed top-0 left-0 z-[9999]
                will-change-transform
                text-black dark:text-white
            "
        >
            <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="
                    drop-shadow-[0_0_8px_rgba(0,0,0,0.25)]
                    dark:drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]
                "
            >
                <path
                    d="M21 12L3 21V14L12 12L3 10V3L21 12Z"
                    fill="currentColor"
                    fillOpacity="0.18"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                />
            </svg>
        </div>
    );
}
