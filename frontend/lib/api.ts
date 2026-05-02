// const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// export async function signup(name: string, email: string, password: string) {
//   const res = await fetch(`${API_BASE}/auth/signup`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ name, email, password }),
//   });
//   return res.json();
// }

// export async function login(email: string, password: string) {
//   const res = await fetch(`${API_BASE}/auth/login`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ email, password }),
//   });
//   return res.json();
// }

// export async function savePreferences(userId: string, prefs: object) {
//   const res = await fetch(`${API_BASE}/preferences`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ user_id: userId, ...prefs }),
//   });
//   return res.json();
// }

// export async function analyze(userId: string, text: string) {
//   const res = await fetch(`${API_BASE}/analyze`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({ user_id: userId, text }),
//   });
//   return res.json();
// }

// export async function submitFeedback(
//   userId: string,
//   score: number,
//   recommendations: object[],
//   primaryEmotion: string,
//   interventionType: string
// ) {
//   const res = await fetch(`${API_BASE}/feedback`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({
//       user_id: userId,
//       score,
//       recommendations,
//       primary_emotion: primaryEmotion,
//       intervention_type: interventionType,
//     }),
//   });
//   return res.json();
// }

// export async function getHistory(userId: string) {
//   const res = await fetch(`${API_BASE}/history/${userId}`);
//   return res.json();
// }

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function signup(username: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  return res.json();
}

export async function login(username: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  return res.json();
}

export async function savePreferences(userId: string, prefs: object) {
  const res = await fetch(`${API_BASE}/preferences`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, ...prefs }),
  });
  return res.json();
}

export async function analyze(userId: string, text: string) {
  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_id: userId, text }),
  });
  return res.json();
}

export async function submitFeedback(
  userId: string,
  score: number,
  recommendations: object[],
  primaryEmotion: string,
  interventionType: string
) {
  const res = await fetch(`${API_BASE}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id: userId,
      score,
      recommendations,
      primary_emotion: primaryEmotion,
      intervention_type: interventionType,
    }),
  });
  return res.json();
}

export async function getHistory(userId: string) {
  const res = await fetch(`${API_BASE}/history/${userId}`);
  return res.json();
}
