import { useEffect, useMemo, useRef, type ReactNode } from "react";
import {
  Chart,
  DoughnutController,
  BarController,
  LineController,
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  type ChartConfiguration,
} from "chart.js";
import { useTheme } from "@/hooks/useTheme";

Chart.register(
  DoughnutController,
  BarController,
  LineController,
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
);

export interface ChartItem {
  label: string;
  value: number;
  color?: string;
}

interface DelayContext {
  type?: string;
  index?: number;
  xStarted?: boolean;
  yStarted?: boolean;
}

interface ChartCardProps {
  title: string;
  items: ChartItem[];
  height?: number;
}

const DEFAULT_PALETTE = [
  "#3F72AF",
  "#0D47A1",
  "#F59E0B",
  "#10B981",
  "#EF4444",
  "#0EA5E9",
  "#8B5CF6",
];

const getThemeColors = (theme: "light" | "dark") => ({
  tick: theme === "dark" ? "rgba(255,255,255,0.65)" : "#6B7280",
  grid: theme === "dark" ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)",
  border: theme === "dark" ? "#122B4B" : "#FFFFFF",
});

const getColors = (items: ChartItem[]) =>
  items.map(
    (item, index) => item.color ?? DEFAULT_PALETTE[index % DEFAULT_PALETTE.length],
  );

const ChartShell = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="rounded-2xl bg-white dark:bg-dark-surface border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
    <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">
      {title}
    </h2>
    {children}
  </section>
);

const EmptyChart = ({ height }: { height: number }) => (
  <div
    className="flex items-center justify-center text-sm text-gray-400 dark:text-gray-500"
    style={{ height }}
  >
    No data yet
  </div>
);

export const DoughnutChartCard = ({ title, items, height = 240 }: ChartCardProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart<"doughnut"> | null>(null);
  const { theme } = useTheme();

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.value, 0),
    [items],
  );
  const colors = useMemo(() => getColors(items), [items]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || total === 0 || items.length === 0) return;

    const themeColors = getThemeColors(theme);
    const config: ChartConfiguration<"doughnut"> = {
      type: "doughnut",
      data: {
        labels: items.map((item) => item.label),
        datasets: [
          {
            data: items.map((item) => item.value),
            backgroundColor: colors,
            borderColor: themeColors.border,
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "62%",
        animation: {
          animateRotate: true,
          animateScale: true,
          easing: "easeInOutQuart",
          duration: 800,
        },
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: themeColors.tick,
              boxWidth: 12,
              boxHeight: 12,
              usePointStyle: true,
            },
          },
          tooltip: {
            callbacks: {
              label: (context) =>
                ` ${context.label}: ${context.parsed} (${Math.round((context.parsed / total) * 100)}%)`,
            },
          },
        },
      },
    };

    Chart.getChart(canvas)?.destroy();
    chartRef.current?.destroy();
    chartRef.current = new Chart(canvas, config);

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [items, colors, total, theme]);

  return (
    <ChartShell title={title}>
      {total > 0 && items.length > 0 ? (
        <div style={{ height }}>
          <canvas ref={canvasRef} />
        </div>
      ) : (
        <EmptyChart height={height} />
      )}
    </ChartShell>
  );
};

export interface LineSeries {
  title: string;
  color: string;
  items: ChartItem[];
}

interface LineChartCardProps {
  title: string;
  series: LineSeries[];
  height?: number;
  pointDelay?: number;
  duration?: number;
}

export const LineChartCard = ({
  title,
  series,
  height = 320,
  pointDelay = 100,
  duration = 1000,
}: LineChartCardProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart<"line"> | null>(null);
  const { theme } = useTheme();

  const labels = useMemo(
    () => series[0]?.items.map((item) => item.label) ?? [],
    [series],
  );

  const hasData = useMemo(
    () => series.some((s) => s.items.some((item) => item.value > 0)),
    [series],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !hasData || labels.length === 0) return;

    const themeColors = getThemeColors(theme);
    const datasets = series
      .filter((s) => s.items.length > 0)
      .map((s) => ({
        label: s.title,
        data: s.items.map((item) => item.value),
        borderColor: s.color,
        backgroundColor: s.color,
        pointBackgroundColor: s.color,
        pointBorderColor: themeColors.border,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderWidth: 2,
        tension: 0.3,
        fill: false,
      }));

    const config = {
      type: "line",
      data: {
        labels,
        datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        animation: {
          x: {
            type: "number",
            easing: "easeInOutQuart",
            from: NaN,
            delay(context: DelayContext) {
              if (context.type !== "data") return 0;
              if (context.xStarted) return 0;
              context.xStarted = true;
              return (context.index ?? 0) * pointDelay;
            },
            duration,
          },
          y: {
            type: "number",
            easing: "easeInOutQuart",
            from: NaN,
            delay(context: DelayContext) {
              if (context.type !== "data") return 0;
              if (context.yStarted) return 0;
              context.yStarted = true;
              return (context.index ?? 0) * pointDelay;
            },
            duration,
          },
        },
        plugins: {
          legend: {
            labels: {
              color: themeColors.tick,
              boxWidth: 12,
              boxHeight: 12,
              usePointStyle: true,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: themeColors.tick },
          },
          y: {
            beginAtZero: true,
            grid: { color: themeColors.grid },
            ticks: { color: themeColors.tick, precision: 0 },
          },
        },
      },
    } as unknown as ChartConfiguration<"line">;

    Chart.getChart(canvas)?.destroy();
    chartRef.current?.destroy();
    chartRef.current = new Chart(canvas, config);

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [series, labels, hasData, theme, pointDelay, duration]);

  return (
    <ChartShell title={title}>
      {hasData ? (
        <div style={{ height }}>
          <canvas ref={canvasRef} />
        </div>
      ) : (
        <EmptyChart height={height} />
      )}
    </ChartShell>
  );
};

export const BarChartCard = ({ title, items, height = 240 }: ChartCardProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart<"bar"> | null>(null);
  const { theme } = useTheme();

  const hasData = useMemo(() => items.some((item) => item.value > 0), [items]);
  const colors = useMemo(() => getColors(items), [items]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !hasData) return;

    const themeColors = getThemeColors(theme);
    const config = {
      type: "bar",
      data: {
        labels: items.map((item) => item.label),
        datasets: [
          {
            data: items.map((item) => item.value),
            backgroundColor: colors,
            borderRadius: 6,
            maxBarThickness: 40,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          y: {
            from: 0,
            easing: "easeInOutQuart",
            duration: 800,
          },
        },
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: themeColors.tick },
          },
          y: {
            beginAtZero: true,
            grid: { color: themeColors.grid },
            ticks: { color: themeColors.tick, precision: 0 },
          },
        },
      },
    } as unknown as ChartConfiguration<"bar">;

    Chart.getChart(canvas)?.destroy();
    chartRef.current?.destroy();
    chartRef.current = new Chart(canvas, config);

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [items, colors, hasData, theme]);

  return (
    <ChartShell title={title}>
      {hasData ? (
        <div style={{ height }}>
          <canvas ref={canvasRef} />
        </div>
      ) : (
        <EmptyChart height={height} />
      )}
    </ChartShell>
  );
};
