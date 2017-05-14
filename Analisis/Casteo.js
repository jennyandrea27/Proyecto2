
function suma(op1,op2) {
	var t;
	var temp;
	switch(op1.tipo+op2.tipo){
		case 2://num con num
		case 4: //num con bool
		case 6: // bool con bool
		t=genera_Temp();
		temp={tipo:Constante.tnum,temp:t};
		cad_3d+=t+" = "+op1.temp+' + '+op2.temp+" ;\n";
		return temp;
		case 8://str con num
			if(op1.tipo===Constante.tnum){
				//convertir num a cadena
				op1=llamadoNumToStr(op1);
			}else{
				op2=llamadoNumToStr(op2);
			}
			//concatenacion
			temp=llamadoConcatenacion(op1,op2);
			return temp;
		case 10://bool con str
			if(op1.tipo===Constante.tbool){
				if(! op1.hasOwnProperty("lv")){//no viene de expresion
					var op_bool1=cadenaBool(op1);
					temp=llamadoConcatenacion(op_bool1,op2);
					return temp;
				}else{
					var tipo1=valTipo(op1.tipo);
					var tipo2=valTipo(op2.tipo);
					var error={desc:'Error semantico, no se puede realizar suma entre tipo '+tipo1+' y '+tipo2+' valor de bool debe ser true o false.',fila:1,col:1};
					return insertarError(error);
				}
			}else{
				var op_bool2=cadenaBool(op2);
				temp=llamadoConcatenacion(op1,op_bool2);
				return temp;
			}
			break;
		case 14://str con str
			//concatenacion
			temp=llamadoConcatenacion(op1,op2);
			return temp;
		default:
			var tipod=valTipo(op1.tipo);
			var tipod1=valTipo(op2.tipo);
			var errord={desc:'Error semantico, no se puede realizar suma entre tipo '+tipod+' y '+tipod1,fila:1,col:1};
			return insertarError(errord);
	}
}
function cadenaBool(op) {
	//verificar si el valor es 1 o 0, verdadero o falso
	var pos=genera_Temp();
	cad_3d+='//obtener posicion disponible en heap\n';
	cad_3d+=pos +' = h ;\n';
	cad_3d+='h = h + 1 ;\n';
	cad_3d+='heap [ '+pos+' ] = s ;\n';
	var lv=genera_Etq();
	var lf=genera_Etq();
	cad_3d+='if( '+op.temp+' == 1 )goto '+lv+' ;\n';
	cad_3d+='goto '+lf+' ;\n';
	//cadena true
	cad_3d+=lv+' :\n';
	cad_3d+='//almacenar cadena en string pool true\n';
	cad_3d+='//ascci de t\n';
	cad_3d+='pool [ s ] = 116 ;\n';
	cad_3d+='s = s + 1 ;\n';
	cad_3d+='//ascci de r\n';
	cad_3d+='pool [ s ] = 114 ;\n';
	cad_3d+='s = s + 1 ;\n';
	cad_3d+='//ascci de u\n';
	cad_3d+='pool [ s ] = 117 ;\n';
	cad_3d+='s = s + 1 ;\n';
	cad_3d+='//ascci de e\n';
	cad_3d+='pool [ s ] = 101 ;\n';
	cad_3d+='s = s + 1 ;\n';
	cad_3d+='//ascci de fin de cadena\n';
	cad_3d+='pool [ s ] = 0 ;\n';
	cad_3d+='s = s + 1 ;\n';
	var lsalto=genera_Etq();
	cad_3d+='goto '+lsalto+' ;\n';
	//cadena false
	cad_3d+=lf+' :\n';
	cad_3d+='//ascci de f\n';
	cad_3d+='pool [ s ] = 102 ;\n';
	cad_3d+='s = s + 1 ;\n';
	cad_3d+='//ascci de a\n';
	cad_3d+='pool [ s ] = 97 ;\n';
	cad_3d+='s = s + 1 ;\n';
	cad_3d+='//ascci de l\n';
	cad_3d+='pool [ s ] = 108 ;\n';
	cad_3d+='s = s + 1 ;\n';
	cad_3d+='//ascci de s\n';
	cad_3d+='pool [ s ] = 115 ;\n';
	cad_3d+='s = s + 1 ;\n';
	cad_3d+='//ascci de e\n';
	cad_3d+='pool [ s ] = 101 ;\n';
	cad_3d+='s = s + 1 ;\n';
	cad_3d+='//ascci de fin de cadena\n';
	cad_3d+='pool [ s ] = 0 ;\n';
	cad_3d+='s = s + 1 ;\n';
	cad_3d+=lsalto+' :\n';
	//retornar temporal
	var temp={tipo:Constante.tstr,temp:pos};
	return temp;
}
function llamadoConcatenacion(op1,op2) {
	//llamado a $$_concatenacion();
	cad_3d+='//llamdo a $$_concatenacion ;\n';
	var amb_actual=buscarAmbito(TablaSimbolos[0],getAmbito());
	cad_3d+='//cambio de ambito simulado\n';
	var pos_simulado=genera_Temp();
	cad_3d+=pos_simulado+' = p + '+amb_actual.variables.length+' ;\n';
	cad_3d+='//dar valor a parametros\n';
	var pos_p=genera_Temp();
	cad_3d+=pos_p+' = '+pos_simulado+' + 1 ;\n';
	cad_3d+='stack [ '+pos_p+' ] = '+op1.temp+' ;\n';
	pos_p=genera_Temp();
	cad_3d+=pos_p+' = '+pos_simulado+' + 2 ;\n';
	cad_3d+='stack [ '+pos_p+' ] = '+op2.temp+' ;\n';
	cad_3d+='//cambio de ambito\n';
	cad_3d+='p = p + '+amb_actual.variables.length+' ;\n';
	cad_3d+='$$_concatenacion()  ;\n';
	cad_3d+='//obtener valor de retorno\n';
	var pos_r=genera_Temp();
	var val_r=genera_Temp();
	cad_3d+=pos_r+' = p + 0 ;\n';
	cad_3d+=val_r+' = stack [ '+pos_r+' ] ;\n';
	cad_3d+='//cambio de ambito\n';
	cad_3d+='p = p - '+amb_actual.variables.length+' ;\n';
	var temp={tipo:Constante.tstr,temp:val_r};
	return temp;
}
function llamadoNumToStr(op1) {
//llamado a $$_numToStr();
cad_3d+='//llamdo a $$_numToStr ;\n';
var amb_actual=buscarAmbito(TablaSimbolos[0],getAmbito());
cad_3d+='//cambio de ambito simulado\n';
var pos_simulado=genera_Temp();
cad_3d+=pos_simulado+' = p + '+amb_actual.variables.length+' ;\n';
cad_3d+='//dar valor a parametros\n';
var pos_p=genera_Temp();
cad_3d+=pos_p+' = '+pos_simulado+' + 1 ;\n';
cad_3d+='stack [ '+pos_p+' ] = '+op1.temp+' ;\n';
cad_3d+='//cambio de ambito\n';
cad_3d+='p = p + '+amb_actual.variables.length+' ;\n';
cad_3d+='$$_numToStr()  ;\n';
cad_3d+='//obtener valor de retorno\n';
var pos_r=genera_Temp();
var val_r=genera_Temp();
cad_3d+=pos_r+' = p + 0 ;\n';
cad_3d+=val_r+' = stack [ '+pos_r+' ] ;\n';
cad_3d+='//cambio de ambito\n';
cad_3d+='p = p - '+amb_actual.variables.length+' ;\n';
var temp={tipo:Constante.tstr,temp:val_r};
return temp;
}
function resta(op1,op2) {
	var t=genera_Temp();
	var temp={tipo:1,temp:t};
	//verificar cuantos hijos tiene
	switch(op1.tipo+op2.tipo){
		case 2://num con num
		case 4: //num con bool
		cad_3d+=t+" = "+op1.temp+' - '+op2.temp+" ;\n";
		return temp;
		default:
		//case 8:str con num
		//case 10:bool con str
		//case 14:str con str
		//error
		var tipo1=valTipo(op1.tipo);
		var tipo2=valTipo(op2.tipo);
		var error={desc:'Error semantico, no se puede realizar resta entre tipo '+tipo1+' y '+tipo2,fila:1,col:1};
		return insertarError(error);
	}
}
function mult(op1,op2) {
	var t=genera_Temp();
	var temp={tipo:1,temp:t};
	switch(op1.tipo+op2.tipo){
		case 2://num con num
		case 4: //num con bool
		case 6: // bool con bool
		cad_3d+=t+" = "+op1.temp+' * '+op2.temp+" ;\n";
		return temp;
		case 8://str con num
		case 10://bool con str
		case 14://str con str
		default:
		//error
		var tipo1=valTipo(op1.tipo);
		var tipo2=valTipo(op2.tipo);
		var error={desc:'Error semantico, no se puede realizar multiplicacion entre tipo '+tipo1+' y '+tipo2,fila:1,col:1};
		return insertarError(error);
	}
}
function div(op1,op2) {
	var t=genera_Temp();
	var temp={tipo:1,temp:t};
	switch(op1.tipo+op2.tipo){
		case 2://num con num
		case 4: //num con bool
		cad_3d+=t+" = "+op1.temp+' / '+op2.temp+" ;\n";
		return temp;
		case 6: // bool con bool
		case 8://str con num
		case 10://bool con str
		case 14://str con str
		default:
		//error
		var tipo1=valTipo(op1.tipo);
		var tipo2=valTipo(op2.tipo);
		var error={desc:'Error semantico, no se puede realizar division entre tipo '+tipo1+' y '+tipo2,fila:1,col:1};
		return insertarError(error);
	}
}
function modulo(op1,op2) {
	var t=genera_Temp();
	var temp={tipo:1,temp:t};
	switch(op1.tipo+op2.tipo){
		case 2://num con num
		case 4: //num con bool
		cad_3d+=t+" = "+op1.temp+' % '+op2.temp+" ;\n";
		return temp;
		case 6: // bool con bool
		case 8://str con num
		case 10://bool con str
		case 14://str con str
		default:
		//error
		var tipo1=valTipo(op1.tipo);
		var tipo2=valTipo(op2.tipo);
		var error={desc:'Error semantico, no se puede realizar resta modulo tipo '+tipo1+' y '+tipo2,fila:1,col:1};
		return insertarError(error);
	}
}
function potencia(op1,op2) {
	var t=genera_Temp();
	var temp={tipo:1,temp:t};
	switch(op1.tipo+op2.tipo){
		case 2://num con num
		case 4: //num con bool
		cad_3d+=t+" = "+op1.temp+' ^ '+op2.temp+" ;\n";
		return temp;
		case 6: // bool con bool
		case 8://str con num
		case 10://bool con str
		case 14://str con str
		default:
		//error
		var tipo1=valTipo(op1.tipo);
		var tipo2=valTipo(op2.tipo);
		var error={desc:'Error semantico, no se puede realizar potencia entre tipo '+tipo1+' y '+tipo2,fila:1,col:1};
		return insertarError(error);
	}
}
function igualacion(op1,op2) {
	var lv=genera_Etq();
	var lf=genera_Etq();
	var temp={tipo:3,lv:[lv],lf:[lf]};
	switch(op1.tipo+op2.tipo){
		case 2://num con num
		case 6: // bool con bool
		cad_3d+='if( '+op1.temp+' == '+op2.temp+' )goto '+lv+' ;\n';
		cad_3d+='goto '+lf+' ;\n';
		return temp;
		case 14://str con str
		//TODO: comparacion de cadenas
		break;
		default:
		// case 4: //num con bool
		// case 8://str con num
		// case 10://bool con str
		//error
		var tipo1=valTipo(op1.tipo);
		var tipo2=valTipo(op2.tipo);
		var error={desc:'Error semantico, no se puede realizar igualacion entre tipo '+tipo1+' y '+tipo2,fila:1,col:1};
		return insertarError(error);
	}
}
function diferencia(op1,op2) {
	var lv=genera_Etq();
	var lf=genera_Etq();
	var temp={tipo:3,lv:[lv],lf:[lf]};
	switch(op1.tipo+op2.tipo){
		case 2://num con num
		case 6: // bool con bool
		cad_3d+='if( '+op1.temp+' != '+op2.temp+' )goto '+lv+' ;\n';
		cad_3d+='goto '+lf+' ;\n';
		return temp;
		case 14://str con str
		//comparacion de cadenas
		break;
		case 4: //num con bool
		case 8://str con num
		case 10://bool con str
		default:
		//error
		var tipo1=valTipo(op1.tipo);
		var tipo2=valTipo(op2.tipo);
		var error={desc:'Error semantico, no se puede realizar igualacion entre tipo '+tipo1+' y '+tipo2,fila:1,col:1};
		return insertarError(error);
	}
}
function mayor(op1,op2) {
	var lv=genera_Etq();
	var lf=genera_Etq();
	var temp={tipo:3,lv:[lv],lf:[lf]};
	switch(op1.tipo+op2.tipo){
		case 2://num con num
		cad_3d+='if( '+op1.temp+' > '+op2.temp+' )goto '+lv+' ;\n';
		cad_3d+='goto '+lf+' ;\n';
		return temp;
		case 14://str con str
		//comparacion de cadenas
		break;
		case 6: // bool con bool
		case 4: //num con bool
		case 8://str con num
		case 10://bool con str
		default:
		//error
		var tipo1=valTipo(op1.tipo);
		var tipo2=valTipo(op2.tipo);
		var error={desc:'Error semantico, no se puede realizar igualacion entre tipo '+tipo1+' y '+tipo2,fila:1,col:1};
		return insertarError(error);
	}
}
function menor(op1,op2) {
	var lv=genera_Etq();
	var lf=genera_Etq();
	var temp={tipo:3,lv:[lv],lf:[lf]};
	switch(op1.tipo+op2.tipo){
		case 2://num con num
		cad_3d+='if( '+op1.temp+' < '+op2.temp+' )goto '+lv+' ;\n';
		cad_3d+='goto '+lf+' ;\n';
		return temp;
		case 14://str con str
		//comparacion de cadenas
		break;
		default:
		// case 6: // bool con bool
		// case 4: //num con bool
		// case 8://str con num
		// case 10://bool con str
		//error
		var tipo1=valTipo(op1.tipo);
		var tipo2=valTipo(op2.tipo);
		var error={desc:'Error semantico, no se puede realizar igualacion entre tipo '+tipo1+' y '+tipo2,fila:1,col:1};
		return insertarError(error);
	}
}
function mayorigual(op1,op2) {
	var lv=genera_Etq();
	var lf=genera_Etq();
	var temp={tipo:3,lv:[lv],lf:[lf]};
	switch(op1.tipo+op2.tipo){
		case 2://num con num
		cad_3d+='if( '+op1.temp+' >= '+op2.temp+' )goto '+lv+' ;\n';
		cad_3d+='goto '+lf+' ;\n';
		return temp;
		case 14://str con str
		case 6: // bool con bool
		case 4: //num con bool
		case 8://str con num
		case 10://bool con str
		default:
		//error
		var tipo1=valTipo(op1.tipo);
		var tipo2=valTipo(op2.tipo);
		var error={desc:'Error semantico, no se puede realizar igualacion entre tipo '+tipo1+' y '+tipo2,fila:1,col:1};
		return insertarError(error);
	}
}
function menorigual(op1,op2) {
	var lv=genera_Etq();
	var lf=genera_Etq();
	var temp={tipo:3,lv:[lv],lf:[lf]};
	switch(op1.tipo+op2.tipo){
		case 2://num con num
		cad_3d+='if( '+op1.temp+' <= '+op2.temp+' )goto '+lv+' ;\n';
		cad_3d+='goto '+lf+' ;\n';
		return temp;
		case 14://str con str
		case 6: // bool con bool
		case 4: //num con bool
		case 8://str con num
		case 10://bool con str
		default:
		//error
		var tipo1=valTipo(op1.tipo);
		var tipo2=valTipo(op2.tipo);
		var error={desc:'Error semantico, no se puede realizar igualacion entre tipo '+tipo1+' y '+tipo2,fila:1,col:1};
		return insertarError(error);
	}
}
function and(exp) {
	var temp={tipo:3,lv:[],lf:[]};
	if(exp.hijos[0].nombre === 'valor'){//es un valor puntual
		if(exp.hijos[0].tipo==='bool'){//es tipo bool
		var lv1=genera_Etq();
		var lf1=genera_Etq();
			if(exp.hijos[0].valor === 'true'){//es verdadero
				//construir if
				cad_3d+='if( 1 == 1 )goto '+lv1+' ;\n';
			}else{
				cad_3d+='if( 1 == 0 )goto '+lv1+' ;\n';
			}
			cad_3d+='goto '+lf1+' ;\n';
			temp.lf.push(lf1);
		}else{
			var tipo=valTipo(exp.hijos[0].tipo);
			var error={desc:'Error semantico, no puede evaluarse and con operador tipo '+tipo,fila:1,col:1};
			return insertarError(error);
		}
	cad_3d+=lv1+' :\n';
	}else{//es una expresion
		var t1=evaluarExp(exp.hijos[0]);
		console.log(t1);
		if(t1.tipo!==3){//op2 no es tipo bool
			var tipo=valTipo(t1.tipo);
			var error={desc:'Error semantico, no puede evaluarse and con operador tipo '+tipo,fila:1,col:1};
			return insertarError(error);
		}
		cad_3d+=t1.lv.join(' :\n')+' :\n';
		temp.lf=temp.lf.concat(t1.lf);
	}
	//operando 2
	if(exp.hijos[1].nombre === 'valor'){//es un valor puntual
		if(exp.hijos[1].tipo==='bool'){//es tipo bool
		var lv2=genera_Etq();
		var lf2=genera_Etq();
			if(exp.hijos[1].valor === 'true'){//es verdadero
				//construir if
				cad_3d+='if( 1 == 1 )goto '+lv2+' ;\n';
			}else{
				cad_3d+='if( 1 == 0 )goto '+lv2+' ;\n';
			}
			cad_3d+='goto '+lf2+' ;\n';
			temp.lv.push(lv2);
			temp.lf.push(lf2);
		}else{
			var tipo=valTipo(exp.hijos[1].tipo);
			var error={desc:'Error semantico, no puede evaluarse and con operador tipo '+tipo,fila:1,col:1};
			return insertarError(error);
		}
	}else{//es una expresion
		var t2=evaluarExp(exp.hijos[1]);
		if(t2.tipo!==3){//op2 no es tipo bool
			var tipo=valTipo(t2.tipo);
			var error={desc:'Error semantico, no puede evaluarse and con operador tipo '+tipo,fila:1,col:1};
			return insertarError(error);
		}
		temp.lv=temp.lv.concat(t2.lv);
		temp.lf=temp.lf.concat(t2.lf);
	}
	return temp;
}
function or(exp) {
	var temp={tipo:3,lv:[],lf:[]};
	if(exp.hijos[0].nombre === 'valor'){//es un valor puntual
		if(exp.hijos[0].tipo==='bool'){//es tipo bool
		var lv1=genera_Etq();
		var lf1=genera_Etq();
			if(exp.hijos[0].valor === 'true'){//es verdadero
				//construir if
				cad_3d+='if( 1 == 1 )goto '+lv1+' ;\n';
			}else{
				cad_3d+='if( 1 == 0 )goto '+lv1+' ;\n';
			}
			cad_3d+='goto '+lf1+' ;\n';
			temp.lv.push(lv1);
		}else{
			var tipo=valTipo(exp.hijos[0].tipo);
			var error={desc:'Error semantico, no puede evaluarse and con operador tipo '+tipo,fila:1,col:1};
			return insertarError(error);
		}
	cad_3d+=lf1+' :\n';
	}else{//es una expresion
		var t1=evaluarExp(exp.hijos[0]);
		if(t1.tipo!==3){//op2 no es tipo bool
			var tipo=valTipo(t1.tipo);
			var error={desc:'Error semantico, no puede evaluarse and con operador tipo '+tipo,fila:1,col:1};
			return insertarError(error);
		}
		cad_3d+=t1.lf.join(' :\n')+' :\n';
		temp.lv=temp.lv.concat(t1.lv);
	}
	//operando 2
	if(exp.hijos[1].nombre === 'valor'){//es un valor puntual
		if(exp.hijos[1].tipo==='bool'){//es tipo bool
		var lv2=genera_Etq();
		var lf2=genera_Etq();
			if(exp.hijos[1].valor === 'true'){//es verdadero
				//construir if
				cad_3d+='if( 1 == 1 )goto '+lv2+' ;\n';
			}else{
				cad_3d+='if( 1 == 0 )goto '+lv2+' ;\n';
			}
			cad_3d+='goto '+lf2+' ;\n';
			temp.lv.push(lv2);
			temp.lf.push(lf2);
		}else{
			var tipo=valTipo(exp.hijos[1].tipo);
			var error={desc:'Error semantico, no puede evaluarse and con operador tipo '+tipo,fila:1,col:1};
			return insertarError(error);
		}
	}else{//es una expresion
		var t2=evaluarExp(exp.hijos[1]);
		if(t2.tipo!==3){//op2 no es tipo bool
			var tipo=valTipo(t2.tipo);
			var error={desc:'Error semantico, no puede evaluarse and con operador tipo '+tipo,fila:1,col:1};
			return insertarError(error);
		}
		temp.lv=temp.lv.concat(t2.lv);
		temp.lf=temp.lf.concat(t2.lf);
	}
	return temp;
}
function not(exp) {
	//verificar si es valor puntual
	var temp={tipo:3,lv:[],lf:[]};
	if(exp.nombre==='valor'){
		if(exp.tipo==='bool'){
			var lv1=genera_Etq();
			var lf1=genera_Etq();
			if(exp.valor === 'true'){//es verdadero se hace falso
				cad_3d+='if( 1 == 1 )goto '+lv1+' ;\n';
			}else{
				cad_3d+='if( 1 == 0 )goto '+lv1+' ;\n';
			}
			cad_3d+='goto '+lf1+' :\n';
			temp.lv.push(lf1);
			temp.lf.push(lv1);
			return temp;
		}else{
			var tipo=valTipo(exp.tipo);
			var error={desc:'Error semantico, no puede evaluarse not con operador tipo '+tipo,fila:1,col:1};
			return insertarError(error);
		}
	}else{//es una condicion que debe ser evaluada
		var op1=evaluarExp(exp);
		if(op1.tipo === 3){
			//se intercambian etiquetas
			temp.lv=op1.lf;
			temp.lf=op1.lv;
		}else{
			var tipo=valTipo(exp.tipo);
			var error={desc:'Error semantico, no puede evaluarse not con operador tipo '+tipo,fila:1,col:1};
			return insertarError(error);
		}
		return temp;
	}
}
function xor(exp) {
	var t1='';
	var t2='';
	var lcond2='';
	var lverifica='';
	if(exp.hijos[0].nombre==='valor'){
		if(exp.hijos[0].tipo==='bool'){
			var lv1=genera_Etq();
			var lf1=genera_Etq();
			if(exp.hijos[0].valor === 'true'){//es verdadero se hace falso
				cad_3d+='if( 1 == 1 )goto '+lv1+' ;\n';
			}else{
				cad_3d+='if( 1 == 0 )goto '+lv1+' ;\n';
			}
			cad_3d+='goto '+lf1+' :\n';
			cad_3d+=lv1+' :\n';
			t1=genera_Temp();
			cad_3d+=t1+'=1 ;\n';
			lcond2=genera_Etq();
			cad_3d+='goto '+lcond2+' ;\n';
			cad_3d+=lf1+' :\n';
			cad_3d+=t1+'=0 ;\n';
		}else{
			var tipo=valTipo(exp.tipo);
			var error={desc:'Error semantico, no puede evaluarse not con operador tipo '+tipo,fila:1,col:1};
			return insertarError(error);
		}
	}else{//es una condicion que debe ser evaluada
		var op1=evaluarExp(exp.hijos[0]);
		//variable que indica si el resultado de la primera expresion fue verdadero
		cad_3d+=op1.lv.join(' :\n')+' :\n';
		t1=genera_Temp();
		cad_3d+=t1+'=1 ;\n';
		lcond2=genera_Etq();
		cad_3d+='goto '+lcond2+' ;\n';
		cad_3d+=op1.lf.join(' :\n')+' :\n';
		cad_3d+=t1+'=0 ;\n';
	}
	cad_3d+=lcond2+' :\n';
	//evaluar hijo[1]
	if(exp.hijos[1].nombre==='valor'){
		if(exp.hijos[1].tipo==='bool'){
			var lv2=genera_Etq();
			var lf2=genera_Etq();
			if(exp.hijos[1].valor === 'true'){//es verdadero se hace falso
				cad_3d+='if( 1 == 1 )goto '+lv2+' ;\n';
			}else{
				cad_3d+='if( 1 == 0 )goto '+lv2+' ;\n';
			}
			cad_3d+='goto '+lf2+' :\n';
			cad_3d+=lv2+' :\n';
			t2=genera_Temp();
			cad_3d+=t2+'=1 ;\n';
			lverifica=genera_Etq();
			cad_3d+='goto '+lverifica+' ;\n';
			cad_3d+=lf2+' :\n';
			cad_3d+=t2+'=0 ;\n';
		}else{
			var tipo1=valTipo(exp.tipo);
			var error={desc:'Error semantico, no puede evaluarse not con operador tipo '+tipo1,fila:1,col:1};
			return insertarError(error);
		}
	}else{//es una condicion que debe ser evaluada
		var op2=evaluarExp(exp.hijos[1]);
		cad_3d+=op2.lv.join(' :\n')+' :\n';
		t2=genera_Temp();
		cad_3d+=t2+'=1 ;\n';
		lverifica=genera_Etq();
		cad_3d+='goto '+lverifica+' ;\n';
		cad_3d+=op2.lf.join(' :\n')+' :\n';
		cad_3d+=t2+'=0 ;\n';
	}
	cad_3d+=lverifica+' :\n';
	var lv=genera_Etq();
	var lf=genera_Etq();
	cad_3d+='if( '+t1+' != '+t2+' )goto '+lv+' ;\n';
	cad_3d+='goto '+lf+' ;\n';
	var temp={tipo:3,lv:[lv],lf:[lf]};
	return temp;
}
