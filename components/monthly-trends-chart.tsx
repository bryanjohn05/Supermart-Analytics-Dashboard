"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface MonthlyTrendsChartProps {
  data?: Array<{ date: string; Sales: number }>
}

export function MonthlyTrendsChart({ data }: MonthlyTrendsChartProps) {
  // Format data for chart
  const chartData = data
    ?.map((item) => {
      const date = new Date(item.date)
      // Estimate profit based on sales (for demonstration)
      const profit = item.Sales * 0.2 // Assuming 20% profit margin
      const discount = Math.random() * 0.1 + 0.15 // Random discount between 15-25%

      return {
        month: date.toLocaleString("default", { month: "short" }),
        sales: item.Sales,
        profit,
        discount,
        fullDate: date,
      }
    })
    .sort((a, b) => a.fullDate.getTime() - b.fullDate.getTime())

  if (!data || data.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Monthly Trends Analysis</CardTitle>
          <CardDescription className="text-sm">Sales and profit trends showing seasonal patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No trends data available. Please run the training script to generate analytics data.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Monthly Trends Analysis</CardTitle>
        <CardDescription className="text-sm">Sales and profit trends showing seasonal patterns</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            sales: {
              label: "Sales (₹)",
              color: "hsl(var(--chart-1))",
            },
            profit: {
              label: "Profit (₹)",
              color: "hsl(var(--chart-2))",
            },
          }}
          className="h-[400px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
              <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="sales"
                stroke="var(--color-sales)"
                strokeWidth={2}
                name="Sales"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="profit"
                stroke="var(--color-profit)"
                strokeWidth={2}
                name="Profit"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
