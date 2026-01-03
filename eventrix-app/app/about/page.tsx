import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import {
  SectionHeader,
  FeatureCard,
  TeamCard,
} from '@/components/static';
import {
  Calendar,
  Users,
  Ticket,
  TrendingUp,
  Shield,
  Zap,
  Bell,
  BarChart,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us - Eventrix',
  description:
    'Learn about Eventrix, the ultimate platform for seamless event management. Discover our mission, features, and the team behind the platform.',
  keywords: [
    'event management',
    'about eventrix',
    'event platform',
    'team',
    'mission',
  ],
};

export default function AboutPage() {
  const features = [
    {
      icon: Calendar,
      title: 'Event Management',
      description:
        'Create and manage events with ease. Set up schedules, venues, and all event details in one place.',
    },
    {
      icon: Ticket,
      title: 'Ticketing System',
      description:
        'Seamless ticket generation and management. Handle registrations, payments, and attendee tracking.',
    },
    {
      icon: Users,
      title: 'Team Collaboration',
      description:
        'Work together with your team. Assign roles, manage permissions, and coordinate effectively.',
    },
    {
      icon: TrendingUp,
      title: 'Analytics & Insights',
      description:
        'Get detailed analytics on your events. Track attendance, engagement, and performance metrics.',
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description:
        'Built with security in mind. Your data is protected with industry-standard encryption.',
    },
    {
      icon: Zap,
      title: 'Fast & Efficient',
      description:
        'Lightning-fast performance. Manage thousands of events and attendees without breaking a sweat.',
    },
    {
      icon: Bell,
      title: 'Smart Notifications',
      description:
        'Keep everyone informed with automated notifications and reminders via email and SMS.',
    },
    {
      icon: BarChart,
      title: 'Real-time Updates',
      description:
        'Get live updates on registrations, check-ins, and event status. Stay in control at all times.',
    },
  ];

  const team = [
    {
      name: 'Kuldeep Bhadouriya',
      role: 'Lead Developer',
      image: '/assets/team/placeholder-avatar.svg',
      bio: 'Full-stack developer passionate about creating seamless event management solutions.',
      social: {
        github: 'https://github.com/Kuldeep-bhadouriya',
        linkedin: 'https://linkedin.com/in/kuldeep-bhadouriya',
        email: 'kuldeep@eventrix.com',
      },
    },
    // Add more team members as needed
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Eventrix
              </span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300 sm:text-xl">
              The ultimate platform for seamless event management and
              unforgettable experiences
            </p>
            <div className="mt-10 flex items-center justify-center gap-6">
              <div className="relative h-64 w-full max-w-2xl overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-2xl">
                <div className="flex h-full items-center justify-center">
                  <Calendar className="h-32 w-32 text-white opacity-20" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <SectionHeader
              title="Our Mission"
              subtitle="Empowering event organizers worldwide"
              centered
            />
            <div className="space-y-6 text-center text-gray-600 dark:text-gray-300">
              <p className="text-lg">
                At Eventrix, we believe that every event should be a memorable
                experience. Our mission is to provide event organizers with
                powerful, intuitive tools that simplify the complexities of
                event management.
              </p>
              <p className="text-lg">
                We envision a world where creating and managing events is
                effortless, allowing organizers to focus on what truly matters:
                creating meaningful connections and unforgettable experiences
                for their attendees.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-white py-16 dark:bg-gray-900 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Features & Benefits"
            subtitle="Everything you need to manage successful events"
            centered
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Meet Our Team"
            subtitle="The people behind Eventrix"
            centered
          />
          <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((member, index) => (
              <TeamCard key={index} member={member} />
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to Get Started?
            </h2>
            <p className="mt-6 text-lg leading-8 text-blue-100">
              Join thousands of event organizers who trust Eventrix to manage
              their events. Create your account today and start planning your
              next amazing event!
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/auth/signup">
                <Button
                  size="lg"
                  variant="secondary"
                  className="w-full bg-white text-blue-600 hover:bg-gray-100 sm:w-auto"
                >
                  Create Account
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-white text-white hover:bg-white/10 sm:w-auto"
                >
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
