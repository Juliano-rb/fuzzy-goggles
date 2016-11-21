var TelegramBot = require('node-telegram-bot-api'),
    // Be sure to replace YOUR_BOT_TOKEN with your actual bot token on this line.
    telegram = new TelegramBot("220044654:AAEVby2Q0imOf-VMdJ-JkVUB6dSouLH0NuY", { polling: true });

console.log("Servidor iniciado...");

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
	
	//Se load = 11: esta calculando a pontuacao de espiao
	//Se load = 22: esta calculando a pontuacao de agente
	
	var load = 1;
	
	var index = 0;
	var total = [0,0];
	while(line != -1){
		if(line == "Como espião:"){
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
				console.log(index + " Pontuacao: "+ pontuacao);
				result.spy[index]= pontuacao;
			}
			//Se estiver carregando os dados de agente...
			else if(load == 2){
				var pontuacao = lastNumber(line)*config.agent[index];
				console.log("Pontuacao: " + pontuacao);
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

telegram.on("text", (message) => {
	//O if verifica se na mensagem que o  usuario mandou comntem "Como espião", supõe-se se esta frase então ele ta mandando as estatisticas
	if(message.text.indexOf("Como espião:") != -1){
		//Chama a funcao de calcular o a pontuacao da pessoa
		var resultado = pontuacao(message.text);
		//Sò imprime que alguém fez a requisição, o message.chat.id é porque eu queria imprimir o username da pessoa mas não achei como, depois vejo melhor
		console.log(message.chat.id + " pediu a sua classificacao");
		
		//Imprime os valores obtidos pela funçao pontuacao();
		telegram.sendMessage(message.chat.id, "Pontuação como Espião: " + resultado[0] + "\nPontuação como Agente: " + resultado[1]);
		
	}
	
});