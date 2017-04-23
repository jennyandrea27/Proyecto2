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
		console.log(res);
		break;
		case 'asig':
		//hijo 0 tiene lidp
		//hijo 1 tiene expresion
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
		case -100:
		return 'error';
	}
	return -1;
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
		var temp={tipo:3,lv:[],lf:[]};
		console.log(exp.hijos[0]);
			if(exp.hijos[0].nombre === 'valor'){//es un valor puntual				
				if(exp.hijos[0].tipo==='bool'){//es tipo bool
				var lv1=genera_Etq();				
				var lf1=genera_Etq();		
					if(exp.hijos[0].valor === 'true'){//es verdadero
						//construir if
						cad_3d+='if (1 == 1) goto '+lv1+';\n';					
					}else{
						cad_3d+='if (1 == 0) goto '+lv1+';\n';
					}
					cad_3d+='goto '+lf1+';\n';					
					temp.lf.push(lf1);
				}else{
					var tipo=valTipo(exp.hijos[0].tipo);
					var error='Error semantico, no puede evaluarse and con operador tipo '+tipo;;
					return insertarError();
				}
			cad_3d+=lv1+':\n';
			}else{//es una expresion
				var t1=evaluarExp(exp.hijos[0]);
				if(t1.tipo!==3){//op2 no es tipo bool				
					var tipo=valTipo(t1.tipo);
					var error='Error semantico, no puede evaluarse and con operador tipo '+tipo;;
					return insertarError();
				}
				cad_3d+=t1.lv.join(':\n')+':\n';					
				temp.lf=temp.lf.concat(t1.lf);										
			}
			//operando 2
			if(exp.hijos[1].nombre === 'valor'){//es un valor puntual				
				if(exp.hijos[1].tipo==='bool'){//es tipo bool
				var lv2=genera_Etq();				
				var lf2=genera_Etq();		
					if(exp.hijos[1].valor === 'true'){//es verdadero
						//construir if
						cad_3d+='if (1 == 1) goto '+lv2+';\n';					
					}else{
						cad_3d+='if (1 == 0) goto '+lv2+';\n';
					}
					cad_3d+='goto '+lf2+';\n';
					temp.lv.push(lv2);
					temp.lf.push(lf2);
				}else{
					var tipo=valTipo(exp.hijos[1].tipo);
					var error='Error semantico, no puede evaluarse and con operador tipo '+tipo;;
					return insertarError();
				}		
			}else{//es una expresion
				var t2=evaluarExp(exp.hijos[1]);
				if(t2.tipo!==3){//op2 no es tipo bool				
					var tipo=valTipo(t2.tipo);
					var error='Error semantico, no puede evaluarse and con operador tipo '+tipo;;
					return insertarError();
				}
				temp.lv=temp.lv.concat(t2.lv);				
				temp.lf=temp.lf.concat(t2.lf);
			}
			return temp;
			
	}
	return exp;
}
