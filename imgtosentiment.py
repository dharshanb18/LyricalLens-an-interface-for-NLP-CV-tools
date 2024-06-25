from pytesseract import pytesseract
import os
import pandas as pd
import numpy as np
import keras
import tensorflow
from keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
from sklearn.preprocessing import LabelEncoder
from keras.models import load_model


tokenizer = Tokenizer()
label_encoder = LabelEncoder()


class OCR:
    def __init__(self):
        self.path = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

    def extract(self, filename):
        try:
            pytesseract.tesseract_cmd = self.path
            text = pytesseract.image_to_string(filename)
            return text
        except Exception as e:
            print(e)
            return "error"

# Load the sentiment analysis model
loaded_model = load_model("my_modellstm1.h5")

ocr = OCR()
text = ocr.extract(r"C:\Users\Jovan\Desktop\french.jpg")

max_length = len(text.split())

# Preprocess the extracted text for sentiment analysis
new_input_sequence = tokenizer.texts_to_sequences([text])
padded_new_input_sequence = pad_sequences(new_input_sequence, maxlen=max_length)

# Make a prediction using the loaded model
new_prediction = loaded_model.predict(padded_new_input_sequence)
new_predicted_label = label_encoder.inverse_transform([np.argmax(new_prediction[0])])

print("Extracted Text:")
print(text)
print("Predicted Sentiment:")
print(new_predicted_label[0])
