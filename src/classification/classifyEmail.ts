import type { TaskCategory } from '../types';

export interface ClassificationEmail {
  subject?: string;
  fullBody?: string;
  snippet?: string;
}

export interface ClassificationResult {
  category: TaskCategory;
  confidence: number;
  reason: string;
}

type Candidate = { category: Exclude<TaskCategory, 'Updates'>; score: number; evidence: string[] };

const CATEGORY_ORDER: TaskCategory[] = [
  'Spam',
  'Finance',
  'Deadlines / Reply',
  'Engagements',
  'Opportunities',
  'Experiences',
  'Discover',
  'Updates',
];

function matches(text: string, pattern: RegExp) {
  return pattern.test(text);
}

function add(candidates: Candidate[], category: Candidate['category'], score: number, evidence: string) {
  const candidate = candidates.find((item) => item.category === category);
  if (candidate) {
    candidate.score += score;
    candidate.evidence.push(evidence);
  } else {
    candidates.push({ category, score, evidence: [evidence] });
  }
}

/**
 * Version-one, deterministic email categorizer. It intentionally prefers a
 * safe Updates result whenever there is not enough evidence for one intent.
 */
export function classifyEmail(email: ClassificationEmail): ClassificationResult {
  const text = `${email.subject || ''}\n${email.fullBody || email.snippet || ''}`.toLowerCase();
  const candidates: Candidate[] = [];

  if (matches(text, /\b(guaranteed (?:cash|crypto|reward)|claim (?:your )?(?:prize|reward)|wallet address|wire money|bitcoin giveaway|act now to claim)\b/i)) {
    add(candidates, 'Spam', 0.95, 'scam or implausible reward language');
  }

  if (matches(text, /\b(invoice|payment (?:is )?due|refund|remittance|subscription charge|billing statement|amount due|fee reminder)\b/i)) {
    // Billing remains Finance even when it contains a payment date; the money
    // movement is the email's primary intent.
    add(candidates, 'Finance', 1.1, 'money movement or billing language');
  }

  if (matches(text, /\b(by|before|due|deadline|closes?|submit by|apply by|respond by|reply by)\b.{0,50}\b(today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|\d{1,2}(?::\d{2})?\s*(?:am|pm)?|\d{4}-\d{2}-\d{2})\b/i)) {
    add(candidates, 'Deadlines / Reply', 0.9, 'explicit time-bound action');
  }
  if (matches(text, /\b(please (?:reply|respond|confirm|send|share)|could you (?:reply|respond|confirm|send|share)|awaiting your (?:reply|response|confirmation)|reply requested)\b/i)) {
    add(candidates, 'Deadlines / Reply', 0.7, 'explicit response requested');
  }

  if (matches(text, /\b(calendar invite|meeting (?:is )?scheduled|call (?:is )?scheduled|join (?:the )?(?:meeting|call)|interview (?:is )?scheduled)\b/i) ||
      (matches(text, /\b(meeting|call|interview|class|lecture|standup|1:1|review|sync)\b/i) && matches(text, /\b(?:at )?\d{1,2}(?::\d{2})?\s*(?:am|pm)\b|\b(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i))) {
    add(candidates, 'Engagements', 0.8, 'fixed-time attendance commitment');
  }

  if (matches(text, /\b(job opening|job posting|internship|scholarship|grant|call for proposals|we are (?:accepting|hiring)|apply for)\b/i)) {
    add(candidates, 'Opportunities', 0.65, 'concrete opportunity to pursue');
  }

  if (matches(text, /\b(webinar|conference|meetup|workshop|bootcamp|hackathon|ideathon|festival)\b/i)) {
    add(candidates, 'Experiences', 0.65, 'optional event or experience');
  }

  if (matches(text, /\b(\d+% off|discount|sale|free trial|try (?:our|the) new|new (?:tool|product|service)|sign up (?:today|now))\b/i)) {
    add(candidates, 'Discover', 0.65, 'promotion for a new product or service');
  }

  if (matches(text, /\b(no action (?:is )?needed|confirmation|successfully changed|policy update|for your information|fyi|status update)\b/i)) {
    return { category: 'Updates', confidence: 0.9, reason: 'informational update with no requested action' };
  }

  const ranked = candidates.sort((a, b) => b.score - a.score || CATEGORY_ORDER.indexOf(a.category) - CATEGORY_ORDER.indexOf(b.category));
  const winner = ranked[0];
  const runnerUp = ranked[1];

  if (!winner || winner.score < 0.65 || (runnerUp && winner.score - runnerUp.score < 0.15)) {
    return { category: 'Updates', confidence: 0.45, reason: 'insufficient or conflicting evidence for a single primary intent' };
  }

  return {
    category: winner.category,
    confidence: Math.min(winner.score, 0.98),
    reason: winner.evidence.join('; '),
  };
}
