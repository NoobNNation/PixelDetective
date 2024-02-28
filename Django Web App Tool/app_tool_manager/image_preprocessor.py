from PIL import Image
import numpy as np

class ImagePreprocessor:
    def __init__(self, size=(299, 299)):
        self.size = size

    def convert_to_RGB(self, input_file_path):
        try:
            with Image.open(input_file_path) as img:
                if img.mode == 'P':
                    img = img.convert('RGBA')
                if img.mode == 'RGBA':
                    background = Image.new('RGB', img.size, (255, 255, 255))
                    background.paste(img, mask=img.split()[3])
                    img = background

                if img.mode not in ['P', 'RGBA']:
                    img = img.convert('RGB')
            return img
        except Exception as e:
            print(f"Error converting image at {input_file_path}: {e}")
    
    def preprocess(self, image_path):
            img = self.convert_to_RGB(image_path)
            img = img.resize(self.size)
            img_array = np.array(img) / 255.0
            return img_array