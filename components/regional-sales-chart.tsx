"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Pie, PieChart, Cell, ResponsiveContainer, Legend } from "recharts"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface RegionalSalesChartProps {
  data?: Record<string, number>
}

export function RegionalSalesChart({ data }: RegionalSalesChartProps) {
  // Colors for regions
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  // Format data for chart
  const chartData = data
    ? Object.entries(data)
        .map(([region, sales], index) => {
          const regionNames = ["North", "South", "East", "West", "Central"]
          const regionName = regionNames[Number.parseInt(region)] || `Region ${region}`
          const totalSales = Object.values(data).reduce((sum, val) => sum + val, 0)
          const percentage = ((sales / totalSales) * 100).toFixed(1)

          return {
            region: regionName,
            sales: sales,
            percentage: Number.parseFloat(percentage),
            color: COLORS[index % COLORS.length],
          }
        })
        .filter((item) => item.sales > 0) // Only show regions with sales
    : []

  if (!data || Object.keys(data).length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Regional Sales Distribution</CardTitle>
          <CardDescription className="text-sm">
            Sales performance across different regions in Tamil Nadu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No regional data available. Please run the training script to generate analytics data.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const renderCustomLabel = ({ region, percentage }) => {
    return `${region}: ${percentage}%`
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Regional Sales Distribution</CardTitle>
        <CardDescription className="text-sm">Sales performance across different regions in Tamil Nadu</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            sales: {
              label: "Sales (₹)",
              color: "hsl(var(--chart-3))",
            },
          }}
          className="h-[300px] sm:h-[400px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius="70%"
                fill="#8884d8"
                dataKey="sales"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <ChartTooltip
                content={<ChartTooltipContent />}
                formatter={(value) => [`₹${value.toLocaleString()}`, "Sales"]}
              />
              {/* <Legend
                wrapperStyle={{ fontSize: "12px" }}
                iconSize={12}
                formatter={(value, entry) => `${value} (${entry.payload.percentage}%)`}
              /> */}
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
