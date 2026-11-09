"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";

import { cn } from "@/lib/utils";

// --------------------------------------------------
// Types
// --------------------------------------------------

type ChartTheme = {
  light?: string;
  dark?: string;
};

export type ChartConfig = {
  [key: string]: {
    label?: React.ReactNode;
    icon?: React.ElementType;
    color?: string;
    theme?: ChartTheme;
  };
};

type ChartContainerProps = React.ComponentProps<"div"> & {
  id?: string;
  config: ChartConfig;
  children: React.ReactElement;
};

type ChartContextValue = {
  config: ChartConfig;
};

type TooltipItem = {
  dataKey?: string | number;
  name?: string;
  value?: number | string;
  color?: string;
  payload?: Record<string, unknown>;
  [key: string]: unknown;
};

type ChartTooltipContentProps = React.ComponentProps<"div"> & {
  active?: boolean;
  payload?: TooltipItem[];
  label?: string | number;
  indicator?: "dot" | "line" | "dashed";
  hideLabel?: boolean;
  hideIndicator?: boolean;
  labelFormatter?: (
    label: React.ReactNode,
    payload: TooltipItem[],
  ) => React.ReactNode;
  labelClassName?: string;
  formatter?: (
    value: number | string,
    name: string,
    item: TooltipItem,
    index: number,
    payload: Record<string, unknown>,
  ) => React.ReactNode;
  color?: string;
  nameKey?: string;
  labelKey?: string;
};

type ChartLegendContentProps = React.ComponentProps<"div"> & {
  payload?: Array<{
    value?: string | number;
    dataKey?: string | number;
    color?: string;
    [key: string]: unknown;
  }>;
  hideIcon?: boolean;
  verticalAlign?: "top" | "bottom" | "middle";
  nameKey?: string;
};

// --------------------------------------------------
// Context
// --------------------------------------------------

const ChartContext = React.createContext<ChartContextValue | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }

  return context;
}

// --------------------------------------------------
// Chart Container
// --------------------------------------------------

const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
  ({ id, className, children, config, ...props }, ref) => {
    const uniqueId = React.useId();
    const chartId = `chart-${id ?? uniqueId.replace(/:/g, "")}`;

    return (
      <ChartContext.Provider value={{ config }}>
        <div
          ref={ref}
          data-chart={chartId}
          className={cn(
            "flex aspect-video w-full justify-center text-xs",
            "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground",
            "[&_.recharts-cartesian-grid_line]:stroke-border/50",
            "[&_.recharts-curve.recharts-tooltip-cursor]:stroke-border",
            "[&_.recharts-dot[stroke='#fff']]:stroke-transparent",
            "[&_.recharts-layer]:outline-none",
            "[&_.recharts-polar-grid]:stroke-border",
            "[&_.recharts-radial-bar-background-sector]:fill-muted",
            "[&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted",
            "[&_.recharts-sector[stroke='#fff']]:stroke-transparent",
            "[&_.recharts-sector]:outline-none",
            "[&_.recharts-surface]:outline-none",
            className,
          )}
          {...props}
        >
          <ChartStyle id={chartId} config={config} />

          <RechartsPrimitive.ResponsiveContainer>
            {children}
          </RechartsPrimitive.ResponsiveContainer>
        </div>
      </ChartContext.Provider>
    );
  },
);

ChartContainer.displayName = "Chart";

// --------------------------------------------------
// Chart Style
// --------------------------------------------------

type ChartStyleProps = {
  id: string;
  config: ChartConfig;
};

const ChartStyle = ({ id, config }: ChartStyleProps) => {
  const colorConfig = Object.entries(config).filter(
    ([, item]) => item.theme || item.color,
  );

  if (!colorConfig.length) return null;

  const css = Object.entries({
    light: "",
    dark: ".dark",
  })
    .map(([theme, prefix]) => {
      const variables = colorConfig
        .map(([key, item]) => {
          const color = item.theme?.[theme as keyof ChartTheme] ?? item.color;

          return color ? `--color-${key}: ${color};` : null;
        })
        .filter(Boolean)
        .join("\n");

      return `${prefix} [data-chart="${id}"] {\n${variables}\n}`;
    })
    .join("\n");

  return <style dangerouslySetInnerHTML={{ __html: css }} />;
};

// --------------------------------------------------
// Tooltip
// --------------------------------------------------

const ChartTooltip = RechartsPrimitive.Tooltip;

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  ChartTooltipContentProps
>(
  (
    {
      active,
      payload,
      className,
      indicator = "dot",
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      labelClassName,
      formatter,
      color,
      nameKey,
      labelKey,
      ...props
    },
    ref,
  ) => {
    const { config } = useChart();

    const tooltipLabel = React.useMemo(() => {
      if (hideLabel || !payload?.length) return null;

      const item = payload[0];

      const key = String(labelKey || item.dataKey || item.name || "value");

      const itemConfig = getPayloadConfigFromPayload(config, item, key);

      const value =
        !labelKey && typeof label === "string"
          ? config[label]?.label || label
          : itemConfig?.label;

      if (labelFormatter) {
        return (
          <div className={cn("font-medium", labelClassName)}>
            {labelFormatter(value, payload)}
          </div>
        );
      }

      if (!value) return null;

      return <div className={cn("font-medium", labelClassName)}>{value}</div>;
    }, [
      config,
      hideLabel,
      label,
      labelFormatter,
      labelClassName,
      labelKey,
      payload,
    ]);

    if (!active || !payload?.length) return null;

    const nestLabel = payload.length === 1 && indicator !== "dot";

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-[8rem] items-start gap-1.5",
          "rounded-lg border border-border/50",
          "bg-background px-2.5 py-1.5",
          "text-xs shadow-xl",
          className,
        )}
        {...props}
      >
        {!nestLabel && tooltipLabel}

        <div className="grid gap-1.5">
          {payload.map((item, index) => {
            const key = String(nameKey || item.name || item.dataKey || "value");

            const itemConfig = getPayloadConfigFromPayload(config, item, key);

            const indicatorColor =
              color ||
              (typeof item.payload?.fill === "string"
                ? item.payload.fill
                : item.color);

            const Icon = itemConfig?.icon;

            return (
              <div
                key={`${item.dataKey ?? item.name ?? "item"}-${index}`}
                className={cn(
                  "flex w-full flex-wrap items-stretch gap-2",
                  "[&>svg]:h-2.5 [&>svg]:w-2.5",
                  "[&>svg]:text-muted-foreground",
                  indicator === "dot" && "items-center",
                )}
              >
                {formatter && item.value !== undefined && item.name ? (
                  formatter(
                    item.value,
                    item.name,
                    item,
                    index,
                    item.payload ?? {},
                  )
                ) : (
                  <>
                    {Icon ? (
                      <Icon />
                    ) : (
                      !hideIndicator && (
                        <div
                          className={cn(
                            "shrink-0 rounded-[2px]",
                            "border-[--color-border]",
                            "bg-[--color-bg]",
                            {
                              "h-2.5 w-2.5": indicator === "dot",
                              "w-1": indicator === "line",
                              "w-0 border-[1.5px] border-dashed bg-transparent":
                                indicator === "dashed",
                              "my-0.5": nestLabel && indicator === "dashed",
                            },
                          )}
                          style={
                            {
                              "--color-bg": indicatorColor,
                              "--color-border": indicatorColor,
                            } as React.CSSProperties
                          }
                        />
                      )
                    )}

                    <div
                      className={cn(
                        "flex flex-1 justify-between leading-none",
                        nestLabel ? "items-end" : "items-center",
                      )}
                    >
                      <div className="grid gap-1.5">
                        {nestLabel && tooltipLabel}

                        <span className="text-muted-foreground">
                          {itemConfig?.label || item.name}
                        </span>
                      </div>

                      {item.value !== undefined && item.value !== null && (
                        <span className="font-mono font-medium tabular-nums text-foreground">
                          {typeof item.value === "number"
                            ? item.value.toLocaleString()
                            : item.value}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  },
);

ChartTooltipContent.displayName = "ChartTooltip";

// --------------------------------------------------
// Legend
// --------------------------------------------------

const ChartLegend = RechartsPrimitive.Legend;

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  ChartLegendContentProps
>(
  (
    {
      className,
      hideIcon = false,
      payload,
      verticalAlign = "bottom",
      nameKey,
      ...props
    },
    ref,
  ) => {
    const { config } = useChart();

    if (!payload?.length) return null;

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center gap-4",
          verticalAlign === "top" ? "pb-3" : "pt-3",
          className,
        )}
        {...props}
      >
        {payload.map((item, index) => {
          const key = String(nameKey || item.dataKey || "value");

          const itemConfig = getPayloadConfigFromPayload(config, item, key);

          const Icon = itemConfig?.icon;

          return (
            <div
              key={`${item.value ?? item.dataKey ?? "legend"}-${index}`}
              className="flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground"
            >
              {Icon && !hideIcon ? (
                <Icon />
              ) : (
                <div
                  className="h-2 w-2 shrink-0 rounded-[2px]"
                  style={{
                    backgroundColor: item.color,
                  }}
                />
              )}

              {itemConfig?.label}
            </div>
          );
        })}
      </div>
    );
  },
);

ChartLegendContent.displayName = "ChartLegend";

// --------------------------------------------------
// Helper
// --------------------------------------------------

function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string,
) {
  if (typeof payload !== "object" || payload === null) {
    return undefined;
  }

  const record = payload as Record<string, unknown>;

  const nestedPayload =
    typeof record.payload === "object" && record.payload !== null
      ? (record.payload as Record<string, unknown>)
      : undefined;

  let configKey = key;

  if (typeof record[key] === "string") {
    configKey = record[key] as string;
  } else if (nestedPayload && typeof nestedPayload[key] === "string") {
    configKey = nestedPayload[key] as string;
  }

  return config[configKey] ?? config[key];
}

// --------------------------------------------------
// Exports
// --------------------------------------------------

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
  useChart,
};
