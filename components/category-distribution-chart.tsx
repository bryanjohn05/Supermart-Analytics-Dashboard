"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface CategoryDistributionChartProps {
  data?: Record<string, number>
}

export function CategoryDistributionChart({ data }: CategoryDistributionChartProps) {
  // Category names mapping
  const categoryNames = [
    "Beverages",
    "Egg, Meat & Fish",
    "Food Grains",
    "Fruits & Veggies",
    "Oil & Masala",
    "Snacks & Branded",
    "Kitchen & Garden",
    "Gourmet Food",
    "Baby Care",
    "Cleaning",
    "Beauty & Hygiene",
  ]

  // Format data for chart
  const chartData = data
    ? Object.entries(data)
        .map(([category, sales]) => {
          const categoryIndex = Number.parseInt(category)
          const categoryName = categoryNames[categoryIndex] || `Category ${category}`
          return {
            category: categoryName,
            sales: sales,
            shortName: categoryName.length > 15 ? categoryName.substring(0, 12) + "..." : categoryName,
          }
        })
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 8) // Show top 8 categories
    : []

  if (!data || Object.keys(data).length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Sales by Category</CardTitle>
          <CardDescription className="text-sm">Revenue distribution across product categories</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No category data available. Please run the training script to generate analytics data.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl">Sales by Category</CardTitle>
        <CardDescription className="text-sm">Revenue distribution across product categories</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            sales: {
              label: "Sales (₹)",
              color: "hsl(var(--chart-2))",
            },
          }}
          className="h-[300px] sm:h-[400px] w-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="shortName" angle={-45} textAnchor="end" height={80} fontSize={10} interval={0} />
              <YAxis fontSize={10} tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
              <ChartTooltip
                content={<ChartTooltipContent />}
                formatter={(value, name, props) => [`₹${value.toLocaleString()}`, "Sales", props.payload.category]}
                labelFormatter={(label, payload) => {
                  if (payload && payload[0]) {
                    return payload[0].payload.category
                  }
                  return label
                }}
              />
              <Bar dataKey="sales" fill="var(--color-sales)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
