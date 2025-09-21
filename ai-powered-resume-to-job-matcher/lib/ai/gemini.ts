/**
 * Gemini API integration for AI-powered resume to job matching
 */

if (!process.env.GEMINI_API_KEY) {
  throw new Error('Missing environment variable: GEMINI_API_KEY');
}

const API_KEY = process.env.GEMINI_API_KEY;
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

/**
 * Analyze a resume and extract key information
 * @param resumeText The text content of the resume
 */
export async function analyzeResume(resumeText: string) {
  const prompt = `
    Analyze the following resume and extract key information in JSON format:
    - skills (array of strings)
    - experience (array of objects with company, title, duration, and description)
    - education (array of objects with institution, degree, field, and year)
    - certifications (array of strings)
    
    Resume text:
    ${resumeText}
  `;

  const response = await callGeminiAPI(prompt);
  return JSON.parse(response);
}

/**
 * Match a resume to job descriptions
 * @param resumeAnalysis The analyzed resume data
 * @param jobDescriptions Array of job descriptions to match against
 */
export async function matchResumeToJobs(resumeAnalysis: any, jobDescriptions: any[]) {
  const prompt = `
    Given the following resume analysis and job descriptions, rank the jobs from most to least suitable match.
    For each job, provide a match score (0-100) and brief explanation of the match.
    
    Resume analysis:
    ${JSON.stringify(resumeAnalysis)}
    
    Job descriptions:
    ${JSON.stringify(jobDescriptions)}
    
    Return the results as a JSON array of objects with the following properties:
    - jobId
    - matchScore (0-100)
    - matchReason (string explaining the match)
  `;

  const response = await callGeminiAPI(prompt);
  return JSON.parse(response);
}

/**
 * Generate improvement suggestions for a resume based on a job description
 * @param resumeText The text content of the resume
 * @param jobDescription The job description
 */
export async function generateResumeImprovements(resumeText: string, jobDescription: string) {
  const prompt = `
    Given the following resume and job description, provide specific suggestions to improve the resume
    to better match the job requirements. Focus on:
    - Skills that should be highlighted or added
    - Experience that should be emphasized
    - Format or structure improvements
    - Keywords that should be included
    
    Resume text:
    ${resumeText}
    
    Job description:
    ${jobDescription}
    
    Return the suggestions as a JSON object with the following properties:
    - skillSuggestions (array of strings)
    - experienceSuggestions (array of strings)
    - formatSuggestions (array of strings)
    - keywordSuggestions (array of strings)
  `;

  const response = await callGeminiAPI(prompt);
  return JSON.parse(response);
}

/**
 * Helper function to call the Gemini API
 * @param prompt The prompt to send to the API
 */
async function callGeminiAPI(prompt: string): Promise<string> {
  const url = `${API_URL}?key=${API_KEY}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json() as GeminiResponse;
  return data.candidates[0].content.parts[0].text;
}