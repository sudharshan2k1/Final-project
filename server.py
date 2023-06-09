#!/usr/bin/env python
import cv2
import json
import numpy as np
import classifier
import subprocess

from flask import Flask, render_template,  request
from keras.models import model_from_json

app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

# Load Haarcascade File
face_detector = cv2.CascadeClassifier("ml_folder/haarcascade_frontalface_default.xml")

# Load the Model and Weights
model = model_from_json(open("ml_folder/facial_expression_model_structure.json", "r").read())
model.load_weights('ml_folder/facial_expression_model_weights.h5')
model.make_predict_function()


@app.route('/')
def home():
    return render_template('index.html')


@app.route('/uploade', methods=['POST', 'GET'])
def upload_file():
    if request.method == 'POST':
        # f.save("somefile.jpeg")
        # f = request.files['file']

        f = request.files['file'].read()
        npimg = np.fromstring(f, np.uint8)
        img = cv2.imdecode(npimg, cv2.IMREAD_GRAYSCALE)
        face_properties = classifier.classify(img, face_detector, model)

        return json.dumps(face_properties)

@app.route('/compile', methods=['POST'])
def compile():
    code = request.form['code']
    lang = request.form['lang']
    filename = 'temp.' + lang
    with open(filename, 'w') as f:
        f.write(code)
    try:
        if lang == 'py':
            output = subprocess.check_output(['python', filename], stderr=subprocess.STDOUT, timeout=5)
        elif lang == 'js':
            output = subprocess.check_output(['node', filename], stderr=subprocess.STDOUT, timeout=5)
        output = output.decode('utf-8')
    except subprocess.CalledProcessError as e:
        output = e.output.decode('utf-8')
    except subprocess.TimeoutExpired:
        output = 'Timeout Error: Your program took too long to execute.'
    except Exception as e:
        output = str(e)
    return output
if __name__ == '__main__':

    # Run the flask app
    app.run()
