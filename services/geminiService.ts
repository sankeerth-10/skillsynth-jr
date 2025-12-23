
import { GoogleGenAI, Type } from "@google/genai";
import { Module } from "../types.ts";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const adaptModuleContent = async (module: Module, grade: string) => {
  const gradeNum = parseInt(grade) || 8;
  const systemInstruction = `
    You are an AI Education Specialist. Your task is to adapt a soft-skills lesson for a student in Grade ${gradeNum}.
    Return a JSON object with updated 'content', 'learningPoints', and 'examples'.
    Ensure 'learningPoints' has exactly 8 items.
  `;
  const prompt = `Adapt this module for a Grade ${gradeNum} student:\n${JSON.stringify(module)}`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { 
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            content: { type: Type.STRING },
            learningPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            examples: { type: Type.ARRAY, items: { type: Type.STRING } }
          },
          required: ["content", "learningPoints", "examples"]
        }
      }
    });
    const adaptedData = JSON.parse(response.text || "{}");
    return { ...module, ...adaptedData };
  } catch (error) {
    console.error("Content Adaptation Error:", error);
    return module;
  }
};

export const evolveModuleContent = async (module: Module, grade: string) => {
  const systemInstruction = `
    You are an AI Mastery Architect. The student has mastered the basic version of "${module.title}".
    Generate "Level 2: Advanced Concepts" for this module.
    Focus on complex scenarios, nuance, and professional-level soft skills appropriate for Grade ${grade}.
    Return a JSON object with a NEW 'title', 'content', 'learningPoints', and 'quizzes'.
  `;
  const prompt = `Evolve this module to an advanced level:\n${JSON.stringify(module)}`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { 
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING },
            learningPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
            quizzes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  correctAnswer: { type: Type.NUMBER }
                },
                required: ["id", "question", "options", "correctAnswer"]
              }
            }
          },
          required: ["title", "content", "learningPoints", "quizzes"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Module Evolution Error:", error);
    return null;
  }
};

export const generateAdaptiveQuestion = async (history: { question: string, answer: string }[], step: number, pastQuestions: string[] = [], grade: string = '8') => {
  const systemInstruction = `
    You are a friendly AI Mentor for school kids (Grades 6-12). 
    Ask ONLY ONE simple, short, relatable soft-skill question.
  `;
  const context = history.map(h => `Q: ${h.question}\nA: ${h.answer}`).join('\n\n');
  const prompt = history.length === 0 
    ? `Ask a first easy question for a Grade ${grade} student.` 
    : `The student said:\n${context}\n\nAsk the NEXT easy question (Step ${step + 1}).`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { systemInstruction, temperature: 0.8 }
    });
    return response.text?.trim().replace(/^"/, '').replace(/"$/, '') || "How do you handle a tough school project?";
  } catch (error) {
    return "What is your favorite way to work with a team?";
  }
};

export const getAssessmentFeedback = async (history: { question: string, answer: string }[]) => {
  const systemInstruction = `
    Perform a HIGH-SPEED NEURAL AUDIT. Be concise but deep. 
    Use the FASTEST analysis possible.
    Evaluate: Communication, Confidence, Teamwork, Problem Solving, Leadership, Empathy, Resilience.
    Analyze Vocal Dynamics: Pace (1-100), Energy (1-100), Fillers.
    Generate a 3-step actionable Growth Roadmap.
  `;
  const transcript = history.map(h => `Q: ${h.question}\nA: ${h.answer}`).join('\n\n');
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", // Switched to FLASH for speed
      contents: `Audit this transcript immediately:\n\n${transcript}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 }, // Disable thinking for ultra-low latency
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            feedback: { type: Type.STRING },
            scores: {
              type: Type.OBJECT,
              properties: {
                communication: { type: Type.NUMBER },
                confidence: { type: Type.NUMBER },
                teamwork: { type: Type.NUMBER },
                problemSolving: { type: Type.NUMBER },
                leadership: { type: Type.NUMBER },
                empathy: { type: Type.NUMBER },
                resilience: { type: Type.NUMBER }
              },
              required: ["communication", "confidence", "teamwork", "problemSolving", "leadership", "empathy", "resilience"]
            },
            speechAnalysis: {
              type: Type.OBJECT,
              properties: {
                paceScore: { type: Type.NUMBER },
                paceDescription: { type: Type.STRING },
                energyLevel: { type: Type.NUMBER },
                fillerWordsLevel: { type: Type.STRING }
              },
              required: ["paceScore", "paceDescription", "energyLevel", "fillerWordsLevel"]
            },
            strengths: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT,
                properties: { title: { type: Type.STRING }, description: { type: Type.STRING } }
              } 
            },
            weaknesses: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT,
                properties: { title: { type: Type.STRING }, description: { type: Type.STRING } }
              } 
            },
            growthRoadmap: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT,
                properties: { step: { type: Type.NUMBER }, goal: { type: Type.STRING }, action: { type: Type.STRING } }
              } 
            },
            aiVision: { type: Type.STRING }
          },
          required: ["feedback", "scores", "speechAnalysis", "strengths", "weaknesses", "growthRoadmap", "aiVision"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Assessment Error:", error);
    return null;
  }
};
