/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#FAFAF8',
        'bg-card': '#FFFFFF',
        'text-primary': '#1A1A1A',
        'text-muted': '#6B7280',
        'border': '#E5E7EB',
        'accent': '#FF6B6B',
        'elaine': '#FF6B9D',
        'felipe': '#4ECDC4',
        'leticia': '#FFE66D',
        'raul': '#7C83FD',
      },
      fontFamily: {
        display: ['Nunito', 'sans-serif'],
        body: ['Inter', 'DM Sans', 'sans-serif'],
      },
      keyframes: {
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'float-up': {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-40px)' },
        },
        'toast-in': {
          '0%': { opacity: '0', transform: 'translateY(-100%)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'toast-out': {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-100%)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-8px)' },
          '40%': { transform: 'translateX(8px)' },
          '60%': { transform: 'translateX(-4px)' },
          '80%': { transform: 'translateX(4px)' },
        },
        'wave': {
          '0%': { transform: 'rotate(0deg)' },
          '10%': { transform: 'rotate(14deg)' },
          '20%': { transform: 'rotate(-8deg)' },
          '30%': { transform: 'rotate(14deg)' },
          '40%': { transform: 'rotate(-4deg)' },
          '50%': { transform: 'rotate(10deg)' },
          '60%, 100%': { transform: 'rotate(0deg)' },
        },
        'task-done': {
          '0%': { opacity: '1', transform: 'translateX(0)', maxHeight: '120px' },
          '60%': { opacity: '0.4', transform: 'translateX(-30px)' },
          '100%': { opacity: '0', transform: 'translateX(-60px)', maxHeight: '0px', padding: '0', margin: '0', border: '0' },
        },
        'check-fill': {
          '0%': { transform: 'scale(0.5)', opacity: '0' },
          '50%': { transform: 'scale(1.3)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'streak-pulse': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.1)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(1)', opacity: '0.8' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
      },
      animation: {
        'slide-up': 'slide-up 0.4s ease-out both',
        'float-up': 'float-up 1s ease-out forwards',
        'toast-in': 'toast-in 0.3s ease-out',
        'toast-out': 'toast-out 0.3s ease-in forwards',
        'shimmer': 'shimmer 1.5s infinite linear',
        'shake': 'shake 0.4s ease-in-out',
        'wave': 'wave 1.8s ease-in-out infinite',
        'task-done': 'task-done 0.8s ease-in-out forwards',
        'check-fill': 'check-fill 0.3s ease-out',
        'streak-pulse': 'streak-pulse 2s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 1.2s ease-out infinite',
      },
    },
  },
  plugins: [],
}
