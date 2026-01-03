import React from 'react';
import { Metadata } from 'next';
import { SectionHeader, ContactForm, InfoCard } from '@/components/static';
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
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
      {/* Header Section */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
              Get in Touch
            </h1>
            <p className="mt-6 text-lg text-gray-600 dark:text-gray-300">
              Have questions? We'd love to hear from you. Send us a message and
              we'll respond as soon as possible.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form and Info Section */}
      <section className="pb-16 sm:pb-24">
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

      {/* Map Section (Optional - placeholder) */}
      <section className="bg-white py-16 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Visit Our Office"
            subtitle="We'd love to meet you in person"
            centered
          />
          <div className="mx-auto max-w-5xl">
            <div className="relative h-96 overflow-hidden rounded-2xl bg-gray-200 dark:bg-gray-800">
              {/* Placeholder for map - you can integrate Google Maps or other map service */}
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <MapPin className="mx-auto h-16 w-16 text-gray-400" />
                  <p className="mt-4 text-gray-600 dark:text-gray-400">
                    Map integration coming soon
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <SectionHeader
              title="Frequently Asked Questions"
              subtitle="Quick answers to common questions"
              centered
            />
            <div className="space-y-6">
              <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                  What is Eventrix?
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Eventrix is a comprehensive event management platform that
                  helps you create, manage, and track events of all sizes. From
                  small meetups to large conferences, we provide all the tools
                  you need.
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                  How quickly do you respond to inquiries?
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  We typically respond to all inquiries within 24 hours during
                  business days. For urgent matters, please call our support
                  line directly.
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                  Do you offer custom solutions?
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Yes! We offer custom solutions for enterprise clients with
                  specific needs. Contact our sales team to discuss your
                  requirements.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
