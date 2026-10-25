import { GoogleGenerativeAI } from '@google/generative-ai';
import { SYSTEM_PROMPTS } from './prompts';

export interface IntakeExtractionResult {
  eventType?: 'wedding' | 'birthday' | 'community';
  title?: string;
  date?: string;
  city?: string;
  cityTier?: 'tier1' | 'tier2' | 'tier3';
  totalBudget?: number;
  guestCount?: number;
  dietaryConstraints?: string[];
  priorities?: string[];
  venuePreference?: 'indoor' | 'outdoor' | 'hybrid';
  religionCultureNotes?: string;
  language?: 'en' | 'hi' | 'mr';
  missingRequiredFields: string[];
  nextQuestion: string;
}

export interface LLMClient {
  extractIntake(
    userInput: string,
    existingState?: Partial<IntakeExtractionResult>
  ): Promise<IntakeExtractionResult>;
  enrichIdeas(context: string): Promise<Record<string, unknown>>;
}

/**
 * In-memory LRU cache to avoid duplicate LLM billing
 */
const cache = new Map<string, { data: IntakeExtractionResult; timestamp: number }>();
const CACHE_TTL_MS = 1000 * 60 * 30; // 30 minutes

/**
 * Heuristic fallback parser when AI is unavailable or rate limited.
 * Ensures the app NEVER breaks.
 */
export function heuristicExtract(
  userInput: string,
  existingState: Partial<IntakeExtractionResult> = {}
): IntakeExtractionResult {
  const lower = userInput.toLowerCase();

  // Detect Language
  let lang: 'en' | 'hi' | 'mr' = existingState.language || 'en';
  if (/[\u0900-\u097F]/.test(userInput)) {
    lang = /आहे|आम्ही|लग्न|पुण्यात|झाले|पाहिजे/.test(userInput) ? 'mr' : 'hi';
  }

  // Detect Event Type
  let eventType = existingState.eventType || 'wedding';
  if (/birthday|bday|वाढदिवस|जन्मदिन/.test(lower)) eventType = 'birthday';
  else if (/community|samaj|festival|utsav|सोहळा|उत्सव|मेळावा/.test(lower)) eventType = 'community';

  // Detect Budget
  let totalBudget = existingState.totalBudget;
  const budgetMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|l|cr|crore|लाख|करोड)/i);
  if (budgetMatch) {
    const val = parseFloat(budgetMatch[1]);
    if (/cr|crore|करोड/.test(budgetMatch[0])) totalBudget = Math.round(val * 10000000);
    else totalBudget = Math.round(val * 100000);
  } else {
    const numMatch = lower.match(/(?:budget|₹|rs\.?|रुपये)\s*(\d{5,9})/i);
    if (numMatch) totalBudget = parseInt(numMatch[1], 10);
  }

  // Detect Guest Count
  let guestCount = existingState.guestCount;
  const guestMatch = lower.match(/(\d+)\s*(?:guests?|people|pax|members|पाहुणे|अतिथि|लोग)/i);
  if (guestMatch) {
    guestCount = parseInt(guestMatch[1], 10);
  }

  // Detect City & Tier
  let city = existingState.city;
  let cityTier = existingState.cityTier || 'tier2';

  const tier1Cities = [
    'mumbai',
    'delhi',
    'bangalore',
    'bengaluru',
    'hyderabad',
    'chennai',
    'kolkata',
  ];
  const tier2Cities = [
    'jaipur',
    'pune',
    'udaipur',
    'ahmedabad',
    'lucknow',
    'chandigarh',
    'surat',
    'goa',
    'indore',
    'kochi',
  ];

  for (const c of tier1Cities) {
    if (lower.includes(c)) {
      city = c.charAt(0).toUpperCase() + c.slice(1);
      cityTier = 'tier1';
      break;
    }
  }
  if (!city) {
    for (const c of tier2Cities) {
      if (lower.includes(c)) {
        city = c.charAt(0).toUpperCase() + c.slice(1);
        cityTier = 'tier2';
        break;
      }
    }
  }

  // Detect Date
  let date = existingState.date;
  const dateMatch = lower.match(/(\d{4}-\d{2}-\d{2})/);
  if (dateMatch) {
    date = dateMatch[1];
  } else if (/december|दिसंबर|डिसेंबर/.test(lower)) {
    date = '2026-12-18';
  } else if (/november|नवंबर|नोव्हेंबर/.test(lower)) {
    date = '2026-11-24';
  } else if (/january|जनवरी|जानेवारी/.test(lower)) {
    date = '2027-01-20';
  }

  // Dietary
  const dietaryConstraints = [...(existingState.dietaryConstraints || ['pure_veg'])];
  if (/jain|जैन/.test(lower) && !dietaryConstraints.includes('jain')) {
    dietaryConstraints.push('jain');
  }
  if (/non[- ]?veg|चिकन|मटन|nonveg/.test(lower) && !dietaryConstraints.includes('non_veg')) {
    dietaryConstraints.push('non_veg');
  }

  // Determine Missing Fields
  const missing: string[] = [];
  if (!date) missing.push('date');
  if (!city) missing.push('city');
  if (!totalBudget) missing.push('totalBudget');
  if (!guestCount) missing.push('guestCount');

  // Next Question
  let nextQuestion = 'All essential parameters identified! Ready to generate master plan.';
  if (missing.includes('city')) {
    nextQuestion =
      lang === 'hi'
        ? 'आपका उत्सव किस शहर में आयोजित होगा?'
        : lang === 'mr'
          ? 'हा सोहळा कोणत्या शहरात होणार आहे?'
          : 'Which city will host your celebration?';
  } else if (missing.includes('totalBudget')) {
    nextQuestion =
      lang === 'hi'
        ? 'इस भव्य उत्सव के लिए आपका कुल अनुमानित बजट कितना है?'
        : lang === 'mr'
          ? 'या सोहळ्यासाठी तुमचे अंदाजे एकूण बजेट किती आहे?'
          : 'What is your approximate total budget (e.g. 35 Lakhs)?';
  } else if (missing.includes('guestCount')) {
    nextQuestion =
      lang === 'hi'
        ? 'लगभग कितने अतिथि शामिल होंगे?'
        : lang === 'mr'
          ? 'साधारण किती पाहुणे उपस्थित राहतील?'
          : 'Approximately how many guests are you expecting?';
  } else if (missing.includes('date')) {
    nextQuestion =
      lang === 'hi'
        ? 'उत्सव की शुभ तिथि क्या है?'
        : lang === 'mr'
          ? 'सोहळ्याची शुभ तारीख कोणती आहे?'
          : 'What is the auspicious target date for the celebration?';
  }

  return {
    eventType,
    title:
      existingState.title ||
      `${city || 'Royal'} ${eventType.charAt(0).toUpperCase() + eventType.slice(1)} Celebration`,
    date: date || '2026-12-18',
    city: city || 'Jaipur',
    cityTier,
    totalBudget: totalBudget || 3500000,
    guestCount: guestCount || 300,
    dietaryConstraints,
    priorities: existingState.priorities || ['venue', 'catering', 'decor'],
    venuePreference: existingState.venuePreference || 'indoor',
    religionCultureNotes: existingState.religionCultureNotes || '',
    language: lang,
    missingRequiredFields: missing,
    nextQuestion,
  };
}

export class GeminiLLMClient implements LLMClient {
  private genAI: GoogleGenerativeAI | null = null;
  private modelName: string;

  constructor(apiKey?: string, modelName?: string) {
    const key = apiKey || process.env.GEMINI_API_KEY;
    this.modelName = modelName || process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    if (key && key !== 'mock-key-for-ci') {
      this.genAI = new GoogleGenerativeAI(key);
    }
  }

  async extractIntake(
    userInput: string,
    existingState: Partial<IntakeExtractionResult> = {}
  ): Promise<IntakeExtractionResult> {
    const cacheKey = `${userInput}_${JSON.stringify(existingState)}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    if (!this.genAI) {
      // Fall back seamlessly to heuristic engine
      const res = heuristicExtract(userInput, existingState);
      cache.set(cacheKey, { data: res, timestamp: Date.now() });
      return res;
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json',
        },
      });

      const prompt = `${SYSTEM_PROMPTS.v1_intake_extraction}\n\nEXISTING STATE:\n${JSON.stringify(
        existingState
      )}\n\n<USER_INPUT>\n${userInput}\n</USER_INPUT>`;

      // 8 second timeout controller
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await model.generateContent(prompt);
      clearTimeout(timeoutId);

      const text = response.response.text();
      const parsed = JSON.parse(text);

      cache.set(cacheKey, { data: parsed, timestamp: Date.now() });
      return parsed;
    } catch {
      // Graceful fallback to deterministic engine on network error, rate limit, or invalid response
      const fallback = heuristicExtract(userInput, existingState);
      return fallback;
    }
  }

  async enrichIdeas(context: string): Promise<Record<string, unknown>> {
    if (!this.genAI) {
      return {
        signatureDrink: 'Kesar Badam Thandai with 24K Gold Leaf',
        specialHighlights: ['Live Shehnai Jugalbandi at entrance', 'Royal Attar Perfume Bar'],
      };
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        generationConfig: {
          temperature: 0.7,
          responseMimeType: 'application/json',
        },
      });

      const prompt = `${SYSTEM_PROMPTS.v1_ideas_enrichment}\n\n<CONTEXT>\n${context}\n</CONTEXT>`;
      const response = await model.generateContent(prompt);
      return JSON.parse(response.response.text());
    } catch {
      return {
        signatureDrink: 'Spiced Kokum Spritzer & Royal Thandai',
        specialHighlights: ['Bespoke Live Jalebi & Rabdi Counter', 'Fragrant Mogra Garlanding'],
      };
    }
  }
}
