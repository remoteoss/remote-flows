// Helper function to generate unique employment IDs for each test
let employmentIdCounter = 0;
export const generateUniqueEmploymentId = () => {
  employmentIdCounter++;
  return `test-employment-${employmentIdCounter}-${Date.now()}`;
};
