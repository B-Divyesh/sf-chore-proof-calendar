import { writeFileSync } from 'node:fs';

const endpoint = 'https://api.sociobot.in/api/v1/products/chore-proof-calendar/verify?license=review-5-invalid-token';
const attempts = [];
for (let number = 1; number <= 40; number += 1) {
  const response = await fetch(endpoint, {
    headers: { Origin: 'https://chore-proof-calendar.sociobot.in' }
  });
  attempts.push({
    number,
    status: response.status,
    retryAfter: response.headers.get('retry-after'),
    cacheControl: response.headers.get('cache-control'),
    allowOrigin: response.headers.get('access-control-allow-origin')
  });
  await response.arrayBuffer();
  if (response.status === 429) break;
}

const result = {
  successfulRequests: attempts.filter((attempt) => attempt.status === 200).length,
  rateLimited: attempts.some((attempt) => attempt.status === 429),
  retryAfter: attempts.find((attempt) => attempt.status === 429)?.retryAfter ?? null,
  attempts
};
writeFileSync('/work/repo/.factory/evidence-review-5/rate-limit.json', `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));
if (!result.rateLimited || !result.retryAfter) process.exitCode = 1;
