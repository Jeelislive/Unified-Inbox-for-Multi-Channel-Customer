"use client";

import { ChannelType } from "@prisma/client";
import LogoutButton from "../LogoutButton";
import { cn } from "@/lib/utils";

type Contact = any;
type User = any;

interface SidebarProps {
  contacts: Contact[];
  selectedContactId: string | null;
  onSelectContact: (id: string) => void;
  selectedChannel: ChannelType | "ALL";
  onSelectChannel: (channel: ChannelType | "ALL") => void;
  user: User;
  isOpen: boolean;
  onToggle: () => void;
}

const CHANNELS = [
  { value: "ALL", label: "All Channels", icon: "💬" },
  { value: "SMS", label: "SMS", icon: "📱" },
  { value: "WHATSAPP", label: "WhatsApp", icon: "💚" },
  { value: "EMAIL", label: "Email", icon: "📧" },
  { value: "TWITTER", label: "Twitter", icon: "🐦" },
  { value: "FACEBOOK", label: "Facebook", icon: "👍" },
  { value: "INSTAGRAM", label: "Instagram", icon: "📷" },
];

/**
 * Inbox sidebar with channel filter and contacts list
 */
export default function Sidebar({
  contacts,
  selectedContactId,
  onSelectContact,
  selectedChannel,
  onSelectChannel,
  user,
  isOpen,
  onToggle,
}: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-80 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="h-16 border-b border-gray-200 flex items-center justify-between px-4">
          <h1 className="text-lg font-bold text-gray-900">Inbox</h1>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">{user.role}</span>
            <button
              onClick={onToggle}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Channel Filter */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xs font-semibold text-gray-500 uppercase mb-2">
            Channels
          </h2>
          <div className="space-y-1">
            {CHANNELS.map((channel) => (
              <button
                key={channel.value}
                onClick={() => onSelectChannel(channel.value as any)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                  selectedChannel === channel.value
                    ? "bg-blue-50 text-blue-700 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <span>{channel.icon}</span>
                <span>{channel.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-xs font-semibold text-gray-500 uppercase mb-2">
              Conversations ({contacts.length})
            </h2>
            <div className="space-y-1">
              {contacts.map((contact) => {
                const lastMessage = contact.messages[0];
                const unreadCount = 0; // TODO: Implement unread count

                return (
                  <button
                    key={contact.id}
                    onClick={() => onSelectContact(contact.id)}
                    className={cn(
                      "w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors",
                      selectedContactId === contact.id
                        ? "bg-blue-50"
                        : "hover:bg-gray-50"
                    )}
                  >
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                        {contact.name?.[0]?.toUpperCase() || "?"}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {contact.name || contact.phoneNumber || "Unknown"}
                        </p>
                        {lastMessage && (
                          <span className="text-xs text-gray-500">
                            {new Date(lastMessage.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </span>
                        )}
                      </div>

                      {lastMessage && (
                        <p className="text-sm text-gray-600 truncate">
                          {lastMessage.content}
                        </p>
                      )}

                      <div className="flex items-center gap-2 mt-1">
                        {lastMessage && (
                          <span className="text-xs text-gray-500">
                            {getChannelIcon(lastMessage.channel)}
                          </span>
                        )}
                        {unreadCount > 0 && (
                          <span className="px-1.5 py-0.5 text-xs font-semibold text-white bg-blue-600 rounded-full">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}

              {contacts.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-8">
                  No contacts found
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-700">{user.name}</span>
          </div>
          <LogoutButton />
        </div>
      </div>
    </>
  );
}

function getChannelIcon(channel: string) {
  const icons: Record<string, string> = {
    SMS: "📱",
    WHATSAPP: "💚",
    EMAIL: "📧",
    TWITTER: "🐦",
    FACEBOOK: "👍",
    INSTAGRAM: "📷",
  };
  return icons[channel] || "💬";
}
