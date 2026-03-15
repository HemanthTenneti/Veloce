/**
 * Module-level Lenis instance store so any component can scroll programmatically.
 * Set by SmoothScrollProvider on mount, cleared on unmount.
 */
let lenisInstance: import("lenis").default | null = null;

export function setLenis(lenis: import("lenis").default | null) {
  lenisInstance = lenis;
}

export function getLenis() {
  return lenisInstance;
}
