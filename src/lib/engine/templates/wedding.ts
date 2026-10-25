import { EventTemplateConfig } from './types';

export const weddingTemplate: EventTemplateConfig = {
  eventType: 'wedding',
  title: 'Royal Indian Wedding Celebration',
  description:
    'Comprehensive multi-function Indian celebration encompassing auspicious rituals, music, feasting, and hospitality.',
  defaultFunctions: [
    {
      type: 'engagement',
      name: 'Roka & Ring Ceremony',
      timeOfDay: 'evening',
      venueType: 'indoor',
      guestRatio: 0.4,
      significance: 'Formal announcement and exchange of blessings and rings between families.',
    },
    {
      type: 'mehendi',
      name: 'Mehendi & Henna Soiree',
      timeOfDay: 'afternoon',
      venueType: 'hybrid',
      guestRatio: 0.35,
      significance:
        'Intimate, vibrant afternoon of herbal henna art, folk music, and colourful attire.',
    },
    {
      type: 'haldi',
      name: 'Auspicious Haldi Ceremony',
      timeOfDay: 'morning',
      venueType: 'outdoor',
      guestRatio: 0.35,
      significance:
        'Traditional turmeric blessing ritual to purify and impart radiance to bride and groom.',
    },
    {
      type: 'sangeet',
      name: 'Grand Sangeet & Musical Night',
      timeOfDay: 'night',
      venueType: 'indoor',
      guestRatio: 0.85,
      significance:
        'High-energy celebration with choreography, DJ music, and family dance performances.',
    },
    {
      type: 'wedding',
      name: 'Vedic Pheras & Varmala',
      timeOfDay: 'evening',
      venueType: 'hybrid',
      guestRatio: 1.0,
      significance: 'Sacred nuptial ceremony around holy agni, varmala garland exchange, and vows.',
    },
    {
      type: 'reception',
      name: 'Grand Royal Reception',
      timeOfDay: 'night',
      venueType: 'indoor',
      guestRatio: 1.0,
      significance:
        'Formal gala dinner welcoming extended family, dignitary guests, and colleagues.',
    },
  ],
  baseCategoryWeights: {
    venue: 20,
    catering: 24,
    decor: 12,
    photography: 8,
    attire_jewellery: 8,
    music_entertainment: 5,
    makeup_mehendi: 4,
    invitations_stationery: 2,
    logistics_accommodation: 5,
    rituals_pandit: 1.5,
    gifts_favors: 2.5,
    contingency: 8,
  },
  tierCostPerGuestFloor: {
    tier1: 2200, // Mumbai, Delhi, Bangalore min realistic cost per guest
    tier2: 1500, // Jaipur, Pune, Ahmedabad, Lucknow
    tier3: 950, // Smaller towns
  },
  tierCostPerGuestCeiling: {
    tier1: 15000,
    tier2: 10000,
    tier3: 6500,
  },
  taskBlueprints: [
    {
      id: 'task-venue-book',
      title: 'Finalize and book primary venue(s) with deposit',
      category: 'venue',
      defaultDaysBeforeEvent: 180,
      priority: 'critical',
      owner: 'Family Lead',
      dependencies: [],
    },
    {
      id: 'task-caterer-tasting',
      title: 'Menu tasting session and finalize catering contract',
      category: 'catering',
      defaultDaysBeforeEvent: 120,
      priority: 'critical',
      owner: 'Food Committee',
      dependencies: ['task-venue-book'],
    },
    {
      id: 'task-photo-hire',
      title: 'Book candid photographer and cinematic videographer',
      category: 'photography',
      defaultDaysBeforeEvent: 110,
      priority: 'high',
      owner: 'Couple',
      dependencies: ['task-venue-book'],
    },
    {
      id: 'task-decor-concept',
      title: 'Approve decor 3D mood boards and floral staging concepts',
      category: 'decor',
      defaultDaysBeforeEvent: 90,
      priority: 'critical',
      owner: 'Decor Lead',
      dependencies: ['task-venue-book'],
    },
    {
      id: 'task-attire-fitting',
      title: 'Wedding trousseau and main ceremony attire final fittings',
      category: 'attire_jewellery',
      defaultDaysBeforeEvent: 60,
      priority: 'high',
      owner: 'Couple',
      dependencies: [],
    },
    {
      id: 'task-invitations-send',
      title: 'Dispatch physical invites and launch digital RSVP portal',
      category: 'invitations_stationery',
      defaultDaysBeforeEvent: 50,
      priority: 'high',
      owner: 'Communications Lead',
      dependencies: ['task-venue-book', 'task-caterer-tasting'],
    },
    {
      id: 'task-music-choreography',
      title: 'Begin Sangeet dance practice & sound track curation with DJ',
      category: 'music_entertainment',
      defaultDaysBeforeEvent: 40,
      priority: 'medium',
      owner: 'Sangeet Team',
      dependencies: [],
    },
    {
      id: 'task-mehendi-artist',
      title: 'Confirm bridal henna lead and assistant mehendi team',
      category: 'makeup_mehendi',
      defaultDaysBeforeEvent: 35,
      priority: 'medium',
      owner: 'Bride Team',
      dependencies: [],
    },
    {
      id: 'task-pandit-samagri',
      title: 'Review Vedic ceremony samagri list & muhurat timing with Pandit',
      category: 'rituals_pandit',
      defaultDaysBeforeEvent: 25,
      priority: 'critical',
      owner: 'Ritual Elder',
      dependencies: ['task-venue-book'],
    },
    {
      id: 'task-logistics-rooms',
      title: 'Confirm hotel room blocks, airport shuttles, and driver sheet',
      category: 'logistics_accommodation',
      defaultDaysBeforeEvent: 20,
      priority: 'high',
      owner: 'Logistics Manager',
      dependencies: ['task-invitations-send'],
    },
    {
      id: 'task-gifts-packing',
      title: 'Pack return gifts, sweets (mithai boxes), and welcome hampers',
      category: 'gifts_favors',
      defaultDaysBeforeEvent: 14,
      priority: 'medium',
      owner: 'Hospitality Lead',
      dependencies: ['task-invitations-send'],
    },
    {
      id: 'task-final-venue-walkthrough',
      title: 'On-site technical walkthrough: generator, green rooms, sound check',
      category: 'venue',
      defaultDaysBeforeEvent: 7,
      priority: 'critical',
      owner: 'Event Coordinator',
      dependencies: ['task-decor-concept', 'task-caterer-tasting'],
    },
    {
      id: 'task-emergency-cash',
      title: 'Allocate physical cash envelopes for vendor tips & contingency',
      category: 'contingency',
      defaultDaysBeforeEvent: 3,
      priority: 'critical',
      owner: 'Treasurer / Uncle',
      dependencies: [],
    },
  ],
  vendorBlueprints: [
    {
      category: 'venue',
      categoryLabel: 'Venue & Banquet',
      questionsToAsk: [
        'Is the outdoor lawn licensed for music past 10:00 PM?',
        'What is the heavy generator power backup capacity in KVA?',
        'Are there any corkage or outside vendor royalty penalty fees?',
        'How many complimentary green rooms / bride suites are provided?',
      ],
      redFlags: [
        'Venue insists on mandatory in-house decorator with no price guarantee',
        'Vague weather backup clause with no indoor hall guarantee in case of rain',
        'No dedicated parking or valet space for expected car volume',
      ],
      negotiationTips: [
        'Ask to bundle complimentary morning breakfast or high tea for in-house stay guests',
        'Negotiate zero corkage charges if liquor license is obtained directly',
        'Request 2 extra complimentary preparation hours before the event start',
      ],
      documentsToCollect: [
        'Booking agreement with time slots and room numbers',
        'Fire safety NOC and sound limit compliance certificate',
        'Payment milestone receipt and security deposit refund terms',
      ],
    },
    {
      category: 'catering',
      categoryLabel: 'Catering & Feasts',
      questionsToAsk: [
        'Can separate Jain-friendly and pure-vegetarian live counters be guaranteed?',
        'What is the staff-to-guest ratio during peak dining hours?',
        'How are sudden surplus guests (buffer plates) charged?',
        'Does the rate include mineral water dispensers, dessert ice, and disposables?',
      ],
      redFlags: [
        'Refusal to conduct a formal live food tasting before advance payment',
        'Exorbitant +30% markups for buffer plates beyond contracted guarantee',
        'No clear hygiene certification or food waste disposal strategy',
      ],
      negotiationTips: [
        'Insist on free live counter additions (e.g., chaat or custom mocktail bar)',
        'Negotiate per-plate price downward by committing to all multi-day functions',
        'Lock buffer plate pricing at parity with regular agreed plate rate',
      ],
      documentsToCollect: [
        'FSSAI food hygiene license copy',
        'Itemized menu agreement with live station specifics',
        'Staff uniform & grooming commitment clause',
      ],
    },
    {
      category: 'photography',
      categoryLabel: 'Photography & Cinematography',
      questionsToAsk: [
        'Will the primary lead photographer personally shoot the wedding day?',
        'How many candid vs traditional photographers and drone operators are in the team?',
        'What is the hard deadline for teaser video, full film, and photo album delivery?',
        'Do we get all raw uncompressed footage and photos on a hard drive?',
      ],
      redFlags: [
        'Lead photographer outsources shooting to junior freelancers on the day',
        'Contract missing clear delivery turnaround deadlines',
        'Extra hidden fees for raw RAW photo files or drone footage licensing',
      ],
      negotiationTips: [
        'Request a complimentary pre-wedding couple shoot in the package',
        'Include 2 premium printed coffee table albums for both sets of parents',
        'Reserve 10% final payment until complete album and edited 4K film delivery',
      ],
      documentsToCollect: [
        'Deliverable schedule contract with specific turnaround weeks',
        'Drone flight permit / clearance for the venue locality',
        'Payment schedule tied to delivery milestones',
      ],
    },
    {
      category: 'decor',
      categoryLabel: 'Decor & Mandap Production',
      questionsToAsk: [
        'Are fresh flowers sourced on the same morning, or cold-stored?',
        'What is the exact height and structural rating of the wedding mandap?',
        'Can we see recent real venue setup photos rather than stock 3D renders?',
        'Who handles local police / municipal permissions for entrance arches?',
      ],
      redFlags: [
        'Decorator uses artificial flowers while charging premium fresh exotic rates',
        'No rainproof or wind-resistant mandap canopy engineering for outdoor setups',
        'Failure to specify LED light counts, ambient trusses, or wash lighting',
      ],
      negotiationTips: [
        'Repurpose daytime Haldi floral elements into evening walkway aesthetics',
        'Negotiate complimentary fairy light draping on surrounding garden trees',
        'Request clear 3D mockups before approving advance disbursement',
      ],
      documentsToCollect: [
        'Itemized materials and staging blueprint sheet',
        'Mandap structural stability declaration',
        'Clearance timeline for post-event teardown',
      ],
    },
    {
      category: 'music_entertainment',
      categoryLabel: 'Music, Sound & DJ',
      questionsToAsk: [
        'Does the DJ sound console comply with local decibel thresholds past 10 PM?',
        'Can the DJ provide silent disco headphones if sound curfew is enforced?',
        'Does the package include line-array sound speakers and dynamic moving head lights?',
      ],
      redFlags: [
        'DJ does not bring backup equipment (laptop, mixer, cables, microphones)',
        'Unwillingness to rehearse the Sangeet family dance track timeline in advance',
      ],
      negotiationTips: [
        'Bundle dhol players for the Baraat entry with the DJ package',
        'Request free acoustic folk singers for the afternoon Haldi or Mehendi',
      ],
      documentsToCollect: [
        'IPRS / PPL music performance license guidance',
        'Technical rider and sound equipment schedule',
      ],
    },
    {
      category: 'makeup_mehendi',
      categoryLabel: 'Bridal Makeup & Mehendi',
      questionsToAsk: [
        'Does the artist do paid trials with hair styling and drape testing?',
        'Are international high-definition (HD) / airbrush makeup products guaranteed?',
        'How many family member touch-ups are supported by the team?',
      ],
      redFlags: [
        'Artist double-books multiple brides on the same wedding muhurat evening',
        'Chemical-laced fast darkening henna cones that cause skin allergies',
      ],
      negotiationTips: [
        'Bundle bridal mehendi with complimentary henna for mother and sisters',
        'Secure free groom grooming / styling touch-up on the wedding day',
      ],
      documentsToCollect: [
        'Product brand commitment list',
        'Bridal schedule and call-time commitment sheet',
      ],
    },
  ],
  defaultThemes: [
    {
      name: 'Royal Rajputana Heritage',
      palette: {
        name: 'Kesariya & Antique Gold',
        hexCodes: ['#941437', '#D4A838', '#EA580C', '#FAF6EC', '#0F4D34'],
        description: 'Majestic deep crimson, gold leaf filigree, and warm marigold highlights.',
      },
      decorIdeas: [
        'Handcrafted brass urli bowls with floating rose petals and fragrant mogra',
        'Carved wooden jharokha photo backdrops draped in royal velvet',
        'Traditional block-printed shamianas with vintage crystal chandeliers',
      ],
      entertainment: [
        'Live Rajasthani Manganiyar folk ensemble with dholak and sarangi',
        'Royal regal procession with traditional brass trumpets (Tutari) and royal umbrellas',
      ],
      returnGifts: [
        'Pure brass diya sets in velvet gift boxes with organic attar perfume',
        'Artisanal silver-plated coin with custom couple emblem engraving',
      ],
    },
    {
      name: 'Vedic Flora & Sacred Temple',
      palette: {
        name: 'Temple Chandan & Mogra',
        hexCodes: ['#CFA838', '#FFFFFF', '#0A9060', '#F5EEDB', '#EA580C'],
        description:
          'Spiritual sandalwood tones, pure white jasmine strings, and fresh temple greens.',
      },
      decorIdeas: [
        'Magnificent 10,000-bell brass chime canopy above the holy mandap',
        'Fresh tuberose (rajnigandha) and banana leaf ceremonial welcome pillars',
        'Terracotta deepak pathways illuminated with pure ghee lamps',
      ],
      entertainment: [
        'Classical Carnatic flute & sitar jugalbandi welcoming guests',
        'Sanskrit mantra chanting choir during the sacred pheras',
      ],
      returnGifts: [
        'Handmade Ayurvedic incense boxes with pure Mysore sandalwood soap',
        'Sacred copper kalash with organic Kashmiri saffron vial',
      ],
    },
  ],
};
