import React from 'react';
import { GlowCard } from '@/components/ui/spotlight-card';
import { Github, Linkedin, Twitter, Mail } from 'lucide-react';

interface TeamMember {
  name: string;
  role: string;
  image: string;
  bio?: string;
  social?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    email?: string;
  };
}

interface TeamCardProps {
  member: TeamMember;
  className?: string;
}

export function TeamCard({ member, className = '' }: TeamCardProps) {
  return (
    <GlowCard 
      customSize={true} 
      glowColor="purple" 
      className={`w-full h-full ${className}`}
    >
      <div className="flex flex-col items-center h-full justify-center">
        <div className="mb-4 h-32 w-32 overflow-hidden rounded-full">
          <img
            src={member.image}
            alt={member.name}
            className="h-full w-full object-cover"
          />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          {member.name}
        </h3>
        <p className="mt-1 text-sm font-medium text-primary">{member.role}</p>
        {member.bio && (
          <p className="mt-3 text-center text-sm text-gray-600 dark:text-gray-300">
            {member.bio}
          </p>
        )}
        {member.social && (
          <div className="mt-4 flex space-x-3">
            {member.social.github && (
              <a
                href={member.social.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                aria-label={`${member.name}'s GitHub`}
              >
                <Github className="h-5 w-5" />
              </a>
            )}
            {member.social.linkedin && (
              <a
                href={member.social.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                aria-label={`${member.name}'s LinkedIn`}
              >
                <Linkedin className="h-5 w-5" />
              </a>
            )}
            {member.social.twitter && (
              <a
                href={member.social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                aria-label={`${member.name}'s Twitter`}
              >
                <Twitter className="h-5 w-5" />
              </a>
            )}
            {member.social.email && (
              <a
                href={`mailto:${member.social.email}`}
                className="text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                aria-label={`Email ${member.name}`}
              >
                <Mail className="h-5 w-5" />
              </a>
            )}
          </div>
        )}
      </div>
    </GlowCard>
  );
}
