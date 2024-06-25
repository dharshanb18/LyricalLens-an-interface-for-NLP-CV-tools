import sys
from transformers import T5Tokenizer, T5ForConditionalGeneration
from pytesseract import pytesseract
import os

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


ocr = OCR()
t = sys.argv[1]  #r"C:\Users\Jovan\Desktop\french.jpg"
text = ocr.extract(t)


# Load the tokenizer and model
tokenizer = T5Tokenizer.from_pretrained("mrm8488/t5-base-finetuned-emotion")
model = T5ForConditionalGeneration.from_pretrained("mrm8488/t5-base-finetuned-emotion")


# Tokenize the text
inputs = tokenizer.encode("emotion: " + text, return_tensors="pt")

# Generate the output
outputs = model.generate(inputs, max_length=2)

# Decode the output
predicted_emotion = tokenizer.decode(outputs[0])

print("Predicted Emotion:", predicted_emotion)


"""
import tensorflow as tf
from transformers import T5Tokenizer, TFT5ForConditionalGeneration

# Load the tokenizer
tokenizer = T5Tokenizer.from_pretrained("t5-small")

# Define the model
model = TFT5ForConditionalGeneration.from_pretrained("t5-small")

# Define the text
text = "I am feeling happy today."

# Tokenize the text
inputs = tokenizer("emotion: " + text, return_tensors="tf")

# Generate the output
outputs = model.generate(inputs["input_ids"])

# Decode the output
predicted_emotion = tokenizer.decode(outputs[0], skip_special_tokens=True)

print("Predicted Emotion:", predicted_emotion)
"""