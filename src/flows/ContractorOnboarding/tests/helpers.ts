// Helper to generate unique employment IDs
let employmentIdCounter = 0;
export const generateUniqueEmploymentId = () => {
  employmentIdCounter++;
  return `test-contractor-employment-${employmentIdCounter}-${Date.now()}`;
};
