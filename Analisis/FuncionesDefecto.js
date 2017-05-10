function crearFuncionesDefecto() {
  numToStr();
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
  cad_3d+=etq_inicio1+':\n';
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
}
function numToStr() {
  var tx=genera_Temp();
  cad_3d+='void $$_numToStr(){\n';
  cad_3d+='//obtener posicion disponible en heap\n';
	cad_3d+=tx +' = h;\n';
	cad_3d+='h = h + 1;\n';
	cad_3d+='heap[ '+tx+' ] = s;\n';
  //posicion 1 valor del numero
  var pos_val=genera_Temp();
  var temp_val=genera_Temp();
  cad_3d+=pos_val+' = p + 1;\n';
  cad_3d+=temp_val+' = stack[ '+pos_val+'];\n';
  var temp_dig=genera_Temp();
  cad_3d+=temp_dig+' = 10;\n';
  var etq_loop1=genera_Etq();
  var lv1=genera_Etq();
  var lf1=genera_Etq();
  cad_3d+=etq_loop1+':\n';
  cad_3d+='if( '+temp_dig+' < '+temp_val+' )goto '+lv1+';\n';
	cad_3d+='goto '+lf1+';\n';
  cad_3d+=lv1+':\n';//aumentar temp_dig
  cad_3d+=temp_dig+' = '+temp_dig+' * 10;\n';
  cad_3d+='goto '+etq_loop1+';\n';
  cad_3d+=lf1+':\n';//inicia loop para reconocer cada digito
  var etq_loop2=genera_Etq();
  cad_3d+=etq_loop2+':\n';
  cad_3d+=temp_dig+' = '+temp_dig+' / 10;\n';
  var lv2=genera_Etq();
  var lf2=genera_Etq();
  cad_3d+='if( '+temp_val+' > 1 )goto '+lv2+';\n';
	cad_3d+='goto '+lf2+';\n';
  cad_3d+=lv2+':\n';//aumentar temp_dig
  var t6=genera_Temp();
  var t7=genera_Temp();
  var t8=genera_Temp();
  var t9=genera_Temp();
  cad_3d+=t6+' = '+temp_val+' % '+temp_dig+';\n';
  cad_3d+=t7+' = '+temp_val+' - '+t6+';\n';
  cad_3d+=t8+' = '+t7+' / '+temp_dig+';\n';
  cad_3d+=t9+' = '+t8+' + 48;\n';
  cad_3d+='pool[ s ] = '+t9+';\n';
  cad_3d+='s = s + 1;\n';
  cad_3d+=temp_val+' = '+ t6+';\n';
  cad_3d+='goto '+etq_loop2+';\n';
  cad_3d+=lf2+':\n';//verificar si tiene decimal
  var lv3=genera_Etq();
  var lf3=genera_Etq();
  cad_3d+='if( '+temp_val+' > 0 )goto '+lv3+';\n';
	cad_3d+='goto '+lf3+';\n';
  cad_3d+=lv3+':\n';
  cad_3d+='//ascci punto decimal\n';
  cad_3d+='pool[ s ] = 46;\n';
  cad_3d+='s = s + 1;\n';
  var etq_loop3=genera_Etq();
  var lv4=genera_Etq();
  var lf4=genera_Etq();
  cad_3d+=etq_loop3+':\n';
  cad_3d+='if( '+temp_val+' > 0 )goto '+lv4+';\n';
	cad_3d+='goto '+lf4+';\n';
  cad_3d+=lv4+':\n';
  cad_3d+=temp_val+' = '+temp_val+' * 10;\n';
  var t10=genera_Temp();
  var t11=genera_Temp();
  var t12=genera_Temp();
  var t13=genera_Temp();
  cad_3d+=t10+' = '+temp_val+' % 1;\n';
  cad_3d+=t11+' = '+temp_val+' - '+t10+';\n';
  cad_3d+=t12+' = '+t11+' + 48;\n';
  cad_3d+='pool[ s ] = '+t12+';\n';
  cad_3d+='s = s + 1;\n';
  cad_3d+=temp_val+' = '+temp_val+' - '+t11+';\n';
  cad_3d+='goto '+etq_loop3+';\n';
  cad_3d+=lf4+':\n';
  cad_3d+=lf3+':\n';
  cad_3d+='//ascci final de cadena\n';
  cad_3d+='pool[ s ] = 0;\n';
  cad_3d+='s = s + 1;\n';
  cad_3d+='//retorno de funcion\n';
  var pos_r=genera_Temp();
  cad_3d+=pos_r+' = p + 0;\n';
  cad_3d+='stack[ '+pos_r+' ] = '+tx+';\n';
  cad_3d+='}\n';
}
