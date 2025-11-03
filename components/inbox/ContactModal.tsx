"use client";

import { Fragment } from "react";

type Contact = any;

interface ContactModalProps {
  contact: Contact;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Contact details modal
 */
export default function ContactModal({
  contact,
  isOpen,
  onClose,
}: ContactModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Contact Details</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-md hover:bg-gray-100"
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

          {/* Avatar */}
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
              {contact.name?.[0]?.toUpperCase() || "?"}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Name</label>
              <p className="text-gray-900">{contact.name || "Not provided"}</p>
            </div>

            {contact.email && (
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Email
                </label>
                <p className="text-gray-900">{contact.email}</p>
              </div>
            )}

            {contact.phoneNumber && (
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Phone
                </label>
                <p className="text-gray-900">{contact.phoneNumber}</p>
              </div>
            )}

            {contact.whatsappNumber && (
              <div>
                <label className="text-sm font-medium text-gray-500">
                  WhatsApp
                </label>
                <p className="text-gray-900">{contact.whatsappNumber}</p>
              </div>
            )}

            {contact.tags && contact.tags.length > 0 && (
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {contact.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {contact.assignedUser && (
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Assigned To
                </label>
                <p className="text-gray-900">{contact.assignedUser.name}</p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-500">
                Total Messages
              </label>
              <p className="text-gray-900">{contact._count?.messages || 0}</p>
            </div>

            {contact.lastContactedAt && (
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Last Contacted
                </label>
                <p className="text-gray-900">
                  {new Date(contact.lastContactedAt).toLocaleString()}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Close
            </button>
            <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Edit Contact
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
