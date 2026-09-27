export default function Home() {
  return (
    <main style={{ maxWidth: 720, margin: "48px auto", padding: "0 24px", lineHeight: 1.6 }}>
      <h1>QAF Support AI — local scaffold</h1>
      <p>
        App and database run <strong>locally for now</strong>: Next.js dev server +
        SQLite file (<code>prisma/dev.db</code>). No cloud, no auth yet.
      </p>
      <ul>
        <li>
          Health check: <a href="/api/health">/api/health</a>
        </li>
        <li>
          Next: WhatsApp webhook + corpus retrieval (Plan Phase 1). Admin login
          arrives with the Admin Console MVP — not needed now.
        </li>
      </ul>
    </main>
  );
}
