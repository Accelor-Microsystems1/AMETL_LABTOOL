function generateCustomerCode(name) {
  if (!name) return "XX";
  
  const cleaned = name.trim().replace(/\s+/g, " ");
  const parts = cleaned.split(" ").filter(Boolean);
  
  if (parts.length === 0) return "XX";
  
  const first = parts[0][0] || "X";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : parts[0][1] || "X";
  
  return (first + last).toUpperCase().replace(/[^A-Z]/g, "X").slice(0, 2);
}

function getStartOfDay(date) {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}

function formatDDMM(date) {
  const d = new Date(date);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}-${mm}`;
}

function formatYY(date) {
  const d = new Date(date);
  return String(d.getFullYear()).slice(-2);
}

function pad4(num) {
  return String(num).padStart(4, "0");
}

function buildUutCode({ inDate, testCode, customerCode, uutType, serialOfDay }) {
  const YY = formatYY(inDate);
  const TCC = `${testCode}${customerCode}`;
  const UU = uutType;
  const DDMM = formatDDMM(inDate);
  const XXXX = pad4(serialOfDay);
  
  return `${YY}/${TCC}/${UU}/${DDMM}/${XXXX}`;
}

module.exports = {
    generateCustomerCode,
    getStartOfDay,
    formatDDMM,
    formatYY,
    pad4,
    buildUutCode,
}