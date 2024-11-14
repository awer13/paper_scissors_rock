// Адрес и ABI контракта
const contractAddress = '0x84e07851f6d89fAAEa564CA4f178D8c46B71d507';
let contractAbi;

// Web3 переменные
let contract;

// DOM-элементы
const scoreSpan = document.getElementById('score');
const resultDiv = document.getElementById('message');
const rockBtn = document.getElementById('rock');
const paperBtn = document.getElementById('paper');
const scissorsBtn = document.getElementById('scissors');

// Инициализация Web3 и контракта
async function initWeb3() {
    if (typeof window.ethereum !== 'undefined') {
        window.web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        contract = new web3.eth.Contract(contractAbi, contractAddress);
    } else {
        alert('Пожалуйста, установите MetaMask!');
    }
}

// Загрузка ABI и инициализация Web3
fetch('abi.json')
    .then(response => response.json())
    .then(abi => {
        contractAbi = abi;
        initWeb3();
    })
    .catch(error => console.error('Ошибка при загрузке ABI:', error));

// Логика игры
async function playGame(userChoice) {
    try {
        const accounts = await web3.eth.getAccounts();
        const playerMove = { 'камень': 0, 'бумага': 1, 'ножницы': 2 }[userChoice];

        // Вызов функции контракта
        await contract.methods.play(playerMove).send({ from: accounts[0] });

        console.log(`Ваш ход: ${userChoice} отправлен в блокчейн.`);

        // Обновить историю после игры
        fetchGameHistory();
    } catch (error) {
        console.error('Ошибка во время игры:', error);
        alert('Что-то пошло не так. Проверьте консоль для деталей.');
    }
}

// Загрузка истории из контракта
async function fetchGameHistory() {
    try {
        const history = await contract.methods.getHistory().call();
        console.log("История игр:", history);

        const accounts = await web3.eth.getAccounts();
        const userWins = history.filter(
            game => game.player.toLowerCase() === accounts[0].toLowerCase() && game.result === "You Win!"
        ).length;

        // Отобразить счет
        scoreSpan.textContent = userWins;

        // Отобразить историю
        displayHistory(history);
    } catch (error) {
        console.error("Ошибка при получении истории:", error);
    }
}

// Функция отображения истории
function displayHistory(history) {
    resultDiv.innerHTML = ""; // Очистить предыдущие результаты

    history.forEach((game, index) => {
        const gameResult = `
            <div>
                <strong>Игра ${index + 1}:</strong>
                Игрок: ${game.player} | Ваш ход: ${convertMove(game.playerMove)} | 
                Ход противника: ${convertMove(game.opponentMove)} | Результат: ${game.result}
            </div>
        `;
        resultDiv.innerHTML += gameResult;
    });
}

function convertMove(move) {
    return ['Камень', 'Бумага', 'Ножницы'][move];
}

// Обработчики событий для кнопок
rockBtn.addEventListener('click', () => playGame('камень'));
paperBtn.addEventListener('click', () => playGame('бумага'));
scissorsBtn.addEventListener('click', () => playGame('ножницы'));

// Загрузка данных при открытии страницы
window.onload = async () => {
    await initWeb3();
    fetchGameHistory();
};
