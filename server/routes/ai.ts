import { Router, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import {
  risks, findings, controls, vendors, policies, biaProcesses, auditPrograms, nistStatus,
} from '../data/store.js';

const router = Router();

const MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

interface IncomingMessage {
  role: 'user' | 'assistant';
  text: string;
}

/** Compact, grounded snapshot of the current GRC posture for the model. */
function buildContext(): string {
  const openRisks = risks.filter(r => r.status === 'Open' || r.status === 'Mitigating');
  const topRisks = [...risks]
    .sort((a, b) => b.inherentImpact * b.inherentLikelihood - a.inherentImpact * a.inherentLikelihood)
    .slice(0, 5)
    .map(r => `${r.id} "${r.title}" [${r.category}] impact=${r.inherentImpact} likelihood=${r.inherentLikelihood} status=${r.status} owner=${r.owner}`);
  const openFindings = findings.filter(f => f.status !== 'Resolved' && f.status !== 'False Positive');
  const breached = findings.filter(f => f.slaBreached && f.status !== 'Resolved');
  const implemented = controls.filter(c => c.status === 'Implemented').length;
  const nist = nistStatus.map(n => `${n.function}=${n.score}%`).join(', ');
  const overdueAudits = auditPrograms.filter(a => a.status !== 'Archived').length;

  return [
    `NIST CSF 2.0 scores: ${nist}.`,
    `Risks: ${risks.length} total, ${openRisks.length} open/mitigating. Top by inherent score:`,
    ...topRisks.map(r => `  - ${r}`),
    `Findings: ${findings.length} total, ${openFindings.length} open, ${breached.length} SLA-breached.`,
    `Controls: ${controls.length} total, ${implemented} implemented (${Math.round((implemented / Math.max(controls.length, 1)) * 100)}% coverage).`,
    `Vendors: ${vendors.length} (${vendors.filter(v => v.residualRisk === 'Critical' || v.residualRisk === 'High').length} high/critical residual risk).`,
    `Policies: ${policies.length}. BIA processes: ${biaProcesses.length}. Active audits: ${overdueAudits}.`,
  ].join('\n');
}

router.post('/chat', async (req: Request, res: Response) => {
  const { messages, skills } = req.body as { messages?: IncomingMessage[]; skills?: string[] };
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages[] is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return res.json({
      configured: false,
      text:
        'The Aegis AI assistant is not configured yet. Add a valid GEMINI_API_KEY to the server environment ' +
        '(see .env.example) and restart the API to enable live, context-aware GRC analysis.',
    });
  }

  const activeSkills = (skills ?? []).filter(Boolean);
  const systemInstruction = [
    'You are Aegis Intelligence, an expert Governance, Risk & Compliance (GRC) assistant embedded in the Aegis GRC platform.',
    'Answer using the live organizational context below. Be concise, specific, and actionable; cite item ids (e.g. R-101, F-502, control ids) when relevant.',
    'If the context does not contain the answer, say so plainly instead of inventing data.',
    activeSkills.length ? `Active analyst skills: ${activeSkills.join(', ')}.` : '',
    '',
    '--- LIVE GRC CONTEXT ---',
    buildContext(),
  ].filter(Boolean).join('\n');

  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.text }],
  }));

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: MODEL,
      contents,
      config: { systemInstruction, temperature: 0.4, maxOutputTokens: 1024 },
    });
    const text = response.text?.trim();
    if (!text) return res.status(502).json({ error: 'The model returned an empty response.' });
    res.json({ configured: true, text });
  } catch (err) {
    console.error('Gemini request failed:', err);
    res.status(502).json({ error: err instanceof Error ? err.message : 'AI request failed' });
  }
});

export default router;
