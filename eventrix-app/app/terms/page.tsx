import type { Metadata } from 'next';
import { FooterSection, TOC } from '@/components/static';
import { WebGLShader } from '@/components/ui/web-gl-shader';

const LAST_UPDATED = 'April 15, 2026';

const tocItems = [
  { id: 'acceptance', label: 'Acceptance of Terms' },
  { id: 'accounts-and-eligibility', label: 'Accounts and Eligibility' },
  { id: 'platform-usage', label: 'Platform Usage Rules' },
  { id: 'event-content', label: 'Event Content and Organizer Duties' },
  { id: 'payments-and-refunds', label: 'Payments and Refunds' },
  { id: 'termination', label: 'Termination and Suspension' },
  { id: 'liability', label: 'Liability and Disclaimers' },
  { id: 'contact', label: 'Contact Information' },
];

export const metadata: Metadata = {
  title: 'Terms of Service - Eventrix',
  description:
    'Review Eventrix terms of service, including account responsibilities, acceptable use, and legal conditions for using the platform.',
  keywords: ['eventrix terms', 'terms of service', 'platform rules', 'legal terms'],
};

function LegalSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 rounded-2xl border border-white/10 bg-white/10 p-6 sm:p-7">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <div className="mt-4 space-y-3 text-sm leading-7 text-white/85 sm:text-base">{children}</div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <main className="relative min-h-screen">
      <WebGLShader />

      <section className="relative overflow-hidden py-16 sm:py-20">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-white/65">Legal</p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">Terms of Service</h1>
            <p className="mt-5 text-base text-white/80 sm:text-lg">
              These terms govern your access to Eventrix and define account responsibilities, acceptable usage, and legal boundaries.
            </p>
            <p className="mt-4 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-sm text-white/80">
              Last updated: {LAST_UPDATED}
            </p>
          </div>
        </div>
      </section>

      <section className="relative bg-background/50 pb-16 backdrop-blur-sm sm:pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[280px_1fr]">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <TOC items={tocItems} title="Terms contents" />
            </div>

            <div className="space-y-6">
              <LegalSection id="acceptance" title="Acceptance of Terms">
                <p>
                  By accessing Eventrix, you agree to these terms and applicable policies. If you do not agree, you must stop using the platform.
                </p>
                <p>
                  We may update these terms periodically. Continued use after updates means you accept the revised version.
                </p>
              </LegalSection>

              <LegalSection id="accounts-and-eligibility" title="Accounts and Eligibility">
                <p>
                  You are responsible for maintaining accurate account information and safeguarding login credentials.
                </p>
                <p>
                  You must be authorized to create organizer accounts or represent an organization when publishing events on Eventrix.
                </p>
              </LegalSection>

              <LegalSection id="platform-usage" title="Platform Usage Rules">
                <p>
                  You agree not to misuse the platform, interfere with operations, bypass security controls, or violate rights of other users.
                </p>
                <p>
                  Prohibited behavior includes spam, fraudulent registrations, unauthorized scraping, malware distribution, and abusive activity.
                </p>
              </LegalSection>

              <LegalSection id="event-content" title="Event Content and Organizer Duties">
                <p>
                  Organizers are responsible for the accuracy and legality of event listings, schedules, media, and participant communications.
                </p>
                <p>
                  Eventrix may moderate, suspend, or remove content that violates policy, legal requirements, or safety standards.
                </p>
              </LegalSection>

              <LegalSection id="payments-and-refunds" title="Payments and Refunds">
                <p>
                  If paid features are enabled, payment terms, fees, and taxes are shown at checkout or in your billing settings.
                </p>
                <p>
                  Refund eligibility depends on the event policy, transaction status, and applicable law.
                </p>
              </LegalSection>

              <LegalSection id="termination" title="Termination and Suspension">
                <p>
                  We may suspend or terminate access for policy violations, security risk, or legal compliance reasons.
                </p>
                <p>
                  You may request account closure at any time; some records may remain for compliance, audit, or fraud prevention.
                </p>
              </LegalSection>

              <LegalSection id="liability" title="Liability and Disclaimers">
                <p>
                  Eventrix is provided on an &quot;as is&quot; and &quot;as available&quot; basis without guarantees of uninterrupted service.
                </p>
                <p>
                  To the maximum extent permitted by law, Eventrix is not liable for indirect, incidental, or consequential damages arising from platform use.
                </p>
              </LegalSection>

              <LegalSection id="contact" title="Contact Information">
                <p>
                  For legal inquiries, contact{' '}
                  <a
                    href="mailto:legal@eventrix.com"
                    className="underline decoration-white/40 underline-offset-4 transition-colors hover:text-white"
                  >
                    legal@eventrix.com
                  </a>
                  .
                </p>
                <p>
                  For general support, use the contact page and our team will route your request to the right department.
                </p>
              </LegalSection>
            </div>
          </div>
        </div>
      </section>

      <div className="relative bg-background">
        <FooterSection />
      </div>
    </main>
  );
}
