
"use client"

import * as React from "react"
import { Pie, PieChart, Sector } from "recharts"
import { PieSectorDataItem } from "recharts/types/polar/Pie"

import {
  ChartConfig,
  ChartContainer,
  ChartStyle,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const DonutChart = React.forwardRef<
  React.ElementRef<typeof PieChart>,
  React.ComponentProps<typeof PieChart> & {
    config?: ChartConfig
    withTooltip?: boolean
  }
>(({ config, withTooltip = true, className, ...props }, ref) => {
  const id = React.useId()

  return (
    <ChartContainer
      config={config ?? {}}
      className="mx-auto aspect-square w-full max-w-[250px]"
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
[data-chart=${id}] .recharts-layer.recharts-pie-sector:focus-visible {
  outline: none;
  fill: hsl(var(--primary) / 0.8)
}
`,
        }}
      />
      <PieChart
        ref={ref}
        margin={{
          left: 12,
          right: 12,
        }}
        {...props}
      >
        {withTooltip && <ChartTooltip content={<ChartTooltipContent />} />}
        <ChartStyle id={id} config={config ?? {}} />
        {props.children}
      </PieChart>
    </ChartContainer>
  )
})
DonutChart.displayName = "DonutChart"

const DonutChartActiveSector = <TData,>({
  cornerRadius = 4,
  ...props
}: React.ComponentProps<typeof Sector> & {
  cornerRadius?: number
}) => {
  const {
    cx,
    cy,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value,
  } = props as PieSectorDataItem

  return (
    <g>
      <text
        x={cx}
        y={cy}
        dy={-12}
        textAnchor="middle"
        fill="hsl(var(--foreground))"
        className="text-lg font-bold"
      >
        {payload.name}
      </text>
      <text
        x={cx}
        y={cy}
        dy={8}
        textAnchor="middle"
        fill="hsl(var(--muted-foreground))"
      >
        <tspan
          x={cx}
          y={cy}
          dy={8}
          className="text-lg font-mono"
          fill="hsl(var(--foreground))"
        >
          {value?.toLocaleString()}
        </tspan>
        {payload.unit}
      </text>
      <text
        x={cx}
        y={cy}
        dy={32}
        textAnchor="middle"
        fill="hsl(var(--muted-foreground))"
      >
        ({(percent * 100).toFixed(0)}%)
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius * 1.05}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        cornerRadius={cornerRadius}
        style={{
          outline: "none",
        }}
      />
    </g>
  )
}
DonutChartActiveSector.displayName = "DonutChartActiveSector"

export { DonutChart, DonutChartActiveSector }
