var cont_temp=0;
var cont_etq=0;
var cad_3d="";
var Errores=[];
function genera_Temp() {
	cont_temp++;
	return "t"+cont_temp;
}
function genera_Etq() {
	cont_etq++;
	return "L"+cont_etq;
}
function insertarError(error) {
	Errores.push(error);
	return {temp:'tn',tipo:100,etq:'Ln'};
}
function recorrido(result) {
	//limpiar cad_3d y temporales
	cad_3d="";
	cont_temp=0;
	cont_etq=0;
	//tabla de simbolos
	TablaSimbolos=[];
	ambito=['global'];
	//agregar ambito global
	var global=crearAmbito('global',0);
	insertarAmbito(global);
	crearTablaSimbolos(result);
	var ts=TS_HTML();
	localStorage['ts']=ts;
	//buscar principal
	var principal=buscar_principal(result);
	//verificar si se declaro metodo principal
	if(principal !== null){
		console.log("principal");
		//agregar principal a ambito
		ambito.push('principal');
		//recorrer cuerpo de principal
		ejecutar_Sent(principal.hijos[0]);
		//imprimir codigo 3D generado
		console.log(cad_3d);
	}else{
		console.log("Metodo principal no ha sido declarado.");
	}
}
function buscar_principal(result) {
	for (var i = 0; i <= result.hijos.length; i++) {
		if(result.hijos[i].nombre==='principal'){
			return result.hijos[i];
		}
	}
}
function ejecutar_Sent(cuerpo) {
	//recorrer los hijos del cuerpo
	for(var i = 0; i< cuerpo.hijos.length;i++){
		var sent=cuerpo.hijos[i];
		switch(sent.nombre){
		case 'dec':
			decVar(sent);
			break;
		case 'asig':
			asigVar(sent);
			break;
		case Constante._if:
		  ambito.push(sent.nombre+i);
			cad_3d+='//inicio if\n';
			//se ejecuta condicion
			cad_3d+='//evaluar condicion if\n';
			var cond=evaluarExp(sent.hijos[0]);
			var lsalto='';
			//se verifica si es tipo bool
			if(cond.tipo===Constante.tbool){
				//si es verdadero ejecuta cuerpo de sentencias verdaderas
				cad_3d+='//etiquetas de verdad if\n';
				cad_3d+=cond.lv.join(':\n')+':\n';
				ejecutar_Sent(sent.hijos[1]);
				//etiqueta que salta a final para no ejecutar sentencias falsas
				lsalto=genera_Etq();
				cad_3d+='goto '+lsalto+'\n';
				//si tiene else se ejecuta cuerpo else, sentencias falsas
				cad_3d+='//etiquetas falsas if\n';
				cad_3d+=cond.lf.join(':\n')+':\n';
				if(sent.hijos.length===3){
					ambito.push('else'+i);
					ejecutar_Sent(sent.hijos[2]);
					cad_3d+='goto '+lsalto+'\n';
					ambito.pop();
				}
				cad_3d+=lsalto+':\n';
				ambito.pop();
			}else{
				var error='Error semantico, evaluar condicion de tipo '+valTipo();
				insertarError(error);
			}
			break;
		case Constante._while:
		ambito.push(sent.nombre+i);
			cad_3d+='//inicio while\n';
			var lcond=genera_Etq();
			cad_3d+=lcond+':\n';
			cad_3d+='//evaluar condicion while\n';
			cond=evaluarExp(sent.hijos[0]);
			//se verifica si es tipo bool
			if(cond.tipo===Constante.tbool){
				cad_3d+='//etiquetas de verdad while, continua con el ciclo\n';
				cad_3d+=cond.lv.join(':\n')+':\n';
				//ejecutar instrucciones del cuerpo
				ejecutar_Sent(sent.hijos[1]);
				cad_3d+='goto '+lcond+'\n';
				cad_3d+='//etiquetas falsas while, termina con el ciclo\n';
				cad_3d+=cond.lf.join(':\n')+':\n';
			}else{
				var error='Error semantico, evaluar condicion de tipo '+valTipo();
				insertarError(error);
			}
			ambito.pop();
			break;
			case Constante._dowhile:
				ambito.push(sent.nombre+i);
				cad_3d+='//inicio dowhile\n';
				var linicio=genera_Etq();
				cad_3d+=linicio+':\n';
				//ejecutar instrucciones del cuerpo
				ejecutar_Sent(sent.hijos[0]);
				cad_3d+='//evaluar condicion dowhile\n';
				cond=evaluarExp(sent.hijos[1]);
				if(cond.tipo===Constante.tbool){
					cad_3d+='//etiquetas de verdad dowhile, continua ciclo\n';
					cad_3d+=cond.lv.join(':\n')+':\n';
					cad_3d+='goto '+linicio+'\n';
					cad_3d+='//etiquetas falsas dowhile, termina con el ciclo\n';
					cad_3d+=cond.lf.join(':\n')+':\n';
				}else{
					var error='Error semantico, evaluar condicion de tipo '+valTipo();
					insertarError(error);
				}
				break;
				ambito.pop();
				case Constante._repeat:
					ambito.push(sent.nombre+i);
					cad_3d+='//inicio repeat\n';
					linicio=genera_Etq();
					cad_3d+=linicio+':\n';
					//ejecutar instrucciones del cuerpo
					ejecutar_Sent(sent.hijos[0]);
					cad_3d+='//evaluar condicion repeat\n';
					cond=evaluarExp(sent.hijos[1]);
					if(cond.tipo===Constante.tbool){
						cad_3d+='//etiquetas falsas repeat, continua con el ciclo\n';
						cad_3d+=cond.lf.join(':\n')+':\n';
						cad_3d+='goto '+linicio+'\n';
						cad_3d+='//etiquetas de verdad repeat, termina el ciclo\n';
						cad_3d+=cond.lv.join(':\n')+':\n';
					}else{
						var error='Error semantico, evaluar condicion de tipo '+valTipo();
						insertarError(error);
					}
					ambito.pop();
					break;
				case Constante._for:
					ambito.push(sent.nombre+i);
					cad_3d+='//inicio for\n';
					//ejecutar hijo 0 para declaracion o asignacion
					if(sent.hijos[0].nombre===Constante.dec){
						decVar(sent.hijos[0]);
					}else{
						asigVar(sent.hijos[0]);
					}
					//verificar condicion 1
					linicio=genera_Etq();
					cad_3d+=linicio+':\n';
					cad_3d+='//evaluar condicion for\n';
					cond=evaluarExp(sent.hijos[1]);
					if(cond.tipo===Constante.tbool){
						//etiquetas verdaderas -> ejecutar cuerpo
						cad_3d+='//etiquetas de verdad for, ejecuta cuerpo\n';
						cad_3d+=cond.lv.join(':\n')+':\n';
						ejecutar_Sent(sent.hijos[3]);
						//hijo 2 ->operacion en variable de control
						cad_3d+='//realizar operacion a variable de control for\n';
						asigVar(sent.hijos[2]);
						//salto linicio
						cad_3d+='goto '+linicio+'\n';
						//falsas -> termina ciclo
						cad_3d+='//etiquetas falsas for, termina con el ciclo\n';
						cad_3d+=cond.lf.join(':\n')+':\n';
					}else{
						var error='Error semantico, evaluar condicion de tipo '+valTipo();
						insertarError(error);
					}
					ambito.pop();
					break;
					case Constante._loop:
						ambito.push(sent.nombre+i);
						//TODO: agregar display para controlar id en loop
						//valor almacena id de loop
						//hijo0 tiene el cuerpo
						cad_3d+='//inicio loop '+sent.valor+'\n';
						linicio=genera_Etq();
						cad_3d+=linicio+':\n';
						cad_3d+='//ejecuetar sentencias loop\n';
						ejecutar_Sent(sent.hijos[0]);
						cad_3d+='goto '+linicio+'\n';
						ambito.pop();
						break;
					case Constante._count:
						ambito.push(sent.nombre+i);
						cad_3d+='//inicio count'+'\n';
						linicio=genera_Etq();
						var lv=genera_Etq();
						var lf=genera_Etq();
						cad_3d+='//obtener valor de expresion\n';
						//obtener valor de exp
						var count=evaluarExp(sent.hijos[0]);
						var cont=genera_Temp();//variable que lleva contro el ciclo que se esta ejecutando
						cad_3d+=cont+'=0;\n';
						//verificar si la variable de -control es menor a la cantidad que indica la exresion
						cad_3d+='//verificar si se debe ejecutar count\n';
						cad_3d+=linicio+':\n';
						cad_3d+='if ('+cont+'<'+count.temp+') goto '+lv+';\n';
						cad_3d+='goto '+lf+';\n';
						cad_3d+='//ejecutar cuerpo count\n';
						cad_3d+=lv+':\n';
						ejecutar_Sent(sent.hijos[1]);
						//aumentar cont
						cad_3d+='//aumentar cont\n';
						cad_3d+=cont+'='+cont+'+1\n';
						cad_3d+='goto '+linicio+'\n';
						cad_3d+=lf+':\n';
						ambito.pop();
						break;
		}
	}
}

function decVar(sent) {
	cad_3d+='//declaracion de variable(s): ';
	cad_3d+=sent.hijos[0].hijos.join()+'\n';
	//hijo 0 tiene lidp
	//TODO: buscar variable en  tabla de simbolos
	//hijo 1 tiene expresion
	cad_3d+='//evaluar expresion\n';
	var res=evaluarExp(sent.hijos[1]);
}
function asigVar(sent) {
	cad_3d+='//asignacion de variable: ';
	cad_3d+=sent.hijos[0].hijos.join()+'\n';
	//hijo 0 tiene lidp
	//hijo 1 tiene expresion
	cad_3d+='//evaluar expresion\n';
	res=evaluarExp(sent.hijos[1]);
}
function valTipo(tipo) {
	switch (tipo){
		case 1:
		return 'num';
		case 3:
		return 'bool';
		case 7:
		return 'str';
		case 11:
		return 'void';
		case -100:
		return 'error';
	}
	return '';
}
function cadTipo(tipo) {
	switch (tipo) {
		case 'num':
			return 1;
		case 'bool':
			return 3;
		case 'str':
			return 7;
		case 'void':
			return 11;
		case 'error':
			return -100;
		default:
			return-1;
	}

}
function evaluarExp(exp) {
	switch(exp.nombre){
		case 'valor':
		switch(exp.tipo){
			case 'num':
			var t=genera_Temp();
			var temp={tipo:1,temp:t};
			cad_3d+=t+"="+exp.valor+";\n";
			return temp;
			case 'bool':
			t=genera_Temp();
			temp={tipo:3,temp:t};
			if(exp.valor==='true'){
				cad_3d+=t+"=1;\n";
			}else{
				cad_3d+=t+"=0;\n";
			}
			return temp;
		}
		break;
		case 'lidp':
		//TODO: buscar variable dentro de tabla de simbolos
		//verificar si el primer hijo de lidp es un llamado a funcion
		if(exp.hijos[0].nombre===Constante.llamado){

		}else{
			//es una lista de atributos
			return primera=buscarVariable(exp.hijos[0]);
		}
		break;
		case '+':
		var t1=evaluarExp(exp.hijos[0]);
		var t2=evaluarExp(exp.hijos[1]);
		return suma(t1,t2);
		case '*':
		t1=evaluarExp(exp.hijos[0]);
		t2=evaluarExp(exp.hijos[1]);
		return mult(t1,t2);
		case '/':
		t1=evaluarExp(exp.hijos[0]);
		t2=evaluarExp(exp.hijos[1]);
		return div(t1,t2);
		case '%':
		t1=evaluarExp(exp.hijos[0]);
		t2=evaluarExp(exp.hijos[1]);
		return modulo(t1,t2);
		case '^':
		t1=evaluarExp(exp.hijos[0]);
		t2=evaluarExp(exp.hijos[1]);
		return potencia(t1,t2);
		case '-':
		if(exp.hijos.length === 1){
			t=genera_Temp();
			//es operacion unaria
			t1=evaluarExp(exp.hijos[0]);
			//verificar si es tipo str
			if(t1.tipo === 7){
				//error semantico
				var error='Error semantico, no se puede realizar resta unaria de tipo STR.';
				return insertarError(error);
			}else{
				cad_3d+=t+"=-"+t1.temp+";\n";
				temp={tipo:t1.tipo,temp:t};
				return temp;
			}
		}else{
			//obtener temporales de operandos
			t1=evaluarExp(exp.hijos[0]);
			t2=evaluarExp(exp.hijos[1]);
			return resta(t1,t2);
		}
		break;
		case '==':
			t1=evaluarExp(exp.hijos[0]);
			t2=evaluarExp(exp.hijos[1]);
			return igualacion(t1,t2);
		case '!=':
			t1=evaluarExp(exp.hijos[0]);
			t2=evaluarExp(exp.hijos[1]);
			return diferencia(t1,t2);
		case '>':
			t1=evaluarExp(exp.hijos[0]);
			t2=evaluarExp(exp.hijos[1]);
			return mayor(t1,t2);
		case '<':
			t1=evaluarExp(exp.hijos[0]);
			t2=evaluarExp(exp.hijos[1]);
			return menor(t1,t2);
		case '>=':
			t1=evaluarExp(exp.hijos[0]);
			t2=evaluarExp(exp.hijos[1]);
			return mayorigual(t1,t2);
		case '<=':
			t1=evaluarExp(exp.hijos[0]);
			t2=evaluarExp(exp.hijos[1]);
			return menorigual(t1,t2);
		case '&&':
			return and(exp);
		case '||':
			return or(exp);
		case '!':
			return not(exp.hijos[0]);
		case '&?':
			var a=and(exp);
			//se intercambian etiquetas de expresion evaluada
			var lv=a.lf;
			a.lf=a.lv;
			a.lv=lv;
			return a;
		case '|?':
			var o=or(exp);
			//se intercambian etiquetas de expresion evaluada
			lv=o.lf;
			o.lf=o.lv;
			o.lv=lv;
			return o;
		case '|&':
			return xor(exp);
	}
	return exp;
}

function acceso(id) {
	//se busca id TablaSimbolos
	var variable=buscarVariable(id);
}
