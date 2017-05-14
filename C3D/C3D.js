var arr_c3d=[];
var instrucciones=[];
var arr_temp=[];
var pos_metodos=[];
/*
temporal={
  t=temporal,
  val=valor,
};
*/
var p={cad:'p',val:0};
var h={cad:'h',val:0};
var s={cad:'s',val:0};
arr_temp.push(p);
arr_temp.push(h);
arr_temp.push(s);
//estructuras
var stack=[];
var heap=[];
var pool=[];

//separar cad_3d por lineas
function crearArrC3D(cad_3d) {
  var lineas=cad_3d.split('\n');
  for(var i=0;i<lineas.length-1;i++){
    instrucciones.push(lineas[i]);
    var com=lineas[i].split(' ');
    var comando;
    if(com.length>1){
      if(com[1].search(Constante.igual)>=0){//////////////es una asignacion
        if(com.length===4){//no tiene operador
          comando={
            inst:Constante.asig_simple,d1:com[0],d2:com[2],op:'',d3:'',fila:i
          };
        }else if(com.length===6){
          comando={
            inst:Constante.asig_op,d1:com[0],d2:com[2],op:com[3],d3:com[4],fila:i
          };
        }else if(com.length===7){
          if(com[2].search('stack')>=0){
            comando={
              inst:Constante.acceso_stack,d1:com[0],d2:'stack',op:'',d3:com[4],fila:i
            };
          }else if(com[2].search('heap')>=0){
            comando={
              inst:Constante.acceso_heap,d1:com[0],d2:'heap',op:'',d3:com[4],fila:i
            };
          }else if(com[2].search('pool')>=0){
            comando={
              inst:Constante.acceso_pool,d1:com[0],d2:'pool',op:'',d3:com[4],fila:i
            };
          }

        }
      }else if (com[0].search(Constante.goto)>=0){////////es un salto
        comando={
          inst:Constante.goto,d1:com[1],d2:'',op:'',d3:'',fila:i
        };
      }else if (com[0].search(Constante._if)>=0){////////es un if
        comando={
          inst:Constante._if,d1:com[1],d2:com[3],op:com[2],d3:com[5],fila:i
        };
      }else if (com[0].search('L')>=0){////////es una etiqueta
        comando={
          inst:'L',d1:com[0],d2:'',op:'',d3:'',fila:i
        };
      }else if (com[0].search('//')>=0){////////es un comentario
        comando={
          inst:'//',d1:'',d2:'',op:'',d3:'',fila:i
        };
      }else if (com[0].search(Constante._void)>=0){////////es una declaracion de metodo
        comando={
          inst:Constante._void,d1:com[1],d2:'',op:'',d3:'',fila:i
        };
      }else if (com[0].search('stack')>=0){////////es un asignacion a stack
        comando={
          inst:Constante.asig_stack,d1:'stack',d2:com[2],op:'',d3:com[5],fila:i
        };
      }else if (com[0].search('heap')>=0){////////es un asignacion a heap
        comando={
          inst:Constante.asig_heap,d1:'heap',d2:com[2],op:'',d3:com[5],fila:i
        };
      }else if (com[0].search('pool')>=0){////////es un asignacion a pool
        comando={
          inst:Constante.asig_pool,d1:'pool',d2:com[2],op:'',d3:com[5],fila:i
        };
      }else if (com[0].search('$')>=0){////////es un llamado a metodo
        comando={
          inst:Constante.llamado,d1:com[0],d2:'',op:'',d3:com[5],fila:i
        };
      }
    }else{//es llave
      comando={
        inst:'}',d1:'',d2:'',op:'',d3:'',fila:i
      };
    }
    arr_c3d.push(comando);
  }
}
function buscarEtq(etq) {
  for(var i=0;i<arr_c3d.length;i++){
    if(arr_c3d[i].d1 === etq && arr_c3d[i].inst==='L'){
      return i;
    }
  }
  return 0;
}
function buscarMetodoC3D(nombre) {
  for(var i=0;i<arr_c3d.length;i++){
    if(arr_c3d[i].d1 === nombre && arr_c3d[i].inst===Constante._void){
      return i;
    }
  }
  return -1;
}
function ejecutarC3D() {
  stack=[];
  heap=[];
  pool=[];
  var pos_principal=buscarMetodoC3D('principal(){');
  var principal={pos:pos_principal};
  if(principal.pos!==-1){//si existe principal
    var hilo=function () {
      if(!pausa){
        ejecutarMetodo(principal);
      }else{
        if(siguiente){
          ejecutarMetodo(principal);
          siguiente=false;
        }
      }
      clearInterval(hilo_principal);
      hilo_principal=setInterval(hilo,intervalo);
    };
    var hilo_principal=setInterval(hilo,intervalo);
  }else{
    alert('No se ha encontrado metodo Principal.');
  }
}
function ejecutarMetodo(pos) {
  var ejecutar=true;
  if (pos.pos<arr_c3d.length && ejecutar) {
    if(arr_c3d[pos.pos].inst==='}'){
      ejecutar=false;
      if(pos_metodos.length > 0){
        pos.pos=pos_metodos[pos_metodos.length-1];
        pos_metodos.pop();
      }
    }else {
      ejecutarInstr(pos);
    }
  }
}
function ejecutarInstr(pos) {
    imprimirInstr(pos.pos);
    var temporal;
    var comando=arr_c3d[pos.pos];
    var val;
    switch (comando.inst) {
      case Constante.asig_simple:
        //obtener valor a asignar
        val=buscarTemp(comando.d2);
        //crear temporal y agregarlo a arr_temp
        temporal={cad:comando.d1,val:val};
        asigTemp(temporal.cad,temporal.val);
        break;
      case Constante.asig_op:
        var d2=buscarTemp(comando.d2);
        var d3=buscarTemp(comando.d3);
        val=operarC3D(comando.op,d2,d3);
        asigTemp(comando.d1,val);
        break;
      case Constante.asig_stack:
        //obtener valor a asignar
        var pos1=buscarTemp(comando.d2);
        val=buscarTemp(comando.d3);
        //crear temporal y agregarlo a arr_temp
        asigStack(pos1,val);
        break;
      case Constante.acceso_stack:
        var pos_stack=buscarTemp(comando.d3);
        val = accesoStack(pos_stack);
        asigTemp(comando.d1,val);
        break;
      case Constante.acceso_heap:
        var pos_heap=buscarTemp(comando.d3);
        val = accesoHeap(pos_heap);
        asigTemp(comando.d1,val);
        break;
      case Constante.asig_heap:
        //obtener valor a asignar
        var pos_h=buscarTemp(comando.d2);
        val=buscarTemp(comando.d3);
        //crear temporal y agregarlo a arr_temp
        asigHeap(pos_h,val);
        break;
      case Constante.acceso_pool:
        var pos_pool=buscarTemp(comando.d3);
        val = accesoPool(pos_pool);
        asigTemp(comando.d1,val);
        break;
      case Constante.asig_pool:
        //obtener valor a asignar
        var pos2=buscarTemp(comando.d2);
        val=buscarTemp(comando.d3);
        //crear temporal y agregarlo a arr_temp
        asigPool(pos2,val);
        break;
      case Constante.goto:
        //buscar etiqueta
        pos.pos=buscarEtq(comando.d1);
        break;
      case Constante._if:
        //obterner valores de d1 y d2
        var op1=buscarTemp(comando.d1);
        var op2=buscarTemp(comando.d2);
        //evaluar condicion
        var cond=evaluarCond3D(op1,op2,comando.op);
        if(cond===true){
          pos.pos=buscarEtq(comando.d3);
        }else{
          //en la siguiente instruccion se tiene goto Lf etiqueta de falso
          var com_f=arr_c3d[pos.pos+1];
          pos.pos=buscarEtq(com_f.d1);
        }
        break;
      case Constante.llamado:
        pos_metodos.push(pos.pos+1);
        pos.pos=buscarMetodoC3D(comando.d1+'{');
    }
    recorrerEstructuras();
    pos.pos=pos.pos+1;
}
function evaluarCond3D(d1,d2,op){
  switch (op) {
    case Constante._mayor:
      if(d1>d2){
        return true;
      }
      return false;
    case Constante._menor:
      if(d1<d2){
        return true;
      }
      return false;
    case Constante._mayorigual:
      if(d1>=d2){
        return true;
      }
      return false;
    case Constante._menorigual:
      if(d1<=d2){
        return true;
      }
      return false;
    case Constante._igualacion:
      if(d1===d2){
        return true;
      }
      return false;
    case Constante._diferente:
      if(d1!==d2){
        return true;
      }
      return false;
  }
}
function buscarTemp(cad) {
  if(cad.search('t')>=0 || cad.search('h')>=0 || cad.search('p')>=0 || cad.search('s')>=0){
    for(var i=0;i<arr_temp.length;i++){
      var temp=arr_temp[i];
      if(temp.cad===cad){
        return temp.val;
      }
    }
  }else{
    return Number(cad);
  }
}
function asigTemp(cad,val) {
  var i;
  for(i=0;i<arr_temp.length;i++){
    var temp=arr_temp[i];
    if(temp.cad===cad){
      arr_temp[i].val=val;
      return;
    }
  }
  //no existe el temporal agregar
  var temporal={cad:cad,val:val};
  arr_temp.push(temporal);
}
function asigStack(cad,val) {
  var i;
  for(i=0;i<stack.length;i++){
    var temp=stack[i];
    if(temp.cad===cad){
      stack[i].val=val;
      return;
    }
  }
  //no existe el temporal agregar
  var temporal={cad:cad,val:val};
  stack.push(temporal);
  ordenarStack();
}
function accesoStack(pos) {
  var val=0;
  for(var i=0;i<stack.length;i++){
    if(stack[i].cad===pos){
      //si se ha declarado posicion en el stack
      val=stack[i].val;
    }
  }
  return val;
}
function asigHeap(cad,val) {
  var i;
  for(i=0;i<heap.length;i++){
    var temp=heap[i];
    if(temp.cad===cad){
      heap[i].val=val;
      return;
    }
  }
  //no existe el temporal agregar
  var temporal={cad:cad,val:val};
  heap.push(temporal);
  ordenarHeap();
}
function accesoHeap(pos) {
  var val=0;
  for(var i=0;i<heap.length;i++){
    if(heap[i].cad===pos){
      //si se ha declarado posicion en el heap
      val=heap[i].val;
    }
  }
  return val;
}
function asigPool(cad,val) {
  var i;
  for(i=0;i<pool.length;i++){
    var temp=pool[i];
    if(temp.cad===cad){
      pool[i].val=val;
      return;
    }
  }
  //no existe el temporal agregar
  var temporal={cad:cad,val:val};
  pool.push(temporal);
}
function accesoPool(pos) {
  var val=0;
  for(var i=0;i<pool.length;i++){
    if(pool[i].cad===pos){
      //si se ha declarado posicion en el pool
      val=pool[i].val;
    }
  }
  return val;
}
function operarC3D(op,v2,v3) {
  var val;
  switch (op) {
    case Constante.suma:
      val=v2+v3;
      break;
    case Constante.resta:
      val=v2-v3;
      break;
    case Constante.mult:
      val=v2*v3;
      break;
    case Constante.div:
      val=v2/v3;
      break;
    case Constante.mod:
      val=v2%v3;
      break;
    case Constante.pot:
      val=Math.pow(v2,v3);
      break;
  }
  return Math.round(val*10000)/10000;
}
function recorrerEstructuras() {
  recorrerStack();
  recorrerHeap();
  recorrerPool();
}
function recorrerStack() {
  var cad_stack='<table class="table" id="t_stack">\n';
  cad_stack+='<tr class="warning">\n';
  cad_stack+='<th>Stack</th><td> </td>\n';
  cad_stack+='</tr>';
  //imprimir valor actual de p
  cad_stack+='<tr class="success">\n';
  cad_stack+='<td>P</td>\n';
  cad_stack+='<td>'+p.val+'</td>\n';
  cad_stack+='</tr>\n';
  for(var i=0;i<stack.length;i++){
    cad_stack+='<tr>\n';
    cad_stack+='<td>'+stack[i].cad+'</td>\n';
    cad_stack+='<td>'+stack[i].val+'</td>\n';
    cad_stack+='</tr>\n';
  }
  cad_stack+='</table>';
  $('#t_stack').html(cad_stack);
}
function recorrerHeap() {
  var cad_heap='<table class="table" id="t_heap">\n';
  cad_heap+='<tr class="warning">\n';
  cad_heap+='<th>Heap</th><td> </td>\n';
  cad_heap+='</tr>';
  //imprimir valor actual de h
  cad_heap+='<tr class="success">\n';
  cad_heap+='<td>H</td>\n';
  cad_heap+='<td>'+h.val+'</td>\n';
  cad_heap+='</tr>\n';
  for(var i=0;i<heap.length;i++){
    cad_heap+='<tr>\n';
    cad_heap+='<td>'+heap[i].cad+'</td>\n';
    cad_heap+='<td>'+heap[i].val+'</td>\n';
    cad_heap+='</tr>\n';
  }
  cad_heap+='</table>';
  $('#t_heap').html(cad_heap);
}
function recorrerPool() {
  var cad_pool='<table class="table" id="t_pool">\n';
  cad_pool+='<tr class="warning">\n';
  cad_pool+='<th>Pool</th><td> </td>\n';
  cad_pool+='</tr>';
  //imprimir valor actual de s
  cad_pool+='<tr class="success">\n';
  cad_pool+='<td>S</td>\n';
  cad_pool+='<td>'+s.val+'</td>\n';
  cad_pool+='</tr>\n';
  var pos_inicio=true;
  for(var i=0;i<pool.length;i++){
    if(pos_inicio){
      cad_pool+='<tr>\n';
      cad_pool+='<td>'+i+'</td>\n';
      cad_pool+='<td>';
      pos_inicio=false;
    }
    if(pool[i].val===0){//es final de cadena
      cad_pool+='</td>\n';
      cad_pool+='</tr>\n';
      pos_inicio=true;
    }else{
      cad_pool+=String.fromCharCode(pool[i].val);
    }
  }
  cad_pool+='</table>';
  $('#t_pool').html(cad_pool);
}
function imprimirInstr(i) {
  var cad='<table class="table" id="tbInstruccion">\n';
  cad+='<tr><th>Fila</th><th>Instruccion </th></tr>\n';
  cad+='<tr><td>'+i+'</td><th>'+instrucciones[i]+'</th></tr>\n';
  cad+='<tr class="active"><td>'+(i+1)+'</td><th>'+instrucciones[i+1]+'</th></tr>\n';
  cad+='</table>\n';
  $('#tbInstruccion').html(cad);
}
function ordenarStack() {
  //stack
  for(var i=0;i<stack.length;i++){
    for(var j=i;j<stack.length;j++){
      if(stack[i].cad>stack[j].cad){
        var actual={cad:stack[i].cad,val:stack[i].val};
        stack[i].cad=stack[j].cad;
        stack[i].val=stack[j].val;
        stack[j].cad=actual.cad;
        stack[j].val=actual.val;
      }
    }
  }
}
function ordenarHeap() {
  //heap
  for(var i=0;i<heap.length;i++){
    for(var j=i;j<heap.length;j++){
      if(heap[i].cad>heap[j].cad){
        var actual={cad:heap[i].cad,val:heap[i].val};
        heap[i].cad=heap[j].cad;
        heap[i].val=heap[j].val;
        heap[j].cad=actual.cad;
        heap[j].val=actual.val;
      }
    }
  }
}
