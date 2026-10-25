import { EventTemplateConfig } from './types';

export const communityTemplate: EventTemplateConfig = {
  eventType: 'community',
  title: 'Community Festival & Cultural Utsav',
  description:
    'Large-scale community festival or cultural gathering uniting societies, clubs, or alumni groups.',
  defaultFunctions: [
    {
      type: 'puja_inauguration',
      name: 'Inaugural Blessing & Lamp Lighting',
      timeOfDay: 'morning',
      venueType: 'hybrid',
      guestRatio: 0.7,
      significance:
        'Traditional lamp lighting (Deep Prajwalan), Ganesh Vandana, and committee address.',
    },
    {
      type: 'cultural_performances',
      name: 'Youth & Cultural Showcase',
      timeOfDay: 'afternoon',
      venueType: 'indoor',
      guestRatio: 0.9,
      significance: 'Classical dance, skits, instrumental performances, and community awards.',
    },
    {
      type: 'community_feast',
      name: 'Maha-Prasad / Community Banquet',
      timeOfDay: 'evening',
      venueType: 'hybrid',
      guestRatio: 1.0,
      significance: 'Grand traditional sit-down or buffet community feast (Pangat / Bhojan).',
    },
  ],
  baseCategoryWeights: {
    venue: 25,
    catering: 35,
    decor: 10,
    photography: 6,
    attire_jewellery: 0,
    music_entertainment: 8,
    makeup_mehendi: 0,
    invitations_stationery: 3,
    logistics_accommodation: 4,
    rituals_pandit: 3,
    gifts_favors: 2,
    contingency: 4,
  },
  tierCostPerGuestFloor: {
    tier1: 850,
    tier2: 550,
    tier3: 400,
  },
  tierCostPerGuestCeiling: {
    tier1: 4500,
    tier2: 3000,
    tier3: 2000,
  },
  taskBlueprints: [
    {
      id: 'task-comm-grounds',
      title: 'Book community ground / auditorium & municipal permits',
      category: 'venue',
      defaultDaysBeforeEvent: 90,
      priority: 'critical',
      owner: 'Civic Committee',
      dependencies: [],
    },
    {
      id: 'task-comm-caterer',
      title: 'Finalize community feast menu & volunteer serving roster',
      category: 'catering',
      defaultDaysBeforeEvent: 45,
      priority: 'critical',
      owner: 'Bhojan Committee',
      dependencies: ['task-comm-grounds'],
    },
    {
      id: 'task-comm-sound-stage',
      title: 'Set up audio-visual stage, microphones & generator power',
      category: 'music_entertainment',
      defaultDaysBeforeEvent: 20,
      priority: 'high',
      owner: 'Technical Team',
      dependencies: ['task-comm-grounds'],
    },
    {
      id: 'task-comm-announcements',
      title: 'Publish community circular, WhatsApp flyers & banners',
      category: 'invitations_stationery',
      defaultDaysBeforeEvent: 30,
      priority: 'high',
      owner: 'PR Committee',
      dependencies: ['task-comm-grounds'],
    },
  ],
  vendorBlueprints: [
    {
      category: 'venue',
      categoryLabel: 'Auditorium & Public Grounds',
      questionsToAsk: [
        'Are local police and fire brigade NOC clearances included or separate?',
        'Is high-voltage 3-phase generator connection available on premise?',
      ],
      redFlags: ['No certified emergency exit plan for crowd surge'],
      negotiationTips: ['Request non-profit or resident association concession rates'],
      documentsToCollect: ['Premises permit & municipal receipts'],
    },
  ],
  defaultThemes: [
    {
      name: 'Anandam Mahotsav',
      palette: {
        name: 'Saffron & Sacred Emerald',
        hexCodes: ['#EA580C', '#0A9060', '#CFA838', '#FAF6EC', '#941437'],
        description: 'Vibrant festive orange, auspicious emerald greens, and marigold garlands.',
      },
      decorIdeas: [
        'Grand floral Toran entrance arch with banana tree saplings',
        'Large Rangoli centerpiece designed with natural dry rice dyes and flower petals',
      ],
      entertainment: ['Inter-community folk dance competition and felicitation ceremony'],
      returnGifts: ['Jute conference tote bag with prasadam sweet box and ceremonial coin'],
    },
  ],
};
