"use client";
import { useLayoutEffect } from "react";
import gsap from "gsap";

export function useGsap(callback: () => void, deps: any[] = []) {
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      callback();
    });
    return () => ctx.revert();
  }, deps);
}
