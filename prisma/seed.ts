import {
  PrismaClient,
  Role,
  ChannelType,
  MessageDirection,
  MessageStatus,
  ContactTag,
  NoteVisibility,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * Seed the database with demo data
 */
async function main() {
  console.log("🌱 Starting database seed...");

  // Create demo team
  const team = await prisma.team.upsert({
    where: { slug: "acme-corp" },
    update: {},
    create: {
      name: "Acme Corporation",
      slug: "acme-corp",
      twilioPhoneNumber: "+1234567890", // Demo number
    },
  });
  console.log("✓ Created team:", team.name);

  // Hash demo password
  const demoPassword = await bcrypt.hash("demo123", 10);

  // Create demo users
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@acme.com" },
    update: {},
    create: {
      email: "admin@acme.com",
      name: "Admin User",
      role: Role.ADMIN,
      teamId: team.id,
      password: demoPassword,
    },
  });

  const editorUser = await prisma.user.upsert({
    where: { email: "editor@acme.com" },
    update: {},
    create: {
      email: "editor@acme.com",
      name: "Editor User",
      role: Role.EDITOR,
      teamId: team.id,
      password: demoPassword,
    },
  });

  const viewerUser = await prisma.user.upsert({
    where: { email: "viewer@acme.com" },
    update: {},
    create: {
      email: "viewer@acme.com",
      name: "Viewer User",
      role: Role.VIEWER,
      teamId: team.id,
      password: demoPassword,
    },
  });
  console.log("✓ Created users: Admin, Editor, Viewer");

  // Create demo contacts
  const contact1 = await prisma.contact.create({
    data: {
      name: "John Doe",
      email: "john@example.com",
      phoneNumber: "+1234567001",
      whatsappNumber: "+1234567001",
      tags: [ContactTag.LEAD, ContactTag.VIP],
      teamId: team.id,
      assignedUserId: editorUser.id,
      customFields: {
        company: "Tech Startup Inc",
        industry: "Technology",
      },
    },
  });

  const contact2 = await prisma.contact.create({
    data: {
      name: "Jane Smith",
      email: "jane@example.com",
      phoneNumber: "+1234567002",
      tags: [ContactTag.CLIENT],
      teamId: team.id,
      assignedUserId: editorUser.id,
      customFields: {
        company: "Marketing Agency",
        industry: "Marketing",
      },
    },
  });

  const contact3 = await prisma.contact.create({
    data: {
      name: "Bob Johnson",
      phoneNumber: "+1234567003",
      whatsappNumber: "+1234567003",
      tags: [ContactTag.SUPPORT],
      teamId: team.id,
      customFields: {
        priority: "high",
      },
    },
  });
  console.log("✓ Created 3 demo contacts");

  // Create demo messages
  const inboundMessage1 = await prisma.message.create({
    data: {
      content: "Hi, I'm interested in your product. Can you tell me more?",
      channel: ChannelType.SMS,
      direction: MessageDirection.INBOUND,
      status: MessageStatus.DELIVERED,
      contactId: contact1.id,
      teamId: team.id,
      sentAt: new Date(Date.now() - 3600000), // 1 hour ago
      deliveredAt: new Date(Date.now() - 3600000),
    },
  });

  const outboundMessage1 = await prisma.message.create({
    data: {
      content:
        "Thanks for reaching out! I'd be happy to help. Our product offers...",
      channel: ChannelType.SMS,
      direction: MessageDirection.OUTBOUND,
      status: MessageStatus.DELIVERED,
      contactId: contact1.id,
      teamId: team.id,
      userId: editorUser.id,
      inReplyToId: inboundMessage1.id,
      sentAt: new Date(Date.now() - 3000000), // 50 min ago
      deliveredAt: new Date(Date.now() - 3000000),
    },
  });

  await prisma.message.create({
    data: {
      content: "Hello! Just following up on our previous conversation.",
      channel: ChannelType.WHATSAPP,
      direction: MessageDirection.INBOUND,
      status: MessageStatus.DELIVERED,
      contactId: contact2.id,
      teamId: team.id,
      sentAt: new Date(Date.now() - 7200000), // 2 hours ago
      deliveredAt: new Date(Date.now() - 7200000),
    },
  });

  await prisma.message.create({
    data: {
      content: "Need help with my account access",
      channel: ChannelType.SMS,
      direction: MessageDirection.INBOUND,
      status: MessageStatus.DELIVERED,
      contactId: contact3.id,
      teamId: team.id,
      sentAt: new Date(Date.now() - 1800000), // 30 min ago
      deliveredAt: new Date(Date.now() - 1800000),
    },
  });

  // Create a scheduled message
  await prisma.message.create({
    data: {
      content: "Scheduled follow-up message for tomorrow",
      channel: ChannelType.SMS,
      direction: MessageDirection.OUTBOUND,
      status: MessageStatus.SCHEDULED,
      contactId: contact1.id,
      teamId: team.id,
      userId: editorUser.id,
      scheduledFor: new Date(Date.now() + 86400000), // 24 hours from now
    },
  });
  console.log("✓ Created 5 demo messages (including 1 scheduled)");

  // Create demo notes
  await prisma.note.create({
    data: {
      content:
        "Very interested prospect. Follow up next week about enterprise plan.",
      visibility: NoteVisibility.PUBLIC,
      contactId: contact1.id,
      teamId: team.id,
      authorId: editorUser.id,
      mentions: [adminUser.id],
      isPinned: true,
    },
  });

  await prisma.note.create({
    data: {
      content: "Client mentioned budget constraints. Offer discount if needed.",
      visibility: NoteVisibility.TEAM,
      contactId: contact2.id,
      teamId: team.id,
      authorId: editorUser.id,
    },
  });

  await prisma.note.create({
    data: {
      content: "Private note: This contact requires extra attention",
      visibility: NoteVisibility.PRIVATE,
      contactId: contact3.id,
      teamId: team.id,
      authorId: adminUser.id,
    },
  });
  console.log("✓ Created 3 demo notes");

  console.log("\n✅ Database seeded successfully!");
  console.log("\n📊 Demo accounts (password: demo123):");
  console.log("  Admin:  admin@acme.com");
  console.log("  Editor: editor@acme.com");
  console.log("  Viewer: viewer@acme.com");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
