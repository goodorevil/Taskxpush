import type { TaskCategory } from '../src/types';

export interface CategoryFixture {
  id: string;
  expected: TaskCategory;
  subject: string;
  senderName: string;
  senderEmail: string;
  body: string;
}

export const categoryFixtures: CategoryFixture[] = [
  {
    id: 'engagement',
    expected: 'Engagements',
    subject: 'Design review — Tuesday, 2:00 PM',
    senderName: 'Maya Patel',
    senderEmail: 'maya@company.com',
    body: 'Your 45-minute design review is scheduled for Tuesday at 2:00 PM. Join using the calendar link.',
  },
  {
    id: 'deadline-reply',
    expected: 'Deadlines / Reply',
    subject: 'Please submit your security questionnaire by Friday',
    senderName: 'Vendor Security',
    senderEmail: 'security@vendor.com',
    body: 'Please complete and submit the attached questionnaire by Friday at 5 PM so onboarding can continue.',
  },
  {
    id: 'opportunity',
    expected: 'Opportunities',
    subject: 'Open-source maintainer internship',
    senderName: 'Open Source Foundation',
    senderEmail: 'programs@opensource.org',
    body: 'We are accepting applications for our paid maintainer internship. Review the role and apply if interested.',
  },
  {
    id: 'experience',
    expected: 'Experiences',
    subject: 'Invitation: ProductCraft virtual conference',
    senderName: 'ProductCraft',
    senderEmail: 'hello@productcraft.dev',
    body: 'You are invited to attend our optional virtual conference next month with talks and workshops.',
  },
  {
    id: 'finance',
    expected: 'Finance',
    subject: 'Invoice INV-2048: $249 payment due',
    senderName: 'CloudHost Billing',
    senderEmail: 'billing@cloudhost.com',
    body: 'Your monthly invoice for $249 is due on 15 September. Pay securely from your account portal.',
  },
  {
    id: 'discover',
    expected: 'Discover',
    subject: 'Try our new note-taking assistant — 30% off',
    senderName: 'NoteFlow',
    senderEmail: 'offers@noteflow.io',
    body: 'Meet NoteFlow AI, a new note-taking tool. Sign up this week and receive 30% off your first year.',
  },
  {
    id: 'updates',
    expected: 'Updates',
    subject: 'GitHub security notice: password successfully changed',
    senderName: 'GitHub',
    senderEmail: 'noreply@github.com',
    body: 'This is a confirmation that the password for your GitHub account was successfully changed. No action is needed.',
  },
  {
    id: 'spam',
    expected: 'Spam',
    subject: 'Claim your guaranteed $10,000 crypto reward today',
    senderName: 'Crypto Rewards Desk',
    senderEmail: 'winner@unrelated-domain.example',
    body: 'You have been selected for a guaranteed crypto reward. Reply immediately with your wallet address to claim it.',
  },
  {
    id: 'conflict-deadline-over-opportunity',
    expected: 'Deadlines / Reply',
    subject: 'Scholarship application closes Friday',
    senderName: 'Future Scholars',
    senderEmail: 'awards@scholars.org',
    body: 'Apply for the scholarship by Friday at 11:59 PM. Applications received after that time will not be reviewed.',
  },
  {
    id: 'ambiguous-safe-default',
    expected: 'Updates',
    subject: 'A quick note about next quarter',
    senderName: 'Operations',
    senderEmail: 'ops@company.com',
    body: 'We are considering a few changes to our next-quarter process and will share details later.',
  },
];
