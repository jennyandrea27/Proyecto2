var pausa=true;
var intervalo=3000;
var siguiente=false;


function bInicio() {
  pausa=false;
}

function bPausa() {
  pausa=true;
}
function bAumenta() {
  intervalo=intervalo/2;
  if(intervalo<100){
    intervalo=100;
  }
}
function bDisminuye() {
  intervalo=intervalo*2;
  if(intervalo>4000){
    intervalo=4000;
  }
}
function bSiguiente() {
  siguiente=true;
}
