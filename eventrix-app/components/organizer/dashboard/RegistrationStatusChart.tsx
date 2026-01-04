"use client";

import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card } from "@/components/ui/card";

export function RegistrationStatusChart({
  data,
}: {
  data: Array<{ status: string; count: number }>;
}) {
  return (
    <Card className="p-4">
      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Registration status</div>

      {data.length === 0 ? (
        <div className="mt-4 rounded-md border border-dashed border-gray-200 p-6 text-sm text-gray-600 dark:border-gray-800 dark:text-gray-300">
          No registrations yet.
        </div>
      ) : (
        <div className="mt-4 h-64" aria-label="Registration status bar chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
