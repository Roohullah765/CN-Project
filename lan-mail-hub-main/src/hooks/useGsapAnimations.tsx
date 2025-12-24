import { useEffect, useRef, RefObject } from 'react';
import gsap from 'gsap';

export const useGsapFadeIn = <T extends HTMLElement>(): RefObject<T> => {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (ref.current) {
      gsap.fromTo(
        ref.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
      );
    }
  }, []);

  return ref;
};

export const useGsapStagger = <T extends HTMLElement>(selector: string): RefObject<T> => {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    if (containerRef.current) {
      const elements = containerRef.current.querySelectorAll(selector);
      gsap.fromTo(
        elements,
        { opacity: 0, y: 20 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.4, 
          stagger: 0.1, 
          ease: 'power2.out',
          delay: 0.2,
        }
      );
    }
  }, [selector]);

  return containerRef;
};

export const useGsapHover = <T extends HTMLElement>(): RefObject<T> => {
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseEnter = () => {
      gsap.to(element, { 
        scale: 1.02, 
        y: -2, 
        duration: 0.3, 
        ease: 'power2.out' 
      });
    };

    const handleMouseLeave = () => {
      gsap.to(element, { 
        scale: 1, 
        y: 0, 
        duration: 0.3, 
        ease: 'power2.out' 
      });
    };

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return ref;
};

export const useGsapPulse = <T extends HTMLElement>(): RefObject<T> => {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (ref.current) {
      gsap.to(ref.current, {
        scale: 1.05,
        duration: 0.6,
        repeat: -1,
        yoyo: true,
        ease: 'power1.inOut',
      });
    }
  }, []);

  return ref;
};

export const animateCounter = (
  element: HTMLElement,
  endValue: number,
  duration: number = 1
) => {
  const obj = { value: 0 };
  gsap.to(obj, {
    value: endValue,
    duration,
    ease: 'power2.out',
    onUpdate: () => {
      element.textContent = Math.round(obj.value).toString();
    },
  });
};
