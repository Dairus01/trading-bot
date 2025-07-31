export function insertSeparators(input) {
  // Convert to string if it's a number
  let numStr = typeof input === "string" ? input : input.toString();

  // Check for negative sign
  let sign = "";
  if (numStr[0] === "-") {
    sign = "-";
    numStr = numStr.slice(1);
  }

  // Split the string into integer and fractional parts if a decimal exists
  let [integerPart, fractionalPart] = numStr.split(".");

  // Insert commas into the integer part
  integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // Reassemble the formatted number
  return fractionalPart
    ? sign + integerPart + "." + fractionalPart
    : sign + integerPart;
}
