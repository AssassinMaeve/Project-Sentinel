"use client";

import React, { useEffect } from 'react';

// --- TypeScript Augmentation ---
declare global {
    interface Window {
        anime: {
            (params: any): any;
            stagger: (value: number | string | readonly (number | string)[], options?: any) => (el: HTMLElement, i: number, t: number) => number;
        };
    }
}

// --- Helper Function ---
const loadScript = (src: string, id: string, callback?: () => void) => {
    if (document.getElementById(id)) {
        if (callback) callback();
        return;
    }
    const script = document.createElement('script');
    script.id = id;
    script.src = src;
    script.onload = () => {
        if (callback) callback();
    };
    document.head.appendChild(script);
};

export const AnimatedBackground = () => {
    // This effect loads anime.js and runs the animation once the component is mounted.
    useEffect(() => {
        loadScript("https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js", "anime-js-cdn", () => {
            if (typeof window.anime === 'function') {
                window.anime({
                    targets: '.bg-square',
                    backgroundColor: ['#1e1b4b', '#4c1d95', '#a78bfa'],
                    scale: [
                        { value: 0, easing: 'easeOutSine', duration: 500 },
                        { value: 1, easing: 'easeInOutQuad', duration: 1200 }
                    ],
                    translateY: window.anime.stagger(10, {grid: [10, 10], from: 'center', axis: 'y'}),
                    translateX: window.anime.stagger(10, {grid: [10, 10], from: 'center', axis: 'x'}),
                    delay: window.anime.stagger(100, { grid: [10, 10], from: 'center' }),
                    loop: true,
                    direction: 'alternate',
                    easing: 'easeInOutSine'
                });
            }
        });
    }, []); // Empty dependency array ensures this runs only once.

    const squares = Array.from(Array(100).keys());
    return (
        <div className="absolute top-0 left-0 w-full h-full grid grid-cols-10 grid-rows-10 overflow-hidden -z-10">
            {squares.map(i => <div key={i} className="bg-square border border-purple-900/10"></div>)}
        </div>
    );
};