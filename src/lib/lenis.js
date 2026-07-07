import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export const initLenis = () => {
  const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: "vertical",
    gestureOrientation: "vertical",
    smoothWheel: true,
    wheelMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
  });

  lenis.on("scroll", ScrollTrigger.update);

  const tickerFn = (time) => {
    lenis.raf(time * 1000);
  };

  gsap.ticker.add(tickerFn);
  gsap.ticker.lagSmoothing(0);

  lenis.cleanup = () => {
    gsap.ticker.remove(tickerFn);
    lenis.destroy();
  };

  return lenis;
};
