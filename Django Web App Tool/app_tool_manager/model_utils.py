import os, json
import pandas as pd
from django.conf import settings
from tensorflow.keras.models import load_model

ClassLabels_path = os.path.join(settings.BASE_DIR, 'app_tool_manager', 'trained_models', 'Trained_ClassLabels.csv')
ClassLabels = pd.read_csv(ClassLabels_path)['Class Labels'].tolist()
flattened_tree_path = os.path.join(settings.BASE_DIR, 'app_tool_manager', 'trained_models', 'flattened_tree.json')
with open(flattened_tree_path, 'r') as file:
    flattened_tree_json = json.load(file)
model_path = os.path.join(settings.BASE_DIR, 'app_tool_manager', 'trained_models', 'custom_CNN_1_12 layers.tf')
trained_model = load_model(model_path)