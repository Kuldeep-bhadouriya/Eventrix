import type { Metadata } from 'next';
import { FooterSection, TOC } from '@/components/static';
import { WebGLShader } from '@/components/ui/web-gl-shader';

const LAST_UPDATED = 'April 15, 2026';

const tocItems = [
  { id: 'information-we-collect', label: 'Information We Collect' },
  { id: 'how-we-use-information', label: 'How We Use Information' },
  { id: 'sharing-and-disclosures', label: 'Sharing and Disclosures' },
  { id: 'data-retention', label: 'Data Retention' },
  { id: 'your-rights', label: 'Your Rights and Choices' },
  { id: 'security', label: 'Security Practices' },
  { id: 'contact-us', label: 'Contact Us' },
];

export const metadata: Metadata = {
  title: 'Privacy Policy - Eventrix',
  description:
    'Read Eventrix privacy practices, including what information we collect, how we use it, and the controls available to you.',
  keywords: ['eventrix privacy', 'privacy policy', 'data protection', 'user privacy'],
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

export default function PrivacyPage() {
  return (
    <main className="relative min-h-screen">
      <WebGLShader />

      <section className="relative overflow-hidden py-16 sm:py-20">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-white/65">Legal</p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">Privacy Policy</h1>
            <p className="mt-5 text-base text-white/80 sm:text-lg">
              Your trust matters. This policy explains what we collect, how we use it, and how you can control your data on Eventrix.
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
              <TOC items={tocItems} title="Policy contents" />
            </div>

            <div className="space-y-6">
              <LegalSection id="information-we-collect" title="Information We Collect">
                <p>
                  We collect information you provide directly, such as your name, email address, profile details, and event registrations.
                </p>
                <p>
                  We also collect operational data needed to run the platform, including device/browser data, IP address, and activity logs tied to account and security actions.
                </p>
              </LegalSection>

              <LegalSection id="how-we-use-information" title="How We Use Information">
                <p>
                  We use your data to provide core services like account authentication, event discovery, registration management, notifications, and certificates.
                </p>
                <p>
                  We may also use aggregated, non-identifiable analytics to improve reliability, product performance, and user experience.
                </p>
              </LegalSection>

              <LegalSection id="sharing-and-disclosures" title="Sharing and Disclosures">
                <p>
                  We do not sell your personal information. We only share data with trusted providers and event organizers when required to operate requested services.
                </p>
                <p>
                  We may disclose data when required by law, to enforce platform policies, or to protect users and infrastructure from abuse or fraud.
                </p>
              </LegalSection>

              <LegalSection id="data-retention" title="Data Retention">
                <p>
                  We keep personal data only as long as needed for account functionality, legal obligations, dispute resolution, and fraud prevention.
                </p>
                <p>
                  Retention windows vary by data type. Registration and audit records may be retained longer when required for compliance and security.
                </p>
              </LegalSection>

              <LegalSection id="your-rights" title="Your Rights and Choices">
                <p>
                  You can update profile details, manage notification preferences, and request account deletion from your dashboard settings where available.
                </p>
                <p>
                  Depending on your location, you may have additional rights to access, correct, or erase personal data. We honor valid requests in accordance with applicable law.
                </p>
              </LegalSection>

              <LegalSection id="security" title="Security Practices">
                <p>
                  We apply layered security controls including access restrictions, audit trails, credential protections, and environment-level safeguards.
                </p>
                <p>
                  No system is completely immune from risk, but we continuously monitor and improve controls to protect your information.
                </p>
              </LegalSection>

              <LegalSection id="contact-us" title="Contact Us">
                <p>
                  Questions about this policy can be sent to{' '}
                  <a
                    href="mailto:privacy@eventrix.com"
                    className="underline decoration-white/40 underline-offset-4 transition-colors hover:text-white"
                  >
                    privacy@eventrix.com
                  </a>
                  .
                </p>
                <p>We respond to privacy and data requests as quickly as possible, typically within standard business timelines.</p>
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
