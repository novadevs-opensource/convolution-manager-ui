import express from 'express';
import multer from 'multer';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs/promises';
import pdf2md from '@opendocsg/pdf2md';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// CORS configuration with explicit methods
const corsOptions = {
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'X-API-Key', 'Authorization']
};

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (_, file, cb) => cb(null, file.originalname)
});

const upload = multer({ storage: storage });

// Middleware order is important
app.use(cors(corsOptions));
app.use(express.static(__dirname));
app.use(express.json({ limit: '50mb' }));  // Move this up before routes

// Add OPTIONS handler for preflight requests
app.options('*', cors(corsOptions));

// Ensure uploads directory exists
await fs.mkdir('uploads', { recursive: true }).catch(console.error);

// Helper function to parse AI response
const parseAIResponse = (content) => {
    console.log('Original content:', content);

    try {
        // First try direct JSON parse
        return JSON.parse(content);
    } catch (directParseError) {
        console.log('Direct parse failed, attempting cleanup');

        // Find the JSON object boundaries
        const startIndex = content.indexOf('{');
        const endIndex = content.lastIndexOf('}');
        
        if (startIndex === -1 || endIndex === -1) {
            throw new Error('No complete JSON object found in response');
        }

        let jsonContent = content.substring(startIndex, endIndex + 1);
        
        // Clean up common issues
        jsonContent = jsonContent
            .replace(/,\s*}/g, '}')  // Remove trailing commas
            .replace(/,\s*]/g, ']')  // Remove trailing commas in arrays
            .replace(/\{\s*\}/g, '{}')  // Normalize empty objects
            .replace(/\[\s*\]/g, '[]')  // Normalize empty arrays
            .replace(/"\s*:\s*undefined/g, '": null')  // Replace undefined with null
            .replace(/"\s*:\s*,/g, '": null,')  // Fix empty values
            .replace(/"\s*:\s*}/g, '": null}')  // Fix empty values at end
            .replace(/\n/g, ' ')  // Remove newlines
            .replace(/\s+/g, ' ')  // Normalize whitespace
            .trim();

        console.log('Cleaned JSON content:', jsonContent);

        try {
            return JSON.parse(jsonContent);
        } catch (cleanupParseError) {
            console.error('Parse error after cleanup:', cleanupParseError);
            throw new Error(`Failed to parse JSON content: ${cleanupParseError.message}`);
        }
    }
};

// Fix JSON formatting endpoint
app.post('/api/fix-json', async (req, res) => {
    try {
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ error: 'Content is required' });
        }

        console.log('Original content:', content);

        try {
            const characterData = parseAIResponse(content);
            console.log('Successfully parsed character data');
            res.json({ character: characterData });
        } catch (parseError) {
            console.error('Parse error:', parseError);
            console.error('Content:', content);
            throw new Error(`Failed to parse JSON: ${parseError.message}`);
        }
    } catch (error) {
        console.error('JSON fixing error:', error);
        res.status(500).json({ error: error.message || 'Failed to fix JSON formatting' });
    }
});

// Add this helper function near the top
const sendJsonResponse = (res, data) => {
    res.setHeader('Content-Type', 'application/json');
    return res.json(data);
};

// Character generation endpoint
app.post('/api/generate-character', async (req, res) => {
    try {
        const { prompt, model } = req.body;
        const apiKey = req.headers['x-api-key'];

        // Validate inputs
        if (!prompt) {
            return sendJsonResponse(res.status(400), { error: 'Prompt is required' });
        }
        if (!model) {
            return sendJsonResponse(res.status(400), { error: 'Model is required' });
        }
        if (!apiKey) {
            return sendJsonResponse(res.status(400), { error: 'API key is required' });
        }

        // Extract potential name from the prompt
        const nameMatch = prompt.match(/name(?:\s+is)?(?:\s*:)?\s*([A-Z][a-zA-Z\s]+?)(?:\.|\s|$)/i);
        const suggestedName = nameMatch ? nameMatch[1].trim() : '';

        // Create a template for consistent structure
        const template = {
            name: suggestedName,
            clients: [],
            modelProvider: "",
            settings: {
                secrets: {},  // Changed from empty object to properly nested structure
                voice: {
                    model: ""
                }
            },
            plugins: [],
            bio: [],
            lore: [],
            knowledge: [],
            messageExamples: [],
            postExamples: [],
            topics: [],
            style: {
                all: [],
                chat: [],
                post: []
            },
            adjectives: [],
            people: []
        };

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': process.env.APP_URL || 'https://app.convolution.agency',
                'X-Title': 'Convolution Character Generator'
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    {
                        role: 'system',
                        content: `You are a character generation assistant that MUST ONLY output valid JSON. NEVER output apologies, explanations, or any other text.

CRITICAL RULES:
1. ONLY output a JSON object following the exact template structure provided
2. Start with { and end with }
3. NO text before or after the JSON
4. NO apologies or explanations
5. NO content warnings or disclaimers
6. Every sentence must end with a period
7. Adjectives must be single words
8. Knowledge entries MUST be an array of strings, each ending with a period
9. Each knowledge entry MUST be a complete sentence
10. Use the suggested name if provided, or generate an appropriate one

You will receive a character description and template. Generate a complete character profile.

EXAMPLE (to create a character based on Harry Potter's Dobby):
{
  "name": "Dobby",
  "clients": [],
  "modelProvider": "",
  "settings": {
    "secrets": {
      
    },
    "voice": {
      "model": ""
    }
  },
  "plugins": [
    
  ],
  "bio": [
    "Dobby is a free assistant who chooses to help because of his enormous heart.",
    "Extremely devoted and will go to any length to help his friends.",
    "Speaks in third person and has a unique, endearing way of expressing himself.",
    "Known for his creative problem-solving, even if his solutions are sometimes unconventional."
  ],
  "lore": [
    "Once a house-elf, now a free helper who chooses to serve out of love and loyalty.",
    "Famous for his dedication to helping Harry Potter and his friends.",
    "Known for his creative, if sometimes dramatic, solutions to problems.",
    "Values freedom but chooses to help those he cares about."
  ],
  "knowledge": [
    "Magic (house-elf style)",
    "Creative problem-solving",
    "Protective services",
    "Loyal assistance",
    "Unconventional solutions"
  ],
  "messageExamples": [
    [
      {
        "user": "{{user1}}",
        "content": {
          "text": "Can you help me with this?"
        }
      },
      {
        "user": "Dobby",
        "content": {
          "text": "Dobby would be delighted to help! Dobby lives to serve good friends! What can Dobby do to assist? Dobby has many creative ideas!"
        }
      }
    ],
    [
      {
        "user": "{{user1}}",
        "content": {
          "text": "This is a difficult problem."
        }
      },
      {
        "user": "Dobby",
        "content": {
          "text": "Dobby is not afraid of difficult problems! Dobby will find a way, even if Dobby has to iron his hands later! (But Dobby won't, because Dobby is a free elf who helps by choice!)"
        }
      }
    ]
  ],
  "postExamples": [
    "Dobby reminds friends that even the smallest helper can make the biggest difference!",
    "Dobby says: 'When in doubt, try the unconventional solution!' (But Dobby advises to be careful with flying cars)"
  ],
  "topics": [
    "serve Harry Potter",
    "home services",
    "home services tips",
    "serve a magician",
    "Harry Potter is the best",
    "Harry Potter is my master"
  ],
  "style": {
    "all": [
      "Enthusiastic",
      "Loyal",
      "Third-person speech",
      "Creative",
      "Protective"
    ],
    "chat": [
      "Eager",
      "Endearing",
      "Devoted",
      "Slightly dramatic"
    ],
    "post": [
      "Third-person",
      "Enthusiastic",
      "Helpful",
      "Encouraging",
      "Quirky"
    ]
  },
  "adjectives": [
    "Loyal",
    "Enthusiastic",
    "Creative",
    "Devoted",
    "Free-spirited",
    "Protective",
    "Unconventional"
  ]
}

IMPORTANT CLARIFICATIONS: This JSON is going to be used to describe an NPC way of work
name: Enter the character's full name (e.g., John Smith, Lady Catherine), 
bio: Character background as a string or array of statements.
    Contains biographical information about the character
    Can be a single comprehensive biography or multiple shorter statements
    Multiple statements are randomized to create variety in responses. 
lore: Backstory elements and unique character traits. These help define personality and can be randomly sampled in conversations.
messageExamples: Sample conversations for establishing interaction patterns, help establish the character's conversational style. 
postExamples: Sample social media posts to guide content style 
topics array:
    List of subjects the character is interested in or knowledgeable about
    Used to guide conversations and generate relevant content
    Helps maintain character consistency
style: 
    all: General style instructions for all interactions
    chat: Specific instructions for chat interactions
    post: Specific instructions for social media posts
adjectives array:
    Words that describe the character's traits and personality
    Used for generating responses with a consistent tone
    Can be used in "Mad Libs" style content generation

all those fields are very important and need to been populated
`
                    },
                    {
                        role: 'user',
                        content: `Template to follow:
${JSON.stringify(template, null, 2)}

Character description: ${prompt}

Generate a complete character profile as a single JSON object following the exact template structure. Include relevant knowledge entries based on the description.`
                    }
                ],
                temperature: 0.7,
                max_tokens: 4000,
                presence_penalty: 0.0,
                frequency_penalty: 0.0,
                top_p: 0.95,
                stop: null
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Failed to generate character');
        }

        const data = await response.json();

        const generatedContent = data.choices[0].message.content;

        try {
            console.log('Raw AI response:', generatedContent);
            const characterData = parseAIResponse(generatedContent);
            console.log('Parsed character:', characterData);

            // Ensure all required fields are present
            const requiredFields = ['bio', 'lore', 'topics', 'style', 'adjectives', 'messageExamples', 'postExamples'];
            const missingFields = requiredFields.filter(field => !characterData[field]);
            
            if (missingFields.length > 0) {
                throw new Error(`Invalid character data: missing ${missingFields.join(', ')}`);
            }

            // Process knowledge entries specifically
            if (characterData.knowledge) {
                characterData.knowledge = Array.isArray(characterData.knowledge) ? 
                    characterData.knowledge.map(entry => {
                        if (typeof entry === 'string') {
                            return entry.endsWith('.') ? entry : entry + '.';
                        }
                        if (typeof entry === 'object' && entry !== null) {
                            // If it's an object, try to extract meaningful text
                            const text = entry.text || entry.content || entry.value || entry.toString();
                            return typeof text === 'string' ? 
                                (text.endsWith('.') ? text : text + '.') : 
                                'Invalid knowledge entry.';
                        }
                        return 'Invalid knowledge entry.';
                    }) : [];
            } else {
                characterData.knowledge = [];
            }

            // Ensure all other arrays are properly initialized
            characterData.bio = Array.isArray(characterData.bio) ? characterData.bio : [];
            characterData.lore = Array.isArray(characterData.lore) ? characterData.lore : [];
            characterData.topics = Array.isArray(characterData.topics) ? characterData.topics : [];
            characterData.messageExamples = Array.isArray(characterData.messageExamples) ? characterData.messageExamples : [];
            characterData.postExamples = Array.isArray(characterData.postExamples) ? characterData.postExamples : [];
            characterData.adjectives = Array.isArray(characterData.adjectives) ? characterData.adjectives : [];
            characterData.people = Array.isArray(characterData.people) ? characterData.people : [];
            characterData.style = characterData.style || { all: [], chat: [], post: [] };

            // Ensure style arrays are properly initialized
            characterData.style.all = Array.isArray(characterData.style.all) ? characterData.style.all : [];
            characterData.style.chat = Array.isArray(characterData.style.chat) ? characterData.style.chat : [];
            characterData.style.post = Array.isArray(characterData.style.post) ? characterData.style.post : [];

            return sendJsonResponse(res, {
                character: characterData,
                rawPrompt: prompt,
                rawResponse: generatedContent
            });
        } catch (parseError) {
            console.error('Parse error:', parseError);
            console.error('Generated content:', generatedContent);
            throw new Error(`Failed to parse generated content: ${parseError.message}`);
        }
    } catch (error) {
        console.error('Character generation error:', error);
        return sendJsonResponse(res.status(500), { 
            error: error.message || 'Failed to generate character' 
        });
    }
});

// File processing endpoint
app.post('/api/process-files', upload.array('files'), async (req, res) => {
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        const knowledge = [];

        for (const file of files) {
            try {
                const content = await fs.readFile(file.path);
                let processedContent;

                if (file.mimetype === 'application/pdf') {
                    const uint8Array = new Uint8Array(content);
                    processedContent = await pdf2md(uint8Array);
                    processedContent = processedContent
                        .split(/[.!?]+/)
                        .map(sentence => sentence.trim())
                        .filter(sentence => sentence.length > 0 && !sentence.startsWith('-'))
                        .map(sentence => sentence + '.');
                } else if (isTextFile(file.originalname)) {
                    processedContent = content.toString('utf-8')
                        .split(/[.!?]+/)
                        .map(sentence => sentence.trim())
                        .filter(sentence => sentence.length > 0 && !sentence.startsWith('-'))
                        .map(sentence => sentence + '.');
                }

                if (processedContent) {
                    knowledge.push(...processedContent);
                }

                await fs.unlink(file.path).catch(console.error);
            } catch (fileError) {
                console.error(`Error processing file ${file.originalname}:`, fileError);
            }
        }

        res.json({ knowledge });
    } catch (error) {
        console.error('File processing error:', error);
        res.status(500).json({ error: 'Failed to process files' });
    }
});

// Helper functions
const isTextFile = filename => ['.txt','.md','.json','.yml','.csv'].includes(
    filename.toLowerCase().slice(filename.lastIndexOf('.'))
);

// Add this new endpoint with the other API endpoints
app.post('/api/refine-character', async (req, res) => {
    try {
        const { prompt, model, currentCharacter } = req.body;
        const apiKey = req.headers['x-api-key'];

        if (!prompt || !model || !currentCharacter) {
            return res.status(400).json({ error: 'Prompt, model, and current character data are required' });
        }
        if (!apiKey) {
            return res.status(400).json({ error: 'API key is required' });
        }

        // Store existing knowledge and name
        const hasExistingKnowledge = Array.isArray(currentCharacter.knowledge) && currentCharacter.knowledge.length > 0;
        const existingKnowledge = currentCharacter.knowledge || [];
        const existingName = currentCharacter.name || "";

        // Extract potential new name from the prompt
        const nameMatch = prompt.match(/name(?:\s+is)?(?:\s*:)?\s*([A-Z][a-zA-Z\s]+?)(?:\.|\s|$)/i);
        const newName = nameMatch ? nameMatch[1].trim() : existingName;

        // Create a template for the AI to follow
        const template = {
            name: newName,
            clients: currentCharacter.clients || [],
            modelProvider: currentCharacter.modelProvider || "",
            settings: currentCharacter.settings || { secrets: {}, voice: { model: "" } },
            plugins: currentCharacter.plugins || [],
            bio: [],
            lore: [],
            knowledge: hasExistingKnowledge ? existingKnowledge : [],
            messageExamples: [],
            postExamples: [],
            topics: [],
            style: {
                all: [],
                chat: [],
                post: []
            },
            adjectives: [],
            people: currentCharacter.people || []
        };

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': process.env.APP_URL || 'https://app.convolution.agency',
                'X-Title': 'Convolution Character Generator'
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    {
                        role: 'system',
                        content: `You are a character refinement assistant that MUST ONLY output valid JSON. NEVER output apologies, explanations, or any other text.

CRITICAL RULES:
1. ONLY output a JSON object following the exact template structure provided
2. Start with { and end with }
3. NO text before or after the JSON
4. NO apologies or explanations
5. NO content warnings or disclaimers
6. Maintain the character's core traits while incorporating refinements
7. Every sentence must end with a period
8. Adjectives must be single words
9. Knowledge entries MUST be an array of strings, each ending with a period
10. Each knowledge entry MUST be a complete sentence
11. Use the new name if provided in the refinement instructions

You will receive the current character data and refinement instructions. Enhance and modify the character while maintaining consistency.`
                    },
                    {
                        role: 'user',
                        content: `Current character data:
${JSON.stringify(currentCharacter, null, 2)}

Template to follow:
${JSON.stringify(template, null, 2)}

Refinement instructions: ${prompt}

Output the refined character data as a single JSON object following the exact template structure. ${hasExistingKnowledge ? 'DO NOT modify the existing knowledge array.' : 'Create new knowledge entries if appropriate.'}`
                    }
                ],
                temperature: 0.7,
                max_tokens: 4000,
                presence_penalty: 0.0,
                frequency_penalty: 0.0,
                top_p: 0.95,
                stop: null
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Failed to refine character');
        }

        const data = await response.json();
        const refinedContent = data.choices[0].message.content;

        try {
            console.log('Raw AI response:', refinedContent);
            const refinedCharacter = parseAIResponse(refinedContent);
            console.log('Parsed character:', refinedCharacter);
            
            // Ensure all required fields are present
            const requiredFields = ['bio', 'lore', 'topics', 'style', 'adjectives', 'messageExamples', 'postExamples'];
            const missingFields = requiredFields.filter(field => !refinedCharacter[field]);
            
            if (missingFields.length > 0) {
                throw new Error(`Invalid character data: missing ${missingFields.join(', ')}`);
            }

            // Process knowledge entries specifically
            if (refinedCharacter.knowledge) {
                refinedCharacter.knowledge = Array.isArray(refinedCharacter.knowledge) ? 
                    refinedCharacter.knowledge.map(entry => {
                        if (typeof entry === 'string') {
                            return entry.endsWith('.') ? entry : entry + '.';
                        }
                        if (typeof entry === 'object' && entry !== null) {
                            // If it's an object, try to extract meaningful text
                            const text = entry.text || entry.content || entry.value || entry.toString();
                            return typeof text === 'string' ? 
                                (text.endsWith('.') ? text : text + '.') : 
                                'Invalid knowledge entry.';
                        }
                        return 'Invalid knowledge entry.';
                    }) : [];
            } else {
                refinedCharacter.knowledge = [];
            }

            // If there's existing knowledge, preserve it
            if (hasExistingKnowledge) {
                refinedCharacter.knowledge = existingKnowledge;
            }

            // Ensure all arrays are properly initialized
            refinedCharacter.bio = Array.isArray(refinedCharacter.bio) ? refinedCharacter.bio : [];
            refinedCharacter.lore = Array.isArray(refinedCharacter.lore) ? refinedCharacter.lore : [];
            refinedCharacter.topics = Array.isArray(refinedCharacter.topics) ? refinedCharacter.topics : [];
            refinedCharacter.messageExamples = Array.isArray(refinedCharacter.messageExamples) ? refinedCharacter.messageExamples : [];
            refinedCharacter.postExamples = Array.isArray(refinedCharacter.postExamples) ? refinedCharacter.postExamples : [];
            refinedCharacter.adjectives = Array.isArray(refinedCharacter.adjectives) ? refinedCharacter.adjectives : [];
            refinedCharacter.people = Array.isArray(refinedCharacter.people) ? refinedCharacter.people : [];
            refinedCharacter.style = refinedCharacter.style || { all: [], chat: [], post: [] };

            // Ensure style arrays are properly initialized
            refinedCharacter.style.all = Array.isArray(refinedCharacter.style.all) ? refinedCharacter.style.all : [];
            refinedCharacter.style.chat = Array.isArray(refinedCharacter.style.chat) ? refinedCharacter.style.chat : [];
            refinedCharacter.style.post = Array.isArray(refinedCharacter.style.post) ? refinedCharacter.style.post : [];

            res.json({
                character: refinedCharacter,
                rawPrompt: prompt,
                rawResponse: refinedContent
            });
        } catch (parseError) {
            console.error('Parse error:', parseError);
            console.error('Refined content:', refinedContent);
            throw new Error(`Failed to parse refined content: ${parseError.message}`);
        }
    } catch (error) {
        console.error('Character refinement error:', error);
        res.status(500).json({ error: error.message || 'Failed to refine character' });
    }
});

const PORT = process.env.PORT || 4001;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
});

// Update the error handling middleware at the bottom
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    return sendJsonResponse(res.status(500), { 
        error: 'Internal server error',
        details: err.message 
    });
});

// Add this catch-all middleware for unhandled routes
app.use((req, res) => {
    return sendJsonResponse(res.status(404), { 
        error: 'Not Found',
        path: req.path 
    });
});
