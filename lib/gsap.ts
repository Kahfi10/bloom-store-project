/**
 * Central GSAP setup.
 * Import gsap + plugins from THIS file to guarantee single registration.
 * Guard with typeof window — Next.js SSR must not touch DOM APIs.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText }    from 'gsap/SplitText';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, SplitText);
}

export { gsap, ScrollTrigger, SplitText };
export default gsap;
