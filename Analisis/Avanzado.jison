/*Analisis Lexico*/
%lex
%%
\s+                   /* espacios en blanco se ignoran */
\r                   /* espacios en blanco se ignoran */
\n                   /* espacios en blanco se ignoran */
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
"principal"			  return 'principal'
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
BASIC : BASIC BSENT
	   | BSENT {$$=$1;};
BSENT : DECVAR {$$=$1;}
	   | DECFUN {$$=$1;}
	   | DECARR {$$=$1;}
	   | PRINCIPAL;
DECVAR : TVAR LIDC VALVAR ';' {$$={nombre:'dec',tipo:$1,hijos:[$2,$3]};};
TVAR : tbool {$$='tbool';}
	  |tnum {$$='tnum';}
	  |tstr {$$='tstr'}
	  |id {$$=$1;};
LIDC : LIDC ',' id {$1.hijos.push($3);$$=$1;}
	 | id {$$={nombre:'lid',hijos:[$1]};};
VALVAR : ':' EXP {$$=$2;}
       | {$$=null;};
DECARR : array ':' id LCV of TVAR ';'{$$={nombre:'array',tipo:$6,valor:$3,hijos:[$4]};};
LCV : LCV '[' INDICE ']'{$1.hijos.push($3);$$=$1;}	
	| '[' INDICE ']'{$$={nombre:'lcv',hijos:[$2]};};
INDICE : EXP '..' EXP 
	   | EXP
	   |;
EXP : EXP '||' EXP {$$={nombre:'||',hijos: [$1 , $3]};}
	| EXP '&&' EXP {$$={nombre:'&&',hijos: [$1 , $3]};}
	| EXP '|&' EXP {$$={nombre:'|&',hijos: [$1 , $3]};}
	| EXP '&?' EXP {$$={nombre:'<&?',hijos: [$1 , $3]};}
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
	 | EXP3;
EXP3 : num {$$={nombre:'valor',tipo:'num', valor : $1};}
	| true {$$={nombre:'valor',tipo:'bool', valor : 'true'};}
	| false {$$={nombre:'valor',tipo:'bool', valor : 'false'};}
	| id {$$={nombre:'valor',tipo:'id', valor : $1};}
	| cad {$$={nombre:'valor',tipo:'cad', valor : $1};}
	| '(' EXP ')'{$$=$2;};       
DECFUN : TFUN ':' id '(' LPAR ')' '{' CUERPO '}'
		{
		$$={nombre:'decfun',tipo:$1,valor:$3,hijos:[$5,$8]};
		};
TFUN : TVAR LC
	  |tvoid{$$='tvoid'};
LC : LCV
	|;
LPAR :LPAR ',' TVAR id{var v={nombre:$2,tipo:$1};$1.hijos.push(v);$$=$1;}
	 |TVAR id{var v={nombre:$2,tipo:$1};$$={nombre:'lpar',hijos:[v]};}
	 |{$$={nombre:'lpar'};};
ASIGNACION : id '=' EXP{$$ = {nombre:'asig',hijos:[$1,$3]};} ;	 
CUERPO : CUERPO SENT{$1.hijos.push($2);$$=$1;}
		|SENT{$$={nombre:'cuerpo',hijos:[$1]};};
SENT : DECVAR{$$=$1;}
	 | DECARR{$$=$1;}
	 | ASIGNACION ';'
	 | IF	 
	 | SWITCH
	 | BREAK ';'
	 | continue ';'
	 | RETURN ';'
	 | WHILE
	 | DOWHILE
	 | FOR
	 | LOOP
	 | COUNT
	 | DOWHILEX
	 | REPEAT;	
IF : if '(' EXP ')' then '{' CUERPO '}' ELSE;
ELSE : else '{' CUERPO '}'
	 |;
SWITCH : switch '(' EXP ',' MODO ')' '{' CASOS DEFECTO '}';
MODO : true
	 | false;
CASOS : CASOS CASO
	  | CASO;
CASO : case VALCASE ':' CUERPO;
VALCASE : EXP;
DEFECTO : default ':' CUERPO
	    |;
WHILE : while '(' EXP ')' '{' CUERPO '}';
DOWHILE : do '{' CUERPO '}' while '(' EXP ')';
REPEAT : repeat '{' CUERPO '}' until '(' EXP ')';
FOR : for '(' VARFOR ';' EXP ';' id OPFOR ')' '{' CUERPO '}';
VARFOR : id '=' EXP
	   | tnum id '=' EXP;
OPFOR : '+''+'
	  | '-''-';
BREAK : break id
	  | break;
RETURN : return EXP
	   | return;
LOOP : loop id '{' CUERPO '}';
COUNT : count '(' EXP ')' '{' CUERPO '}';
DOWHILEX : do '{' CUERPO '}' whilex '(' EXP ',' EXP ')';
PRINCIPAL : principal '(' ')' '{' CUERPO '}';
