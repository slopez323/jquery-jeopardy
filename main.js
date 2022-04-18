let pickedQuestions = [];
let score = localStorage.getItem('score') || 0;

function setup() {
    for (let i = 0; i < 5; i++) {
        $('.board').append(`<div class="cell cell-100">$100</div>`)
    }
    for (let i = 0; i < 5; i++) {
        $('.board').append(`<div class="cell cell-200">$200</div>`)
    }
    for (let i = 0; i < 5; i++) {
        $('.board').append(`<div class="cell cell-400">$400</div>`)
    }
    for (let i = 0; i < 5; i++) {
        $('.board').append(`<div class="cell cell-600">$600</div>`)
    }
    for (let i = 0; i < 5; i++) {
        $('.board').append(`<div class="cell cell-800">$800</div>`)
    }
    $('.scoreValue').text(`$${score}`);
}

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
    // console.log(pickedQuestions.find(x => x.question == chosenQuestion).answer)

};

$('.board').on('click', $('.cell'), function (e) {
    let value = e.target.textContent;
    getQuestion(value);
});

$('.response').on('submit', function (e) {
    e.preventDefault();
    checkAnswer();
});

function checkAnswer() {
    if ($('.question').text() !== '') {
        if ($('#userAnswer').val().toLowerCase() == pickedQuestions[pickedQuestions.length - 1].answer.toLowerCase()) {
            $('.result').text('Correct!');
            score += +pickedQuestions[pickedQuestions.length-1].value;
            $('.scoreValue').text(`$${score}`);
            localStorage.setItem('score', score);
        } else {
            $('.result').text(`The correct answer is: ${pickedQuestions[pickedQuestions.length - 1].answer}`);
        }
        $('.result').show();
        $('.question').text('');
        $('.question').hide();
    };
    $('#userAnswer').val('');
};