import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function extractRateCardDataOpenAI(text: string): Promise<any> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a data extraction specialist. Extract rate card information from the provided text and return it in JSON format with the following structure:
          
          {
            "mediaTypes": [
              {
                "type": "string (e.g., 'Print', 'Digital', 'Radio', 'TV', 'Outdoor')",
                "placements": [
                  {
                    "name": "string (placement name/description)",
                    "size": "string (dimensions or duration)",
                    "baseRate": "number (price without discounts)",
                    "discountedRate": "number (price with discounts, if applicable)",
                    "currency": "string (e.g., 'USD', 'EUR')",
                    "unit": "string (e.g., 'per month', 'per week', 'per spot')",
                    "notes": "string (additional information)"
                  }
                ]
              }
            ],
            "validityPeriod": "string (when rates are valid)",
            "contactInfo": "string (sales contact information)",
            "additionalTerms": "string (important terms and conditions)"
          }
          
          Extract all pricing information, media types, placement options, and relevant details. If certain information is not available, use null values.`
        },
        {
          role: "user",
          content: text,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return result;
  } catch (error) {
    console.error("OpenAI extraction error:", error);
    throw new Error("Failed to extract rate card data using OpenAI: " + error.message);
  }
}

export async function analyzeImageOpenAI(base64Image: string): Promise<string> {
  try {
    const visionResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this image and extract any rate card information, pricing details, media types, or advertising specifications. Provide a detailed text description of all relevant information."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ],
        },
      ],
      max_tokens: 1000,
    });

    return visionResponse.choices[0].message.content || '';
  } catch (error) {
    console.error("OpenAI image analysis error:", error);
    throw new Error("Failed to analyze image using OpenAI: " + error.message);
  }
}