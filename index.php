<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HamsterHack by Doxecy</title>
    <link rel="stylesheet" href="css/style.css">
    <link rel="icon" href="img/favicon.ico" type="image/x-icon"> <!-- Добавлено для favicon -->
</head>
<body>
    <div class="container">
        <header>
            <p>Создатель Doxecy</p>
        </header>
        <h1>Генератор ключей Hamster Kombat</h1>
        <select id="keyCountSelect">
            <option value="1">1 Ключ</option>
            <option value="2">2 Ключа</option>
            <option value="3">3 Ключа</option>
            <option value="4">4 Ключа</option>
        </select>
        <button id="startBtn">Начать</button>
        <div id="progressContainer" class="hidden">
            <div id="progressBar"></div>
            <span id="progressText">0%</span>
        </div>
        <div id="keyContainer" class="hidden">
            <h2>Сгенерированные ключи:</h2>
            <p id="generatedKeys"></p>
        </div>
        <footer>
            <button id="creatorChannelBtn">Telegram канал создателя</button>
        </footer>
    </div>
    <script src="js/script.js"></script>
</body>
</html>
