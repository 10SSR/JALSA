import { EventProfile, FunctionIdea } from '@/lib/validation';
import { getEventTemplate } from './templates';

/**
 * Pure TS Personalized Ideas Engine
 * Synthesizes themes, color palettes, decor, curated catering items with portion grams,
 * entertainment, and return gift concepts tailored to dietary and cultural context.
 */
export function generatePersonalizedIdeas(profile: EventProfile): FunctionIdea[] {
  const template = getEventTemplate(profile.eventType);
  const themes = template.defaultThemes;
  const isJain = profile.dietaryConstraints?.includes('jain');
  const isPureVeg = profile.dietaryConstraints?.includes('pure_veg');

  return profile.functions.map((fn, index) => {
    const selectedTheme = themes[index % themes.length] || themes[0];

    // Menu customization based on dietary preferences
    const snackItems = isJain
      ? [
          'Kaju Corn Seekh Kabab',
          'Kele Ki Tikki (No Potato)',
          'Crispy Lotus Stem Chips',
          'Paneer Malai Tikka',
        ]
      : ['Paneer Tikka Angara', 'Dahi Ke Sholay', 'Kurkuri Bhindi Chaat', 'Hara Bhara Kabab'];

    const mainCourseItems = isJain
      ? [
          'Paneer Pasanda in White Gravy',
          'Jain Dal Makhani (No Onion/Garlic)',
          'Kaju Methi Malai',
          'Subz Biryani with Anar Raita',
        ]
      : isPureVeg
        ? [
            'Paneer Lababdar',
            'Dal Bukhara Slow-Cooked',
            'Amritsari Kulcha',
            'Dum Subz Handi Biryani',
          ]
        : [
            'Murgh Makhani Butter Chicken',
            'Gosht Rogan Josh',
            'Paneer Tikka Masala',
            'Awadhi Gosht Dum Biryani',
          ];

    const desserts = [
      'Warm Gulab Jamun Stuffed with Gulkand',
      'Artisanal Kesar Rabdi Jalebi Live Counter',
      'Sitaphal (Custard Apple) Cream Shots',
    ];

    // Decor customization based on venue type and time of day
    const customDecor = [...selectedTheme.decorIdeas];
    if (fn.venueType === 'outdoor') {
      customDecor.push(
        'Fairy light curtain canopy across lawn perimeter with rustic wooden signposts'
      );
    } else {
      customDecor.push(
        'Crystal chandelier centerpieces with antique mirror consoles and velvet drapery'
      );
    }

    if (fn.timeOfDay === 'night' || fn.timeOfDay === 'evening') {
      customDecor.push(
        'Illuminated diya and candle bridge walkway with low-smoke sparkler fountain entrance'
      );
    }

    return {
      functionId: fn.id,
      functionName: fn.name,
      theme: `${selectedTheme.name} - ${fn.name}`,
      colorPalette: selectedTheme.palette,
      decorIdeas: customDecor,
      menuRecommendations: [
        {
          section: 'Live Appetizers & Welcome Sips',
          items: snackItems,
          estimatedGramsPerGuest: '180g - 220g per guest',
        },
        {
          section: 'Royal Banquet Main Course',
          items: mainCourseItems,
          estimatedGramsPerGuest: '380g - 450g per guest',
        },
        {
          section: 'Gourmet Mithai & Desserts',
          items: desserts,
          estimatedGramsPerGuest: '120g - 150g per guest',
        },
      ],
      entertainmentIdeas: selectedTheme.entertainment,
      returnGiftIdeas: selectedTheme.returnGifts,
    };
  });
}
