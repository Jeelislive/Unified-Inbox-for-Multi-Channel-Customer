"use client";

import { useState } from "react";
import { ChannelType } from "@prisma/client";
import Sidebar from "./Sidebar";
import MessageThread from "./MessageThread";
import ContactModal from "./ContactModal";

type Contact = any; // Simplified for now
type User = any;

interface InboxLayoutProps {
  contacts: Contact[];
  user: User;
}

/**
 * Main inbox layout with sidebar and message thread
 */
export default function InboxLayout({ contacts, user }: InboxLayoutProps) {
  const [selectedContactId, setSelectedContactId] = useState<string | null>(
    contacts[0]?.id || null
  );
  const [selectedChannel, setSelectedChannel] = useState<ChannelType | "ALL">(
    "ALL"
  );
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const selectedContact = contacts.find((c) => c.id === selectedContactId);

  // Filter contacts by selected channel
  const filteredContacts =
    selectedChannel === "ALL"
      ? contacts
      : contacts.filter((contact) =>
          contact.messages.some((m: any) => m.channel === selectedChannel)
        );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        contacts={filteredContacts}
        selectedContactId={selectedContactId}
        onSelectContact={setSelectedContactId}
        selectedChannel={selectedChannel}
        onSelectChannel={setSelectedChannel}
        user={user}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <MessageThread
            contact={selectedContact}
            user={user}
            onOpenContactModal={() => setIsContactModalOpen(true)}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No conversation selected
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Select a contact from the sidebar to view messages
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Contact Modal */}
      {selectedContact && (
        <ContactModal
          contact={selectedContact}
          isOpen={isContactModalOpen}
          onClose={() => setIsContactModalOpen(false)}
        />
      )}
    </div>
  );
}
