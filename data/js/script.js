const KEYBOARD = [
    ['Q','W','E','R','T','Y','U','I','O','P'],
    ['A','S','D','F','G','H','J','K','L'],
    ['Z','X','C','V','B','N','M']
];
var validWords = [];
var selectedCell = [0,0];
var answer = ['','','','',''];
var realAnswer;

window.onload = function() {
    // Carregar as listas de palavras
    fetch('./data/assets/answer-list.txt') // Carregar a lista de respostas
        .then((response) => response.text())
        .then((text) => {
            var answerList = text.split('\n'); // Transformar em um array
            realAnswer = answerList[Math.floor(Math.random()*answerList.length)]; // Escolher a palavra
        });

    fetch('./data/assets/valid-words.txt') // Carregar a lista de palavras válidas
        .then((response) => response.text())
        .then((text) => {
            validWords = text.split('\n'); // Transformar em um array
        });

    // Criar as células dinamicamente
    for(i = 0; i < 6; i++) {
        $('.game').append(`<div id="${i}" class="row"></div>`);
        for(j = 0; j < 5; j++) {
            $(`#${i}`).append(`<span id="${i}_${j}" class="cell" prior="-1"></span>`) // prior -1 = Undefined
        }
    }
    loop(); // Iniciar o loop()

    // Criar o teclado dinamicamente
    for(i in KEYBOARD) {
        $('.keyboard').append(`<div id="kr${i}" class="kr"></div>`);
        for(j in KEYBOARD[i]) {
            $(`#kr${i}`).append(`<span id="k${i}k${j}" class="key" prior="-1">${KEYBOARD[i][j]}</span>`); // prior -1 = Undefined
        }
    }
};

// Escrever
function write(cell, letter, isRemov) {
    $(`#${cell}`).html(letter); // Escreve a letra na célula
    if(!isRemov) { selectedCell[1] += 1; } // Se for remover uma letra não avançar a célula
    for(i = 0; i < 5; i++) {
        answer[i] = $(`#${selectedCell[0]}_${i}`).text();
    }
}

// Enviar respota
function submit() {
    // As 3 váriaveis precisam ser resetadas toda vez que apertar ENTER
    var strAnswer = (answer.join('')).toUpperCase();
    var arrReal = realAnswer.split('');
    var wordExist;

    // Verifica se a palavra existe
    for(i in validWords) {
        if(strAnswer == validWords[i]) {
            wordExist = true;
            break; // Se existir ele já quebra o loop
        } else {
            wordExist = false;
        }
    }
    if(wordExist && selectedCell[0] < 6) 
    {
        // Determina as letras na mesma posição
        for(i in answer) {
            $(`#${selectedCell[0]}_${i}`).attr('prior', '0'); // prior 0 = #CCC

            if(answer[i].toUpperCase() == arrReal[i]) {
                $(`#${selectedCell[0]}_${i}`).attr('prior', '2'); // prior 2 = GREEN
                
                // Remover a letra de ambos arrays sendo que a caractere não pode ser a mesma para os dois
                arrReal[i] = '.';
                answer[i] = '-';
            }
        }
        // Determinar as letras que existem porém não estão na mesma posição (após já eliminar as que estão na mesma posição)
        for(i in answer) {
            var quant = arrReal.filter(letter => letter === answer[i].toUpperCase()).length; // Determina o quantidade de letras
            if(quant > 0) { // Se tiver a letra
                $(`#${selectedCell[0]}_${i}`).attr('prior', '1'); // prior 1 = YELLOW
                
                // Remover a letra do arrReal, adicionando a mesma caracter que anteriormente (apenas para padronização)
                let pos = arrReal.indexOf(answer[i].toUpperCase());
                arrReal[pos] = '.';
            }
            $(`#${selectedCell[0]}_${i}`).css('opacity', '0.9'); // Deixa todas as células da linha opacas

            // Muda a cor da tecla dos teclados para ficar igual as letras (Se o prior da tecla for menor do que o da célula)
            for(r in KEYBOARD) {
                var keyNum = KEYBOARD[r].indexOf(($(`#${selectedCell[0]}_${i}`).text()).toUpperCase());
                if($(`#k${r}k${keyNum}`).attr('prior') < $(`#${selectedCell[0]}_${i}`).attr('prior')) {
                    $(`#k${r}k${keyNum}`).attr('prior', $(`#${selectedCell[0]}_${i}`).attr('prior'));
                };
            }
        }
        // Ir para a próxima linha
        selectedCell[0] += 1;
        selectedCell[1] = 0;
    }
}

document.addEventListener('click', function(e) {
    var targetId = e.target.id;

    switch(e.target.className) {
        case 'cell': // Selecionar célula ao clicá-la
            var newSelectedCell = targetId.split('_');
            selectedCell[1] = Number(newSelectedCell[1]);
            break;
    }
});
document.addEventListener('keyup', function(e) {
    if(e.keyCode <= 90 && e.keyCode >= 65) { // Se for uma letra [de A à Z]
        write(`${selectedCell[0]}_${selectedCell[1]}`, e.key, false);
    }
    switch(e.keyCode) {
        case 8: // 'Backspace'
            if($(`#${selectedCell[0]}_${selectedCell[1]}`).text() !== '') {
                write(`${selectedCell[0]}_${selectedCell[1]}`, '', true); // Remover a letra da célula selecionada sem selecionar a anterior
            } else if(selectedCell[1] > 0 && selectedCell[1] <= 4) {
                selectedCell[1] -= 1; write(`${selectedCell[0]}_${selectedCell[1]}`, '', true); // Remover a letra da célula anterior (quando não tiver letra na célula atual)
            } else if(selectedCell[1] == 0) {
                selectedCell[1] = 0; // Impedir que saia da célula 0 e pule para a célula 4
            } else {
                selectedCell[1] = 4; write(`${selectedCell[0]}_${selectedCell[1]}`, '', true); // Remover e selecionar a última célula (se nenhuma célula estiver selecionada)
            }
            break;
        case 13: // 'Enter'
            submit();
            break;
        case 37: // 'Left Arrow'
            if(selectedCell[1] > 0 && selectedCell[1] <= 4) { selectedCell[1] -= 1; } else { selectedCell[1] = 0 }
            break;
        case 39: // 'Right Arrow'
            if(selectedCell[1] < 4 && selectedCell[1] >= 0) { selectedCell[1] += 1; } else { selectedCell[1] = 4 }
            break;
        case 186: // 'Cedilha'
            write(`${selectedCell[0]}_${selectedCell[1]}`, 'c', false);
            break;
    }
});
function loop() {
    // Sinalizar a célula selecionada
    $('.cell').css('border-bottom-width', '2px');
    $(`#${selectedCell[0]}_${selectedCell[1]}`).css('border-bottom-width', '8px');

    // Mudar a cor de aocrdo com o atributo 'prior'
    $('[prior="-1"]').css('background-color', '#eee');
    $('.key[prior="0"]').css('background-color', '#ccc'); // Somene as teclas irão ficar nessa cor
    $('[prior="1"]').css({'background-color': 'yellow', 'border-color': 'yellow'});
    $('[prior="2"]').css({'background-color': 'green', 'border-color': 'green'});

    requestAnimationFrame(loop);
}