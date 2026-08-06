async function request(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  me: () => request("/auth/me"),
  logout: () => request("/auth/logout", { method: "POST" }),
  login: () => request("/auth/login", { method: "POST" }),
  callback: () => {
    request("/auth/callback", { method: "POST" });
  },
  anonLogin: (displayName) =>
    request("/auth/anon", {
      method: "POST",
      body: JSON.stringify({ displayName }),
    }),
  todayPrompt: () => request("/prompts/today"),
  submitAnswers: (promptId, answers) =>
    request("/answers/submit", {
      method: "POST",
      body: JSON.stringify({ promptId, answers }),
    }),
  todayAnswers: (promptId) => request(`/answers/today?promptId=${promptId}`),
  history: () => request("/answers/history"),

  suggestPrompt: (data) =>
    request("/prompts/suggest", { method: "POST", body: JSON.stringify(data) }),
  adminMe: () => request("/auth/admin-me"),
  adminLogin: (password) =>
    request("/auth/admin-login", {
      method: "POST",
      body: JSON.stringify({ password }),
    }),
  adminLogout: () => request("/auth/admin-logout", { method: "POST" }),
  adminQueue: () => request("/prompts/queue"),
  schedulePrompt: (id, date) =>
    request("/prompts/schedule", {
      method: "POST",
      body: JSON.stringify({ id, date }),
    }),
  createPrompt: (data) =>
    request("/prompts/create", { method: "POST", body: JSON.stringify(data) }),
  deletePrompt: (id) =>
    request("/prompts/delete", {
      method: "POST",
      body: JSON.stringify({ id }),
    }),
  rejectSuggestion: (id) =>
    request("/prompts/reject", {
      method: "POST",
      body: JSON.stringify({ id }),
    }),
  reactToAnswer: (answerId, emoji) =>
    request("/answers/react", {
      method: "POST",
      body: JSON.stringify({ answerId, emoji }),
    }),
};
