export interface SalaryCheckResult {
  flagged: boolean;
  detail: string;
}

const SALARY_PATTERNS = [
  { regex: /(?:₹|inr|rs\.?)\s*([\d,.]+)\s*(?:lpa|per annum|p\.a\.)/gi, currency: 'INR' },
  { regex: /(?:\$|usd)\s*([\d,.]+)\s*(?:per year|annually|p\.a\.)/gi, currency: 'USD' },
];

const UNREALISTIC_THRESHOLDS: Record<string, number> = {
  INR: 2000000, // ₹20 LPA for freshers is suspicious
  USD: 150000,
};

export function checkSalaryRealism(pdfText: string, hadInterview: boolean, interviewRounds: number): SalaryCheckResult {
  const textLower = pdfText.toLowerCase();
  
  // Check for fresher indicators
  const isFresher = /fresher|entry.level|graduate.trainee|campus|intern.*full.time/i.test(pdfText);
  
  for (const { regex, currency } of SALARY_PATTERNS) {
    regex.lastIndex = 0;
    let match;
    while ((match = regex.exec(textLower)) !== null) {
      const salaryStr = match[1].replace(/,/g, '');
      const salary = parseFloat(salaryStr);
      
      // Normalize LPA to actual amount
      let actualSalary = salary;
      if (currency === 'INR' && salary < 1000) {
        actualSalary = salary * 100000; // Convert LPA to actual
      }
      
      const threshold = UNREALISTIC_THRESHOLDS[currency] || 2000000;
      
      if (actualSalary > threshold && (isFresher || !hadInterview || interviewRounds <= 1)) {
        return {
          flagged: true,
          detail: `Salary of ${currency === 'INR' ? '₹' : '$'}${salary.toLocaleString()}${currency === 'INR' ? ' LPA' : '/year'} seems unrealistic for ${isFresher ? 'a fresher' : 'a candidate'} with ${!hadInterview ? 'no interview' : `only ${interviewRounds} interview round(s)`}.`,
        };
      }
    }
  }

  return { flagged: false, detail: '' };
}
