function draculaSoftmax(values) {

  // TODO: need to check if this U is the same as the one exported
//  var act = numeric.dot(values, draculaParams_U);
  var act = [];
  for (var i = 0; i < values.length; i++) {
    var tmp = numeric.dot(values[i], draculaParams_U);
    tmp = numeric.add(tmp, draculaParams_b);
    act.push(tmp);
  }

  //var exp = numeric.exp(act);
  var exp = [];
  for (var i = 0; i < act.length; i++) {
    //var ex = numeric.exp(act[i] - Math.max(...act[i]))
    var ex = numeric.exp(act[i]);
    ex = numeric.div(ex, numeric.sum(ex))
    exp.push(ex);
//    exp[i] = numeric.div(exp[i], numeric.sum(exp[i]));
  }
  return exp;
}

draculaParams_inv_pos_dict= {
	1: 'Noun (pl)',
	2: 'Personal Pronoun',
	3: 'Verb (past)',
	4: 'Verb (-ing)',
	5: 'Prep/Sub. Conj.',
	6: 'Pronoun',
	7: 'Noun',
	8: 'Coordinating Conj.',
	9: 'Proper Noun',
	10: '\'',
	11: 'USR',
	12: 'Interj.',
	13: 'Adjective',
	14: 'to',
	15: ',',
	16: '.',
	17: 'Adverb',
	18: 'Verb',
	19: 'Verb',
	20: 'Verb',
	21: 'Determiner',
	22: ')',
	23: 'Wh-adverb',
	24: 'Verb',
	25: 'Comparative Adj.',
	26: 'URL',
	27: 'HT',
	28: ':',
	29: 'Verb (past)',
	30: '``',
	31: 'Cardinal Number',
	32: 'Comparative Adv.',
	33: 'Particle',
	34: 'RT',
	35: 'Superl. Adj.',
	36: 'Superl. Adv.',
	37: 'Existence There',
	38: 'Proper Noun',
	39: 'Possessive Ending  \'s',
	40: 'Wh-pronoun',
	41: '(',
	42: 'Wh-determiner ',
	43: 'Foreign Word',
	44: '$',
	45: 'Predeterminer',
	46: 'Symbol',
	47: 'MB',
	48: 'Possessive wh-pronoun',
	49: '-LRB-',
	50: '-RRB-',
	51: 'List Item Marker',
	52: '#',
};

function determineLabels(exp) {

  // Compute the argmax
  var ret = [];
  for (var i = 0; i < exp.length; i++) {
    var argMax = 0;
    var argMaxVal = 0;
    for (var j = 0; j < exp[i].length; j++) {
      var v = exp[i][j];
      if (v > argMaxVal) {
        argMax = j;
        argMaxVal = v;
      }
    }
    if (argMax in draculaParams_inv_pos_dict) {
      ret.push(draculaParams_inv_pos_dict[argMax]);
    } else {
      ret.push('UNK');
    }
  }

  return ret;
}
