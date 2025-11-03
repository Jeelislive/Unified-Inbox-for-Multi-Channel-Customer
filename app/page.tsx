export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-4">Unified Inbox CRM</h1>
        <p className="text-lg text-gray-600">
          Multi-channel customer communication platform
        </p>
        <div className="mt-8 p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Phase 1 Complete ✓</h2>
          <p>Project initialized with Next.js, Tailwind CSS, and Prisma</p>
        </div>
      </div>
    </main>
  );
}
