
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Modern task design tokens
				'task-card': {
					DEFAULT: 'hsl(var(--task-card-bg))',
					hover: 'hsl(var(--task-card-hover))',
					border: 'hsl(var(--task-card-border))'
				},
				'status': {
					completed: 'hsl(var(--status-completed))',
					'completed-bg': 'hsl(var(--status-completed-bg))',
					'completed-glow': 'hsl(var(--status-completed-glow))',
					'in-progress': 'hsl(var(--status-in-progress))',
					'in-progress-bg': 'hsl(var(--status-in-progress-bg))',
					'in-progress-glow': 'hsl(var(--status-in-progress-glow))',
					pending: 'hsl(var(--status-pending))',
					'pending-bg': 'hsl(var(--status-pending-bg))',
					'pending-fg': 'hsl(var(--status-pending-fg))',
					cancelled: 'hsl(var(--status-cancelled))',
					'cancelled-bg': 'hsl(var(--status-cancelled-bg))',
					'cancelled-glow': 'hsl(var(--status-cancelled-glow))'
				},
				'priority': {
					urgent: 'hsl(var(--priority-urgent))',
					'urgent-light': 'hsl(var(--priority-urgent-light))',
					high: 'hsl(var(--priority-high))',
					'high-light': 'hsl(var(--priority-high-light))',
					medium: 'hsl(var(--priority-medium))',
					'medium-light': 'hsl(var(--priority-medium-light))',
					low: 'hsl(var(--priority-low))',
					'low-light': 'hsl(var(--priority-low-light))'
				},
				// AI Assistant specific colors  
				'ai': {
					primary: 'hsl(var(--ai-primary))',
					'primary-light': 'hsl(var(--ai-primary-light))',
					secondary: 'hsl(var(--ai-secondary))',
					accent: 'hsl(var(--ai-accent))',
					surface: 'hsl(var(--ai-surface))',
					'surface-hover': 'hsl(var(--ai-surface-hover))',
					border: 'hsl(var(--ai-border))',
					text: 'hsl(var(--ai-text))',
					'text-muted': 'hsl(var(--ai-text-muted))'
				}
			},
			backgroundImage: {
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-card': 'var(--gradient-card)',
				'gradient-subtle': 'var(--gradient-subtle)',
				'gradient-ai-primary': 'var(--gradient-ai-primary)',
				'gradient-ai-surface': 'var(--gradient-ai-surface)',
				'priority-urgent': 'var(--priority-urgent-gradient)',
				'priority-high': 'var(--priority-high-gradient)',
				'priority-medium': 'var(--priority-medium-gradient)',
				'priority-low': 'var(--priority-low-gradient)'
			},
			boxShadow: {
				'task-sm': 'var(--shadow-sm)',
				'task-md': 'var(--shadow-md)',
				'task-lg': 'var(--shadow-lg)',
				'task-xl': 'var(--shadow-xl)',
				'colored': 'var(--shadow-colored)',
				'ai-sm': 'var(--shadow-ai-sm)',
				'ai-md': 'var(--shadow-ai-md)',
				'ai-lg': 'var(--shadow-ai-lg)',
				'glow-urgent': '0 0 20px hsl(var(--status-completed-glow) / 0.3)',
				'glow-completed': '0 0 20px hsl(var(--status-completed-glow) / 0.3)',
				'glow-progress': '0 0 20px hsl(var(--status-in-progress-glow) / 0.3)'
			},
			transitionProperty: {
				'ai': 'color, background-color, border-color, transform, box-shadow, opacity'
			},
			transitionTimingFunction: {
				'ai': 'cubic-bezier(0.4, 0, 0.2, 1)'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'slide-in': {
					'0%': {
						transform: 'translateX(-10px)',
						opacity: '0'
					},
					'100%': {
						transform: 'translateX(0)',
						opacity: '1'
					}
				},
				'scale-in': {
					'0%': {
						transform: 'scale(0.95)',
						opacity: '0'
					},
					'100%': {
						transform: 'scale(1)',
						opacity: '1'
					}
				},
				'shimmer': {
					'0%': {
						backgroundPosition: '-200px 0'
					},
					'100%': {
						backgroundPosition: 'calc(200px + 100%) 0'
					}
				},
				'bounce-subtle': {
					'0%, 100%': {
						transform: 'translateY(0)',
						animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)'
					},
					'50%': {
						transform: 'translateY(-2px)',
						animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)'
					}
				},
				'pulse-glow': {
					'0%, 100%': {
						boxShadow: '0 0 0 0 hsl(var(--primary) / 0.4)'
					},
					'50%': {
						boxShadow: '0 0 0 4px hsl(var(--primary) / 0.1)'
					}
				},
				'celebration': {
					'0%': {
						transform: 'scale(1) rotate(0deg)',
						opacity: '1'
					},
					'25%': {
						transform: 'scale(1.1) rotate(5deg)',
						opacity: '0.9'
					},
					'50%': {
						transform: 'scale(1.05) rotate(-3deg)',
						opacity: '0.8'
					},
					'75%': {
						transform: 'scale(1.08) rotate(2deg)',
						opacity: '0.9'
					},
					'100%': {
						transform: 'scale(1) rotate(0deg)',
						opacity: '1'
					}
				},
				'micro-bounce': {
					'0%, 100%': {
						transform: 'translateY(0) scale(1)',
						animationTimingFunction: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
					},
					'50%': {
						transform: 'translateY(-2px) scale(1.02)',
						animationTimingFunction: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'slide-in': 'slide-in 0.3s ease-out',
				'scale-in': 'scale-in 0.2s ease-out',
				'shimmer': 'shimmer 2s linear infinite',
				'bounce-subtle': 'bounce-subtle 0.6s ease-in-out',
				'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				'celebration': 'celebration 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
				'micro-bounce': 'micro-bounce 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
