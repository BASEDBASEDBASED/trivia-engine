export const TIMER_MAX = 15;
export const LS_KEY = "gm_trivia_leaderboard";

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function decodeHTML(str) {
  const txt = document.createElement("textarea");
  txt.innerHTML = str;
  return txt.value;
}

export function loadLeaderboard() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY)) || [];
  } catch {
    return [];
  }
}

export function saveLeaderboard(entries) {
  localStorage.setItem(LS_KEY, JSON.stringify(entries));
}