import assert from 'node:assert/strict';
import { classifyEmail } from '../src/classification/classifyEmail';
import { categoryFixtures } from './category-fixtures';

let failures = 0;
for (const fixture of categoryFixtures) {
  const result = classifyEmail({ subject: fixture.subject, fullBody: fixture.body });
  try {
    assert.equal(result.category, fixture.expected);
    console.log(`PASS ${fixture.id}: ${result.category}`);
  } catch {
    failures += 1;
    console.error(`FAIL ${fixture.id}: expected ${fixture.expected}; got ${result.category} (${result.reason})`);
  }
}

console.log(`\n${categoryFixtures.length - failures}/${categoryFixtures.length} passed`);
process.exitCode = failures ? 1 : 0;
