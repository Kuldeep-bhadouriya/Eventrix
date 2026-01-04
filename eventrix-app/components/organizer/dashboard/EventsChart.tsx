"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(var(--accent))",
  "hsl(var(--muted))",
  "hsl(var(--destructive))",
];

export function EventsChart({
  data,
}: {
  data: Array<{ category: string; events: number }>;
}) {
  return (
    <Card className="p-4">
      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">Events by category</div>

      {data.length === 0 ? (
        <div className="mt-4 rounded-md border border-dashed border-gray-200 p-6 text-sm text-gray-600 dark:border-gray-800 dark:text-gray-300">
          No events yet.
        </div>
      ) : (
        <div className="mt-4 h-64" aria-label="Events by category chart">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="events" nameKey="category" outerRadius={90}>
                {data.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
