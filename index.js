var TelegramBot = require('node-telegram-bot-api'),
    // Be sure to replace YOUR_BOT_TOKEN with your actual bot token on this line.
    telegram = new TelegramBot("220044654:AAEVby2Q0imOf-VMdJ-JkVUB6dSouLH0NuY", { polling: true });

console.log("Servidor iniciado...");
	
telegram.on("text", (message) => {
  telegram.sendMessage(message.chat.id, "Ola mundo porraaaaaaaaaa!! Feito por Juliano");
});