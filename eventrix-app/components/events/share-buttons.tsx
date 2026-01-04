"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Share2, Mail, MessageCircle, Twitter, Facebook } from 'lucide-react';

interface ShareButtonsProps {
  title: string;
  url?: string;
}

export function ShareButtons({ title, url }: ShareButtonsProps) {
  const currentUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const [copied, setCopied] = useState(false);

  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(currentUrl);

  const shareLinks = {
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url: currentUrl });
      } catch (error) {
        console.error('Share failed', error);
      }
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy failed', error);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="secondary"
        size="sm"
        onClick={handleNativeShare}
        className="flex items-center gap-2"
      >
        <Share2 className="h-4 w-4" /> Share
      </Button>
      <Button asChild variant="outline" size="sm">
        <a href={shareLinks.whatsapp} target="_blank" rel="noreferrer" aria-label="Share on WhatsApp">
          <MessageCircle className="h-4 w-4" />
        </a>
      </Button>
      <Button asChild variant="outline" size="sm">
        <a href={shareLinks.email} aria-label="Share via email">
          <Mail className="h-4 w-4" />
        </a>
      </Button>
      <Button asChild variant="outline" size="sm">
        <a href={shareLinks.twitter} target="_blank" rel="noreferrer" aria-label="Share on Twitter">
          <Twitter className="h-4 w-4" />
        </a>
      </Button>
      <Button asChild variant="outline" size="sm">
        <a href={shareLinks.facebook} target="_blank" rel="noreferrer" aria-label="Share on Facebook">
          <Facebook className="h-4 w-4" />
        </a>
      </Button>
      <Button variant="outline" size="sm" onClick={handleCopy} className="flex items-center gap-2">
        <Copy className="h-4 w-4" /> {copied ? 'Copied' : 'Copy Link'}
      </Button>
    </div>
  );
}
