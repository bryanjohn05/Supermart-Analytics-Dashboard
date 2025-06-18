# supermart_pipeline.py

import os
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import json
import joblib
import warnings
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, r2_score
from xgboost import XGBRegressor, plot_importance

warnings.filterwarnings('ignore')

def prepare_data_file():
    """Format 'Order Date' and save as new_orders.csv"""
    if os.path.exists('shop.csv'):
        df_shop = pd.read_csv('shop.csv')
        df_shop['Order Date'] = pd.to_datetime(df_shop['Order Date'], errors='coerce').dt.strftime('%d-%m-%Y')
        df_shop.to_csv('data/new_orders.csv', index=False)

def load_and_preprocess_data():
    print("Loading dataset...")
    csv_path = "data/new_orders.csv"
    if not os.path.exists(csv_path):
        print(f"❌ Error: {csv_path} not found!")
        return None, None, None, None, None

    df = pd.read_csv(csv_path)
    df.dropna(inplace=True)
    df.drop_duplicates(inplace=True)
    df.columns = df.columns.str.strip().str.replace('\n', ' ')

    df['Order Date'] = pd.to_datetime(df['Order Date'], format='mixed', errors='coerce')
    df['profit_margin'] = (df['Profit'] / df['Sales']).fillna(0)

    original_categories = df['Category'].unique()
    original_regions = df['Region'].unique()
    original_cities = df['City'].unique()

    le_dict = {}
    categorical_cols = ['Category', 'City', 'Region']
    for col in categorical_cols:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col])
        le_dict[col] = le

    return df, le_dict, original_categories, original_regions, original_cities

def generate_analytics_data(df, original_categories, original_regions, original_cities):
    analytics = {}
    df_analytics = df.copy()

    monthly_sales = df_analytics.groupby(df_analytics['Order Date'].dt.to_period('M'))['Sales'].sum().reset_index()
    monthly_sales['date'] = monthly_sales['Order Date'].dt.to_timestamp()
    analytics['monthly_sales'] = [
        {'date': row['date'].strftime('%Y-%m-%d'), 'Sales': int(row['Sales'])}
        for _, row in monthly_sales.iterrows()
    ]

    analytics['category_sales'] = df_analytics.groupby('Category')['Sales'].sum().astype(int).to_dict()
    analytics['region_sales'] = df_analytics.groupby('Region')['Sales'].sum().astype(int).to_dict()
    analytics['profit_by_category'] = df_analytics.groupby('Category')['Profit'].sum().astype(int).to_dict()
    analytics['top_cities'] = df_analytics.groupby('City')['Sales'].sum().sort_values(ascending=False).head(10).astype(int).to_dict()

    analytics['total_sales'] = int(df_analytics['Sales'].sum())
    analytics['total_orders'] = int(len(df_analytics))
    analytics['avg_order_value'] = float(df_analytics['Sales'].mean())
    analytics['total_profit'] = int(df_analytics['Profit'].sum())
    analytics['unique_cities'] = int(df_analytics['City'].nunique())

    return analytics

def show_visualizations(df):
    plt.figure(figsize=(10, 6))
    sns.boxplot(x='Category', y='Sales', data=df)
    plt.title('Sales Distribution by Category')
    plt.show()

    df.groupby('Order Date')['Sales'].sum().plot(figsize=(12, 6), title="Sales Over Time")
    plt.show()

    sns.heatmap(df.select_dtypes(include='number').corr(), annot=True, cmap="coolwarm")
    plt.title("Correlation Heatmap")
    plt.show()

def train_models(df):
    feature_cols = ['Category', 'City', 'Region', 'Profit', 'Discount']

    X_full = df[feature_cols]
    y = df['Sales']

    X_train, X_test, y_train, y_test = train_test_split(X_full, y, test_size=0.2, random_state=42)
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train[feature_cols])
    X_test_scaled = scaler.transform(X_test[feature_cols])

    lr_model = LinearRegression()
    lr_model.fit(X_train_scaled, y_train)
    lr_pred = lr_model.predict(X_test_scaled)
    lr_mse = mean_squared_error(y_test, lr_pred)
    lr_r2 = r2_score(y_test, lr_pred)

    param_grid = {
        'n_estimators': [100, 200],
        'max_depth': [3, 5, 7],
        'learning_rate': [0.05, 0.1, 0.2],
        'subsample': [0.8, 1],
        'colsample_bytree': [0.8, 1]
    }

    grid_search = GridSearchCV(
        estimator=XGBRegressor(random_state=42),
        param_grid=param_grid,
        cv=3,
        scoring='r2',
        verbose=1,
        n_jobs=-1
    )
    grid_search.fit(X_train[feature_cols], y_train)
    best_model = grid_search.best_estimator_
    y_pred_best = best_model.predict(X_test[feature_cols])
    xgb_mse = mean_squared_error(y_test, y_pred_best)
    xgb_r2 = r2_score(y_test, y_pred_best)

    return best_model, scaler, {
        'lr_mse': float(lr_mse), 'lr_r2': float(lr_r2),
        'xgb_mse': float(xgb_mse), 'xgb_r2': float(xgb_r2),
        'best_params': grid_search.best_params_,
        'feature_names': feature_cols
    }

def save_models_and_data(model, scaler, le_dict, analytics, metrics):
    os.makedirs('models', exist_ok=True)
    os.makedirs('data/processed', exist_ok=True)

    joblib.dump(model, 'models/xgb_model.pkl')
    joblib.dump(scaler, 'models/scaler.pkl')
    joblib.dump(le_dict, 'models/label_encoders.pkl')

    with open('data/processed/analytics.json', 'w') as f:
        json.dump(analytics, f, indent=2)
    with open('data/processed/model_metrics.json', 'w') as f:
        json.dump(metrics, f, indent=2)

    return True

def main():
    print("\n=== Starting Supermart ML Pipeline ===")

    prepare_data_file()
    df_result = load_and_preprocess_data()
    if df_result[0] is None:
        return False

    df, le_dict, cat, reg, cities = df_result

    show_visualizations(df)
    analytics = generate_analytics_data(df, cat, reg, cities)
    model, scaler, metrics = train_models(df)
    save_models_and_data(model, scaler, le_dict, analytics, metrics)

    plot_importance(model)
    plt.title("XGBoost Feature Importance")
    plt.show()

    print("\n🎯 XGBoost R² Score:", metrics['xgb_r2'])
    print("🎯 XGBoost MSE:", metrics['xgb_mse'])
    print("✅ Pipeline completed successfully!")
    return True

if __name__ == "__main__":
    success = main()
    if not success:
        exit(1)