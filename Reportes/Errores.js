function TE_HTML() {
	var errores_html='';
	errores_html+=recorrerErrores();
	return errores_html;
}
function recorrerErrores() {
	var cad_errores='';
	//imprimirlos datos del ambito actual
	for(var i=0;i<Errores.length;i++){
    cad_errores+='<tr>';
    cad_errores+='<td>'+Errores[i].desc+'</td>';
    cad_errores+='<td>'+Errores[i].fila+'</td>';
    cad_errores+='<td>'+Errores[i].col+'</td>';
    cad_errores+='</tr>\n';
	}
	return cad_errores;
}
