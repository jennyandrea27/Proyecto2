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
	Errores=[];
	//agregar ambito global
	var global=crearAmbito('global',0,'','');
	insertarAmbito(global);
	crearTablaSimbolos(result);
	var ts=TS_HTML();
	localStorage['ts']=ts;
	//generar funciones por DEFECTO
	crearFuncionesDefecto();
	//recorrer hijos de basic
	recorrerBasic(result);
	//imprimir codigo 3D generado
	console.log(cad_3d);
}
function buscar_principal(result) {
	for (var i = 0; i <= result.hijos.length; i++) {
		if(result.hijos[i].nombre==='principal'){
			return result.hijos[i];
		}
	}
}
function recorrerBasic(raiz) {
	for(var i=0;i<raiz.hijos.length;i++){
		var sent=raiz.hijos[i];
		switch (sent.nombre) {
			case Constante.principal:
				cad_3d+='\nDECLARACION DE PRINCIPAL\n';
				cad_3d+='void principal(){\n';
				//agregar principal a ambito
				ambito.push('principal');
				//recorrer cuerpo de principal
				ejecutar_Sent(sent.hijos[0]);
				cad_3d+='}\n';
				ambito.pop();
				break;
			case Constante.decfun:
				cad_3d+='\nDECLARACION DE FUNCION\n';
				//recorrer parametros para formar el nombre de la funcion
				var fun=buscarAmbito(TablaSimbolos[0],'global$'+sent.valor);
				cad_3d+='void'+sent.valor+'(){\n';
				//agregar funcion a ambito
				ambito.push(sent.valor);
				//recorrer cuerpo de funcion
				ejecutar_Sent(sent.hijos[1]);
				cad_3d+='}\n';
				ambito.pop();
				break;
			case Constante.dec:
				decVar(sent);
				break;
			case Constante.element:
				initElement('global',sent);
				break;
			default:

		}
	}
}
function initElement(cad_ambito,element) {
	//recorrer cuerpo buscando si tiene mas declaraciones de element en su cuerpo
	ambito.push(element.valor);
	var cuerpo=element.hijos[0];
	for(var i=0;i<cuerpo.hijos.length;i++){
		if(cuerpo.hijos[i].nombre===Constante.element){
			initElement(cad_ambito+'$'+element.valor,cuerpo.hijos[i]);
		}
	}
	//encabezado de metodo init
	cad_3d+='void init$'+cad_ambito+'$'+element.valor+'(){\n';
	//buscar elemento en la tabal de simbolos
	var elemento_ts=buscarAmbito(TablaSimbolos[0],cad_ambito+'$'+element.valor);
	//tomar posicion actual del heap
	var pos=genera_Temp();
	cad_3d+='//reserva espacio en heap para '+elemento_ts.nombre+'\n';
	cad_3d+=pos+' = h ;\n';
	cad_3d+='h = h + '+elemento_ts.variables.length+';\n';
	for(var j=0;j<cuerpo.hijos.length;j++){
		//volver a recorrer cuerpo para buscar declaraciones
		if(cuerpo.hijos[j].nombre===Constante.dec){
			var dec=cuerpo.hijos[j];
			cad_3d+='//evaluar expresion\n';
			var res=evaluarExp(dec.hijos[1]);
			//hijo 0 tiene lista de variables a declarar lidp
			var lidc=dec.hijos[0];
			for(var l=0;l<lidc.hijos.length;l++){
				var nomb_var=lidc.hijos[l].hijos[0];//nombre de la variable a declarar
				var variable=buscarVarAmbitoTS(elemento_ts,nomb_var);
				cad_3d+='//asignar valor inicial a '+nomb_var+'\n';
				var pos_var=genera_Temp();
				cad_3d+=pos_var+' = '+pos+' + '+variable.pos+';\n';
				cad_3d+='heap[ '+pos_var+' ] = '+res.temp+';\n';
			}
		}
	}
	ambito.pop();
	//guardar apuntador al elemento_ts
	var puntero=genera_Temp();
	cad_3d+=puntero+' = p + 0;\n';
	cad_3d+='stack[ '+puntero+' ] ='+pos+';\n';
	cad_3d+='}\n';
}
function buscarVarAmbitoTS(ambito,nombre) {
	for(var i = 0;i<ambito.variables.length;i++){
		if(ambito.variables[i].nombre===nombre){
			return ambito.variables[i];
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
			cad_3d+='//INICIO IF\n';
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
				ambito.pop();
				if(sent.hijos.length===3){
					ambito.push('else'+i);
					ejecutar_Sent(sent.hijos[2]);
					ambito.pop();
				}
				cad_3d+=lsalto+':\n';
			}else{
				var error='Error semantico, evaluar condicion de tipo '+valTipo();
				insertarError(error);
			}
			break;
		case Constante._while:
		ambito.push(sent.nombre+i);
			cad_3d+='//INICIO WHILE\n';
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
				cad_3d+='//INICIO DOWHILE\n';
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
				ambito.pop();
				break;
				case Constante._repeat:
					ambito.push(sent.nombre+i);
					cad_3d+='//INICIO REPEAT\n';
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
					cad_3d+='//INICIO FOR\n';
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
						cad_3d+='//INICIO LOOP '+sent.valor+'\n';
						linicio=genera_Etq();
						cad_3d+=linicio+':\n';
						cad_3d+='//ejecuetar sentencias loop\n';
						ejecutar_Sent(sent.hijos[0]);
						cad_3d+='goto '+linicio+'\n';
						ambito.pop();
						break;
					case Constante._count:
						ambito.push(sent.nombre+i);
						cad_3d+='//INICIO COUNT'+'\n';
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
	cad_3d+='//DECLARACION DE VARIABLES(s): \n';
	//hijo 1 tiene expresion
	cad_3d+='//evaluar expresion\n';
	var res=evaluarExp(sent.hijos[1]);
	cad_3d+='//asignar valor a variable\n';
	var lidc=sent.hijos[0];
	for(var i=0;i<lidc.hijos.length;i++){
		cad_3d+='//variable '+lidc.hijos[i].hijos[0]+'\n';
		//hijo 0 tiene lidp
		var variable=accesoId(lidc.hijos[i]);
		//verificar si variable es global
		if(variable.ambito==='global'){
			//se accede en heap
			cad_3d+='heap[ '+variable.temp_ref+' ] = '+res.temp+';\n';
		}else{
			//se accede en stack
			cad_3d+='stack[ '+variable.temp_ref+' ] = '+res.temp+';\n';
		}
	}
}
function asigVar(sent) {
	cad_3d+='//ASIGNACION DE VARIABLE: ';
	cad_3d+=sent.hijos[0].hijos.join()+'\n';
	//hijo 0 tiene lidp
	var variable=accesoId(sent.hijos[0]);
	//hijo 1 tiene expresion
	cad_3d+='//evaluar expresion\n';
	res=evaluarExp(sent.hijos[1]);
	cad_3d+='//asignar valor a variable\n';
	if(sent.hijos[0].hijos.length>1){
		//fue un acceso a lidp se accede en heap
		cad_3d+='heap[ '+variable.temp_ref+' ] = '+res.temp+';\n';
	}else{
		//verificar si variable es global
		if(variable.ambito==='global'){
			//se accede en heap
			cad_3d+='heap[ '+variable.temp_ref+' ] = '+res.temp+';\n';
		}else{
			//se accede en stack
			cad_3d+='stack[ '+variable.temp_ref+' ] = '+res.temp+';\n';
		}
	}

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
		case 15:
		return 'id';
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
		case 'id':
		  return 15;
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
				var temp={tipo:Constante.tnum,temp:t};
				cad_3d+=t+" = "+exp.valor+";\n";
				return temp;
			case 'bool':
				t=genera_Temp();
				temp={tipo:Constante.tbool,temp:t};
				if(exp.valor==='true'){
					cad_3d+=t+" = 1;\n";
				}else{
					cad_3d+=t+" = 0;\n";
				}
			return temp;
			case 'str':
				t=genera_Temp();
				temp={tipo:Constante.tstr,temp:t};
				cad_3d+='//obtener posicion disponible en heap\n';
				cad_3d+=t+' = h;\n';
				cad_3d+='h = h + 1;\n';
				cad_3d+='heap[ '+t+' ] = s;\n';
				//se recorre valor de expresion para almacenar cadena en string pool
				cad_3d+='//almacenar cadena en string pool '+exp.valor+'\n';
				for(var i=0;i<exp.valor.length;i++){
					cad_3d+='//ascci de '+exp.valor[i]+'\n';
					cad_3d+='pool[ s ] = '+exp.valor.charCodeAt(i)+';\n';
					cad_3d+='s = s + 1;\n';
				}
				cad_3d+='//ascci de fin de cadena\n';
				cad_3d+='pool[ s ] = 0;\n';
				cad_3d+='s = s + 1;\n';
				return temp;
		}
		break;
		case Constante._null:
			t=genera_Temp();
			temp={tipo:1,temp:t};
			cad_3d+=t+" = "+Constante.tnull+";\n";
			return temp;
		case 'lidp':
		return accesoId(exp);
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

function accesoId(exp) {
	//verificar si el primer hijo de lidp es un llamado a funcion
	if(exp.hijos[0].nombre===Constante.llamado){
		//TODO: accesoId cuando el primero es un llamado
	}else{
		//es una lista de atributos
		//buscar primer variable
		var primera= buscarVariable(exp.hijos[0]);
		if(exp.hijos.length>1){
			//tiene mas hijos id.id.id
			var cont =1;
			var continuar=true;
			var amb_ele='global';
			var atr=null;
			var elemento;
			while(cont<exp.hijos.length && continuar){
				if(primera.tipo===Constante.tid){
					elemento=buscarAmbito(TablaSimbolos[0],amb_ele+'$'+primera.tipo_ele);
					if(elemento!==null){
						atr=buscarAtributo(elemento,exp.hijos[cont]);
						if(atr!==null){
							var temp_pos=genera_Temp();
							var temp_val=genera_Temp();
							cad_3d+='//posicion de '+exp.hijos[cont]+'\n';
							cad_3d+=temp_pos+' = '+primera.temp+' + '+atr.pos+' ;\n';
							cad_3d+='//valor de '+exp.hijos[cont]+'\n';
							cad_3d+=temp_val+' = heap[ '+temp_pos+' ];\n';
							cont=cont+1;
							amb_ele+='$'+primera.tipo_ele;
							primera={tipo:atr.tipo,temp:temp_val,temp_ref:temp_pos,tipo_ele:atr.tipo_ele};
						}else{
							continuar=false;
							var error='Error semantico, elemento '+primera.tipo_ele+' no tiene atributo '+exp.hijos[cont]+'.';
							insertarError(error);
						}
					}else{
						continuar=false;
						var error='Error semantico, elemento '+primera.tipo_ele+' no ha sido declarado.';
						insertarError(error);
					}
				}else{
					continuar=false;
					var error='Error semantico, la variable '+exp.hijos[cont-1]+' no es de tipo elemento.';
					insertarError(error);
				}
			}
			return primera;
		}else{
			return primera;
		}
	}
}
