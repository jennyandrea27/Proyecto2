
function suma(op1,op2) {
	var t=genera_Temp();
	var temp={tipo:1,temp:t};
	switch(op1.tipo+op2.tipo){
		case 2://num con num		
		case 4: //num con bool
		case 6:
		cad_3d+=t+"="+op1.temp+'+'+op2.temp+";\n";
		return temp;		
		
	}
}
