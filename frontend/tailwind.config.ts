import { heroui } from "@heroui/react";
import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {},
    },
    plugins: [
        heroui({
            themes: {
                light: {
                    colors: {
                        background: "#F5F5F7", // 略带灰度的背景，比纯白更有质感
                        foreground: "#11181C",
                        primary: {
                            50: "#e6f1fe",
                            100: "#cce3fd",
                            200: "#99c7fb",
                            300: "#66aaf9",
                            400: "#338ef7",
                            500: "#006FEE", // HeroUI standard primary
                            600: "#005bc4",
                            700: "#004493",
                            800: "#002e62",
                            900: "#001731",
                            DEFAULT: "#006FEE",
                            foreground: "#ffffff",
                        },
                        focus: "#006FEE",
                    },
                },
            },
        }),
    ],
};

export default config;
