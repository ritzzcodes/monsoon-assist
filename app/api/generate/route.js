import { GoogleGenAI } from '@google/genai';

const rateLimit = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMIT_MAX = 10;

function checkRateLimit(ip) {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;

  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, []);
  }

  const timestamps = rateLimit.get(ip).filter((t) => t > windowStart);
  rateLimit.set(ip, timestamps);

  if (timestamps.length >= RATE_LIMIT_MAX) {
    return false;
  }

  timestamps.push(now);
  return true;
}

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

    const { city, familySize, housingType, concerns, language } = body;

    if (!city || typeof city !== 'string' || city.trim().length === 0) {
      return Response.json({ error: 'City/Region is required.' }, { status: 400 });
    }
    if (city.trim().length > 100) {
      return Response.json({ error: 'City name must be under 100 characters.' }, { status: 400 });
    }

    const size = parseInt(familySize);
    if (isNaN(size) || size < 1 || size > 20) {
      return Response.json({ error: 'Family size must be between 1 and 20.' }, { status: 400 });
    }

    const validHousingTypes = ['Apartment', 'Independent House', 'Ground Floor', 'Slum / Kutcha House', 'Other'];
    if (!housingType || !validHousingTypes.includes(housingType)) {
      return Response.json({ error: 'Invalid housing type.' }, { status: 400 });
    }

    if (!Array.isArray(concerns) || concerns.length === 0) {
      return Response.json({ error: 'Please select at least one concern.' }, { status: 400 });
    }
    const concernsStr = concerns.join(', ');
    if (concernsStr.length > 500) {
      return Response.json({ error: 'Concerns text is too long.' }, { status: 400 });
    }

    const validLanguages = ['English', 'Hindi', 'Tamil', 'Telugu', 'Bengali', 'Marathi', 'Kannada', 'Malayalam', 'Gujarati', 'Odia', 'Punjabi', 'Assamese', 'Urdu'];
    const selectedLanguage = validLanguages.includes(language) ? language : 'English';

    const userMessage = `City: ${city.trim()}, Family Size: ${size}, Housing: ${housingType}, Concerns: ${concernsStr}, Language: ${selectedLanguage}`;

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: userMessage,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const text = response.text;
    console.log('Raw Gemini response:', text);

    // Clean JSON response (strip markdown code blocks if any)
    let cleanedText = text ? text.trim() : '';
    if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```(?:json)?\n?/i, '');
      if (cleanedText.endsWith('```')) {
        cleanedText = cleanedText.slice(0, -3);
      }
      cleanedText = cleanedText.trim();
    }

    let planData;
    try {
      planData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('JSON parsing failed. Raw response text was:', text);
      console.error('Parsing error details:', parseError);
      return Response.json(
        { error: 'Failed to parse AI response. Please try again.' },
        { status: 500 }
      );
    }

    return Response.json(planData);
  } catch (error) {
    console.error('API Error:', error);
    return Response.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
