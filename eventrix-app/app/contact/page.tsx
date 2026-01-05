import React from 'react';
import { Metadata } from 'next';
import { SectionHeader, ContactForm, InfoCard, FooterSection } from '@/components/static';
import { WebGLShader } from '@/components/ui/web-gl-shader';
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageSquare,
  Headphones,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us - Eventrix',
  description:
    'Get in touch with Eventrix. Send us a message, call us, or visit our office. We\'re here to help with all your event management needs.',
  keywords: [
    'contact eventrix',
    'support',
    'help',
    'get in touch',
    'customer service',
  ],
};

export default function ContactPage() {
  const contactInfo = [
    {
      icon: Mail,
      title: 'Email',
      content: 'support@eventrix.com',
      link: 'mailto:support@eventrix.com',
    },
    {
      icon: Phone,
      title: 'Phone',
      content: '+1 (555) 123-4567',
      link: 'tel:+15551234567',
    },
    {
      icon: MapPin,
      title: 'Address',
      content: '123 Event Street, Suite 100, San Francisco, CA 94102',
    },
    {
      icon: Clock,
      title: 'Business Hours',
      content: 'Monday - Friday: 9:00 AM - 6:00 PM PST',
    },
    {
      icon: MessageSquare,
      title: 'Live Chat',
      content: 'Available 24/7 for premium members',
    },
    {
      icon: Headphones,
      title: 'Support',
      content: 'Dedicated support team ready to help',
    },
  ];

  return (
    <main className="relative min-h-screen">
      <WebGLShader />
      {/* Header Section */}
      <section className="relative overflow-hidden py-16 sm:py-20">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Get in Touch
            </h1>
            <p className="mt-6 text-lg text-gray-200">
              Have questions? We&apos;d love to hear from you. Send us a message and
              we&apos;ll respond as soon as possible.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form and Info Section */}
      <section className="relative bg-background/50 backdrop-blur-sm pb-16 sm:pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2">
            {/* Contact Form */}
            <div>
              <SectionHeader
                title="Send us a Message"
                subtitle="Fill out the form below and we'll get back to you shortly"
              />
              <ContactForm />
            </div>

            {/* Contact Information */}
            <div>
              <SectionHeader
                title="Contact Information"
                subtitle="Other ways to reach us"
              />
              <div className="space-y-4">
                {contactInfo.map((info, index) => (
                  <InfoCard
                    key={index}
                    icon={info.icon}
                    title={info.title}
                    content={info.content}
                    link={info.link}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <SectionHeader
              title="Frequently Asked Questions"
              subtitle="Quick answers to common questions"
              centered
            />
            <div className="space-y-6">
              <div className="glass-effect rounded-lg border border-white/10 bg-white/10 p-6">
                <h3 className="mb-2 text-lg font-semibold text-white">
                  What is Eventrix?
                </h3>
                <p className="text-gray-200">
                  Eventrix is a comprehensive event management platform that
                  helps you create, manage, and track events of all sizes. From
                  small meetups to large conferences, we provide all the tools
                  you need.
                </p>
              </div>
              <div className="glass-effect rounded-lg border border-white/10 bg-white/10 p-6">
                <h3 className="mb-2 text-lg font-semibold text-white">
                  How quickly do you respond to inquiries?
                </h3>
                <p className="text-gray-200">
                  We typically respond to all inquiries within 24 hours during
                  business days. For urgent matters, please call our support
                  line directly.
                </p>
              </div>
              <div className="glass-effect rounded-lg border border-white/10 bg-white/10 p-6">
                <h3 className="mb-2 text-lg font-semibold text-white">
                  Do you offer custom solutions?
                </h3>
                <p className="text-gray-200">
                  Yes! We offer custom solutions for enterprise clients with
                  specific needs. Contact our sales team to discuss your
                  requirements.
                </p>
              </div>
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
