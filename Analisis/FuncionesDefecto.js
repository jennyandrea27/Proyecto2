function crearFuncionesDefecto() {
  concatenacion();
}
function concatenacion() {
  //encabezado
  cad_3d+='void $$_concatenacion(){\n';
  cad_3d+='//obtener posicion disponible en heap\n';
  var t=genera_Temp();
  temp={tipo:Constante.tstr,temp:t};
  cad_3d+=t+' = h;\n';
  cad_3d+='h = h + 1;\n';
  cad_3d+='heap[ '+t+' ] = s;\n';
  //obener posicion de parametro 1, temporal del primer operando
  var pos_tx=genera_Temp();
  cad_3d+=pos_tx+' = p + 1;\n';
  var val_tx=genera_Temp();
  cad_3d+=val_tx+' = heap[ '+pos_tx+' ];\n';
  var cont1=genera_Temp();
  var pos_cad1=genera_Temp();
  var val_cad1=genera_Temp();
  var etq_inicio1=genera_Etq();
  cad_3d+=cont1+' = 0;\n';
  cad_3d+=etq_inicio1+':\n'
  cad_3d+=pos_cad1+' = '+val_tx+' + '+cont1+'\n';
  cad_3d+=val_cad1+' = pool[ '+pos_cad1+' ];\n';
  var lv1=genera_Etq();
  var lf1=genera_Etq();
  cad_3d+='if( '+val_cad1+' != 0 )goto '+lv1+';\n';
  cad_3d+='goto '+lf1+';\n';
  cad_3d+=lv1+':\n';
  cad_3d+='pool[ s ] = '+val_cad1+';\n';
  cad_3d+='s = s + 1;\n';
  cad_3d+=cont1+' = '+cont1+' + 1;\n';
  cad_3d+='goto '+etq_inicio1+';\n';
  cad_3d+=lf1+':\n';
  //operando 2
  pos_tx=genera_Temp();
  cad_3d+=pos_tx+' = p + 2;\n';
  val_tx=genera_Temp();
  cad_3d+=val_tx+' = heap[ '+pos_tx+' ];\n';
  cont1=genera_Temp();
  pos_cad1=genera_Temp();
  val_cad1=genera_Temp();
  etq_inicio1=genera_Etq();
  cad_3d+=cont1+' = 0;\n';
  cad_3d+=etq_inicio1+':\n'
  cad_3d+=pos_cad1+' = '+val_tx+' + '+cont1+'\n';
  cad_3d+=val_cad1+' = pool[ '+pos_cad1+' ];\n';
  lv1=genera_Etq();
  lf1=genera_Etq();
  cad_3d+='if( '+val_cad1+' != 0 )goto '+lv1+';\n';
  cad_3d+='goto '+lf1+';\n';
  cad_3d+=lv1+':\n';
  cad_3d+='pool[ s ] = '+val_cad1+';\n';
  cad_3d+='s = s + 1;\n';
  cad_3d+=cont1+' = '+cont1+' + 1;\n';
  cad_3d+='goto '+etq_inicio1+';\n';
  cad_3d+=lf1+':\n';
  //final de cadena
  cad_3d+='pool[ s ] = 0;\n';
  cad_3d+='s = s + 1;\n';
  //retorno
  var pos_ret=genera_Temp();
  cad_3d+=pos_ret+' = p + 0;\n';
  cad_3d+='stack[ '+pos_ret+' ] = '+t+';\n';
  cad_3d+='}\n';
  return temp;
}
