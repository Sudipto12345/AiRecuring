"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

export interface DonutSlice {
  name: string;
  value: number;
  color: string;
}

export function Donut({
  data,
  centerTop,
  centerBottom,
  size = 180,
}: {
  data: DonutSlice[];
  centerTop?: React.ReactNode;
  centerBottom?: React.ReactNode;
  size?: number;
}) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            innerRadius={size * 0.32}
            outerRadius={size * 0.46}
            paddingAngle={2}
            stroke="none"
            startAngle={90}
            endAngle={-270}
            isAnimationActive={false}
          >
            {data.map((s) => (
              <Cell key={s.name} fill={s.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      {(centerTop || centerBottom) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {centerTop}
          {centerBottom}
        </div>
      )}
    </div>
  );
}
