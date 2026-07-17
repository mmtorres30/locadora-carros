export function onlyDigits(v) {
  return (v || "").replace(/\D/g, "");
}

export function toTitleCase(v) {
  if (!v) return v;
  return v.toLowerCase().replace(/(^|\s|-)\p{L}/gu, (c) => c.toUpperCase());
}

export function formatCPF(v) {
  const d = onlyDigits(v).slice(0, 11);
  let out = d.slice(0, 3);
  if (d.length > 3) out += "." + d.slice(3, 6);
  if (d.length > 6) out += "." + d.slice(6, 9);
  if (d.length > 9) out += "-" + d.slice(9, 11);
  return out;
}

export function formatRG(v) {
  const raw = (v || "").replace(/[^0-9A-Za-z]/g, "").slice(0, 9);
  let out = raw.slice(0, 2);
  if (raw.length > 2) out += "." + raw.slice(2, 5);
  if (raw.length > 5) out += "." + raw.slice(5, 8);
  if (raw.length > 8) out += "-" + raw.slice(8, 9);
  return out;
}

export function formatPhone(v) {
  const d = onlyDigits(v).slice(0, 11);
  if (!d) return "";
  let out = "(" + d.slice(0, 2);
  if (d.length >= 2) out += ") ";
  if (d.length > 2) {
    const isCel = d.length > 10;
    const mid = isCel ? d.slice(2, 7) : d.slice(2, 6);
    const end = isCel ? d.slice(7, 11) : d.slice(6, 10);
    out += mid;
    if (end) out += "-" + end;
  }
  return out;
}

export function applyFormat(format, value) {
  if (format === "title") return toTitleCase(value);
  if (format === "cpf") return formatCPF(value);
  if (format === "rg") return formatRG(value);
  if (format === "phone") return formatPhone(value);
  if (format === "upper") return (value || "").toUpperCase();
  return value;
}

export function isValidCPF(v) {
  const d = onlyDigits(v);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(d[i]) * (10 - i);
  let check1 = (sum * 10) % 11;
  if (check1 === 10) check1 = 0;
  if (check1 !== parseInt(d[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(d[i]) * (11 - i);
  let check2 = (sum * 10) % 11;
  if (check2 === 10) check2 = 0;
  return check2 === parseInt(d[10]);
}

export function rgIncompleto(v) {
  const raw = (v || "").replace(/[^0-9A-Za-z]/g, "");
  return raw.length > 0 && raw.length < 7;
}
