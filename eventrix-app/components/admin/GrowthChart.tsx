"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { DashboardCard } from "@/components/dashboard/DashboardCard";

export type GrowthPoint = {
  date: string; // YYYY-MM-DD
  users: number;
  events: number;
  registrations: number;
};

export function GrowthChart({
  title,
  description,
  data,
}: {
  title: string;
  description?: string;
  data: GrowthPoint[];
}) {
  return (
    <DashboardCard title={title} description={description} className="h-full">
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="users" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="events" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="registrations" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">Users, events, and registrations over time.</div>
    </DashboardCard>
  );
}
