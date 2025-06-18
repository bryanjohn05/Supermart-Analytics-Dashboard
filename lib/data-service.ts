import fs from "fs"
import path from "path"

export interface AnalyticsData {
  monthly_sales: Array<{ date: string; Sales: number }>
  category_sales: Record<string, number>
  region_sales: Record<string, number>
  profit_by_category: Record<string, number>
  top_cities: Record<string, number>
  total_sales: number
  total_orders: number
  avg_order_value: number
  total_profit: number
  unique_cities: number
}

export interface ModelMetrics {
  lr_mse: number
  lr_r2: number
  xgb_mse: number
  xgb_r2: number
  best_params: Record<string, any>
  feature_names: string[]
}

class DataService {
  private static instance: DataService
  private analyticsData: AnalyticsData | null = null
  private modelMetrics: ModelMetrics | null = null

  private constructor() {}

  static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService()
    }
    return DataService.instance
  }

  async loadAnalyticsData(): Promise<AnalyticsData | null> {
    if (this.analyticsData) {
      return this.analyticsData
    }

    try {
      const analyticsPath = path.join(process.cwd(), "data", "processed", "analytics.json")

      console.log(`Attempting to load analytics from: ${analyticsPath}`)

      // Check if file exists
      if (!fs.existsSync(analyticsPath)) {
        console.error(`Analytics file does not exist: ${analyticsPath}`)
        return null
      }

      // Check file size
      const stats = fs.statSync(analyticsPath)
      console.log(`Analytics file size: ${stats.size} bytes`)

      if (stats.size === 0) {
        console.error("Analytics file is empty")
        return null
      }

      const data = fs.readFileSync(analyticsPath, "utf-8")
      console.log(`Analytics file content length: ${data.length}`)

      this.analyticsData = JSON.parse(data)
      console.log("Analytics data loaded successfully")
      console.log(`Keys in analytics data: ${Object.keys(this.analyticsData).join(", ")}`)

      return this.analyticsData
    } catch (error) {
      console.error("Error loading analytics data:", error)
      return null
    }
  }

  async loadModelMetrics(): Promise<ModelMetrics | null> {
    if (this.modelMetrics) {
      return this.modelMetrics
    }

    try {
      const metricsPath = path.join(process.cwd(), "data", "processed", "model_metrics.json")

      if (!fs.existsSync(metricsPath)) {
        console.error(`Model metrics file does not exist: ${metricsPath}`)
        return null
      }

      const data = fs.readFileSync(metricsPath, "utf-8")
      this.modelMetrics = JSON.parse(data)
      console.log("Model metrics loaded successfully")

      return this.modelMetrics
    } catch (error) {
      console.error("Error loading model metrics:", error)
      return null
    }
  }

  // Method to clear cache and reload data
  clearCache(): void {
    this.analyticsData = null
    this.modelMetrics = null
  }
}

export const dataService = DataService.getInstance()
