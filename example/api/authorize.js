/**
 * Decides whether the user behind this request may act as the given employment.
 *
 * The SDK sends the employment id from the browser (the `x-rf-employment-id`
 * header in the PayrollEmployeeOnboarding flow), so anyone can change it.
 * Before minting an employee assertion for that employment, check it against
 * the user your own backend has authenticated, for example:
 *
 *   const user = await getUserFromSession(req);
 *   return user?.remoteEmploymentId === employmentId;
 *
 * This demo has no login, so it lets every request through. Replace it in
 * your integration: without this check, a user who changes the header acts as
 * another employee.
 *
 * @param {import('express').Request} _req - The incoming request
 * @param {string} _employmentId - The employment id the browser asked for
 * @returns {Promise<boolean>} Whether to mint a token for this employment
 */
async function authorizeEmployment(_req, _employmentId) {
  return true;
}

module.exports = { authorizeEmployment };
