"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Calculator, TrendingUp, AlertCircle, Brain, Target, DollarSign, Info } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function SalesPredictor() {
  const [prediction, setPrediction] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    category: "",
    subCategory: "",
    city: "",
    region: "",
    state: "Tamil Nadu",
    discount: [0.1],
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    dayOfWeek: 0,
    isWeekend: 0,
    profitMargin: [0.2],
  })

  const categories = [
    "Beverages",
    "Egg, Meat & Fish",
    "Food Grains",
    "Fruits & Veggies",
    "Oil & Masala",
    "Snacks & Branded Foods",
    "Kitchen, Garden & Pets",
    "Gourmet & World Food",
    "Baby Care",
    "Cleaning & Household",
    "Beauty & Hygiene",
  ]

  const regions = ["North", "South", "East", "West", "Central"]

  const cities = [
    "Chennai",
    "Coimbatore",
    "Madurai",
    "Tiruchirappalli",
    "Salem",
    "Tirunelveli",
    "Erode",
    "Vellore",
    "Thoothukudi",
    "Dindigul",
  ]

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

  const handlePredict = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category: categories.indexOf(formData.category),
          subCategory: 0,
          city: cities.indexOf(formData.city),
          region: regions.indexOf(formData.region),
          state: 0,
          discount: formData.discount[0],
          month: formData.month,
          year: formData.year,
          dayOfWeek: formData.dayOfWeek,
          isWeekend: formData.isWeekend,
          profitMargin: formData.profitMargin[0],
        }),
      })

      const result = await response.json()

      if (result.success) {
        setPrediction(result)
      } else {
        setError(result.error || "Prediction failed. Please try again.")
      }
    } catch (error) {
      console.error("Error making prediction:", error)
      setError("Failed to connect to prediction service. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const isSimulatedPrediction = prediction?.model_type === "Vercel_Simulation"

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
            <Brain className="h-6 w-6 text-blue-600" />
            AI-Powered Sales Prediction
          </CardTitle>
          <CardDescription className="text-base">
            Use our trained XGBoost machine learning model to predict sales based on product details, location, and
            market conditions.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Vercel Notice */}
      {typeof window !== "undefined" && window.location.hostname.includes("vercel") && (
        <Alert className="border-amber-200 bg-amber-50">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>Production Mode:</strong> This deployment uses a simulated prediction algorithm. For full ML
            predictions with the trained XGBoost model, run the application locally.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Calculator className="h-5 w-5" />
              Prediction Parameters
            </CardTitle>
            <CardDescription className="text-sm">
              Enter the details below to generate a sales prediction
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Product Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-gray-700 border-b pb-2">📦 Product Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-medium">
                    Product Category *
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat} className="text-sm">
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Discount Percentage</Label>
                  <div className="space-y-2">
                    <Slider
                      value={formData.discount}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, discount: value }))}
                      max={0.5}
                      min={0}
                      step={0.01}
                      className="w-full"
                    />
                    <div className="text-center text-sm text-gray-600">
                      {(formData.discount[0] * 100).toFixed(0)}% discount
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-sm text-gray-700 border-b pb-2">📍 Location Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="region" className="text-sm font-medium">
                    Region *
                  </Label>
                  <Select
                    value={formData.region}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, region: value }))}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map((region) => (
                        <SelectItem key={region} value={region} className="text-sm">
                          {region}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city" className="text-sm font-medium">
                    City *
                  </Label>
                  <Select
                    value={formData.city}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, city: value }))}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city} value={city} className="text-sm">
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Timing Information */}
            {/* <div className="space-y-4">
              <h3 className="font-semibold text-sm text-gray-700 border-b pb-2">📅 Timing Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="month" className="text-sm font-medium">
                    Month
                  </Label>
                  <Select
                    value={formData.month.toString()}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, month: Number.parseInt(value) }))}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month, index) => (
                        <SelectItem key={month} value={(index + 1).toString()}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year" className="text-sm font-medium">
                    Year
                  </Label>
                  <Select
                    value={formData.year.toString()}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, year: Number.parseInt(value) }))}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2026">2026</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dayOfWeek" className="text-sm font-medium">
                    Day of Week
                  </Label>
                  <Select
                    value={formData.dayOfWeek.toString()}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, dayOfWeek: Number.parseInt(value) }))}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {dayNames.map((day, index) => (
                        <SelectItem key={day} value={index.toString()}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Weekend Order</Label>
                  <Select
                    value={formData.isWeekend.toString()}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, isWeekend: Number.parseInt(value) }))}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Weekday</SelectItem>
                      <SelectItem value="1">Weekend</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div> */}

            {/* Business Parameters */}
            <div className="space-y-4">
              {/* <h3 className="font-semibold text-sm text-gray-700 border-b pb-2">💼 Business Parameters</h3> */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Expected Profit Margin</Label>
                <div className="space-y-2">
                  <Slider
                    value={formData.profitMargin}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, profitMargin: value }))}
                    max={0.5}
                    min={0.05}
                    step={0.01}
                    className="w-full"
                  />
                  <div className="text-center text-sm text-gray-600">
                    {(formData.profitMargin[0] * 100).toFixed(0)}% profit margin
                  </div>
                </div>
              </div>
            </div>

            <Button
              onClick={handlePredict}
              disabled={loading || !formData.category || !formData.region || !formData.city}
              className="w-full h-12 text-base"
            >
              {loading ? (
                <>
                  <Calculator className="mr-2 h-4 w-4 animate-spin" />
                  Generating Prediction...
                </>
              ) : (
                <>
                  <Target className="mr-2 h-4 w-4" />
                  Predict Sales
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Panel */}
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <TrendingUp className="h-5 w-5" />
              Prediction Results
            </CardTitle>
            <CardDescription className="text-sm">
              AI-powered sales forecast based on your input parameters
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : prediction ? (
              <div className="space-y-6">
                {/* Simulation Notice */}
                {isSimulatedPrediction && (
                  <Alert className="border-blue-200 bg-blue-50">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      <strong>Simulated Prediction:</strong> This result uses a simplified algorithm for Vercel
                      deployment. Run locally for full XGBoost predictions.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Main Prediction */}
                <div className="text-center space-y-3 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <div className="text-3xl sm:text-4xl font-bold text-green-600">
                    ₹{prediction.prediction.toFixed(2)}
                  </div>
                  <Badge variant="secondary" className="text-sm">
                    {isSimulatedPrediction ? "Simulated Sales Prediction" : "ML-Predicted Sales Amount"}
                  </Badge>
                </div>

                {/* Detailed Breakdown */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm text-gray-700 border-b pb-2">💰 Financial Breakdown</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">Estimated Profit</span>
                      </div>
                      <p className="text-xl font-bold text-blue-600">
                        ₹{(prediction.prediction * formData.profitMargin[0]).toFixed(2)}
                      </p>
                    </div>

                    <div className="p-4 bg-purple-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium">Profit Margin</span>
                      </div>
                      <p className="text-xl font-bold text-purple-600">
                        {(formData.profitMargin[0] * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>

                
                </div>

                {/* Insights */}
             
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                <Brain className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Ready to Predict</h3>
                <p className="text-sm">Fill in the form and click "Predict Sales" to see AI-powered results</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
