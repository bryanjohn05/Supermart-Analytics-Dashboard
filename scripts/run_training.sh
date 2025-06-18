#!/bin/bash

echo "🚀 Starting Supermart ML Training Pipeline..."
echo "================================================"

# Check if we're in the right directory
if [ ! -f "data/new_orders.csv" ]; then
    echo "❌ Error: data/new_orders.csv not found!"
    echo "   Please make sure you're running this from the project root directory."
    exit 1
fi

# Check if Python is installed
if ! command -v python &> /dev/null; then
    echo "❌ Python is not installed. Please install Python 3.7+ to continue."
    exit 1
fi

# Check if required packages are installed
echo "📦 Checking Python packages..."
python -c "import pandas, sklearn, xgboost, joblib" 2>/dev/null
if [ $? -ne 0 ]; then
    echo "📦 Installing required Python packages..."
    pip install pandas scikit-learn xgboost joblib matplotlib seaborn numpy
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install packages. Please install manually:"
        echo "   pip install pandas scikit-learn xgboost joblib matplotlib seaborn numpy"
        exit 1
    fi
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p models
mkdir -p data/processed

# Run the training script
echo "🤖 Running model training..."
python scripts/train_model.py

if [ $? -eq 0 ]; then
    echo ""
    echo "🔍 Verifying setup..."
    python scripts/verify_setup.py
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "🎉 SUCCESS! Training completed successfully!"
        echo "================================================"
        echo "✅ Models saved in: models/"
        echo "✅ Analytics data saved in: data/processed/"
        echo ""
        echo "🌐 You can now run your dashboard:"
        echo "   npm run dev"
        echo ""
        echo "🔄 If the dashboard still shows errors, try refreshing the page."
    else
        echo "❌ Verification failed. Please check the error messages above."
        exit 1
    fi
else
    echo "❌ Model training failed. Check the error messages above."
    exit 1
fi
