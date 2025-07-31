export function getFirstNWords(description, n) {
  if (typeof description !== "string") {
    throw new Error("The first argument must be a string.");
  }
  if (typeof n !== "number" || n < 0) {
    throw new Error("The second argument must be a non-negative number.");
  }

  // Trim the string and split on one or more whitespace characters.
  const words = description.trim().split(/\s+/);

  // If the description has n or fewer words, return it as-is.
  if (words.length <= n) {
    return description.trim();
  }

  // Otherwise, return the first n words followed by ellipsis.
  return words.slice(0, n).join(" ") + "...";
}
