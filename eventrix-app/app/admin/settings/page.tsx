import { AdminSettingsClient } from "@/components/admin/AdminSettingsClient";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { DashboardSection } from "@/components/dashboard/DashboardSection";
import { prisma } from "@/lib/db";

const DEFAULT_TEMPLATES = [
  {
    name: "welcome",
    subject: "Welcome to Eventrix",
    body: "Hi {{name}},\n\nWelcome to Eventrix. Start exploring events that match your interests.\n\n- Team Eventrix",
    variables: ["name"],
    enabled: true,
  },
  {
    name: "event_reminder",
    subject: "Reminder: {{eventTitle}} starts soon",
    body: "Hi {{name}},\n\nThis is a reminder that {{eventTitle}} starts on {{eventDate}} at {{eventTime}}.",
    variables: ["name", "eventTitle", "eventDate", "eventTime"],
    enabled: true,
  },
  {
    name: "password_reset",
    subject: "Reset your password",
    body: "Hi {{name}},\n\nUse this link to reset your password: {{resetLink}}",
    variables: ["name", "resetLink"],
    enabled: true,
  },
];

function isDatabaseAvailable() {
  return Boolean(process.env.DATABASE_URL);
}

export default async function AdminSettingsPage() {
  const dbAvailable = isDatabaseAvailable();
  let dbWarning: string | null = null;

  let settings: {
    key: string;
    category: string;
    value: unknown;
    description?: string | null;
  }[] = [];

  let templates: {
    name: string;
    subject: string;
    body: string;
    variables: string[];
    enabled: boolean;
  }[] = [];

  let campaigns: {
    id: string;
    title: string;
    role: string;
    status: string;
    scheduledFor: string | null;
    sentAt: string | null;
    recipientsCount: number;
    createdAt: string;
  }[] = [];

  if (dbAvailable) {
    try {
      const campaignTableState = await prisma.$queryRaw<Array<{ table_name: string | null }>>`
        SELECT to_regclass('public.notification_campaigns')::text AS table_name
      `;
      const hasCampaignTable = Boolean(campaignTableState[0]?.table_name);

      const [settingsRows, templateRows, campaignRows] = await Promise.all([
        prisma.adminSetting.findMany({ orderBy: [{ category: "asc" }, { key: "asc" }] }),
        prisma.emailTemplate.findMany({ orderBy: { name: "asc" } }),
        hasCampaignTable
          ? prisma.notificationCampaign.findMany({
              orderBy: { createdAt: "desc" },
              take: 20,
            })
          : Promise.resolve([]),
      ]);

      if (!hasCampaignTable) {
        dbWarning = "Notification campaign history requires the latest Prisma schema sync.";
      }

      settings = settingsRows.map((row) => ({
        key: row.key,
        category: row.category,
        value: row.value,
        description: row.description,
      }));

      templates = templateRows.map((row) => ({
        name: row.name,
        subject: row.subject,
        body: row.body,
        variables: row.variables,
        enabled: row.enabled,
      }));

      if (templates.length === 0) {
        templates = DEFAULT_TEMPLATES;
      }

      campaigns = campaignRows.map((campaign) => ({
        id: campaign.id,
        title: campaign.title,
        role: campaign.role,
        status: campaign.status,
        scheduledFor: campaign.scheduledFor ? campaign.scheduledFor.toISOString() : null,
        sentAt: campaign.sentAt ? campaign.sentAt.toISOString() : null,
        recipientsCount: campaign.recipientsCount,
        createdAt: campaign.createdAt.toISOString(),
      }));
    } catch (error) {
      console.error("Failed to load admin settings data", error);
      templates = DEFAULT_TEMPLATES;
      dbWarning = "Admin settings tables are not available yet. Run Prisma schema sync/migrations.";
    }
  }

  return (
    <div className="space-y-6">
      <DashboardSection
        title="Settings"
        description="Manage platform configuration, email templates, and broadcast notifications"
      >
        <></>
      </DashboardSection>

      <DashboardCard title="Configuration" description="General, security, templates, and notification controls">
        <AdminSettingsClient
          initialSettings={settings}
          initialTemplates={templates}
          initialCampaigns={campaigns}
        />
      </DashboardCard>

      {!dbAvailable ? (
        <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800 dark:border-yellow-900 dark:bg-yellow-950/40 dark:text-yellow-200">
          DATABASE_URL is not configured; settings data is unavailable.
        </div>
      ) : null}

      {dbWarning ? (
        <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800 dark:border-yellow-900 dark:bg-yellow-950/40 dark:text-yellow-200">
          {dbWarning}
        </div>
      ) : null}
    </div>
  );
}
