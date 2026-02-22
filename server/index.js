// Server commented out – using CopilotKit Cloud. Uncomment below for self-hosted Gemini.
/*
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import {
  CopilotRuntime,
  GoogleGenerativeAIAdapter,
  copilotRuntimeNodeExpressEndpoint,
} from '@copilotkit/runtime';

const PORT = Number(process.env.PORT) || 3001;
const API_KEY = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

if (!API_KEY) {
  console.error('Missing GOOGLE_GENERATIVE_AI_API_KEY in environment.');
  process.exit(1);
}

const runtime = new CopilotRuntime();
const serviceAdapter = new GoogleGenerativeAIAdapter({
  apiKey: API_KEY,
  model: 'gemini-1.5-flash',
  apiVersion: 'v1',
});
runtime.handleServiceAdapter(serviceAdapter);

const copilotHandler = copilotRuntimeNodeExpressEndpoint({
  runtime,
  serviceAdapter,
  endpoint: '/api/copilotkit',
  cors: { origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] },
});

const app = express();
app.use(cors({ origin: ['http://localhost:5173', 'http://127.0.0.1:5173'] }));
app.post('/api/copilotkit', (req, res) => {
  copilotHandler(req, res);
});

app.listen(PORT, () => {
  console.log(`CopilotKit runtime (Gemini) at http://localhost:${PORT}/api/copilotkit`);
});
*/
console.log('Server is commented out. Using CopilotKit Cloud – set VITE_COPILOT_CLOUD_API_KEY in .env and run npm run dev.');
