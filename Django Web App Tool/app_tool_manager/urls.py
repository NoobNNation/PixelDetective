# Import django modules
from django.urls import path
from . import api

app_name = 'app_tool_manager'

urlpatterns = [
    path('api/media/upload/', api.MediaUploadView.as_view(), name='media_upload'),
]

