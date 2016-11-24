'use strict';

var TelegramBot = require('telebot'),
    // Be sure to replace YOUR_BOT_TOKEN with your actual bot token on this line.
    telegram = new TelegramBot("275559857:AAHjz1pm7bCa7kI-Bx4GEMn8_f8lw2IRl2U");

//console.log("Servidor iniciado...");

/*var configV2 = {
	spy:{
		acertou:3,
		errou:-1,
		capturado:-2,
		infiltrado:2
	},
	agent:{
		prendeuSpy:3,
		prendeuAgent:-3,
		preso:0,
		deixouScapar:-2,
		DeixouErrar:+2
	}
}
*/
//Configuração de pesos
var config = {
	spy: [3,-1,-2,2],
	agent:[3,-3,0,-2,2]
}

//Funcao para pegar linha por linha de um texto...
function loader(str){
	//texto a ser usado
	this.txt = str;
	//numero da linha atualLinha atual;
	this.atLineNumber=1;;
	
	this.lineStartIndex=0;
	this.endOfLine;
	
	this.atLine;
	
	this.nextLine = function(){
		//Se Nao atingiu o final do arquivo, pois quando se esta no fim endOfLine recebeu o valor -1 na iteracao anterior por nao ter encontrado o  \n
		if(this.endOfLine != -1){
			this.endOfLine = this.txt.indexOf("\n", this.lineStartIndex);
	
			//Se chegou ao fim da string sem encontrar um \n entao chegou pega ate o resto
			if(this.endOfLine == -1){
				this.atLine = this.txt.substring(this.lineStartIndex);
			}
			else{
				//Senao pega ate o proximo \n (ainda nao chegou no fim da mensagem)
				this.atLine = this.txt.substring(this.lineStartIndex, this.endOfLine);
			}
			
			this.atLineNumber++;
			//Faz começar após o \n na proxima chamada da funcao
			this.lineStartIndex = this.endOfLine+1;
			return this.atLine;
		}
		else{
			//Se ja chegou no fim da mensagem entao retorna -1 para sinalizar
			return -1;
		}
	}
	
}

//Funcao que pega o ultimo numero de uma linha
function lastNumber(str){
	var start = str.lastIndexOf(" ")+1;

	var number = parseInt(str.substr(start));

	return number;
}

function pontuacao(msg){

	//Variavel (objeto) que será armazenado o resultado após as multiplicações
	var result = {
		spy: [0,0,0,0],
		agent:[0,0,0,0,0]
	}
	
	//Corta tudo que tiver antes de "Como espião"..
	var dados = msg.slice(msg.indexOf("Como"));
	//console.log("DADOS__"+dados);
	
	//Classe loader ler linha a linha da mensagem
	var ler = new loader(dados);
	//Pega a proxima linha (ou a primeira);
	var line = ler.nextLine();
	
	//Se load = 1: esta calculando a pontuacao de espiao
	//Se load = 2: esta calculando a pontuacao de agente
	
	var load = 1;
	
	var index = 0;
	var total = [0,0];
	while(line != -1){
		if(line == "Como espiÃ£o:"){
			load = 1;
			index = 0;
		}
		//Load muda de 1 para 2 quando encontra a string "Como agente secreto:" e então o indice é reiniciado
		else if(line == "Como agente secreto:"){
			load = 2;
			index = 0;
		}
		else{
			//Se estiver carregando os dados de espiao...
			if(load == 1){
				//Pega o numero que esta no fim da linha (a pontuacao naquela parte)
				//E depois multiplica pelos pesos em config
				var pontuacao = lastNumber(line)*config.spy[index];
				//console.log(index + " Pontuacao: "+ pontuacao);
				result.spy[index]= pontuacao;
			}
			//Se estiver carregando os dados de agente...
			else if(load == 2){
				var pontuacao = lastNumber(line)*config.agent[index];
				//console.log("Pontuacao: " + pontuacao);
				result.agent[index]= pontuacao;
			}
			index++;
		}
		
		line = ler.nextLine();
	}
	for(var i = 0; i < result.spy.length; i++){
		total[0]+=result.spy[i];
	}
	
	for(var i = 0; i < result.agent.length; i++){
		total[1]+=result.agent[i];
	}
	return total;
}

/*function send2(){
	var opts = {
	  reply_markup: JSON.stringify(
		{
		  force_reply: true
		}
	)};
	
	telegram.sendMessage(message.chat.id, nameToShow + "Me envie a sua classificação do @PlaySpyfallBot", opts).then(function (sended) {
		var chatId = sended.chat.id;
		var messageId = sended.message_id;
		telegram.onReplyToMessage(chatId, messageId, function (message) {
			//Chama a funcao de calcular o a pontuacao da pessoa
			var resultado = pontuacao(message.text);
			var str = "Pontuacao de @"+ nameToShow + ":\n?? Como EspiÃ£o: " + resultado[0] + "\n?? Como Agente: " + resultado[1];
			
			telegram.sendMessage(message.chat.id, str)
			console.log('User is %s years old', message.text);
		});
	});
}*/

function sendError(id, userName, reply){
	telegram.sendMessage(id, "@"+userName + ", nÃ£o consigo entender a mensagem enviadaðŸ˜\nTente copiar e mandar a mensagem exatamente como estÃ¡ nas estatÃ­stiacas do @PlaySpyfallBot", {reply});
}

telegram.on("/pontuar", (message) => {
	console.log("ON");
	
	//O if verifica se na mensagem que o  usuario mandou comntem "Como espiÃ£o", supÃµe-se se esta frase entÃ£o ele ta mandando as estatisticas
	var username = "@"+message.from.username;
	//var username = message.chat.username;
	//var username = message.chat.username;	
	var firstname = message.from.first_name;
	
	
	var nameToShow = (firstname? firstname: username);
	var date = new Date();
	console.log(date.getHours() + ":" + date.getMinutes() +"-" + nameToShow + " pediu a sua pontuacao");
	
	//if(message.text.indexOf("/pontuar") == 0 ){
		
		//Se existe essa string então supõe-se que o resto da mensagem esta de acordo
	if(message.text.indexOf("Como espiÃ£o") != -1){
		//Chama a funcao de calcular a pontuacao da pessoa
		var reply = message.message_id;
		var resultado = pontuacao(message.text);
		var str = "Pontuacao de "+ nameToShow + ":\nðŸ˜Ž Como EspiÃ£o: " + resultado[0] + "\nðŸ•µ Como Agente: " + resultado[1];
		
		telegram.sendMessage(message.chat.id, str, { reply });
		//telegram.sendMessage(message.from.id, str, { reply });
		//telegram.sendMessage(message.chat.id, str);
		//console.log('User is %s years old', message.text);
	}
	else{
		sendError(message.chat.id, nameToShow, reply);
	}
		
	//}
	
});

telegram.on("*", (message) => {
	console.log("mensagem recebida");
	
	console.log(message);
	//if(message.forward_from.username=="@PlaySpyfallBot")
	
	if(message.text)
	if(message.text.indexOf("porra") != -1){
		var username = "@"+message.from.username;
		var firstname = message.from.first_name;
		
		var nameToShow = (username != "undefined")? username: username;
		var reply = message.message_id;
		
		telegram.sendMessage(message.chat.id, "Olha a boca " + username + ", aqui Ã© um grupo de familia.", { reply });
	}
});

telegram.on("edited", (message) => {
	//var username = "@"+message.from.username;
	//var firstname = message.from.first_name;
	
	//var nameToShow = (firstname != "undefined")? firstname: username;
	var reply = message.message_id;
	console.log("alguem editou");
	telegram.sendMessage(message.chat.id, "hmm... ðŸ‘€", { reply });
});

telegram.on("userLeft", (message) => {
	var username = "@"+message.left_chat_member.username;
	//var username = message.chat.username;
	//var username = message.chat.username;	
	var firstname = message.left_chat_member.first_name;
	var nameToShow = (username!="undefined")? username : firstname;
	var date = new Date();
	console.log(date.getHours() + ":" + date.getMinutes() +"-" + nameToShow + " saiu");
	telegram.sendMessage(message.chat.id, "Mais um soldade que se vai, sentiremos sua falta "+nameToShow);
});
telegram.on("userJoined", (message) => {
	console.log(date.getHours() + ":" + date.getMinutes() +"-" + nameToShow + " entrou");
	var username = "@"+message.new_chat_member.username;
	var firstname = message.new_chat_member.first_name;
	var nameToShow = (username!="undefined"? username : firstname);
	var date = new Date();
	telegram.sendMessage(message.chat.id, "Bem vindo Ã  missÃ£o, agente "+nameToShow+ ". Que a forÃ§a esteja com vocÃª.");
});
telegram.on("new_chat_photo", (message) => {
	telegram.sendMessage(message.chat.id,"Acho que esta realmente ficou melhor.");
});

/*telegram.on("inline_query", (query) => {
	var resultado = query.query.trim();
  telegram.answerInlineQuery(query.id, [
    {
      type: "article",
      id: "Pontuacao",
      title: "Pontuar Estatisticas",
      input_message_content: {
        message_text: "Pontuação como Espião: " + resultado[0] + "\nPontuação como Agente: " + resultado[1]
      }
    }
	]);
});*/

telegram.connect();