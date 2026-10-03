export const API_BASE = '/api';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function bootstrapDbmsDemo() {
  const res = await fetch(`${API_BASE}/demo/dbms`);
  return res.json();
}

export async function fetchSpaces() {
  const res = await fetch(`${API_BASE}/spaces`);
  return res.json();
}

export async function createSpace(title: string, description: string, learningGoal: string) {
  const res = await fetch(`${API_BASE}/spaces`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description, learningGoal })
  });
  return res.json();
}

export async function addSource(spaceId: string, source: any) {
  const res = await fetch(`${API_BASE}/spaces/${spaceId}/sources`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(source)
  });
  return res.json();
}

export async function runGemmaAnalysis(spaceId: string) {
  const res = await fetch(`${API_BASE}/spaces/${spaceId}/analyze`, {
    method: 'POST'
  });
  return res.json();
}

export async function synthesizeKnowledge(spaceId: string) {
  const res = await fetch(`${API_BASE}/spaces/${spaceId}/synthesize-knowledge`, {
    method: 'POST'
  });
  return res.json();
}

export async function assessDiagnosticAnswer(spaceId: string, questionId: string, studentAnswer: string) {
  const res = await fetch(`${API_BASE}/spaces/${spaceId}/assess`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ questionId, studentAnswer })
  });
  return res.json();
}

export async function generateLessonPlan(spaceId: string, conceptId: string, conceptName: string, targetMisconception?: string) {
  const res = await fetch(`${API_BASE}/spaces/${spaceId}/lessons/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ conceptId, conceptName, targetMisconception })
  });
  return res.json();
}

export async function requestNaturalLanguageEdit(spaceId: string, editRequest: string) {
  const res = await fetch(`${API_BASE}/spaces/${spaceId}/lessons/edit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ editRequest })
  });
  return res.json();
}

export async function applyLessonAction(spaceId: string, action: 'keep' | 'discard' | 'undo') {
  const res = await fetch(`${API_BASE}/spaces/${spaceId}/lessons/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action })
  });
  return res.json();
}

export async function switchAIProvider(mode: 'demo' | 'gemma' | 'openweight') {
  const res = await fetch(`${API_BASE}/provider/switch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode })
  });
  return res.json();
}

export async function sendChatMessage(message: string, attachments: any[] = []) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, attachments })
  });
  return res.json();
}

