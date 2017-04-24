var TablaSimbolos=[];
//la tabla de simbolos almacena objetos con los siguientes atributos
//nombre, pos, tam, ambito, tipo, rol y dim
function crearTablaSimbolos(result) {
	//metodo que recorre el arbol para agregar variables y funciones declaradas
	//recorrer sentencias
	for (var i = 0; i < result.hijos.length(); i++) {
		var sent=result.hijos[i];
		//verificar que sentencias es la que se tiene
		switch(sent.nombre){
			case 'dec':
			//hijo 0 tiene lid
						
			break;
		}
	}
}		