import os
import json
import joblib

def verify_setup():
    """Verify that all required files are present and valid"""
    print("🔍 Verifying setup...")
    
    required_files = {
        'data/new_orders.csv': 'Dataset',
        'models/xgb_model.pkl': 'XGBoost Model',
        'models/scaler.pkl': 'Feature Scaler',
        'models/label_encoders.pkl': 'Label Encoders',
        'data/processed/analytics.json': 'Analytics Data',
        'data/processed/model_metrics.json': 'Model Metrics'
    }
    
    all_good = True
    
    for file_path, description in required_files.items():
        if os.path.exists(file_path):
            size = os.path.getsize(file_path)
            print(f"✅ {description}: {file_path} ({size} bytes)")
            
            # Additional validation for JSON files
            if file_path.endswith('.json'):
                try:
                    with open(file_path, 'r') as f:
                        data = json.load(f)
                    if file_path.endswith('analytics.json'):
                        required_keys = ['total_sales', 'total_orders', 'category_sales', 'region_sales']
                        missing_keys = [key for key in required_keys if key not in data]
                        if missing_keys:
                            print(f"   ⚠️  Missing keys in analytics: {missing_keys}")
                        else:
                            print(f"   ✅ Analytics data valid with {len(data)} keys")
                except json.JSONDecodeError as e:
                    print(f"   ❌ Invalid JSON in {file_path}: {e}")
                    all_good = False
                    
        else:
            print(f"❌ {description}: {file_path} - NOT FOUND")
            all_good = False
    
    if all_good:
        print("\n🎉 All files are present and valid!")
        print("✅ Dashboard should work correctly now.")
    else:
        print("\n❌ Some files are missing. Please run the training script:")
        print("   python scripts/train_model.py")
    
    return all_good

if __name__ == "__main__":
    verify_setup()