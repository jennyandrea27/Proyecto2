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
	//buscar principal
	var principal=buscar_principal(result);
	//verificar si se declaro metodo principal
	if(principal !== null){
		console.log("principal");
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
		cad_3d+='//declaracion de variable(s): ';
		cad_3d+=sent.hijos[0].hijos.join()+'\n';
		//hijo 0 tiene lidp

		//hijo 1 tiene expresion
		cad_3d+='//evaluar expresion\n';
		var res=evaluarExp(sent.hijos[1]);
		console.log(res);
		break;
		case 'asig':
		cad_3d+='//asignacion de variable: ';
		cad_3d+=sent.hijos[0].hijos.join()+'\n';
		//hijo 0 tiene lidp
		//hijo 1 tiene expresion
		cad_3d+='//evaluar expresion\n';
		var res=evaluarExp(sent.hijos[1]);
		console.log(res);
		break;
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
		return 'void'
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
			var t=genera_Temp();
			var temp={tipo:3,temp:t};
			if(exp.valor==='true'){
				cad_3d+=t+"=1;\n";
			}else{
				cad_3d+=t+"=0;\n";
			}
			return temp;

		}
		case 'lidp':
		//acceder a id en tabla de simbolos
		break;
		case '+':
		var t1=evaluarExp(exp.hijos[0]);
		var t2=evaluarExp(exp.hijos[1]);
		return suma(t1,t2);
		case '*':
		var t1=evaluarExp(exp.hijos[0]);
		var t2=evaluarExp(exp.hijos[1]);
		return mult(t1,t2);
		case '/':
		var t1=evaluarExp(exp.hijos[0]);
		var t2=evaluarExp(exp.hijos[1]);
		return div(t1,t2);
		case '%':
		var t1=evaluarExp(exp.hijos[0]);
		var t2=evaluarExp(exp.hijos[1]);
		return modulo(t1,t2);
		case '^':
		var t1=evaluarExp(exp.hijos[0]);
		var t2=evaluarExp(exp.hijos[1]);
		return potencia(t1,t2);
		case '-':
		if(exp.hijos.length === 1){
			var t=genera_Temp();
			//es operacion unaria
			var t1=evaluarExp(exp.hijos[0]);
			//verificar si es tipo str
			if(t1.tipo === 7){
				//error semantico
				var error='Error semantico, no se puede realizar resta unaria de tipo STR.';
				return insertarError(error);
			}else{
				cad_3d+=t+"=-"+t1.temp+";\n";
				var temp={tipo:t1.tipo,temp:t};
				return temp;
			}
		}else{
			//obtener temporales de operandos
			var t1=evaluarExp(exp.hijos[0]);
			var t2=evaluarExp(exp.hijos[1]);
			return resta(t1,t2);
		}
		case '==':
			var t1=evaluarExp(exp.hijos[0]);
			var t2=evaluarExp(exp.hijos[1]);
			return igualacion(t1,t2);
		case '!=':
			var t1=evaluarExp(exp.hijos[0]);
			var t2=evaluarExp(exp.hijos[1]);
			return diferencia(t1,t2);
		case '>':
			var t1=evaluarExp(exp.hijos[0]);
			var t2=evaluarExp(exp.hijos[1]);
			return mayor(t1,t2);
		case '<':
			var t1=evaluarExp(exp.hijos[0]);
			var t2=evaluarExp(exp.hijos[1]);
			return menor(t1,t2);
		case '>=':
			var t1=evaluarExp(exp.hijos[0]);
			var t2=evaluarExp(exp.hijos[1]);
			return mayorigual(t1,t2);
		case '<=':
			var t1=evaluarExp(exp.hijos[0]);
			var t2=evaluarExp(exp.hijos[1]);
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
			var lv=o.lf;
			o.lf=o.lv;
			o.lv=lv;
			return o;
		case '|&':
			return xor(exp);
	}
	return exp;
}
