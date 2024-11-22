export interface Price {
  price: string;
  id: string;
}

export interface Product {
  name: string;
  type: 'bundle' | 'license';
  extensions?: string[];
  description: string;
  image: string;
  prices: {
    monthly: Price;
    yearly: Price;
    lifetime: Price;
  };
}

export const bundleConfig: { [key: string]: Product } = {
  'AdvancedBundle': {
    name: 'Advanced Bundle',
    type: 'bundle',
    extensions: ['Canvabulkbg', 'Ideobot', 'Midbot', 'AdvancedTool'],
    description: 'Comprehensive solutions for power users tackling complex tasks.',
    image: '/img.png?height=400&width=600',
    prices: {
      monthly: { price: '$39.99/month', id: 'price_1Q79IwEUAhHysq2jWpJ8wFXv' },
      yearly: { price: '$399.99/year', id: 'price_1Q79JWEUAhHysq2jOFqMGYsU' },
      lifetime: { price: '$799.99 one-time', id: 'price_1Q79JyEUAhHysq2jtihJTIc4' },
    },
  },
  'ProBundle': {
    name: 'Pro Bundle',
    type: 'bundle',
    extensions: ['Canvabulkbg', 'Ideobot', 'Midbot'],
    description: 'Enhance your workflow with advanced tools designed for professionals.',
    image: '/img.png?height=400&width=600',
    prices: {
      monthly: { price: '$29.99/month', id: 'price_1Q79IwEUAhHysq2jWpJ8wFXv' },
      yearly: { price: '$299.99/year', id: 'price_1Q79JWEUAhHysq2jOFqMGYsU' },
      lifetime: { price: '$599.99 one-time', id: 'price_1Q79JyEUAhHysq2jtihJTIc4' },
    },
  },
  'StarterBundle': {
    name: 'Starter Bundle',
    type: 'bundle',
    extensions: ['Canvabulkbg', 'Ideobot'],
    description: 'Perfect for beginners looking to explore powerful productivity tools.',
    image: '/img.png?height=400&width=600',
    prices: {
      monthly: { price: '$19.99/month', id: 'price_1Q79IwEUAhHysq2jWpJ8wFXv' },
      yearly: { price: '$199.99/year', id: 'price_1Q79JWEUAhHysq2jOFqMGYsU' },
      lifetime: { price: '$399.99 one-time', id: 'price_1Q79JyEUAhHysq2jtihJTIc4' },
    },
  },
};

export const licenseProductConfig: { [key: string]: Product } = {
  'PIKBOT': {
    name: 'PIKBOT',
    type: 'license',
    description: 'Powerful AI-driven bot for enhanced productivity.',
    image: '/img.png?height=400&width=600',
    prices: {
      monthly: { price: '$9.99/month', id: 'price_1Q79IwEUAhHysq2jWpJ8wFXv' },
      yearly: { price: '$99.99/year', id: 'price_1Q79JWEUAhHysq2jOFqMGYsU' },
      lifetime: { price: '$199.99 one-time', id: 'price_1Q79JyEUAhHysq2jtihJTIc4' },
    },
  },
  'AdvancedTool': {
    name: 'Advanced Tool',
    type: 'license',
    description: 'Cutting-edge tool for advanced users and complex projects.',
    image: '/img.png?height=400&width=600',
    prices: {
      monthly: { price: '$14.99/month', id: 'price_1Q79IwEUAhHysq2jWpJ8wFXv' },
      yearly: { price: '$149.99/year', id: 'price_1Q79JWEUAhHysq2jOFqMGYsU' },
      lifetime: { price: '$299.99 one-time', id: 'price_1Q79JyEUAhHysq2jtihJTIc4' },
    },
  },
};

