let showNum;
let showList = JSON.parse(localStorage.getItem('showList')) || [];
let pickedQuestions = JSON.parse(localStorage.getItem('list')) || [];
let pickedCells = JSON.parse(localStorage.getItem('picked')) || [];
let score = localStorage.getItem('score') || 0;
let categories = [];

setup();

async function setup() {
    await getRandomShowNum();

    for (let i = 0; i < 5; i++) {
        let cat = showList[i][0].category;
        cat = cat.replace(/\"/g, "");

        categories.push(cat);
        $('.board').append(`<div class="cell category">${categories[i]}</div>`);
    }
    for (let i = 0; i < 5; i++) {
        $('.board').append(`<div class="cell cell-${i} cell-active" data-category="${categories[i]}">$200</div>`);
    };
    for (let i = 5; i < 10; i++) {
        $('.board').append(`<div class="cell cell-${i} cell-active" data-category="${categories[i - 5]}">$400</div>`);
    };
    for (let i = 10; i < 15; i++) {
        $('.board').append(`<div class="cell cell-${i} cell-active" data-category="${categories[i - 10]}">$600</div>`);
    };
    for (let i = 15; i < 20; i++) {
        $('.board').append(`<div class="cell cell-${i} cell-active" data-category="${categories[i - 15]}">$800</div>`);
    };
    for (let i = 20; i < 25; i++) {
        $('.board').append(`<div class="cell cell-${i} cell-active" data-category="${categories[i - 20]}">$1,000</div>`);
    };
    for (let cell of pickedCells) {
        $(`.${cell}`).addClass('picked');
    }

    $('.scoreValue').text(`$${score}`);
    $('#userAnswer').prop('disabled', true);

    if (localStorage.getItem('status') == 'question') {
        $('.question').append(pickedQuestions[pickedQuestions.length - 1].question);
        $('.question').show();
        $('.cell').removeClass('cell-active');
        $('#userAnswer').prop('disabled', false);
        $('#userAnswer').focus();
    };
};

async function getRandomShowNum() {
    if (!localStorage.getItem('showNum')) {
        let list = await fetch('jeopardy.json');
        list = await list.json();
        let random = Math.floor(Math.random() * list.length);
        showNum = list[random].showNumber;

        localStorage.setItem('showNum', showNum);

        let filtered = list.filter(x => x.showNumber == showNum);
        filtered = filtered.filter(x => x.round == 'Jeopardy!');
        let categories = _.groupBy(filtered, 'category');
        let amounts = ['$200', '$400', '$600', '$800', '$1,000'];
        for (let key in categories) {
            if (categories[key].length >= 5) {
                let values = categories[key].map(item => item.value);
                if (amounts.every(amount => values.includes(amount))) {
                    showList.push(categories[key]);
                    if (showList.length == 5) break;
                };
            };
        };
        if (showList.length < 5) resetGame();
        localStorage.setItem('showList', JSON.stringify(showList));
    } else {
        showNum = localStorage.getItem('showNum');
    };
};

function getQuestion(value, cat) {
    let chosen;
    for (let item of showList) {
        let itemCat = item[0].category;
        itemCat = itemCat.replace(/\"/g, '');
        if (itemCat == cat) {
            chosen = item.find(x => x.value == value);
            console.log(chosen)
            break;
        }
    }

    let chosenQuestion = chosen.question;
    let chosenAnswer = chosen.answer;

    $('.result').hide();
    $('.question').empty();
    $('.question').append(chosenQuestion);
    $('.question').show();

    pickedQuestions.push({ 'question': chosenQuestion, 'answer': chosenAnswer, 'value': value.substring(1).replace(',', '') });
    localStorage.setItem('list', JSON.stringify(pickedQuestions));

    $('#userAnswer').prop('disabled', false);
    $('#userAnswer').focus();
};

$('.board').on('click', $('.cell'), function (e) {
    let cellNum = e.target.classList

    if (localStorage.getItem('status') !== 'question' && !pickedCells.includes(cellNum[1]) && $(e.target).hasClass('cell-active')) {
        localStorage.setItem('status', 'question');
        $('.cell').removeClass('cell-active');

        pickedCells.push(cellNum[1]);
        localStorage.setItem('picked', JSON.stringify(pickedCells))

        $(e.target).addClass('picked');

        let value = e.target.textContent;
        let cat = $(e.target).attr('data-category');
        getQuestion(value, cat);
    };
});

$('.response').on('submit', function (e) {
    e.preventDefault();
    checkAnswer();
    localStorage.setItem('status', '');
});

function checkAnswer() {
    if ($('.question').text() !== '') {
        let answer = String(pickedQuestions[pickedQuestions.length - 1].answer).toLowerCase();
        answer = answer.substring(0,2) == 'a ' ? answer.substring(2) : answer.substring(0,3) == 'an ' ? answer.substring(3) : answer.substring(0,4) == 'the ' ? answer.substring(4) : answer;
        answer = answer.replace(/[,.'"]/g, '');
        answer = answer.replace(/ *\([^)]*\) */g, '');
        answer = answer.replace(/&/g, 'and');
        answer = answer.replace(/-/g, ' ');

        let userAnswer = String($('#userAnswer').val()).toLowerCase();
        userAnswer = userAnswer.replace(/[(),.'"]/g, '');
        userAnswer = userAnswer.replace(/&/g, 'and');
        userAnswer = userAnswer.replace(/-/g, ' ');

        if (userAnswer.includes(answer)) {
            $('.result').text('Correct!');
            score = Number(score) + Number(pickedQuestions[pickedQuestions.length - 1].value);
            $('.result').css('color', '');
            $('.scoreValue').text(`$${score}`);
            localStorage.setItem('score', score);
        } else {
            $('.result').text(`Incorrect.  Correct answer was: ${pickedQuestions[pickedQuestions.length - 1].answer}`);
            $('.result').css('color', 'red');
        }
        $('.result').show();
        $('.question').text('');
        $('.question').hide();
    };
    $('#userAnswer').val('');
    $('#userAnswer').prop('disabled', true);

    $('.cell').addClass('cell-active');
};

$('#resetBtn').on('click', resetGame);

function resetGame() {
    localStorage.clear();
    location.reload();
};