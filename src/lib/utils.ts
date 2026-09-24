import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

// Teach tailwind-merge the custom type scale in globals.css; otherwise `text-caption` (a size)
// and `text-ink-80` (a color) look like conflicting colors and the size gets dropped.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["hero", "display-lg", "lead", "lead-airy", "tagline", "body", "dense-link", "caption", "fine", "nav"] }],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
