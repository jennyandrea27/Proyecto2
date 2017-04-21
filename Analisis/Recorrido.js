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
	//tabla de simbolos
	//buscar principal
	var principal=buscar_principal(result);
	//verificar si se declaro metodo principal
	if(principal !== null){
		console.log("principal");
		//recorrer cuerpo de principal
		ejecutar_Sent(principal.hijos[0]);
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
	switch(cuerpo.nombre){
		case 'dec':
		//primer hijo tiene lidp
		//segundo hijo tiene expresion
		var res=evaluarExp(cuerpo.hijos[1]);
		break;
	}
}
function evaluarExp(exp) {
	switch(exp.nombre){
		case 'valor':
		var temp=genera_Temp;
		cad_3d+=temp+"="+exp.valor;
		return temp;
		break;
	}
}