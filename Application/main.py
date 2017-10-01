from flask import Flask, render_template, request
from flask_cors import CORS
from subprocess import Popen, PIPE
from collections import defaultdict
from pattern.en import conjugate
import json

json_string2 = ""
json_string1 = r'''
{
    "text": "He is often writing about the University of Central Florida.",
    "tokens": [
        {
            "children": [],
            "head": 3,
            "index": 0,
            "label": "nsubj",
            "tag": "attribute { name: \"Case\" value: \"Nom\" } attribute { name: \"Gender\" value: \"Masc\" } attribute { name: \"Number\" value: \"Sing\" } attribute { name: \"Person\" value: \"3\" } attribute { name: \"PronType\" value: \"Prs\" } attribute { name: \"fPOS\" value: \"PRON++PRP\" } ",
            "word": "he"
        },
        {
            "children": [],
            "head": 3,
            "index": 1,
            "label": "aux",
            "tag": "attribute { name: \"Mood\" value: \"Ind\" } attribute { name: \"Number\" value: \"Sing\" } attribute { name: \"Person\" value: \"3\" } attribute { name: \"Tense\" value: \"Pres\" } attribute { name: \"VerbForm\" value: \"Fin\" } attribute { name: \"fPOS\" value: \"AUX++VBZ\" } ",
            "word": "is"
        },
        {
            "children": [],
            "head": 3,
            "index": 2,
            "label": "advmod",
            "tag": "attribute { name: \"fPOS\" value: \"ADV++RB\" } ",
            "word": "often"
        },
        {
            "children": [
                0,
                1,
                2,
                6
            ],
            "head": -1,
            "index": 3,
            "label": "root",
            "tag": "attribute { name: \"Tense\" value: \"Pres\" } attribute { name: \"VerbForm\" value: \"Part\" } attribute { name: \"fPOS\" value: \"VERB++VBG\" } ",
            "word": "writing"
        },
        {
            "children": [],
            "head": 6,
            "index": 4,
            "label": "case",
            "tag": "attribute { name: \"fPOS\" value: \"ADP++IN\" } ",
            "word": "about"
        },
        {
            "children": [],
            "head": 6,
            "index": 5,
            "label": "det",
            "tag": "attribute { name: \"Definite\" value: \"Def\" } attribute { name: \"PronType\" value: \"Art\" } attribute { name: \"fPOS\" value: \"DET++DT\" } ",
            "word": "the"
        },
        {
            "children": [
                4,
                5,
                9
            ],
            "head": 3,
            "index": 6,
            "label": "obl",
            "tag": "attribute { name: \"Number\" value: \"Sing\" } attribute { name: \"fPOS\" value: \"NOUN++NN\" } ",
            "word": "university"
        },
        {
            "children": [],
            "head": 9,
            "index": 7,
            "label": "case",
            "tag": "attribute { name: \"fPOS\" value: \"ADP++IN\" } ",
            "word": "of"
        },
        {
            "children": [],
            "head": 9,
            "index": 8,
            "label": "compound",
            "tag": "attribute { name: \"Number\" value: \"Sing\" } attribute { name: \"fPOS\" value: \"PROPN++NNP\" } ",
            "word": "central"
        },
        {
            "children": [
                7,
                8
            ],
            "head": 6,
            "index": 9,
            "label": "nmod",
            "tag": "attribute { name: \"Number\" value: \"Sing\" } attribute { name: \"fPOS\" value: \"PROPN++NNP\" } ",
            "word": "florida"
        }
    ]
}'''

question_lists = []
answer_dict = defaultdict(list)

app = Flask(__name__)
CORS(app)

class Token:
    def __init__(self, index, word):
        self.index = index
        self.word = word
        self.children = []
    def update(self, head, tag, label):
        self.head = head
        self.tag = tag
        self.label = label
    def add_child(self, index):
        self.children.append(index)
    def toJSON(self):
        return json.dumps(self, default=lambda o: o.__dict__,
            sort_keys=True, indent=4)

class Sentence:
    def __init__(self, text):
        self.text = text
        self.tokens = []
        for i, word in enumerate(text[:-1].lower().split(" ")):
            self.tokens.append(Token(i, word))
    def toJSON(self):
        return json.dumps(self, default=lambda o: o.__dict__,
            sort_keys=True, indent=4)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/read')
def read():
    return render_template('read.html')

@app.route('/about')
def about():
    return render_template('about.html')

def parse(message):
    command = ("echo "+message+" | sudo docker run --rm -i brianlow/syntaxnet")
    output = Popen([command], stdout=PIPE, shell=True)
    return output.stdout.read()

"""
requires text data in post

@param: HTTP POST: Constains text data
@return: JSON Dict: generated question(s)

receives http post, sends data to be parsed, generate questions

"""

@app.route("/generate_questions", methods=['POST', 'GET'])
def generate_questions():
    global json_string2

    data = ''
    errors = ''
    thing = ''
    try:
        if request.method == 'POST':
            post = json.loads(request.data.decode('utf-8'))
            if post['parsed']:
                json_string2 = post['parsed']
            if post['data']:
                data=post['data']
        else:
            raise ValueError('Please POST some data.')
        data = parse_source(data)
        thing = dict(data)
    except Exception as e:
        errors = str(e)
    return json.dumps({"data": thing, "errors": errors})

"""
requires text data and answer(s) in post

@param: HTTP POST: Constains text data, answers
@return: JSON Dict: generated hints(s)

receives http post, sends data to be parsed, generate hints

"""

@app.route("/generate_hints", methods=['POST', 'GET'])
def generate_hints():
    data = ''
    answers = ''
    errors = ''
    try:
        if request.method == 'POST':
            post = json.loads(request.data.decode('utf-8'))
            if post['answer']:
                answer=post['answer']
            else:
                raise ValueError('You did not send data')
            if post['question']:
                question=post['question']
            else:
                raise ValueError('You did not send data')
        else:
            raise ValueError('Please POST some data')
        data = parse_answers(question, answer)
    except Exception as e:
        errors = str(e)
    return json.dumps({"data": data, "errors": errors})


def parse_json(json_string):
    thing = json.loads(json_string)
    sentence = Sentence(thing["text"])
    for i in range(len(sentence.tokens)):
        t = thing["tokens"][i]
        sentence.tokens[i].update(t["head"], t["tag"], t["label"])
        if t["head"] != -1:
            sentence.tokens[t["head"]].add_child(i)
    return sentence


def get_child_tokens(sentence, index):
    tokens = set()
    tokens.add(index)
    for child_index in sentence.tokens[index].children:
        tokens.update(get_child_tokens(sentence, child_index))
    return tokens


def parse_source(data):
    # run the docker stuff
    div =  parse_source_sentence(0, parse_json(json_string2))
    print(json_string2)
    return div


def parse_source_sentence(sentence_index, sentence):
    question_list = defaultdict(list)

    child_token_list = []
    for token in sentence.tokens:
        child_token_list.append(get_child_tokens(sentence, token.index))

    for i, token in enumerate(sentence.tokens):
        if token.label == "root":
            question_tokens = ["what", "did"]
            for j, t in enumerate(sentence.tokens):
                if t.label == "nsubj":
                    for k in child_token_list[j]:
                        question_tokens.append(sentence.tokens[k].word)
                    break
            question_tokens.append(conjugate(
                token.word, tense = "infinitive"))
            question = " ".join(question_tokens)
            question_list[i] = (sentence_index,
                    question[0].upper() + question[1:] + "?")

        else:
            if token.label == "nmod:poss":
                wh = "whose"
            elif token.label == "nsubj":
                wh = "who"
            elif token.label == "obj":
                wh = "what"
            else:
                continue

            question_tokens = []
            deleted_tokens = child_token_list[i]
            for j, t in enumerate(sentence.tokens):
                if j == token.index:
                    question_tokens.append(wh)
                elif j not in deleted_tokens:
                    question_tokens.append(t.word)
            question = " ".join(question_tokens)
            question_list[i] = (sentence_index,
                    question[0].upper() + question[1:] + "?")

        index = i
        while index != -1:
            answer = " ".join([sentence.tokens[t].word for t in child_token_list[index]])
            answer_dict[question_list[i][1]].append(answer[0].upper() + answer[1:] + ".")
            index = sentence.tokens[index].head

    question_lists.append(json.dumps(question_list))
    return question_list;

def parse_answers(question, answer):
    if answer in answer_dict[question[1]]:
        return "correct"
    else:
        return "sentence"

def parse(input_data):
    command = ("echo "+input_data+" | docker run --rm -i brianlow/syntaxnet")
    output = Popen([command], stdout=PIPE, shell=True)
    tokens=[]
    parsed_tokens = []
    for line in output.stdout:
        tokens.append(line)
    lines = tokens
    tokens.pop(0)
    tokens.pop(0)
    line = tokens[0]
    head = -1
    start_num = -1
    parts = line.split(" ")
    word = parts[0]
    index = input_data.index(word)
    label = parts[1]
    tag = parts[2]
    token_num = 0
    tokens.pop(0)
    parsed_tokens.append({'word':word,'tag':tag,'head':head,'label':label,'index':index,'start_num':start_num,'children':[], 'token_num':token_num})
    while len(tokens)>0:
        line = tokens[0]
        head = index
        start_num = line.find('+')/3
        line = line[(start_num)*3:]
        parts = line.split()
        # if len(parts)>4:
        word = parts[1]
        index = input_data.index(word)
        label = parts[2]
        tag = parts[3]
        token_num +=1
        tokens.pop(0)
        parsed_tokens.append({'word':word,'tag':tag,'head':head,'label':label,'index':index,'start_num':start_num,'children':[], 'token_num':token_num})

    i=0
    while i+1 < len(parsed_tokens):
        j = i + 1
        if i==0:
            for k in range(len(parsed_tokens)-1):
                if parsed_tokens[k]['start_num'] == 0:
                    parsed_tokens[i]['children'].append(parsed_tokens[k]['index'])
            i+=1
        else:
            while parsed_tokens[j]['start_num'] - parsed_tokens[i]['start_num'] == 1:
                parsed_tokens[i]['children'].append(parsed_tokens[j]['index'])
                j+=1
            i+=1
    final_result = {'text': input_data, 'tokens': parsed_tokens}
    return final_result

if __name__=='__main__':
    # TODO: Threading true?
    # app.run(threaded=False, debug=False, host='0.0.0.0')
    app.run(threaded=False, debug=True)
