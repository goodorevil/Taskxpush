import { categoryFixtures } from './category-fixtures';

const endpoint = process.env.CLASSIFIER_URL || 'http://127.0.0.1:3000/api/extract-tasks';

async function run() {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      referenceDate: '2026-09-02',
      emails: categoryFixtures.map((fixture) => ({
        id: fixture.id,
        threadId: fixture.id,
        subject: fixture.subject,
        senderName: fixture.senderName,
        senderEmail: fixture.senderEmail,
        date: '2026-09-02T09:00:00.000Z',
        snippet: fixture.body,
        fullBody: fixture.body,
      })),
    }),
  });
  if (!response.ok) throw new Error(`Current classifier returned ${response.status}`);

  const payload = await response.json();
  const results = new Map(payload.results.map((result: any) => [result.emailId, result]));
  let failures = 0;

  for (const fixture of categoryFixtures) {
    const result = results.get(fixture.id);
    const actual = result?.category || 'NO RESULT';
    const pass = actual === fixture.expected;
    if (!pass) failures += 1;
    console.log(`${pass ? 'PASS' : 'FAIL'} ${fixture.id}: expected ${fixture.expected}; got ${actual}`);
  }

  console.log(`\n${categoryFixtures.length - failures}/${categoryFixtures.length} passed`);
  process.exitCode = failures ? 1 : 0;
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
