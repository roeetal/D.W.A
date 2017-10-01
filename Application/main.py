from flask import Flask, render_template, request
from collections import OrderedDict
import json
from subprocess import Popen, PIPE

app = Flask(__name__)

@app.route('/')
def index():
    message = "My Name Jeff and I am at a hackathon dying right now."
    command = ("echo "+message+" | docker run --rm -i brianlow/syntaxnet")
    output = Popen([command], stdout=PIPE, shell=True)
    print output.stdout.read()
    return render_template('index.html')

"""
requires text data in post

@param: HTTP POST: Constains text data
@return: JSON Dict: generated question(s)

receives http post, sends data to be parsed, generate questions

"""

@app.route("/generate_questions", methods=['POST', 'GET'])
def generate_questions():
    data = ''
    errors = ''
    try:
        if request.method == 'POST':
            post = request.form
            if post['data']:
                data=post['data']
            else:
                raise ValueError('You did not send data!')
        else:
            raise ValueError('Please POST some data.')
        data = parse(data)
    except Exception as e:
        errors = str(e)
    output = OrderedDict([('questions', data), ('errors', errors)])
    return json.dumps(output)

"""
requires text data and answer(s) in post

@param: HTTP POST: Constains text data, answers
@return: JSON Dict: generated hints(s)

receives http post, sends data to be parsed, generate hints

"""

@app.route("/generate_hints", methods=['POST', 'GET'])
def generate_hints():
    data = ''
    answer = ''
    errors = ''
    try:
        if request.method == 'POST':
            post = request.form
            if post['data']:
                data=post['data']
            else:
                raise ValueError('You did not send data')
            if post['answers']:
                answers=post['answers']
            else:
                raise ValueError('You did not send data')
        else:
            raise ValueError('Please POST some data')
        data = parse(data, hints)
    except Exception as e:
        errors = str(e)
    output = OrderedDict([('hints', data), ('errors', errors)])
    return json.dumps(output)

"""

requires text data as string

@param: String text data
@return: String: generated tree

"""
def parse(input_data):
    sentences = input_data.split('. ')
    return sentences[0]


if __name__=='__main__':
    # TODO: Threading true?
    # app.run(threaded=False, debug=False, host='0.0.0.0')
    app.run(threaded=False, debug=True)
