/*Analisis Lexico*/
%lex
%%
\s+                   /* espacios en blanco se ignoran */
\r                   /* espacios en blanco se ignoran */
\n                   /* espacios en blanco se ignoran */
"%%"[^\n]*\n         /*comentario de linea*/
"¿¿"[^"??"]*"??"         /*comentario de parrafo*/
[0-9]+("."[0-9]+)?\b  return 'num'
\"[^\"]*\"|\'[^\']*\' yytext = yytext.substr(1,yyleng-2); return 'cad';
"*"                   return '*'
"/"                   return '/'
"-"                   return '-'
"+"                   return '+'
"^"                   return '^'
"%"                   return '%'
"("                   return '('
")"                   return ')'
"{"                   return '{'
"}"                   return '}'
"["                   return '['
"]"                   return ']'
":"                   return ':'
";"                   return ';'
","                   return ','
".."                  return '..'
"."                   return '.'
"=="                  return '=='
"="                   return '='
"!="                  return '!='
">="                  return '>='
"<="                  return '<='
">"                   return '>'
"<"                   return '<'
"||"                  return '||'
"|?"                  return '|?'
"&&"                  return '&&'
"||"                  return '||'
"|&"                  return '|&'
"!"                   return '!'
"bool"				  return 'tbool'
"str"				  return 'tstr'
"num"				  return 'tnum'
"void"				  return 'tvoid'
"if"				  return 'if'
"num"				  return 'tnum'
"array"				  return 'array'
"of"				  return 'of'
"if"				  return 'if'
"then"				  return 'then'
"else"				  return 'else'
"switch"			  return 'switch'
"case"				  return 'case'
"default"			  return 'default'
"break"				  return 'break'
"continue"			  return 'continue'
"return"			  return 'return'
"while"				  return 'while'
"do"				  return 'do'
"repeat"			  return 'repeat'
"until"				  return 'until'
"for"				  return 'for'
"loop"				  return 'loop'
"count"				  return 'count'
"whilex"			  return 'whilex'
"Principal"			  return 'principal'
"getBool"			  return 'getBool'
"getNum"			  return 'getNum'
"outStr"			  return 'outStr'
"outNum"			  return 'outNum'
"inStr"			  	  return 'inStr'
"inNum"			  	  return 'inNum'
"show"			  	  return 'show'
"getRandom"			  return 'getRandom'
"getLength"			  return 'getLength'
"throws"			  return 'throws'
"NULL"				  return 'null'
"NullPoinerException"			  return 'NullPoinerException'
"MissingReturnStatement"	      return 'MissingReturnStatement'
"ArithmeticException"			  return 'ArithmeticException'
"StackOverFlowException"		  return 'StackOverFlowException'
"HeapOverFlowException"			  return 'HeapOverFlowException'
"PoolOverFlowException"			  return 'PoolOverFlowException'
"true"				  return 'true'
"false"				  return 'false'
[a-zA-Z]([a-zA-Z0-9_])* return 'id'
<<EOF>>               return 'EOF'
.                     return 'INVALID'

/lex
/*Precedencia de operadores*/
%left '||' '|?'
%left '&&' '&?'
%left '|&'
%left '!'
%left '==' '!=' '>' '<' '>=' '<='
%left '+' '-'
%left '*' '/' '%'
%right '^'

%start INICIO

%% /*Gramatica*/
INICIO : BASIC EOF
	   {
	   	return $1;
	   };
BASIC : BASIC BSENT {$1.hijos.push($2);$$=$1;}
	   | BSENT {$$={nombre:'basic',hijos:[$1]};};
BSENT : DECVAR {$$=$1;}
	   | DECFUN {$$=$1;}
	   | DECARR {$$=$1;}
	   | PRINCIPAL{$$=$1;};
DECVAR : TVAR LIDC VALVAR ';' {$$={nombre:'dec',tipo:$1,hijos:[$2,$3]};};
TVAR : tbool {$$='tbool';}
	  |tnum {$$='tnum';}
	  |tstr {$$='tstr'}
	  |LIDP {$$=$1;};
LIDC : LIDC ',' id {$1.hijos.push($3);$$=$1;}
	 | id {$$={nombre:'lid',hijos:[$1]};};
VALVAR : ':' EXP {$$=$2;}
       | {$$=null;};
DECARR : array ':' id LCV of TVAR ';'{$$={nombre:'array',tipo:$6,valor:$3,hijos:[$4]};};
LCV : LCV '[' INDICE ']'{$1.hijos.push($3);$$=$1;}	
	| '[' INDICE ']'{$$={nombre:'lcv',hijos:[$2]};};
INDICE : num '..' num {$$={nombre:'indice',inf:$1,sup:$3};}
	   | num {$$={nombre:'indice',inf:0,sup:$1};}
	   | {$$={nombre:'indice',inf:-1,sup:-1};};
EXP : EXP '||' EXP {$$={nombre:'||',hijos: [$1 , $3]};}
	| EXP '&&' EXP {$$={nombre:'&&',hijos: [$1 , $3]};}
	| EXP '|&' EXP {$$={nombre:'|&',hijos: [$1 , $3]};}
	| EXP '&?' EXP {$$={nombre:'&?',hijos: [$1 , $3]};}
	| EXP '|?' EXP {$$={nombre:'|?',hijos: [$1 , $3]};}
	| EXP '!' EXP {$$={nombre:'!',hijos: [$1 , $3]};}
	| EXP1{$$=$1;};
EXP1 : EXP1 '==' EXP1 {$$={nombre:'==',hijos: [$1 , $3]};}
	| EXP1 '!=' EXP1 {$$={nombre:'!=',hijos: [$1 , $3]};}
	| EXP1 '>' EXP1 {$$={nombre:'>',hijos: [$1 , $3]};}
	| EXP1 '<' EXP1 {$$={nombre:'<',hijos: [$1 , $3]};}
	| EXP1 '>=' EXP1 {$$={nombre:'>=',hijos: [$1 , $3]};}
	| EXP1 '<=' EXP1 {$$={nombre:'<=',hijos: [$1 , $3]};}
	| EXP2{$$=$1;};
EXP2 : EXP2 '+' EXP2 {$$={nombre:'+',hijos: [$1 , $3]};}
	 | EXP2 '-' EXP2 {$$={nombre:'-',hijos: [$1 , $3]};}
	 | EXP2 '*' EXP2 {$$={nombre:'*',hijos: [$1 , $3]};}
	 | EXP2 '/' EXP2 {$$={nombre:'/',hijos: [$1 , $3]};}
	 | EXP2 '%' EXP2 {$$={nombre:'%',hijos: [$1 , $3]};}
	 | EXP2 '^' EXP2 {$$={nombre:'^',hijos: [$1 , $3]};}
	 | '-' EXP2 {$$={nombre:'-',hijos: [$2]};}
	 | EXP3 {$$=$1;};
EXP3 : num {$$={nombre:'valor',tipo:'num', valor : $1};}
	| true {$$={nombre:'valor',tipo:'bool', valor : 'true'};}
	| false {$$={nombre:'valor',tipo:'bool', valor : 'false'};}
	| LIDP {$$=$1;}
	| LLAMADO {$$=$1;}
	| cad {$$={nombre:'valor',tipo:'str', valor : $1};}
	| '(' EXP ')'{$$=$2;}
	| null{$$={nombre:'null'};};

LIDP : LIDP '.' id{$1.hijos.push($3);$$=$1;}
	 | id {$$={nombre:'lidp',hijos:[$1]};};
DECFUN : TFUN LC ':' id '(' LPAR ')' '{' CUERPO '}'
		{
		$$={nombre:'decfun',tipo:$1,valor:$4,hijos:[]};
		if($2 !== null){
		$$.hijos.push($2);
		}else{
		$$.hijos.push($6);
		$$.hijos.push($9);
		}
		};
TFUN : TVAR {$$=$1;}
	  |tvoid{$$='tvoid'};
LC : LCV {$$=$1;}
	| {$$=null;};
LPAR :LPAR ',' TVAR id LC {var v={nombre:$2,tipo:$1,hijos:[$4]};$1.hijos.push(v);$$=$1;}
	 |TVAR id LC {var v={nombre:$2,tipo:$1,hijos:[$3]};$$={nombre:'lpar',hijos:[v]};}
	 |{$$={nombre:'lpar',hijos:[]};};
ASIGNACION : LIDP '=' EXP{$$ = {nombre:'asig',hijos:[$1,$3]};} ;	 
CUERPO : CUERPO SENT{$1.hijos.push($2);$$=$1;}
		|SENT{$$={nombre:'cuerpo',hijos:[$1]};};
SENT : DECVAR{$$=$1;}
	 | DECARR{$$=$1;}
	 | ASIGNACION ';'{$$=$1;}
	 | IF {$$=$1;}
	 | SWITCH {$$=$1;}
	 | BREAK ';' {$$=$1;}
	 | continue ';' {$$={nombre:'continue'};}
	 | RETURN ';' {$$=$1;}
	 | WHILE {$$=$1;}
	 | DOWHILE {$$=$1;}
	 | FOR {$$=$1;}
	 | LOOP {$$=$1;}
	 | COUNT {$$=$1;}
	 | DOWHILEX {$$=$1;}
	 | REPEAT {$$=$1;}
	 | LLAMADO ';' {$$=$1;};	
IF : if '(' EXP ')' then '{' CUERPO '}' ELSE
	 {
	 $$={nombre:'if',hijos:[$3,$7]};
	 if($9!==null){
	 $$.hijos.push($9);
	 }
	 };
ELSE : else '{' CUERPO '}'{$$=$3;}
	 |{$$=null;};
SWITCH : switch '(' EXP ',' MODO ')' '{' CASOS DEFECTO '}'
	   {
	   $$={nombre:'switch',hijos:[$3,$5,$8,$9]};
	   };
MODO : true{$$='true';}
	 | false{$$='false';};
CASOS : CASOS CASO{$1.hijos.push($2);$$=$1;}
	  | CASO {$$={nombre:'casos',hijos:[$1]};};
CASO : case VALCASE ':' CUERPO {$$={nombre:'case',hijos:[$2,$4]};};
VALCASE : EXP{$$=$1;};
DEFECTO : default ':' CUERPO{$$={nombre:'default',hijos:[$3]};}
	    |{$$=null;};
WHILE : while '(' EXP ')' '{' CUERPO '}'{$$={nombre:'while',hijos:[$3,$6]};};
DOWHILE : do '{' CUERPO '}' while '(' EXP ')'{$$={nombre:'dowhile',hijos:[$3,$7]};};
REPEAT : repeat '{' CUERPO '}' until '(' EXP ')'{$$={nombre:'repeat',hijos:[$3,$7]};};
FOR : for '(' VARFOR ';' EXP ';' OPFOR  '{' CUERPO '}'
	{$$={nombre:'for',hijos:[$3,$5,$7,$9]};};
VARFOR : ASIGNACION{$$=$1;}
	   | tnum id '=' EXP
	   {
	   var v= {nombre:'lid',hijos:[$2]};
	   $$={nombre:'dec',tipo:'tnum',hijos:[v,$4]};
	   };
OPFOR : id '+''+' ')'
	  {	  
	  var lidp ={nombre:'lidp',hijos:[$1]};
	  var b={nombre:'valor',tipo:'num', valor : '1'};
	  var suma={nombre:'+',hijos:[lidp,b]};
	  $$ = {nombre:'asig',hijos:[lidp,suma]};
	  }
	  | id '-''-' ')'
	  {	  
	  var lidp ={nombre:'lidp',hijos:[$1]}	;
	  var b={nombre:'valor',tipo:'num', valor : '1'};
	  var resta={nombre:'-',hijos:[lidp,b]};
	  $$ = {nombre:'asig',hijos:[lidp,resta]};
	  };
BREAK : break id{$$={nombre:'break',hijos:[$2]};}
	  | break{$$={nombre:'break',hijos:[]};};
RETURN : return EXP {$$={nombre:'return',hijos:[$2]};}
	   | return{$$={nombre:'return',hijos:[]};};
LOOP : loop id '{' CUERPO '}'{$$={nombre:'loop',valor:$2,hijos:[$4]};};
COUNT : count '(' EXP ')' '{' CUERPO '}'{$$={nombre:'count',hijos:[$3,$6]};};
DOWHILEX : do '{' CUERPO '}' whilex '(' EXP ',' EXP ')'{$$={nombre:'dowhilex',hijos:[$3,$7,$9]};};
LLAMADO : id '(' LPARFUN ')' 
	    {
	    $$={nombre:'llamado',valor:$1,hijos:[$3]};
	    };
LPARFUN : LPARFUN ',' EXP {$1.hijos.push($2);$$=$1;}
		|EXP {$$={nombre:'lparfun',hijos:[$1]};}
		|{$$={nombre:'lparfun',hijos:[]};};
PRINCIPAL : principal '(' ')' '{' CUERPO '}'{$$={nombre:'principal',hijos:[$5]};};
