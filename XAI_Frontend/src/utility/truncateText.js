export const truncateText = (text, start, end) => {
  if (!text || typeof text !== "string" || text.length <= start + end) {
    return text;
  }

  const truncatedText =
    text.substring(0, start) + "..." + text.substring(text.length - end);
    
  return truncatedText;
};
