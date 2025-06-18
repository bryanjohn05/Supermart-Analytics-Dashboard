import pandas as pd
import json
import os

def test_data_structure():
    """Test the data structure and show sample data"""
    print("🔍 Testing data structure...")
    
    # Test CSV data
    if os.path.exists("data/new_orders.csv"):
        df = pd.read_csv("data/new_orders.csv")
        print(f"✅ CSV loaded: {df.shape}")
        print(f"   Columns: {df.columns.tolist()}")
        print(f"   Date range: {df['Order Date'].min()} to {df['Order Date'].max()}")
        print(f"   Sample data:")
        print(df.head(2).to_string())
    else:
        print("❌ CSV file not found")
        return False
    
    # Test processed analytics
    if os.path.exists("data/processed/analytics.json"):
        with open("data/processed/analytics.json", 'r') as f:
            analytics = json.load(f)
        
        print(f"\n✅ Analytics loaded with keys: {list(analytics.keys())}")
        
        if 'monthly_sales' in analytics:
            print(f"   Monthly sales data points: {len(analytics['monthly_sales'])}")
            if analytics['monthly_sales']:
                print(f"   Sample monthly data: {analytics['monthly_sales'][0]}")
        
        if 'category_sales' in analytics:
            print(f"   Categories: {len(analytics['category_sales'])}")
            print(f"   Category sales: {analytics['category_sales']}")
        
        if 'total_sales' in analytics:
            print(f"   Total sales: ₹{analytics['total_sales']:,}")
            print(f"   Total orders: {analytics['total_orders']:,}")
    else:
        print("❌ Analytics file not found")
        return False
    
    return True

if __name__ == "__main__":
    test_data_structure()
