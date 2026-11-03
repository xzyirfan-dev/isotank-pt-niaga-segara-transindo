import React, { useEffect, useState } from 'react';

export const CursorFollowerLight: React.FC = () => {
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: -500, y: -500 });
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden transition-opacity duration-300"
      style={{ opacity: isVisible ? 1 : 0 }}
    >
      <div
        className="absolute w-[450px] h-[450px] rounded-full transition-transform duration-75 ease-out"
        style={{
          transform: `translate(${position.x - 225}px, ${position.y - 225}px)`,
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, rgba(20, 184, 166, 0.04) 40%, transparent 70%)',
          filter: 'blur(35px)',
        }}
      />
    </div>
  );
};
