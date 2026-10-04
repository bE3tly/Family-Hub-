# Family Hub — a simulated Alexa+ voice assistant for households, with three modes: Productivity, Home & Lifestyle, and Education.

## WHAT IT DOES
The Family Hub allows users to switch between three modes: Productivity, Home & Lifestyle, and Education. It supports both voice and text interactions, with conversational memory maintained within each mode's session.

## TECH STACK
*   React
*   TypeScript
*   Tailwind CSS
*   Framer Motion
*   Vite
*   Groq API (openai/gpt-oss-120b)
*   Browser Web Speech API (SpeechRecognition + SpeechSynthesis)

## SETUP INSTRUCTIONS
1.  Clone the repository.
2.  Run `npm install`.
3.  Copy `.env.example` to `.env.local`.
4.  Get a free Groq API key at https://console.groq.com/keys
5.  Add the key to `.env.local` as `VITE_GROQ_API_KEY=your_key_here`
6.  Run `npm run dev`.
7.  Open the local URL shown in the terminal.

## HOW TO USE IT
Switch between the three modes using the tabs at the top, type or use the microphone icon to interact, responses can be heard aloud via the speaker toggle.

## VOICE FEATURE NOTES
Voice input/output uses the browser's native Web Speech API, works best in Chrome-based browsers, and gracefully falls back to text-only if unsupported.

## NOTE ON DEMO VIDEO
A full working demonstration is available in the submission's demo video. This repository is provided for code review and so reviewers can run the project independently if desired.

## PROJECT STRUCTURE
*   `src/services/assistant.ts`: Handles all Groq API calls, organized by mode.
*   `src/components/`: React components.
*   `src/types/`: TypeScript type definitions.
