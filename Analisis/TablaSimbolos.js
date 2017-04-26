var TablaSimbolos=[];
var ambito=['global'];
//la tabla de simbolos almacena objetos con los siguientes atributos
//nombre, pos, tam, ambito, tipo, rol y dim
function crearTablaSimbolos(result) {
	//agregar ambito global
	var global=crearAmbito('global');
	insertarAmbito(global);
	//metodo que recorre el arbol para agregar variables y funciones declaradas
	//recorrer sentencias
	for (var i = 0; i < result.hijos.length; i++) {
		var sent=result.hijos[i];
		//verificar que sentencias es la que se tiene
		switch(sent.nombre){
			case 'dec':
			//ambito actual
			var amb_actual=buscarAmbito(ambito[ambito.length-1]);
			//tipo
			var tipo=cadTipo(sent.tipo);
			//hijo 0 tiene lid
			var lid=sent.hijos[0];
			for(var j=0;j<lid.hijos.length;j++){
				//por cada hijo en lid se agrega una variable a ambito amb_actual
				//crear variable
				var variable=crearVariable(lid.hijos[j],amb_actual.variables.length,tipo,amb_actual.nombre,null);
				//insertar varible
				insertarVar(variable,amb_actual);
			}
			console.log(TablaSimbolos);
			break;
			case 'array':
			//obtener ambito actual
			var amb=buscarAmbito(ambito[ambito.length-1]);
			//es una declaracion de arreglo, la variable contiene dimensiones
			var nombre=sent.valor;
			var t_arr=cadTipo(sent.tipo);
			//dimensiones lista_corchetes_valor en hijo 0
			var lcv=sent.hijos[0];
			//cada hijo de lcv es una dimension con indice inf e indice sup
			var tam=1;
			for(var k=0;k<lcv.hijos.length;k++){
				var inf=lcv.hijos[k].inf;
				var sup=lcv.hijos[k].sup;
				tam=tam*(sup-inf);
			}
			console.log(tam);
			var var_arr=crearVariable(nombre,amb.variables.length,tipo,tam,amb.nombre,lcv);
			insertarVar(var_arr,amb);
			break;
		}
	}
}
function crearAmbito(nombre) {
	var ambito={nombre:nombre,variables:[],ambitos:[]};
	return ambito;
}
function insertarAmbito(ambito) {
	TablaSimbolos.push(ambito);
}
function insertarVar(variable,amb_actual) {
	//TODO: verificar que no exista la variable a insertar
	amb_actual.variables.push(variable);
}
function crearVariable(nombre,pos,tipo,tam,ambito,dim) {
	var variable={nombre:nombre,pos,tipo:tipo,rol:'var',tam:tam,ambito:ambito,dim:dim};
	return variable;
}
function buscarAmbito(ambito) {
	for(var i =0;i<TablaSimbolos.length;i++){
		if(TablaSimbolos[i].nombre === ambito){
			return TablaSimbolos[i];
		}
	}
}
