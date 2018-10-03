/* eslint-env browser */

var yarnTextField;
var displayArea;
var dialogue;
var dialogueIterator;
var optNum = 0;

function step() {
  // Steps until an options result
  while(true) {
    var iter = dialogueIterator.next()
    if (iter.done) {
      break;
    }

    var result = iter.value;
    if (result instanceof bondage.OptionResult) {
      showOptions(result);
      break;
    } else {
      displayArea.innerHTML += result.text + '<br/>';
    }
  }
}

function recompile() {
  displayArea.innerHTML = '';

  dialogue = new bondage.Runner();
  var file = document.getElementById('file-input').files[0];
  if (file != null) {
    var reader = new FileReader();
    reader.readAsText(file);
    reader.onload = function (e)
    {
      var text = e.target.result;
      var data = JSON.parse(text);
      dialogue.load(data);  
      dialogueIterator = dialogue.run(document.getElementById('nodename-text').value || 'Start');
      step();  
    }
  }
  else {
    var data = JSON.parse(yarnTextField.value);
    dialogue.load(data);  
    dialogueIterator = dialogue.run(document.getElementById('nodename-text').value || 'Start');
    step();  
  }

}

function showOptions(result) {
  displayArea.innerHTML += '<br/>';
  for (var i = 0; i < result.options.length; i++) {
    displayArea.innerHTML += '<input name="opt-' + optNum + '" type="radio" value="' + i + '">' + result.options[i] + '</input><br/>';
  }
  displayArea.innerHTML += '<input type="button" id="option-button-' + optNum + '" value="Choose"/>'
  displayArea.innerHTML += '<br/><br/>';

  var button = document.getElementById('option-button-' + optNum);
  button.onclick = function () {
    var radios = document.getElementsByName('opt-' + optNum);
    for (var n in radios) {
      var radio = radios[n];
      if (radio.checked) {
        result.select(radio.value);
        optNum++;
        step();
        return;
      }
    }

    console.error('Need to choose an option first!');
  }
}

function jump() {
  console.error('Not implemented yet...');
}

window.onload = function () {
  document.getElementById('recompile-button').onclick = recompile;
  yarnTextField = document.getElementById('yarndata-text');
  displayArea = document.getElementById('display-area');
};
