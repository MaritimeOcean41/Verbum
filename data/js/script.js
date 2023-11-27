const KEYBOARD = [
    ['Q','W','E','R','T','Y','U','I','O','P'],
    ['A','S','D','F','G','H','J','K','L',['⌫', 2]],
    ['Z','X','C','V','B','N','M',['ENTER', 3]]
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
            $(`#kr${i}`).append(`<span id="${i}k${j}" class="key" style="width: ${50*KEYBOARD[i][j][1]}px;" prior="-1">${KEYBOARD[i][j][0]}</span>`); // prior -1 = Undefined
        }
    }
};

// Checar qual a tecla apertada e determinar funções a partir disso
function check(keyCode, key) {
    if(keyCode <= 90 && keyCode >= 65) { // Se for uma letra [de A à Z]
        write(`${selectedCell[0]}_${selectedCell[1]}`, key, false);
    }
    switch(keyCode) {
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
}

// Escrever ou remover letras pressionadas nas células
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
                if($(`#${r}k${keyNum}`).attr('prior') < $(`#${selectedCell[0]}_${i}`).attr('prior')) {
                    $(`#${r}k${keyNum}`).attr('prior', $(`#${selectedCell[0]}_${i}`).attr('prior'));
                };
            }
        }
        // Ir para a próxima linha
        selectedCell[0] += 1;
        selectedCell[1] = 0;
    }
}

// Identifica se algo foi clicado (Ex. células ou teclas)
document.addEventListener('click', function(e) {
    var targetId = e.target.id;
    switch(e.target.className) {
        case 'cell': // Selecionar célula ao clicá-la
            var newSelectedCell = targetId.split('_'); // Conseguir o número dessa nova célula selecionada
            selectedCell[1] = Number(newSelectedCell[1]);
            break;
        case 'key': // Escrever utilizando ao 'tecladinho'
            var arrPos = targetId.split('k'); // Conseguir a posição da letra
            var letter = KEYBOARD[arrPos[0]][arrPos[1]];
            if(Array.isArray(letter)) { // Se for um array só poderá ser a tecla ENTER ou BACKSPACE
                switch(letter[0]) {
                    case 'ENTER':
                        check(13);
                        break;
                    case '⌫': // Backspace
                        check(8);
                        break;
                }
            } else { // Se não for um array, ou seja, apenas se for uma letra
                check(letter.charCodeAt(0), letter); // .charCodeAt(0) define o unicode relativo ao caractere
            }
            break;
    }
});
document.addEventListener('keyup', function(e) {
    check(e.keyCode, e.key);
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