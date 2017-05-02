var TablaSimbolos=[];
var ambito=['global'];
var tabla_html='';
//la tabla de simbolos almacena objetos con los siguientes atributos
//nombre, pos, tam, ambito, tipo, rol y dim
function crearTablaSimbolos(cuerpo) {

	//metodo que recorre el arbol para agregar variables y funciones declaradas
	//recorrer sentencias
	for (var i = 0; i < cuerpo.hijos.length; i++) {
		var sent=cuerpo.hijos[i];
		//verificar que sentencias es la que se tiene
		switch(sent.nombre){
			case 'dec':
			//ambito actual
			var amb_actual=buscarAmbito(TablaSimbolos[0],getAmbito());
			//tipo
			var tipo=cadTipo(sent.tipo);
			//hijo 0 tiene lid
			var lid=sent.hijos[0];
			for(var j=0;j<lid.hijos.length;j++){
				//por cada hijo en lid se agrega una variable a ambito amb_actual
				//crear variable
				var variable=crearVariable(lid.hijos[j],amb_actual.variables.length,tipo,1,amb_actual.nombre,null);
				//insertar varible
				insertarVar(variable,amb_actual);
			}
			console.log(TablaSimbolos);
			break;
			case 'array':
			//obtener ambito actual
			var amb=buscarAmbito(TablaSimbolos[0],getAmbito());
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
			var var_arr=crearVariable(nombre,amb.variables.length,tipo,tam,amb.nombre,lcv);
			insertarVar(var_arr,amb);
			break;
			case "decfun":
			//se crea ambito de funciones
			var tipo_fun=cadTipo(sent.tipo);
			var amb_fun=crearAmbito(getAmbito()+'$'+sent.valor,tipo_fun,'funcion');
			var dim_ret=null;
			//en el hijo 2 puede tener corchetes
			if(sent.hijos.length===3){
				if(tipo_fun!==11){//no es tipo void
					var lc=sent.hijos[2];
					var correcto=true;
					for(var p=0; p < lc.hijos.length;p++){
						if(lc.hijos[p].inf !== -1 || lc.hijos[p].sup !== -1){//no tienen corchetes vacios
							//error
							correcto=false;
						}
					}
					if(correcto===false){
						var error='Error semantico, retorno de funcion incorrecto.';
						insertarError(error);
						console.log('incorrecto');
					}else{
						dim_ret=lc;
						console.log('correcto');
					}
				}else{
					//error
					var error2='Error semantico, retorno de funcion es tipo void, no se admiten dimensiones.';
					insertarError(error);
				}
			}
			//se inserta una variabla para retorno
			var ret=crearVariable('retorno',0,tipo_fun,1,amb_fun.nombre,dim_ret);
			ret.rol='retorno';
			insertarVar(ret,amb_fun);
			//se recorre lista de parametros para agregarlos al ambito
			//hijos 0 tiene lpar
			var lpar=sent.hijos[0];
			for (var l = 0; l < lpar.hijos.length; l++) {
				var t_par=cadTipo(lpar.hijos[l].tipo);
				var n_par=lpar.hijos[l].nombre;
				var parametro=crearVariable(n_par,amb_fun.variables.length,t_par,1,amb_fun.nombre,null);
				//insertar varible
				insertarVar(parametro,amb_fun);
			}
			//se agrega ambito a ambito en tabla de simbolos
			TablaSimbolos[TablaSimbolos.length-1].ambitos.push(amb_fun);
			ambito.push(sent.valor);
			//recorrer cuerpo de funcion para agregar declaracones de variables y arreglos
			crearTablaSimbolos(sent.hijos[1]);
			ambito.pop();
			break;
			case 'principal':
			//crear ambito para principal
			var amb_principal=crearAmbito(getAmbito()+'$principal',11,'funcion');//es tipo void
			//se agrega ambito a ambito en tabla de simbolos
			TablaSimbolos[TablaSimbolos.length-1].ambitos.push(amb_principal);
			ambito.push('principal');
			crearTablaSimbolos(sent.hijos[0]);
			ambito.pop();
			console.log(TablaSimbolos);
			break;
			case 'if':
			//crear ambito para if
			var amb_sent=crearAmbito(getAmbito()+'$'+sent.nombre+i,-1,sent.nombre);
			//buscar ambito padre
			var nomb_amb_padre=ambito.join('$');
			console.log(nomb_amb_padre);
			var amb_padre=buscarAmbito(TablaSimbolos[0],nomb_amb_padre);
			//se agrega ambito a ambito en tabla de simbolos
			amb_padre.ambitos.push(amb_sent);
			ambito.push(sent.nombre+i);
			//buscar el cuerpo de la sentencia
			var cuerpo_sent=sent.hijos[1];
			crearTablaSimbolos(cuerpo_sent);
			ambito.pop();
			//verificar si tiene else
			if(sent.hijos.length===3){
				var amb_else=crearAmbito(getAmbito()+'$else'+i,-1,'else');
				nomb_amb_padre=ambito.join('$');
				amb_padre=buscarAmbito(TablaSimbolos[0],nomb_amb_padre);
				//se agrega ambito a ambito en tabla de simbolos
				amb_padre.ambitos.push(amb_else);
				ambito.push('else'+i);
				//buscar el cuerpo de la sentencia
				cuerpo_sent=sent.hijos[2];
				crearTablaSimbolos(cuerpo_sent);
				ambito.pop();
			}
			break;
			case 'while':
			case 'dowhile':
			case 'repeat':
			case 'loop':
			case 'count':
			case 'dowhilex':
			//crear ambito para la sentencia
			amb_sent=crearAmbito(getAmbito()+'$'+sent.nombre+i,-1,sent.nombre);
			//buscar ambito padre
			amb_padre=buscarAmbito(TablaSimbolos[TablaSimbolos.length-1],getAmbito());
			//se agrega ambito a ambito en tabla de simbolos
			amb_padre.ambitos.push(amb_sent);
			ambito.push(sent.nombre+i);
			//buscar el cuerpo de la sentencia
			cuerpo_sent=buscarCuerpo(sent);
			crearTablaSimbolos(cuerpo_sent);
			ambito.pop();
			break;
			case 'for':
			//crear ambito para la sentencia
			amb_sent=crearAmbito(getAmbito()+'$'+sent.nombre+i,-1,sent.nombre);
			//buscar ambito padre
			amb_padre=buscarAmbito(TablaSimbolos[TablaSimbolos.length-1],getAmbito());
			//se agrega ambito a ambito en tabla de simbolos
			amb_padre.ambitos.push(amb_sent);
			ambito.push(sent.nombre+i);
			//verificar si la variable de control es una asignacion
			if(sent.hijos[0].nombre===Constante.dec){
				var n_v_for=sent.hijos[0].hijos[0].hijos[0];
				var v_for=crearVariable(n_v_for,amb_sent.variables.length,sent.hijos[0].tipo,1,amb_sent.nombre,null);
				//insertar varible
				insertarVar(v_for,amb_sent);
			}
			//buscar el cuerpo de la sentencia
			cuerpo_sent=buscarCuerpo(sent);
			crearTablaSimbolos(cuerpo_sent);
			ambito.pop();
			break;
		}
	}
}
function getAmbito() {
	return ambito.join('$');
}
function buscarCuerpo(sentencia) {
	for(var i = 0; i<sentencia.hijos.length;i++){
		if(sentencia.hijos[i].nombre==='cuerpo'){
			return sentencia.hijos[i];
		}
	}
	return null;
}
function crearAmbito(nombre,tipo,rol) {
	var ambito={nombre:nombre,tipo:tipo,variables:[],ambitos:[],rol:rol};
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
	var variable={nombre:nombre,pos:pos,tipo:tipo,rol:'variable',tam:tam,ambito:ambito,dim:dim};
	return variable;
}
function buscarAmbito(ambito,nombre) {
	var encontrado=null;
	if(ambito.nombre===nombre){
		return ambito;
	}
	for(var i=0;i<ambito.ambitos.length;i++){
		if(ambito.ambitos[i].nombre===nombre){
			return ambito.ambitos[i];
		}
	}
	if(encontrado===null){
		//buscar en cada uno de los ambitos del ambito actual
		for(var j=0;j<ambito.ambitos.length;j++){
			var nuevo_amb=ambito.ambitos[j];
			encontrado=buscarAmbito(nuevo_amb,nombre);
			if(encontrado !==null){
				return encontrado;
			}
		}
		return null;
	}

}
function TS_HTML() {
	tabla_html='';
	tabla_html+=recorrerTabla(TablaSimbolos[0]);
	return tabla_html;
}
function recorrerTabla(ambito) {
	var cad_tabla='';
	//imprimirlos datos del ambito actual
	var nom_amb=ambito.nombre.split('$');
	var amb='global';
	for(var i=1;i<nom_amb.length-1;i++){
		amb+='$'+nom_amb[i];
	}
	if(ambito.nombre==='global'){
		cad_tabla+='<tr class="active">';
		cad_tabla+='<td>'+nom_amb[nom_amb.length-1]+'</td>';
		cad_tabla+='<td></td>';//principal no tiene posicion
		cad_tabla+='<td></td>';
		cad_tabla+='<td></td>';
		cad_tabla+='<td></td>';
		cad_tabla+='<td></td>';
		cad_tabla+='<td></td>';
		cad_tabla+='</tr>\n';
	}else{
		if(ambito.rol==='funcion'){
			cad_tabla+='<tr class="info">';
			//var ambito={nombre:nombre,tipo:tipo,variables:[],ambitos:[],rol:rol};
			//nombre,pos,tipo,tam,ambito,rol,dim
			cad_tabla+='<td>'+nom_amb[nom_amb.length-1]+'</td>';
			cad_tabla+='<td></td>';//funcion no tiene posicion
			cad_tabla+='<td>'+valTipo(ambito.tipo)+'</td>';
			cad_tabla+='<td>'+ambito.variables.length+'</td>';
			cad_tabla+='<td>'+amb+'</td>';
			cad_tabla+='<td>'+ambito.rol+'</td>';
			if(ambito.dim===null){
				cad_tabla+='<td></td>';
			}else{
				cad_tabla+='<td></td>';
			}
			cad_tabla+='</tr>\n';
		}else if(ambito.rol!=='variable'){
			cad_tabla+='<tr>';
			cad_tabla+='<td class="info">'+nom_amb[nom_amb.length-1]+'</td>';
			cad_tabla+='<td></td>';//funcion no tiene posicion
			cad_tabla+='<td>'+valTipo(ambito.tipo)+'</td>';
			cad_tabla+='<td>'+ambito.variables.length+'</td>';
			cad_tabla+='<td>'+amb+'</td>';
			cad_tabla+='<td>'+ambito.rol+'</td>';
			if(ambito.dim===null){
				cad_tabla+='<td></td>';
			}else{
				//TODO: verificar dimensione de ambito al recorrer la tabla de simbolos
				cad_tabla+='<td></td>';
			}
			cad_tabla+='</tr>\n';
		}
	}
	for(var j=0;j<ambito.variables.length;j++){
		//nombre,pos,tipo,tam,ambito,dim
		cad_tabla+='<tr>';
		cad_tabla+='<td>'+ambito.variables[j].nombre+'</td>';
		cad_tabla+='<td>'+ambito.variables[j].pos+'</td>';
		cad_tabla+='<td>'+valTipo(ambito.variables[j].tipo)+'</td>';
		cad_tabla+='<td>'+ambito.variables[j].tam+'</td>';
		cad_tabla+='<td>'+ambito.variables[j].ambito+'</td>';
		cad_tabla+='<td>'+ambito.variables[j].rol+'</td>';
		if(ambito.dim===null){
			cad_tabla+='<td></td>';
		}else{
			//TODO: verificar dimensione de variable al recorrer la tabla de simbolos
			cad_tabla+='<td></td>';
		}
		cad_tabla+='</tr>\n';
	}
	for(var k=0;k<ambito.ambitos.length;k++){
		cad_tabla+=recorrerTabla(ambito.ambitos[k]);
	}
	return cad_tabla;
}
