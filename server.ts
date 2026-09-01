import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { classifyEmail } from "./src/classification/classifyEmail";

dotenv.config();

let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (aiClient) return aiClient;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("⚠️ GEMINI_API_KEY is not set in environment.");
    return null;
  }
  aiClient = new GoogleGenAI({ apiKey });
  return aiClient;
}

// Realistic seed emails for Instant Demo / Testing mode
const SAMPLE_EMAILS = [
  {
    id: "msg-101",
    threadId: "th-101",
    provider: "gmail",
    subject: "URGENT: Review Master Service Agreement with TechCorp by Friday",
    senderName: "Sarah Jenkins (Legal Counsel)",
    senderEmail: "sarah.jenkins@acmelegal.com",
    date: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45m ago
    snippet: "Hi team, please review Section 4.2 (Liability Cap) and Section 9 (IP terms) on the TechCorp MSA before 5 PM this Friday. We need signed approval to finalize.",
    fullBody: `Hi team,

Attached is the revised Master Service Agreement for TechCorp. 
Could you please review Section 4.2 (Liability Cap) and Section 9 (IP terms) specifically before 5:00 PM this Friday? 

We need your written confirmation or redlines so we can countersign and meet their procurement deadline next Monday.

Best regards,
Sarah Jenkins
Senior Legal Counsel | Acme Partners`,
    webLink: "https://mail.google.com/mail/u/0/#inbox/th-101",
    labels: ["INBOX", "IMPORTANT"]
  },
  {
    id: "msg-102",
    threadId: "th-102",
    provider: "gmail",
    subject: "Q3 Product Roadmap Sync & Design Review - Call Invite",
    senderName: "David Chen (VP Product)",
    senderEmail: "david.chen@enterprise.io",
    date: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2h ago
    snippet: "Let's meet tomorrow at 2:00 PM EST to align on the Q3 release schedule and design tokens. Please bring your updated user flow wireframes.",
    fullBody: `Hey everyone,

I've set up a 45-minute sync for tomorrow at 2:00 PM EST to walk through the Q3 release milestones and finalize our design token rollout.

Please make sure to review the latest Figma link beforehand and prepare feedback on the onboarding steps.

Meeting Link: https://meet.google.com/abc-defg-hij

Thanks,
David`,
    webLink: "https://mail.google.com/mail/u/0/#inbox/th-102",
    labels: ["INBOX"]
  },
  {
    id: "msg-103",
    threadId: "th-103",
    provider: "outlook",
    subject: "Action Required: Outstanding Invoice #INV-8829 Past Due",
    senderName: "Billing & Accounts",
    senderEmail: "billing@cloudinfra-solutions.net",
    date: new Date(Date.now() - 1000 * 60 * 360).toISOString(), // 6h ago
    snippet: "Your subscription invoice #INV-8829 ($1,420.00) is pending payment. Please approve and process the remittance by tomorrow to avoid service interruption.",
    fullBody: `Dear Account Owner,

This is a reminder that invoice #INV-8829 for Cloud Infrastructure services ($1,420.00) is due for payment by tomorrow. 

Please authorize the payment through your finance portal or reply with the remittance confirmation number.

Invoice Link: https://portal.cloudinfra-solutions.net/invoices/8829

Finance Team,
CloudInfra Solutions`,
    webLink: "https://outlook.live.com/mail/0/inbox/id/th-103",
    labels: ["INBOX", "FINANCE"]
  },
  {
    id: "msg-104",
    threadId: "th-104",
    provider: "gmail",
    subject: "Follow up on customer interview: Elena Rostova (Feedback on search)",
    senderName: "Elena Rostova",
    senderEmail: "elena.rostova@designstudio.co",
    date: new Date(Date.now() - 1000 * 60 * 500).toISOString(), // ~8h ago
    snippet: "Thanks for the great conversation earlier! Can you send over the beta invite link and documentation you mentioned? Excited to test it out.",
    fullBody: `Hi there,

It was lovely chatting with you during our user research session today! 

Whenever you have a moment, could you please share the beta test invite link and API documentation you mentioned? Our engineering team would love to test the webhook integration by early next week.

Warmly,
Elena Rostova`,
    webLink: "https://mail.google.com/mail/u/0/#inbox/th-104",
    labels: ["INBOX"]
  },
  {
    id: "msg-105",
    threadId: "th-105",
    provider: "gmail",
    subject: "Substack Weekly: 10 Trends in AI Developer Experience",
    senderName: "AI Weekly Digest",
    senderEmail: "newsletter@substack.com",
    date: new Date(Date.now() - 1000 * 60 * 700).toISOString(),
    snippet: "Here are this week's top stories in generative agents, token limits, and frontend tooling...",
    fullBody: `Welcome to issue #84 of AI Weekly! In this edition: Why autonomous coding assistants are reshaping developer velocity, deep dive into canvas interfaces, and new benchmarks. Read more on substack.com. Unsubscribe anytime.`,
    webLink: "https://mail.google.com/mail/u/0/#inbox/th-105",
    labels: ["PROMOTIONS"]
  },
  {
    id: "msg-106",
    threadId: "th-106",
    provider: "outlook",
    subject: "Candidate Interview: Senior Full-Stack Engineer - Alex Rivera",
    senderName: "Talent Acquisition",
    senderEmail: "recruiting@growthtech.com",
    date: new Date(Date.now() - 1000 * 60 * 1100).toISOString(),
    snippet: "Alex Rivera is scheduled for the technical interview this Thursday at 11:00 AM. Please submit your interview score & rubric feedback by end of day Thursday.",
    fullBody: `Hi Interview Panel,

Alex Rivera has been scheduled for the 60-minute technical architecture round this Thursday at 11:00 AM PST. 

Please review the candidate's resume and portfolio link attached, and make sure to submit your evaluation notes & score in Lever by end of day Thursday.

Candidate Profile: https://app.lever.co/candidates/alex-rivera-9921

Thank you,
Talent Team`,
    webLink: "https://outlook.live.com/mail/0/inbox/id/th-106",
    labels: ["INBOX", "RECRUITING"]
  },
  {
    id: "msg-107",
    threadId: "th-107",
    provider: "gmail",
    subject: "Your receipt from GitHub #GH-902341",
    senderName: "GitHub Billing",
    senderEmail: "billing@github.com",
    date: new Date(Date.now() - 1000 * 60 * 1500).toISOString(),
    snippet: "Thank you for your payment of $21.00 for GitHub Team subscription. View invoice online.",
    fullBody: `Hi there,
This email confirms your payment of $21.00 on August 20, 2026 for GitHub Team. No further action is required from you. You can view or download your invoice anytime in your account settings.`,
    webLink: "https://mail.google.com/mail/u/0/#inbox/th-107",
    labels: ["RECEIPTS"]
  },
  {
    id: "msg-108",
    threadId: "th-108",
    provider: "gmail",
    subject: "Production Bug: Webhook retry storm on v2 checkout endpoints",
    senderName: "Marcus Vance (Principal SRE)",
    senderEmail: "marcus.vance@company.internal",
    date: new Date(Date.now() - 1000 * 60 * 80).toISOString(),
    snippet: "We detected 429 rate limit errors on the Stripe webhook handler. Need someone from the backend team to deploy a backoff fix today before peak traffic.",
    fullBody: `Team,

Datadog alert triggered 20 minutes ago. Webhook retries are overwhelming the v2 checkout ingress. 
Could someone from the payments backend team patch the exponential backoff configuration and deploy to staging for verification today?

Ticket: https://linear.app/team/issue/ENG-4029

Marcus`,
    webLink: "https://mail.google.com/mail/u/0/#inbox/th-108",
    labels: ["INBOX", "URGENT"]
  }
];

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: "1mb" }));

  // Health check endpoint
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({
      status: "ok",
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
      appUrl: process.env.APP_URL || "http://localhost:3000",
      timestamp: new Date().toISOString()
    });
  });

  // Get sample inbox items for demonstration / quick testing
  app.get("/api/sample-inbox", (_req: Request, res: Response) => {
    res.json({
      emails: SAMPLE_EMAILS,
      count: SAMPLE_EMAILS.length
    });
  });

  // Extract actionable tasks from a batch of emails using Gemini
  const EmailSchema = z.object({
  id: z.string().min(1),
  threadId: z.string().optional(),
  subject: z.string().optional(),
  sender: z.string().optional(),
  senderName: z.string().optional(),
  senderEmail: z.string().optional(),
  date: z.string().optional(),
  snippet: z.string().optional(),
  fullBody: z.string().optional(),
 });

  const ExtractTasksSchema = z.object({
  emails: z.array(EmailSchema).min(1).max(50),
  referenceDate: z.string().optional(),
  });
  const extractLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  });
  app.post("/api/extract-tasks", extractLimiter, async (req: Request, res: Response) => {
    try {
      const parseResult = ExtractTasksSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(400).json({ error: "Invalid request", details: parseResult.error.flatten() });
      }
      const { emails, referenceDate } = parseResult.data;

      // Version one deliberately uses one deterministic, testable pipeline for
      // every email. The classifier receives the complete available body and
      // chooses Updates whenever evidence is weak or conflicting.
      const results = emails.map((email) => {
        const classification = classifyEmail(email);
        const actionable = !['Updates', 'Discover', 'Spam'].includes(classification.category);

        return {
          emailId: email.id,
          threadId: email.threadId,
          actionable,
          taskTitle: email.subject || 'Email update',
          dueDate: null,
          dueTime: null,
          priority: classification.category === 'Deadlines / Reply' || classification.category === 'Finance' ? 'medium' : 'low',
          category: classification.category,
          isPrioritySender: false,
          description: email.snippet || email.fullBody || '',
          actionItems: [],
          confidence: classification.confidence,
          reason: classification.reason,
          skipReason: actionable ? undefined : classification.reason,
        };
      });

      return res.json({
        success: true,
        processedCount: results.length,
        results,
        modelUsed: 'deterministic-v1',
      });

      const client = getGeminiClient();
      const today = referenceDate || new Date().toISOString().split("T")[0];

      // If Gemini client is unavailable (e.g. no API key in local dev), fallback to deterministic smart rule extractor
      if (!client) {
        console.log("Gemini API key not configured, using built-in rule extraction fallback.");
        const results = emails.map(email => fallbackRuleExtractor(email, today));
        return res.json({
          success: true,
          processedCount: emails.length,
          results,
          usedFallback: true
        });
      }

      // Format email summaries for Gemini prompt
      const formattedEmailBatch = emails.map((em, idx) => ({
        index: idx,
        id: em.id,
        threadId: em.threadId,
        subject: em.subject || "",
        sender: `${em.senderName || ""} <${em.senderEmail || ""}>`,
        date: em.date,
        content: (em.fullBody || em.snippet || "").slice(0, 1500)
      }));

      const systemPrompt = `You are Prioris AI, an intelligent email sorting assistant.
Your job is to scan incoming emails and sort EVERY SINGLE ONE into exactly one category. Nothing gets dropped or hidden - every email must end up somewhere.

Current Date Reference: ${today} (Year-Month-Day).

RULES:
1. SORT, DON'T FILTER: Every email gets a category and a taskTitle. Never omit an email from the results.
2. ACTIONABLE FLAG: Set actionable=true if there is a concrete action requested from or owed by the user (e.g. review a document, reply with info, attend a meeting, pay an overdue invoice, apply by a deadline). Set actionable=false for informational/promotional content - but still give it a category and title.
3. TASK TITLE: Keep it concise, imperative, and specific (e.g. "Review Section 4.2 of TechCorp MSA", "Reply to Elena with beta invite link"). For non-actionable emails, the title can simply be a short summary of the email (e.g. "Weekly newsletter from TechCrunch").
4. DUE DATE: If a deadline or relative date is mentioned (e.g. "this Friday", "by 5 PM tomorrow", "next Monday"), calculate the exact YYYY-MM-DD date based on Current Date Reference (${today}). If no date is mentioned, set dueDate to null.
5. PRIORITY:
   - "high": Urgent deadlines (within 24-48h), legal/finance/billing risk, blocker bugs, executive requests.
   - "medium": Standard requests with reasonable deadlines (within 3-7 days), meeting preparations, scheduled interviews.
   - "low": Low urgency follow-ups, general tasks, or anything non-actionable.
6. CATEGORY: Exactly one of these 8 values:
   - "Engagements": calls, interviews, classes, 1:1s, or any fixed-time commitment.
   - "Deadlines / Reply": anything time-bound or awaiting a response: deliverables, submissions, payments due, replies, confirmations, and applications with an apply-by date. If an email asks the user to apply, submit, or reply by a specific time, always use this category.
   - "Opportunities": jobs, internships, scholarships, grants, and competitions with a concrete next step but no time-bound application or submission.
   - "Experiences": optional webinars, conferences, meetups, workshops, bootcamps, or hackathons.
   - "Finance": invoices, payments, refunds, fee reminders, subscription charges, or financial aid.
   - "Discover": marketing that offers a product, discount, or sign-up with no personal opportunity or obligation.
   - "Updates": informational content about services or organizations the user already uses, with no action needed.
   - "Spam": unwanted, irrelevant, or scam-like content.
7. PRIORITY SENDER: Set isPrioritySender=true only for a recognizable major company/institution or a clearly important organization; otherwise false. This is a flag, not a category.
7. CONFIDENCE: Float from 0.0 to 1.0 representing how confident you are in the classification.`;

      const userContent = `Analyze the following ${formattedEmailBatch.length} emails and extract tasks for each one:

${JSON.stringify(formattedEmailBatch, null, 2)}`;

      try {
        const response = await client.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [
            { role: "user", parts: [{ text: `${systemPrompt}\n\n${userContent}` }] }
          ],
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.ARRAY,
              description: "Array of task extraction results matching each input email by index",
              items: {
                type: Type.OBJECT,
                properties: {
                  index: { type: Type.INTEGER, description: "Matching 0-based index of the email in the input batch" },
                  emailId: { type: Type.STRING, description: "Matching email ID" },
                  actionable: { type: Type.BOOLEAN, description: "True if user must take action, false if noise/info only" },
                  taskTitle: { type: Type.STRING, description: "Short, punchy action item title (e.g. 'Review MSA draft')" },
                  dueDate: { type: Type.STRING, description: "YYYY-MM-DD due date if mentioned, or empty string", nullable: true },
                  dueTime: { type: Type.STRING, description: "HH:MM time if mentioned (e.g. '17:00' or '14:00')", nullable: true },
                  priority: { type: Type.STRING, description: "Priority level: 'high', 'medium', or 'low'" },
                  category: { type: Type.STRING, description: "One of: 'Engagements', 'Deadlines / Reply', 'Opportunities', 'Experiences', 'Finance', 'Discover', 'Updates', 'Spam'" },
                  isPrioritySender: { type: Type.BOOLEAN, description: "True for a recognizable important company or institution sender" },
                  description: { type: Type.STRING, description: "Brief 1-2 sentence context summary of what needs to be done" },
                  actionItems: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Key checklist sub-bullets or details"
                  },
                  confidence: { type: Type.NUMBER, description: "Confidence score between 0.0 and 1.0" },
                  reason: { type: Type.STRING, description: "Why this was extracted or why action is required" },
                  skipReason: { type: Type.STRING, description: "If actionable=false, short reason like 'Substack newsletter' or 'Payment receipt'" }
                },
                required: ["index", "actionable", "confidence"]
              }
            }
          }
        });

        const rawText = response.text || "[]";
        let parsedResults = [];

        const GeminiTaskSchema = z.object({
          emailId: z.string(),
          title: z.string(),
          description: z.string(),
          category: z.string(),
          priority: z.string(),
          isPrioritySender: z.boolean().optional(),
          dueDate: z.string().nullable(),
          actionable: z.boolean(),
          confidence: z.number(),
          actionItems: z.array(z.string()),
          skipReason: z.string().optional(),
        });
        const GeminiResultsSchema = z.array(GeminiTaskSchema);
        
        try {
          const jsonResults = JSON.parse(rawText);
          parsedResults = GeminiResultsSchema.parse(jsonResults);
        } catch (parseErr) {
          console.error("Failed to parse Gemini JSON output:", rawText);
          parsedResults = emails.map(email => fallbackRuleExtractor(email, today));
        }

        // Map back to guarantee matching email metadata
        const finalResults = emails.map((email, idx) => {
          const match = parsedResults.find((r: any) => r.index === idx || r.emailId === email.id);
          if (match) {
            return {
              emailId: email.id,
              threadId: email.threadId,
              actionable: Boolean(match.actionable),
              taskTitle: match.taskTitle || email.subject,
              dueDate: match.dueDate && match.dueDate !== "" ? match.dueDate : null,
              dueTime: match.dueTime && match.dueTime !== "" ? match.dueTime : null,
              priority: (['high', 'medium', 'low'].includes(match.priority?.toLowerCase()) ? match.priority.toLowerCase() : 'medium'),
              category: ([
                'Engagements', 'Deadlines / Reply', 'Opportunities', 'Experiences',
                'Finance', 'Discover', 'Updates', 'Spam'
              ].includes(match.category) ? match.category : 'Updates'),
              isPrioritySender: Boolean(match.isPrioritySender),
              description: match.description || email.snippet,
              actionItems: match.actionItems || [],
              confidence: typeof match.confidence === 'number' ? match.confidence : 0.85,
              reason: match.reason || (match.actionable ? "Identified actionable request in email body" : "Informational content only"),
              skipReason: match.skipReason || (match.actionable ? undefined : "Automated email or newsletter")
            };
          }
          return fallbackRuleExtractor(email, today);
        });

        return res.json({
          success: true,
          processedCount: finalResults.length,
          results: finalResults,
          modelUsed: "gemini-2.5-flash"
        });
      } catch (geminiError: any) {
        console.error("Gemini extraction error:", geminiError);
        // Fallback to rule engine on model failure
        const fallbackResults = emails.map(email => fallbackRuleExtractor(email, today));
        return res.json({
          success: true,
          processedCount: fallbackResults.length,
          results: fallbackResults,
          usedFallback: true,
          warning: "Used smart heuristic fallback due to API response: " + (geminiError.message || "Unknown error")
        });
      }
    } catch (err: any) {
      console.error("Server extract error:", err);
      res.status(500).json({ error: err.message || "Failed to process emails" });
    }
  });

  // Client-side Vite integration in dev vs Static files in prod
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Prioris server running on http://0.0.0.0:${PORT}`);
  });
}

// Deterministic heuristic rule extractor for offline testing or fallback
function fallbackRuleExtractor(email: any, todayStr: string) {
  const subject = (email.subject || "").toLowerCase();
  const body = (email.fullBody || email.snippet || "").toLowerCase();
  const text = `${subject} ${body}`;

  // Noise check
  const isNewsletter = text.includes("unsubscribe") || text.includes("newsletter") || text.includes("weekly digest") || text.includes("view in browser");
  const isReceipt = (text.includes("receipt") || text.includes("payment confirmation") || text.includes("thank you for your payment")) && !text.includes("past due") && !text.includes("action required");
  const isNoAction = isNewsletter || (isReceipt && !text.includes("invoice"));

  if (isNoAction) {
    return {
      emailId: email.id,
      threadId: email.threadId,
      actionable: false,
      taskTitle: email.subject || "Newsletter / marketing email",
      priority: 'low',
      category: isNewsletter ? 'Discover' : 'Updates',
      isPrioritySender: false,
      confidence: 0.95,
      skipReason: isNewsletter ? "Newsletter / Marketing digest" : "Automated receipt with no required action"
    };
  }

  let priority: 'high' | 'medium' | 'low' = 'medium';
  let category: 'Engagements' | 'Deadlines / Reply' | 'Opportunities' | 'Experiences' | 'Finance' | 'Discover' | 'Updates' | 'Spam' = 'Updates';
  let dueDate: string | null = null;
  let dueTime: string | null = null;
  let taskTitle = email.subject || "Follow up on email";

  const today = new Date(todayStr);

  if (text.includes("urgent") || text.includes("asap") || text.includes("past due") || text.includes("rate limit") || text.includes("blocker")) {
    priority = 'high';
  } else if (text.includes("whenever you have a moment") || text.includes("low priority") || text.includes("fyi")) {
    priority = 'low';
  }

  if (text.includes("interview") || text.includes("meet") || text.includes("call") || text.includes("sync") || text.includes("schedule")) {
    category = 'Engagements';
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    dueDate = tomorrow.toISOString().split("T")[0];
    dueTime = text.includes("2:00") ? "14:00" : (text.includes("11:00") ? "11:00" : "10:00");
  } else if (text.includes("offer letter") || text.includes("internship") || text.includes("we'd like to offer") || text.includes("job offer")) {
    category = 'Opportunities';
  } else if (text.includes("invite you") || text.includes("webinar") || text.includes("conference") || text.includes("meetup")) {
    category = 'Experiences';
  } else if (text.includes("invoice") || text.includes("payment due") || text.includes("refund") || text.includes("subscription charge") || text.includes("fee reminder")) {
    category = 'Finance';
  } else if (text.includes("deadline") || text.includes("by friday") || text.includes("due") || text.includes("before 5") || text.includes("apply by") || text.includes("submit by") || text.includes("application closes") || text.includes("reply by") || text.includes("respond by")) {
    category = 'Deadlines / Reply';
    const due = new Date(today);
    due.setDate(due.getDate() + 2);
    dueDate = due.toISOString().split("T")[0];
    dueTime = "17:00";
  } else if (text.includes("scholarship") || text.includes("apply by") || text.includes("call for proposals") || text.includes("grant")) {
    category = 'Opportunities';
  } else if (text.includes("discount") || text.includes("sale") || text.includes("try for free") || text.includes("sign up")) {
    category = 'Discover';
  } else if (text.includes("reply") || text.includes("feedback") || text.includes("share") || text.includes("send over")) {
    category = 'Deadlines / Reply';
    const due = new Date(today);
    due.setDate(due.getDate() + 1);
    dueDate = due.toISOString().split("T")[0];
  }

  // Refine title
  if (category === 'Engagements') {
    taskTitle = `Attend / prepare: ${email.subject.replace(/^(invite|call|sync):\s*/i, "")}`;
  } else if (category === 'Deadlines / Reply') {
    taskTitle = text.includes("reply") || text.includes("feedback") || text.includes("share") || text.includes("send over")
      ? `Reply to ${email.senderName || "sender"}: ${email.subject}`
      : `Review & finalize: ${email.subject.replace(/^(urgent|action required):\s*/i, "")}`;
  }

  return {
    emailId: email.id,
    threadId: email.threadId,
    actionable: true,
    taskTitle: taskTitle.slice(0, 100),
    dueDate,
    dueTime,
    priority,
    category,
    isPrioritySender: /@(?:google|microsoft|apple|amazon|ibm|edu|gov)\b/i.test(email.senderEmail || ""),
    description: email.snippet || "Action requested in email thread",
    actionItems: [
      `Review original message from ${email.senderName || email.senderEmail}`,
      "Prepare response or required deliverable"
    ],
    confidence: 0.88,
    reason: `Extracted ${category.toLowerCase()} action items from sender request`
  };
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
});
