export function formatWhatsAppNumber(number: string | undefined): string {
  if (!number) return "234";
  
  // Remove all non-numeric characters
  let clean = number.replace(/\D/g, "");
  
  // If it starts with 0 and is likely a Nigerian local number (e.g. 080...)
  // convert it to 23480...
  if (clean.startsWith("0")) {
    clean = "234" + clean.substring(1);
  }
  
  return clean;
}

export function formatWhatsAppDisplay(number: string | undefined): string {
  if (!number) return "+234";
  
  let clean = number.replace(/\D/g, "");
  
  if (clean.startsWith("0")) {
    return "+234 " + clean.substring(1);
  }
  
  if (clean.startsWith("234")) {
    return "+" + clean.substring(0, 3) + " " + clean.substring(3);
  }
  
  return number.startsWith("+") ? number : "+" + number;
}
