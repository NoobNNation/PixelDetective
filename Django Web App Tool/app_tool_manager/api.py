from rest_framework import status
from rest_framework.response import Response 
from rest_framework import generics, mixins
from .models import *
from django.http import JsonResponse
from django.views import View
from .image_preprocessor import ImagePreprocessor  
import json
import numpy as np
from .model_utils import trained_model, ClassLabels, flattened_tree_json

class MediaUploadView(View):
    def post(self, request, *args, **kwargs):
        try:
            if 'image' in request.FILES:
                image = request.FILES['image']
                imagePreprocessor = ImagePreprocessor()
                preprocessed_image = imagePreprocessor.preprocess(image)
                preprocessed_image = np.expand_dims(preprocessed_image, axis=0)
                predictions = trained_model.predict(preprocessed_image)
                predictions_list = predictions.tolist()[0]
                predictions_dict = dict(zip(ClassLabels, predictions_list))
                top_pred_label = max(predictions_dict, key=predictions_dict.get)
                top_pred_description = ''
                for item in flattened_tree_json:
                    if item['label'] == top_pred_label:
                        top_pred_description = item['note']
                        break
                return JsonResponse({'predictions': predictions_dict,'top_pred_description': top_pred_description})

            else:
                return JsonResponse({'error': 'No image file provided'}, status=400)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
