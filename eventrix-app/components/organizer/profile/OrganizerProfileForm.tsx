"use client";

import { useEffect, useState } from "react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/providers/toast-provider";

type ProfileData = {
  organizationName: string;
  logo: string | null;
  bio: string | null;
  verified: boolean;
  socialLinks: Record<string, unknown> | null;
  user: {
    name: string | null;
    email: string | null;
  };
};

export function OrganizerProfileForm() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const [organizationName, setOrganizationName] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [industry, setIndustry] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [twitter, setTwitter] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [instagram, setInstagram] = useState("");
  const [facebook, setFacebook] = useState("");
  const [logo, setLogo] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/organizer/profile")
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        const data = (json?.data ?? null) as ProfileData | null;
        if (!data) return;

        setOrganizationName(data.organizationName || "");
        setBio(data.bio || "");
        setLogo(data.logo || null);
        setVerified(Boolean(data.verified));

        const social = (data.socialLinks ?? {}) as Record<string, unknown>;
        setWebsite(typeof social.website === "string" ? social.website : "");
        setIndustry(typeof social.industry === "string" ? social.industry : "");
        setContactEmail(typeof social.contactEmail === "string" ? social.contactEmail : "");
        setTwitter(typeof social.twitter === "string" ? social.twitter : "");
        setLinkedin(typeof social.linkedin === "string" ? social.linkedin : "");
        setInstagram(typeof social.instagram === "string" ? social.instagram : "");
        setFacebook(typeof social.facebook === "string" ? social.facebook : "");
      })
      .catch(() => {
        if (cancelled) return;
        toast({ title: "Failed to load organizer profile", variant: "error" });
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [toast]);

  async function uploadLogo(file: File) {
    const form = new FormData();
    form.append("file", file);

    const res = await fetch("/api/organizer/profile/logo", {
      method: "POST",
      body: form,
    });

    const json = await res.json();
    if (!res.ok) throw new Error();
    const url = json?.data?.url as string | undefined;
    if (url) setLogo(url);
  }

  async function saveProfile() {
    setSaving(true);

    try {
      const res = await fetch("/api/organizer/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationName,
          bio,
          website,
          industry,
          contactEmail,
          socialLinks: {
            twitter,
            linkedin,
            instagram,
            facebook,
          },
        }),
      });

      if (!res.ok) throw new Error();
      toast({ title: "Profile updated", variant: "success" });
    } catch {
      toast({ title: "Profile update failed", variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function requestVerification() {
    setVerifying(true);
    try {
      const res = await fetch("/api/organizer/profile/verify", {
        method: "POST",
      });
      const json = await res.json();
      if (!res.ok) throw new Error();
      setVerified(Boolean(json?.data?.verified));
      toast({ title: "Verification request processed", variant: "success" });
    } catch {
      toast({ title: "Verification request failed", variant: "error" });
    } finally {
      setVerifying(false);
    }
  }

  if (loading) {
    return <Card className="p-4 text-sm text-gray-600 dark:text-gray-300">Loading profile...</Card>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Organizer profile</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300">Manage your organization identity and contact channels.</p>
      </div>

      <Card className="space-y-4 p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="h-16 w-16 overflow-hidden rounded-full border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-900">
              {logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logo} alt="Organization logo" className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Logo</p>
              <label className="mt-1 inline-flex cursor-pointer items-center rounded-md border border-gray-200 px-3 py-1.5 text-xs hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900">
                Upload logo
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      await uploadLogo(file);
                      toast({ title: "Logo uploaded", variant: "success" });
                    } catch {
                      toast({ title: "Logo upload failed", variant: "error" });
                    } finally {
                      e.target.value = "";
                    }
                  }}
                />
              </label>
            </div>
          </div>

          <Button type="button" variant={verified ? "outline" : "default"} onClick={requestVerification} disabled={verifying || verified}>
            {verified ? "Verified" : verifying ? "Verifying..." : "Request verification"}
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="organizationName">Organization name</Label>
            <Input id="organizationName" value={organizationName} onChange={(e) => setOrganizationName(e.target.value)} />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <Label htmlFor="bio">Description</Label>
            <textarea
              id="bio"
              className="min-h-24 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-900/10 dark:border-gray-800 dark:bg-gray-950 dark:focus:ring-gray-100/10"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="website">Website</Label>
            <Input id="website" value={website} onChange={(e) => setWebsite(e.target.value)} />
          </div>

          <div className="space-y-1">
            <Label htmlFor="industry">Industry</Label>
            <Input id="industry" value={industry} onChange={(e) => setIndustry(e.target.value)} />
          </div>

          <div className="space-y-1">
            <Label htmlFor="contactEmail">Contact email</Label>
            <Input id="contactEmail" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
          </div>

          <div className="space-y-1">
            <Label htmlFor="twitter">Twitter</Label>
            <Input id="twitter" value={twitter} onChange={(e) => setTwitter(e.target.value)} />
          </div>

          <div className="space-y-1">
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input id="linkedin" value={linkedin} onChange={(e) => setLinkedin(e.target.value)} />
          </div>

          <div className="space-y-1">
            <Label htmlFor="instagram">Instagram</Label>
            <Input id="instagram" value={instagram} onChange={(e) => setInstagram(e.target.value)} />
          </div>

          <div className="space-y-1">
            <Label htmlFor="facebook">Facebook</Label>
            <Input id="facebook" value={facebook} onChange={(e) => setFacebook(e.target.value)} />
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="button" onClick={saveProfile} disabled={saving || !organizationName.trim()}>
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
