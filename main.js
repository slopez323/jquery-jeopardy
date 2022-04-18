let pickedQuestions = JSON.parse(localStorage.getItem('list')) || [];
let pickedCells = JSON.parse(localStorage.getItem('picked')) || [];
let score = localStorage.getItem('score') || 0;

function setup() {
    for (let i = 0; i < 5; i++) {
        $('.board').append(`<div class="cell cell-${i} cell-active">$100</div>`);
    };
    for (let i = 5; i < 10; i++) {
        $('.board').append(`<div class="cell cell-${i} cell-active">$200</div>`);
    };
    for (let i = 10; i < 15; i++) {
        $('.board').append(`<div class="cell cell-${i} cell-active">$400</div>`);
    };
    for (let i = 15; i < 20; i++) {
        $('.board').append(`<div class="cell cell-${i} cell-active">$600</div>`);
    };
    for (let i = 20; i < 25; i++) {
        $('.board').append(`<div class="cell cell-${i} cell-active">$800</div>`);
    };
    for (let cell of pickedCells) {
        $(`.${cell}`).addClass('picked');
    }

    $('.scoreValue').text(`$${score}`);
    $('#userAnswer').prop('disabled', true);

    if (localStorage.getItem('status') == 'ongoing') {
        $('.question').text(pickedQuestions[pickedQuestions.length - 1].question);
        $('.question').show();
        $('#userAnswer').prop('disabled', false);
        $('#userAnswer').focus();
    }
};

setup();

async function getQuestion(value) {
    let questions = await fetch('jeopardy.json');
    questions = await questions.json();
    let filtered = questions.filter(x => x.value == value)
    console.log(filtered)

    let random = Math.floor(Math.random() * filtered.length);

    let chosenQuestion = filtered[random].question;
    let chosenAnswer = filtered[random].answer;
    console.log(random)

    $('.result').hide();
    $('.question').text(chosenQuestion);
    $('.question').show();

    pickedQuestions.push({ 'question': chosenQuestion, 'answer': chosenAnswer, 'value': value.substring(1) });
    localStorage.setItem('list', JSON.stringify(pickedQuestions));

    $('#userAnswer').prop('disabled', false);
    $('#userAnswer').focus();
};

$('.board').on('click', $('.cell'), function (e) {
    let cellNum = e.target.classList
    console.log(cellNum)
    if (localStorage.getItem('status') !== 'ongoing' && !pickedCells.includes(cellNum[1])) {
        localStorage.setItem('status', 'ongoing');
        $('.cell').removeClass('cell-active');

        pickedCells.push(cellNum[1]);
        localStorage.setItem('picked', JSON.stringify(pickedCells))

        $(e.target).addClass('picked');

        let value = e.target.textContent;
        getQuestion(value);
    };
});

$('.response').on('submit', function (e) {
    e.preventDefault();
    checkAnswer();
    localStorage.setItem('status', '');
});

function checkAnswer() {
    if ($('.question').text() !== '') {
        if ($('#userAnswer').val().toLowerCase() == pickedQuestions[pickedQuestions.length - 1].answer.toLowerCase()) {
            $('.result').text('Correct!');
            score += +pickedQuestions[pickedQuestions.length - 1].value;
            $('.scoreValue').text(`$${score}`);
            localStorage.setItem('score', score);
        } else {
            $('.result').text(`Incorrect.  Correct answer was: ${pickedQuestions[pickedQuestions.length - 1].answer}`);
        }
        $('.result').show();
        $('.question').text('');
        $('.question').hide();
    };
    $('#userAnswer').val('');
    $('#userAnswer').prop('disabled', true);

    $('.cell').addClass('cell-active');
};

$('#resetBtn').on('click', function () {
    localStorage.clear();
    $('.cell').removeClass('picked');
    $('.question').hide();
    $('.result').hide();
    $('#userAnswer').val('');
    $('#userAnswer').prop('disabled', true);
    pickedQuestions = [];
    pickedCells = [];
    score = 0;
});