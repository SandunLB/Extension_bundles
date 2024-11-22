export interface Price {
    price: string;
    id: string;
  }
  
  export interface Product {
    name: string;
    type: 'bundle' | 'single';
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
        yearly: { price: '$399.99/year', id: 'price_1Q79IwEUAhHysq2jWpJ8wFXv' },
        lifetime: { price: '$799.99 one-time', id: 'price_1Q79IwEUAhHysq2jWpJ8wFXv' },
      },
    },
    'ProBundle': {
  name: 'Pro Bundle',
  type: 'bundle',
  extensions: ['Canvabulkbg', 'Ideobot', 'Midbot'],
  description: 'A powerful suite for professionals to streamline productivity and creativity.',
  image: '/img_pro.png?height=400&width=600',
  prices: {
    monthly: { price: '$29.99/month', id: 'price_1Q79IwEUAhHysq2jWpJ8wFXv' },
    yearly: { price: '$299.99/year', id: 'price_1Q79IwEUAhHysq2jWpJ8wFXv' },
    lifetime: { price: '$599.99 one-time', id: 'price_1Q79IwEUAhHysq2jWpJ8wFXv' },
  },
},
'StarterBundle': {
  name: 'Starter Bundle',
  type: 'bundle',
  extensions: ['Canvabulkbg', 'Ideobot'],
  description: 'The perfect entry point for those looking to kickstart their projects.',
  image: '/img_starter.png?height=400&width=600',
  prices: {
    monthly: { price: '$19.99/month', id: 'price_1Q79IwEUAhHysq2jWpJ8wFXv' },
    yearly: { price: '$199.99/year', id: 'price_1Q79IwEUAhHysq2jWpJ8wFXv' },
    lifetime: { price: '$399.99 one-time', id: 'price_1Q79IwEUAhHysq2jWpJ8wFXv' },
  },
},

    
    // ... other bundles
  };
  
  export const productConfig: { [key: string]: Product } = {
    'PIKBOT': {
      name: 'PIKBOT',
      type: 'single',
      description: 'Powerful AI-driven bot for enhanced productivity.',
      image: '/pikbot.png?height=400&width=600',
      prices: {
        monthly: { price: '$9.99/month', id: 'price_1Q79IwEUAhHysq2jWpJ8wFXv' },
        yearly: { price: '$99.99/year', id: 'price_1Q79IwEUAhHysq2jWpJ8wFXv' },
        lifetime: { price: '$199.99 one-time', id: 'price_1Q79IwEUAhHysq2jWpJ8wFXv' },
      },
    },
    // ... other products
  };
  
  