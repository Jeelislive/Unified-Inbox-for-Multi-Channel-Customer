import { getCurrentUser } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const user = await getCurrentUser();

  // Redirect authenticated users to dashboard
  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-b from-blue-50 to-white">
      <div className="z-10 max-w-5xl w-full items-center text-center">
        <h1 className="text-5xl font-bold mb-4 text-gray-900">
          Unified Inbox CRM
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Multi-channel customer communication platform
        </p>

        <div className="flex gap-4 justify-center mb-12">
          <Link
            href="/login"
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition-colors"
          >
            Sign Up
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="text-3xl mb-2">✅</div>
            <h3 className="text-lg font-semibold mb-2">Phase 1 Complete</h3>
            <p className="text-sm text-gray-600">
              Next.js, Tailwind CSS, Prisma setup
            </p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="text-3xl mb-2">✅</div>
            <h3 className="text-lg font-semibold mb-2">Phase 2 Complete</h3>
            <p className="text-sm text-gray-600">
              Database schema with 5 models
            </p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="text-3xl mb-2">✅</div>
            <h3 className="text-lg font-semibold mb-2">Phase 3 Complete</h3>
            <p className="text-sm text-gray-600">
              Authentication & role-based access
            </p>
          </div>
        </div>

        <div className="mt-12 p-6 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Demo Credentials</h3>
          <p className="text-sm text-blue-700">
            admin@acme.com • editor@acme.com • viewer@acme.com
          </p>
          <p className="text-xs text-blue-600 mt-1">
            (Any password works for demo)
          </p>
        </div>
      </div>
    </main>
  );
}
