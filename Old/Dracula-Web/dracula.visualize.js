function clearAllVisualizations() {
  $("#visualize-area-chars").empty();
  for (var i = 1; i <= 2; i++) {
    $("#visualize-area-lstm-chars-"+i).empty();
  }
  $("#visualize-area-words").empty();
  $("#pitch-container").css("float", "right");
  $("#form-container").css("float", "left");
}

function visualize3DEmbeddings(embeddings, lengths, plotName, plotText, plotArea) {
  var width = 0;
  var height = 0;
  for (var i = 0; i < embeddings.length; i++) {
    width += 20 + lengths[i]*5;
    if (lengths[i] == 0) break;
    for (var j = 0; j < embeddings[i].length; j++) {
      height = embeddings[i][j].length * 5;
    }
  }
  width += 25;

  // Not a mistake: these charts are rotated through 90
  var canvas = $("<canvas id=\""+plotName+"\""+
  "width=\""+height+"\"height=\""+width+"\"></canvas>");
  $("#"+plotArea).append("<h2>"+plotText+"</h2>");
  $("#"+plotArea).append(canvas);

  // Figure out min-and-max values
  var minimum = Number.MAX_VALUE;
  var maximum = Number.MIN_VALUE;
  for (var i = 0; i < embeddings.length; i++) {
    for (var j = 0; j < embeddings[i].length; j++) {
      for (var k = 0; k < embeddings[i][j].length; k++) {
        minimum = Math.min(minimum, embeddings[i][j][k]);
        maximum = Math.max(maximum, embeddings[i][j][k]);
      }
    }
  }

  var rescale = function (a) {
    var scale = maximum-minimum;
    return Math.round(255*(a - minimum) / scale);
  }

  var hexConvert = function (a) {
    return ("00" + a.toString(16)).substr(-2);
  }

  var c = document.getElementById(plotName);
  var ctx = c.getContext("2d");

  var x = 0;
  for (var i = 0; i < embeddings.length; i++) {
    var word = embeddings[i];
    x += 20; // Seperate adjacent words
    if (lengths[i] == 0) break;
    for (var j = 0; j < lengths[i]; j++) {
      var c = word[j];
      x += 5; // Seperate adjacent letters
      for (var k = 0; k < c.length; k++) {
        var y = k * 5;
        ctx.beginPath();
        ctx.lineWidth="1";
        ctx.strokeStyle="gray";
        ctx.fillStyle="#"+hexConvert(rescale(c[k]))+"0000";
        ctx.fillRect(y, x, 5, 5);
        ctx.stroke();
      }
    }
  }

}


function visualizeCharacterEmbeddings(embeddings, lengths) {
  clearAllVisualizations();
  visualize3DEmbeddings(embeddings,
    lengths,
    "char-embeddings-plot",
    "Character Embeddings",
    "visualize-area-chars"
  );
}

function visualizeLSTMCharsActivation(embeddings, layer, lengths) {
  visualize3DEmbeddings(embeddings, lengths, "lstm-chars-plot-"+layer,
  "Character-level LSTM ("+layer+")", "visualize-area-lstm-chars-"+layer);
}

function visualize2DActivation(embeddings, plotName, plotText) {
  // "#visualize-word-area"
  //var dname = plotName+"-container";
  //var d = $("<div class=\"plot-area\" id=\""+dname+"\"></div>");
  //$("#visualize-area-words").append(d);
  var emb = [embeddings];
  var l = [embeddings.length];
  visualize3DEmbeddings(emb, l, plotName, plotText, "visualize-area-words");
}
