import { gsap } from "gsap";

export const revealItems = (elements) => {
  gsap.from(elements, {
    opacity: 0,
    y: 15,
    stagger: 0.07,
    duration: 0.35,
    ease: "power3.out",
  });
};