/** @type {import('tailwindcss').Config} */
export default {
  // هنا نخبر تيلويند أين يبحث عن الكلاسات ليقوم بتوليدها
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        church: {
          dark: '#1e3a8a',
          light: '#3b82f6',
          accent: '#f59e0b',
          bg: '#f3f4f6',
          text: '#111827',
        }
      },
      fontFamily: {
        // نضع اسم الخط كما هو في Google Fonts
        arabic: ['"Readex Pro"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}