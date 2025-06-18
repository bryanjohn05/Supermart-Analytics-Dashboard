"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, TrendingUp, BarChart3, PieChart, MapPin, AlertCircle, Loader2 } from "lucide-react"
import { SalesOverviewChart } from "@/components/sales-overview-chart"
import { CategoryDistributionChart } from "@/components/category-distribution-chart"
import { RegionalSalesChart } from "@/components/regional-sales-chart"
import { MonthlyTrendsChart } from "@/components/monthly-trends-chart"
import { ProfitAnalysisChart } from "@/components/profit-analysis-chart"
import { SalesPredictor } from "@/components/sales-predictor"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import Link from "next/link" 

export default function SupermartDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Load analytics data
    setLoading(true)
    setError(null)

    fetch("/api/analytics")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to load analytics data. Please run the training script first.")
        }
        return res.json()
      })
      .then((data) => {
        setAnalyticsData(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Failed to load analytics:", err)
        setError(err.message || "Failed to load analytics data. Please run the training script first.")
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <h2 className="text-xl font-semibold">Loading Analytics Data...</h2>
          <p className="text-gray-600">Please wait while we fetch the latest data from your trained model.</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <div className="max-w-md w-full">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Card>
            <CardHeader>
              <CardTitle>Model Training Required</CardTitle>
              <CardDescription>
                Please run the training script to generate analytics data and train the prediction model.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm">Run the following command in your terminal to train the model:</p>
              <div className="bg-gray-100 p-2 rounded text-sm font-mono mb-4">./scripts/run_training.sh</div>
              <Button className="w-full" onClick={() => window.location.reload()}>
                Refresh Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 px-2">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 flex items-center justify-center gap-2 flex-wrap">
            <ShoppingCart className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            <span className="break-words">Supermart Analytics Dashboard</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-600 px-4">
            Comprehensive Retail Analytics & Sales Prediction Platform
          </p>
          <div>
            <p>By <Link className="hover:text-blue-700" href="https://github.com/bryanjohn05/Supermart-Analytics-Dashboard"> Bryan John</Link> | <Link className="hover:text-blue-700"  href="https://github.com/bryanjohn05/Supermart-Analytics-Dashboard/blob/main/scripts/data/new_orders.csv"> Dataset</Link></p>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card className="min-w-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium truncate">Total Sales</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">₹{analyticsData?.total_sales?.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {analyticsData?.monthly_sales?.length > 1
                  ? `+${(
                      (analyticsData.monthly_sales[analyticsData.monthly_sales.length - 1].Sales /
                        analyticsData.monthly_sales[analyticsData.monthly_sales.length - 2].Sales -
                        1) *
                        100
                    ).toFixed(1)}% from last period`
                  : "All time sales"}
              </p>
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium truncate">Total Orders</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{analyticsData?.total_orders?.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Across all regions</p>
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium truncate">Avg Order Value</CardTitle>
              <PieChart className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">₹{analyticsData?.avg_order_value?.toFixed(0)}</div>
              <p className="text-xs text-muted-foreground">
                {analyticsData?.total_profit && analyticsData?.total_sales
                  ? `${((analyticsData.total_profit / analyticsData.total_sales) * 100).toFixed(1)}% profit margin`
                  : "Average transaction"}
              </p>
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium truncate">Active Cities</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{analyticsData?.unique_cities}</div>
              <p className="text-xs text-muted-foreground">Tamil Nadu region</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-2 min-w-fit">
              <TabsTrigger value="overview" className="text-sm sm:text-base">
                Overview & Analytics
              </TabsTrigger>
              <TabsTrigger value="prediction" className="text-sm sm:text-base">
                Sales Prediction
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-6">
            {/* Sales Overview and Category Distribution */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <SalesOverviewChart data={analyticsData?.monthly_sales} />
              <CategoryDistributionChart data={analyticsData?.category_sales} />
            </div>

            {/* Regional Sales Distribution */}
            <RegionalSalesChart data={analyticsData?.region_sales} />

            {/* Monthly Trends and Profit Analysis */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <MonthlyTrendsChart data={analyticsData?.monthly_sales} />
              <ProfitAnalysisChart data={analyticsData?.profit_by_category} />
            </div>

            {/* Category Performance Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl"> Category Performance Insights</CardTitle>
                <CardDescription className="text-sm">
                  Detailed breakdown of sales performance by product categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analyticsData?.category_sales ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(analyticsData.category_sales)
                      .sort(([, a]: [string, any], [, b]: [string, any]) => b - a)
                      .slice(0, 6)
                      .map(([category, sales]: [string, any], index: number) => {
                        const percentage = ((sales / analyticsData.total_sales) * 100).toFixed(1)
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
                        const categoryName = categoryNames[Number.parseInt(category)] || `Category ${category}`

                        return (
                          <div key={category} className="p-4 border rounded-lg bg-white">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-sm">{categoryName}</h4>
                              <Badge variant={index === 0 ? "default" : index < 3 ? "secondary" : "outline"}>
                                #{index + 1}
                              </Badge>
                            </div>
                            <div className="space-y-1">
                              <p className="text-lg font-bold">₹{sales.toLocaleString()}</p>
                              <p className="text-xs text-gray-600">{percentage}% of total sales</p>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No category data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Regional Performance Summary */}
      
          </TabsContent>

          <TabsContent value="prediction" className="space-y-4">
            <SalesPredictor />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
