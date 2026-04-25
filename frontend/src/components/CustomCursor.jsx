import { useEffect, useRef } from "react";

export default function CustomCursor() {
    const cursorRef = useRef(null);

    // High-precision coordinates for smoothing
    const mouse = useRef({ x: 0, y: 0 }); // Actual mouse position
    const delayed = useRef({ x: 0, y: 0 }); // The smoothed "chasing" position
    const currentRotation = useRef(0); // Current angle in degrees

    // Adjust these to change the "feel"
    const LERP_FACTOR = 0.08; // Lower is slower/smoother (0.01 - 0.1)
    const ROTATION_SMOOTH = 0.15; // Lower makes the "turn" slower

    useEffect(() => {
        const handleMouseMove = (e) => {
            mouse.current = { x: e.clientX, y: e.clientY };
        };

        const animate = () => {
            // 1. Smooth Position (Lerp)
            // Formula: current + (target - current) * factor
            delayed.current.x +=
                (mouse.current.x - delayed.current.x) * LERP_FACTOR;
            delayed.current.y +=
                (mouse.current.y - delayed.current.y) * LERP_FACTOR;

            // 2. Calculate Target Rotation
            const dx = mouse.current.x - delayed.current.x;
            const dy = mouse.current.y - delayed.current.y;

            if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
                const targetRotation = Math.atan2(dy, dx) * (180 / Math.PI);

                // 3. Smooth Rotation (Angle Interpolation)
                let deltaRotation = targetRotation - currentRotation.current;

                // Ensure shortest path rotation (prevents 360-degree spins)
                if (deltaRotation > 180) deltaRotation -= 360;
                if (deltaRotation < -180) deltaRotation += 360;

                currentRotation.current += deltaRotation * ROTATION_SMOOTH;
            }

            // 4. Apply to DOM directly (Better performance than React State)
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
            cancelAnimationFrame(requestRef.current);
        };
    }, []);

    const requestRef = useRef();

    return (
        <div
            ref={cursorRef}
            className="pointer-events-none fixed top-0 left-0 z-[9999] will-change-transform"
        >
            <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-[0_0_12px_rgba(59,130,246,0.8)]"
            >
                <path
                    d="M21 12L3 21V14L12 12L3 10V3L21 12Z"
                    fill="rgba(59, 130, 246, 0.2)"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                />
            </svg>
        </div>
    );
}
