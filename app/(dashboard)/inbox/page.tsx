import { getCurrentUser } from "@/lib/authUtils";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import InboxLayout from "@/components/inbox/InboxLayout";

/**
 * Unified Inbox page
 * Displays all messages across channels
 */
export default async function InboxPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!user.teamId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">
          No team assigned. Contact your administrator.
        </p>
      </div>
    );
  }

  // Fetch contacts with their latest message
  const contacts = await prisma.contact.findMany({
    where: { teamId: user.teamId },
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      assignedUser: {
        select: { name: true, email: true },
      },
      _count: {
        select: { messages: true },
      },
    },
    orderBy: { lastContactedAt: "desc" },
  });

  return <InboxLayout contacts={contacts} user={user} />;
}
