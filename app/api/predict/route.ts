//app/api/predict/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { spawn } from "child_process"
import path from "path"
import fs from "fs"
import os from "os"

export async function POST(request: NextRequest) {
  try {
    console.log("Prediction API: Starting prediction request...")
    console.log("Environment:", process.env.NODE_ENV)
    console.log("Platform:", process.platform)

    // Check if we're in Vercel's serverless environment
    const isVercel = process.env.VERCEL || process.env.VERCEL_ENV
    console.log("Is Vercel:", isVercel)

    if (isVercel) {
      // For Vercel deployment, return a simulated prediction
      // since Python execution isn't supported in Vercel serverless functions
      return handleVercelPrediction(request)
    }

    // Original local development logic
    return handleLocalPrediction(request)
  } catch (error) {
    console.error("Prediction API: Error:", error)
    return NextResponse.json(
      {
        error: "Prediction service temporarily unavailable: " + error.message,
        success: false,
      },
      { status: 500 },
    )
  }
}

async function handleVercelPrediction(request: NextRequest) {
  try {
    const body = await request.json()
    const { category, subCategory, city, region, state, discount, month, year, dayOfWeek, isWeekend, profitMargin } =
      body

    console.log("Vercel prediction with params:", body)

    // Simulate prediction using a simplified algorithm
    // This mimics the XGBoost model behavior based on the training data patterns
    const baseSales = 1500 // Base sales amount

    // Category multipliers (based on typical category performance)
    const categoryMultipliers = [1.2, 1.5, 1.1, 1.3, 1.0, 1.4, 0.9, 0.8, 0.7, 0.8, 0.6]
    const categoryMultiplier = categoryMultipliers[category] || 1.0

    // Region multipliers (some regions perform better)
    const regionMultipliers = [1.1, 1.3, 0.9, 1.0, 0.8]
    const regionMultiplier = regionMultipliers[region] || 1.0

    // Seasonal adjustments
    const seasonalMultipliers = [0.9, 0.95, 1.0, 1.05, 1.1, 1.15, 1.2, 1.15, 1.1, 1.05, 1.0, 1.1]
    const seasonalMultiplier = seasonalMultipliers[month - 1] || 1.0

    // Discount impact (higher discount = higher sales but lower per-unit value)
    const discountMultiplier = 1 + discount * 2

    // Weekend boost
    const weekendMultiplier = isWeekend ? 1.1 : 1.0

    // Profit margin impact (higher margin products might sell less)
    const profitMultiplier = Math.max(0.5, 1.2 - profitMargin)

    // Calculate prediction
    let prediction =
      baseSales *
      categoryMultiplier *
      regionMultiplier *
      seasonalMultiplier *
      discountMultiplier *
      weekendMultiplier *
      profitMultiplier

    // Add some realistic variance
    const variance = 0.1 // 10% variance
    const randomFactor = 1 + (Math.random() - 0.5) * variance
    prediction *= randomFactor

    // Ensure reasonable bounds
    prediction = Math.max(100, Math.min(50000, prediction))

    console.log("Vercel prediction result:", prediction)

    return NextResponse.json({
      prediction: Math.round(prediction * 100) / 100,
      success: true,
      model_type: "Vercel_Simulation",
      note: "This is a simulated prediction for Vercel deployment. For full ML predictions, use local development.",
    })
  } catch (error) {
    console.error("Vercel prediction error:", error)
    return NextResponse.json(
      {
        error: "Prediction simulation failed: " + error.message,
        success: false,
      },
      { status: 500 },
    )
  }
}

async function handleLocalPrediction(request: NextRequest) {
  try {
    // Check if model files exist
    const projectRoot = process.cwd()
    const modelPath = path.resolve(projectRoot, "models", "xgb_model.pkl")
    const scalerPath = path.resolve(projectRoot, "models", "scaler.pkl")
    const encodersPath = path.resolve(projectRoot, "models", "label_encoders.pkl")

    const modelExists = fs.existsSync(modelPath)
    const scalerExists = fs.existsSync(scalerPath)
    const encodersExists = fs.existsSync(encodersPath)

    if (!modelExists || !scalerExists || !encodersExists) {
      const missingFiles = []
      if (!modelExists) missingFiles.push("xgb_model.pkl")
      if (!scalerExists) missingFiles.push("scaler.pkl")
      if (!encodersExists) missingFiles.push("label_encoders.pkl")

      return NextResponse.json(
        {
          error: `Model files missing: ${missingFiles.join(", ")}. Please run the training script first.`,
          success: false,
          missingFiles,
        },
        { status: 404 },
      )
    }

    const body = await request.json()
    const { category, subCategory, city, region, state, discount, month, year, dayOfWeek, isWeekend, profitMargin } =
      body

    // Use system temp directory for cross-platform compatibility
    const tempDir = os.tmpdir()
    const scriptPath = path.join(tempDir, `predict_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.py`)

    const predictionScript = `
import sys
import os
import joblib
import numpy as np
import json

def main():
    try:
        # Use absolute paths
        model_path = r"${modelPath.replace(/\\/g, "/")}"
        scaler_path = r"${scalerPath.replace(/\\/g, "/")}"
        encoders_path = r"${encodersPath.replace(/\\/g, "/")}"
        
        # Load models
        model = joblib.load(model_path)
        scaler = joblib.load(scaler_path)
        encoders = joblib.load(encoders_path)
        
        # Prepare input data
        input_features = [
            ${category}, ${subCategory}, ${city}, ${region}, ${state},
            ${discount}, 0, ${month}, 0, ${year}, ${dayOfWeek},
            ${isWeekend}, ${discount > 0.2 ? 1 : 0}, ${profitMargin}, 0
        ]
        
        input_data = np.array([input_features])
        input_scaled = scaler.transform(input_data)
        prediction = model.predict(input_scaled)[0]
        
        # Ensure positive prediction
        prediction = max(prediction, 100)
        prediction = min(prediction, 100000)
        
        result = {
            'prediction': float(prediction),
            'success': True,
            'model_type': 'XGBoost'
        }
        
        print("PREDICTION_RESULT:", json.dumps(result))
        
    except Exception as e:
        import traceback
        error_result = {
            'error': str(e),
            'success': False,
            'traceback': traceback.format_exc()
        }
        print("PREDICTION_ERROR:", json.dumps(error_result))

if __name__ == "__main__":
    main()
`

    // Write to temp directory
    fs.writeFileSync(scriptPath, predictionScript)

    // Execute Python script
    return new Promise((resolve) => {
      const python = spawn("python", [scriptPath])
      let output = ""
      let error = ""

      python.stdout.on("data", (data) => {
        output += data.toString()
      })

      python.stderr.on("data", (data) => {
        error += data.toString()
      })

      python.on("close", (code) => {
        // Clean up temp file
        try {
          fs.unlinkSync(scriptPath)
        } catch (e) {
          console.error("Error cleaning up temp file:", e)
        }

        // Parse result
        const lines = output.split("\n")
        let result = null

        for (const line of lines) {
          if (line.startsWith("PREDICTION_RESULT:")) {
            try {
              result = JSON.parse(line.replace("PREDICTION_RESULT:", ""))
              break
            } catch (e) {
              console.error("Error parsing result:", e)
            }
          } else if (line.startsWith("PREDICTION_ERROR:")) {
            try {
              result = JSON.parse(line.replace("PREDICTION_ERROR:", ""))
              break
            } catch (e) {
              console.error("Error parsing error:", e)
            }
          }
        }

        if (result) {
          resolve(NextResponse.json(result))
        } else {
          resolve(
            NextResponse.json({
              error: "Failed to get prediction result",
              success: false,
              output: output,
              stderr: error,
            }),
          )
        }
      })
    })
  } catch (error) {
    console.error("Local prediction error:", error)
    return NextResponse.json(
      {
        error: "Local prediction failed: " + error.message,
        success: false,
      },
      { status: 500 },
    )
  }
}
