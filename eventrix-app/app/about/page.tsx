import React from 'react';
import { Metadata } from 'next';
import Image from 'next/image';
import {
  SectionHeader,
  FeatureCard,
  TeamCard,
  FooterSection,
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
import { WebGLShader } from '@/components/ui/web-gl-shader';

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

  const leads = [
    {
      name: 'Ganesh Sharma',
      role: 'Male Lead',
      image: '/assets/team/placeholder-avatar.svg',
      bio: 'Event lead coordinating planning, execution, and team alignment.',
      social: {
        github: '#',
        linkedin: '#',
        email: 'ganesh@eventrix.com',
      },
    },
    {
      name: 'Shrishti Tiwari',
      role: 'Female Lead',
      image: '/assets/team/placeholder-avatar.svg',
      bio: 'Event lead overseeing operations, coordination, and participant experience.',
      social: {
        github: '#',
        linkedin: '#',
        email: 'shrishti@eventrix.com',
      },
    },
  ];

  const incharges = [
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
    {
      name: 'Aditya Gupta',
      role: 'Setup & Logistic',
      image: '/assets/team/placeholder-avatar.svg',
      bio: 'Manages setup planning and on-ground logistics for smooth execution.',
      social: {
        github: '#',
        linkedin: '#',
        email: 'aditya@eventrix.com',
      },
    },
    {
      name: 'Adarsh Bhadouriya',
      role: 'Volunteer Deployment',
      image: '/assets/team/placeholder-avatar.svg',
      bio: 'Coordinates volunteer allocation, deployment, and task tracking.',
      social: {
        github: '#',
        linkedin: '#',
        email: 'adarsh@eventrix.com',
      },
    },
    {
      name: 'Anvi Somani',
      role: 'Anchor Operations',
      image: '/assets/team/placeholder-avatar.svg',
      bio: 'Handles anchor coordination, stage flow, and program operations.',
      social: {
        github: '#',
        linkedin: '#',
        email: 'anvi@eventrix.com',
      },
    },
    {
      name: 'Jatin Joshi',
      role: 'Creative Communication',
      image: '/assets/team/placeholder-avatar.svg',
      bio: 'Owns creative communication across announcements, content, and messaging.',
      social: {
        github: '#',
        linkedin: '#',
        email: 'jatin@eventrix.com',
      },
    },
  ];

  return (
    <main className="relative min-h-screen">
      <WebGLShader />
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Eventrix
              </span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-200 sm:text-xl">
              The ultimate platform for seamless event management and
              unforgettable experiences
            </p>
            <div className="mt-10 flex items-center justify-center gap-6">
              <div className="relative h-64 w-full max-w-2xl overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 backdrop-blur-md border border-white/10 shadow-2xl">
                <div className="flex h-full items-center justify-center">
                  <Image
                    src="/assets/Icon.png"
                    alt="Eventrix"
                    width={360}
                    height={180}
                    className="h-24 w-auto opacity-80"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="relative py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <SectionHeader
              title="Our Mission"
              subtitle="Empowering event organizers worldwide"
              centered
            />
            <div className="space-y-6 text-center text-gray-200">
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
      <section className="relative bg-background/50 backdrop-blur-sm py-16 sm:py-24">
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
      <section className="relative py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            title="Meet Our Team"
            subtitle="The people behind Eventrix"
            centered
          />

          <div className="mx-auto max-w-5xl">
            <h3 className="text-lg font-semibold text-white">Leads</h3>
            <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {leads.map((member, index) => (
                <TeamCard key={`lead-${index}`} member={member} />
              ))}
            </div>

            <h3 className="mt-14 text-lg font-semibold text-white">
              Incharges
            </h3>
            <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {incharges.map((member, index) => (
                <TeamCard key={`incharge-${index}`} member={member} />
              ))}
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
