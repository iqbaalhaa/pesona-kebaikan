export function stripHtml(html: string, maxLength = 140) {
  if (!html) return "";

  // remove tags
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "…";
}
