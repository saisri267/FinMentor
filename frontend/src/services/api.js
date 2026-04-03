/**
 * FinMentor AI — API Service
 */

const API_BASE = process.env.REACT_APP_API_URL || "https://finmentor-5.onrender.com/api";

export async function analyzeFinances(formData) {
  const response = await fetch(`${API_BASE}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      age:            Number(formData.age),
      income:         Number(formData.income),
      expenses:       Number(formData.expenses),
      savings:        Number(formData.savings),
      investments:    Number(formData.investments),
      retirement_age: Number(formData.retirement_age),
      persona:        formData.persona || "balanced",
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || `Server error: ${response.status}`);
  }
  return response.json();
}

export async function loadSampleData() {
  const response = await fetch(`${API_BASE}/sample`);
  if (!response.ok) throw new Error("Could not load sample data");
  return response.json();
}

/** Format a number as Indian Rupees */
export function formatINR(num, compact = false) {
  if (num === undefined || num === null) return "₹0";
  if (compact) {
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
    if (num >= 100000)   return `₹${(num / 100000).toFixed(2)} L`;
    if (num >= 1000)     return `₹${(num / 1000).toFixed(1)} K`;
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency", currency: "INR", maximumFractionDigits: 0,
  }).format(num);
}
