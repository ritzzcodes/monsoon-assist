import { GoogleGenAI } from '@google/genai';
import { validateInput } from '../../../lib/validation.mjs';
import { checkRateLimit } from '../../../lib/rateLimit.mjs';

const SYSTEM_PROMPT = `You are MonsoonReady, an expert monsoon preparedness advisor for India. Generate a comprehensive, personalized monsoon preparedness plan.

Respond in valid JSON with this exact structure:
{
  "planTitle": "Monsoon Preparedness Plan for [City]",
  "familySummary": "Brief summary of the family's situation",
  "beforeMonsoon": ["action item 1", "action item 2"],
  "duringMonsoon": ["action item 1", "action item 2"],
  "afterMonsoon": ["action item 1", "action item 2"],
  "emergencyChecklist": ["item 1", "item 2"],
  "emergencyContacts": [{"name": "Service Name", "number": "Phone Number"}],
  "safetyDos": ["do 1", "do 2"],
  "safetyDonts": ["don't 1", "don't 2"]
}

Rules:
- Tailor ALL advice to the specific city, housing type, family size, and concerns provided.
- Include region-specific emergency contacts (NDRF: 011-24363260, SDRF, local municipal helplines).
- For ground floor and kutcha housing, emphasize flood evacuation plans.
- For elderly/children concerns, include specific medical preparedness items.
- Emergency checklist should have 10-15 actionable items.
- Each section should have 5-8 specific, actionable items.
- Respond ENTIRELY in the requested language. The JSON keys must stay in English, but all values must be in the requested language.
- Be practical, specific, and actionable. Avoid generic advice.`;

const PLAN_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    planTitle: { type: 'string' },
    familySummary: { type: 'string' },
    beforeMonsoon: {
      type: 'array',
      items: { type: 'string' }
    },
    duringMonsoon: {
      type: 'array',
      items: { type: 'string' }
    },
    afterMonsoon: {
      type: 'array',
      items: { type: 'string' }
    },
    emergencyChecklist: {
      type: 'array',
      items: { type: 'string' }
    },
    emergencyContacts: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          number: { type: 'string' }
        },
        required: ['name', 'number']
      }
    },
    safetyDos: {
      type: 'array',
      items: { type: 'string' }
    },
    safetyDonts: {
      type: 'array',
      items: { type: 'string' }
    }
  },
  required: [
    'planTitle',
    'familySummary',
    'beforeMonsoon',
    'duringMonsoon',
    'afterMonsoon',
    'emergencyChecklist',
    'emergencyContacts',
    'safetyDos',
    'safetyDonts'
  ]
};

export async function POST(request) {
  try {
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown';

    if (!checkRateLimit(ip)) {
      return Response.json(
        { error: 'Too many requests. Please wait a minute before trying again.' },
        { status: 429 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: 'Gemini API key is not configured. Please set the GEMINI_API_KEY environment variable.' },
        { status: 500 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    const validation = validateInput(body || {});
    if (!validation.isValid) {
      const firstErrorMsg = Object.values(validation.errors)[0];
      return Response.json({ error: firstErrorMsg }, { status: 400 });
    }

    const { city, familySize, housingType, concerns, language } = validation.sanitized;
    const concernsStr = concerns.join(', ');
    const userMessage = `City: ${city}, Family Size: ${familySize}, Housing: ${housingType}, Concerns: ${concernsStr}, Language: ${language}`;

    const ai = new GoogleGenAI({ apiKey });

    let planData = null;
    let attempts = 0;
    const maxAttempts = 2;
    let lastError = null;

    while (attempts < maxAttempts) {
      try {
        attempts++;
        console.log(`Calling Gemini API (Attempt ${attempts} of ${maxAttempts})...`);

        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: userMessage,
          config: {
            systemInstruction: SYSTEM_PROMPT,
            responseMimeType: 'application/json',
            responseSchema: PLAN_RESPONSE_SCHEMA,
            temperature: 0.7,
          },
        });

        const text = response.text;
        console.log(`Raw Gemini response (Attempt ${attempts}):`, text);

        let cleanedText = text ? text.trim() : '';
        if (cleanedText.startsWith('```')) {
          cleanedText = cleanedText.replace(/^```(?:json)?\n?/i, '');
          if (cleanedText.endsWith('```')) {
            cleanedText = cleanedText.slice(0, -3);
          }
          cleanedText = cleanedText.trim();
        }

        planData = JSON.parse(cleanedText);

        // Schema validation checklist key check
        const requiredKeys = ['planTitle', 'familySummary', 'beforeMonsoon', 'duringMonsoon', 'afterMonsoon', 'emergencyChecklist', 'emergencyContacts', 'safetyDos', 'safetyDonts'];
        const hasAllKeys = requiredKeys.every((key) => planData && planData[key] !== undefined);

        if (!hasAllKeys) {
          throw new Error('Parsed response missing required schema fields.');
        }

        // Successfully parsed and validated!
        break;
      } catch (err) {
        lastError = err;
        console.error(`Attempt ${attempts} failed:`, err);
        if (attempts >= maxAttempts) {
          break;
        }
        // Small delay before retrying
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    if (!planData) {
      console.error('All Gemini API attempts failed. Last error details:', lastError);
      return Response.json(
        { error: 'Failed to parse AI response. Please try again.' },
        { status: 500 }
      );
    }

    return Response.json(planData);
  } catch (error) {
    console.error('Unexpected POST Handler Error:', error);
    return Response.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
