import { Instrument_Sans, Newsreader, Rammetto_One } from "next/font/google";

// Brand / display — rare moments only (DESIGN.md §9.2, D52, D58)
export const rammetto = Rammetto_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-rammetto",
  display: "swap",
});

// Product / UI
export const instrument = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});

// Reader — the reader's own words (Thoughts, reflections, quotes)
export const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-newsreader",
  display: "swap",
});

export const fontVariables = `${rammetto.variable} ${instrument.variable} ${newsreader.variable}`;
