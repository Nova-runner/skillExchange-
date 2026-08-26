// Lightweight helpers — Zod can be added later for stricter validation
function parseSkillList(str) {
  if (!str || typeof str !== 'string') return [];
  return str
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

module.exports = { parseSkillList };
