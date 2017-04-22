var cont_temp=0;
var cont_etq=0;
var cad_3d="";
function genera_Temp() {
	cont_temp++;
	return "t"+cont_temp;
}
function genera_Etq() {
	cont_etq++;
	return "L"+cont_etq;
}
function recorrido(result) {
	//limpiar cad_3d y temporales
	cad_3d="";
	cont_temp=0;
	cont_etq=0;
	//tabla de simbolos
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
		console.log(sent);
		switch(sent.nombre){
		case 'dec':
		//hijo 0 tiene lidp
		//hijo 1 tiene expresion
		var res=evaluarExp(sent.hijos[1]);
		break;
		case 'asig':
		//hijo 0 tiene lidp
		//hijo 1 tiene expresion
		var res=evaluarExp(sent.hijos[1]);
		break;
		}
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
		case '/':
		case '%':
		case '^':
		//obtener temporales de operandos
		var t1=evaluarExp(exp.hijos[0]);
		var t2=evaluarExp(exp.hijos[1]);
		var t=genera_Temp();
		var temp={tipo:exp.tipo,temp:t};
		cad_3d+=t+"="+t1.temp+exp.nombre+t2.temp+";\n";
		return temp;
		case '-':
		var t=genera_Temp();
		if(exp.hijos.length === 1){
			//es operacion unaria
			var t1=evaluarExp(exp.hijos[0]);
			cad_3d+=t+"=-"+t1.temp+";\n";
		}else{
			//obtener temporales de operandos
		var t1=evaluarExp(exp.hijos[0]);
		var t2=evaluarExp(exp.hijos[1]);		
		cad_3d+=t+"="+t1.temp+exp.nombre+t2+";\n";
		}
		var temp={tipo:exp.tipo,temp:t};
		return temp;
	}
}