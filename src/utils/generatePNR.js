/**
 * Generates a simple 10-digit numeric PNR, similar in shape to IRCTC's.
 * Not cryptographically special — just random digits with a timestamp
 * component mixed in so collisions are extremely unlikely for this project.
 */
function generatePNR() {
  const timestampPart = Date.now().toString().slice(-6); // last 6 digits of current time
  const randomPart = Math.floor(1000 + Math.random() * 9000); // 4 random digits
  return `${timestampPart}${randomPart}`;
}

module.exports = generatePNR;
