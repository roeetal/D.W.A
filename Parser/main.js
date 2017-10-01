var API_KEY = 'f408a06bcf5b5c948880a3436edd294f';
var API_URL = 'http://words.bighugelabs.com/api/2/' + API_KEY + '/';

// answer: 2 column matrix of ['word', 'ADJ']
// input/inputParse: array of string
// returns boolean or array of indexes ... yeah kinda strange but javascript!
function compare(answer, input, inputParse) {
	return new Promise(function(resolve, reject) {
	//answer should never be empty because hardcode?
	if(input.length === 0) {
		return false; // fail no input
	}

	var answerParse = [];
	var answerWords = answer.map(function(pair) {
		answerParse.push(pair[1]);
		return pair[0];
	});

	var highlightIndexes = [];
	var promises = [];
	answerWords.forEach(function(word) {
		var i = input.indexOf(word);
		if(i > -1 && answerParse[i] == inputParse[i]) {
			return;
		}
		//check if synonym
		promises.push(getPromise(API_URL + word + '/json').then(function(res) {
			var json = JSON.parse(res);
			var wordRef = json['adjective'];
			var synonyms = wordRef.syn.concat(wordRef.sim);
			var found = synonyms.some(function(syn) {
				return input.indexOf(syn) > -1;
			});
			if(!found) {
				highlightIndexes.push(1); //ummm TODO
			}
		}));
	})
	if(promises.length > 0) {
		Promise.all(promises).then(function(res) {
			return resolve(highlightIndexes.length > 0 ? highlightIndexes : true);
		});
	} else {
		return resolve(highlightIndexes.length > 0 ? highlightIndexes : true);
	}

	});
}

function getPromise(url) {
	return new Promise(function(resolve, reject) {
		var xmlHttp = new XMLHttpRequest();
	    xmlHttp.onreadystatechange = function() { 
	        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
	            resolve(xmlHttp.responseText);
	        }
	    }
	    xmlHttp.open("GET", url, true); // true for asynchronous 
	    xmlHttp.send(null);
	});
}

var answer = [['apple', 'NOUN'], ['orange', 'ADJ'], ['content', 'ADJ']]
var input = ['apple', 'orange', 'complacent/NO']
var inputParse = ['NOUN', 'ADJ', 'ADJ']
// console.log(compare(answer, input, inputParse));
compare(answer, input, inputParse).then(function(res) {
	return console.log(res);
}).catch(function(err) {
	return console.log(err);
})

// getPromise('http://words.bighugelabs.com/api/2/'+API_KEY+'/content/json').then(function(res){
// 	return console.log(res);
// }).catch(function(err) {
// 	return console.log(err);
// })
