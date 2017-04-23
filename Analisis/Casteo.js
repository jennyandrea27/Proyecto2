
function suma(op1,op2) {
	var t=genera_Temp();
	var temp={tipo:1,temp:t};
	switch(op1.tipo+op2.tipo){
		case 2://num con num		
		case 4: //num con bool
		case 6: // bool con bool
		cad_3d+=t+"="+op1.temp+'+'+op2.temp+";\n";
		return temp;		
		case 8://str con num
		case 10://bool con str
		case 14://str con str
		//concatenacion
		break;
	}
}
function resta(op1,op2) {
	var t=genera_Temp();
	var temp={tipo:1,temp:t};
	//verificar cuantos hijos tiene
	switch(op1.tipo+op2.tipo){
		case 2://num con num		
		case 4: //num con bool
		cad_3d+=t+"="+op1.temp+'-'+op2.temp+";\n";
		return temp;
		case 8://str con num
		case 10://bool con str
		case 14://str con str		
		default:
		//error
		var tipo1=valTipo(op1.tipo);
		var tipo2=valTipo(op2.tipo);
		var error='Error semantico, no se puede realizar resta entre tipo '+tipo1+' y '+tipo2;
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
		cad_3d+=t+"="+op1.temp+'*'+op2.temp+";\n";
		return temp;	
		case 8://str con num
		case 10://bool con str
		case 14://str con str
		default:
		//error
		var tipo1=valTipo(op1.tipo);
		var tipo2=valTipo(op2.tipo);
		var error='Error semantico, no se puede realizar multiplicacion entre tipo '+tipo1+' y '+tipo2;
		return insertarError(error);			
	}
}
function div(op1,op2) {
	var t=genera_Temp();
	var temp={tipo:1,temp:t};
	switch(op1.tipo+op2.tipo){
		case 2://num con num		
		case 4: //num con bool
		cad_3d+=t+"="+op1.temp+'/'+op2.temp+";\n";
		return temp;
		case 6: // bool con bool
		case 8://str con num
		case 10://bool con str
		case 14://str con str
		default:
		//error
		var tipo1=valTipo(op1.tipo);
		var tipo2=valTipo(op2.tipo);
		var error='Error semantico, no se puede realizar division entre tipo '+tipo1+' y '+tipo2;
		return insertarError(error);
	}
}
function modulo(op1,op2) {
	var t=genera_Temp();
	var temp={tipo:1,temp:t};
	switch(op1.tipo+op2.tipo){
		case 2://num con num		
		case 4: //num con bool
		cad_3d+=t+"="+op1.temp+'%'+op2.temp+";\n";
		return temp;		
		case 6: // bool con bool
		case 8://str con num
		case 10://bool con str
		case 14://str con str
		default:
		//error
		var tipo1=valTipo(op1.tipo);
		var tipo2=valTipo(op2.tipo);
		var error='Error semantico, no se puede realizar resta modulo tipo '+tipo1+' y '+tipo2;
		return insertarError(error);		
	}
}
function potencia(op1,op2) {
	var t=genera_Temp();
	var temp={tipo:1,temp:t};
	switch(op1.tipo+op2.tipo){
		case 2://num con num		
		case 4: //num con bool
		cad_3d+=t+"="+op1.temp+'^'+op2.temp+";\n";
		return temp;		
		case 6: // bool con bool
		case 8://str con num
		case 10://bool con str
		case 14://str con str
		default:
		//error
		var tipo1=valTipo(op1.tipo);
		var tipo2=valTipo(op2.tipo);
		var error='Error semantico, no se puede realizar potencia entre tipo '+tipo1+' y '+tipo2;
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
		cad_3d+='if ('+op1.temp+' == '+op2.temp+') goto '+lv+';\n';
		cad_3d+='goto '+lf+';\n';
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
		var error='Error semantico, no se puede realizar igualacion entre tipo '+tipo1+' y '+tipo2;
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
		cad_3d+='if ('+op1.temp+' != '+op2.temp+') goto '+lv+';\n';
		cad_3d+='goto '+lf+';\n';
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
		var error='Error semantico, no se puede realizar igualacion entre tipo '+tipo1+' y '+tipo2;
		return insertarError(error);		
	}
}
function mayor(op1,op2) {
	var lv=genera_Etq();
	var lf=genera_Etq();
	var temp={tipo:3,lv:[lv],lf:[lf]};
	switch(op1.tipo+op2.tipo){
		case 2://num con num		
		cad_3d+='if ('+op1.temp+' > '+op2.temp+') goto '+lv+';\n';
		cad_3d+='goto '+lf+';\n';
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
		var error='Error semantico, no se puede realizar igualacion entre tipo '+tipo1+' y '+tipo2;
		return insertarError(error);		
	}
}
function menor(op1,op2) {
	var lv=genera_Etq();
	var lf=genera_Etq();
	var temp={tipo:3,lv:[lv],lf:[lf]};
	switch(op1.tipo+op2.tipo){
		case 2://num con num		
		cad_3d+='if ('+op1.temp+' < '+op2.temp+') goto '+lv+';\n';
		cad_3d+='goto '+lf+';\n';
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
		var error='Error semantico, no se puede realizar igualacion entre tipo '+tipo1+' y '+tipo2;
		return insertarError(error);		
	}
}
function mayorigual(op1,op2) {
	var lv=genera_Etq();
	var lf=genera_Etq();
	var temp={tipo:3,lv:[lv],lf:[lf]};
	switch(op1.tipo+op2.tipo){
		case 2://num con num		
		cad_3d+='if ('+op1.temp+' >= '+op2.temp+') goto '+lv+';\n';
		cad_3d+='goto '+lf+';\n';
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
		var error='Error semantico, no se puede realizar igualacion entre tipo '+tipo1+' y '+tipo2;
		return insertarError(error);		
	}
}
function menorigual(op1,op2) {
	var lv=genera_Etq();
	var lf=genera_Etq();
	var temp={tipo:3,lv:[lv],lf:[lf]};
	switch(op1.tipo+op2.tipo){
		case 2://num con num		
		cad_3d+='if ('+op1.temp+' <= '+op2.temp+') goto '+lv+';\n';
		cad_3d+='goto '+lf+';\n';
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
		var error='Error semantico, no se puede realizar igualacion entre tipo '+tipo1+' y '+tipo2;
		return insertarError(error);		
	}
}