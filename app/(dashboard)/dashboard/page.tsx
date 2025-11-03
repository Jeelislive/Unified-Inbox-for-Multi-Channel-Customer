import { getCurrentUser } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";

/**
 * Protected dashboard page
 * Requires authentication
 */
export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                Unified Inbox CRM
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">
                {user.name || user.email}
              </span>
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                {user.role}
              </span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome to your Dashboard
            </h2>

            <div className="space-y-4">
              <div className="border-l-4 border-green-500 bg-green-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-green-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">
                      <strong>Phase 3 Complete!</strong> Authentication is
                      working
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-500">Name</h3>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {user.name || "Not set"}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-500">Email</h3>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {user.email}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-500">Role</h3>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {user.role}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-500">Team</h3>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {user.team?.name || "No team assigned"}
                  </p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-md">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">
                  Role Permissions
                </h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  {user.role === "ADMIN" && (
                    <>
                      <li>✓ Full system access</li>
                      <li>✓ Manage users and teams</li>
                      <li>✓ Access all data</li>
                      <li>✓ Configure integrations</li>
                    </>
                  )}
                  {user.role === "EDITOR" && (
                    <>
                      <li>✓ Send and receive messages</li>
                      <li>✓ Manage contacts</li>
                      <li>✓ Create and edit notes</li>
                      <li>✗ Limited admin access</li>
                    </>
                  )}
                  {user.role === "VIEWER" && (
                    <>
                      <li>✓ View messages and contacts</li>
                      <li>✓ Read notes</li>
                      <li>✗ Cannot send messages</li>
                      <li>✗ Cannot edit data</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
