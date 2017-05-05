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
"&?"                  return '&?'
"||"                  return '||'
"|&"                  return '|&'
"!"                   return '!'
"bool"				  return 'tbool'
"str"				  return 'tstr'
"num"				  return 'tnum'
"void"				  return 'tvoid'
"num"				  return 'tnum'
"array"				  return 'array'
"element"				  return 'element'
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
INICIO : LELEM EOF
	   {
	   	return $1;
	   };
LELEM : LELEM ELEM {$1.hijos.push($2);$$=$1;}
	   | ELEM {$$={nombre:'elementos',hijos:[$1]};};
ELEM : element ':' id '{' CELEM '}'
       {
         $$={nombre:'element',valor:$3,hijos:[$5]};
       };
CELEM :CELEM SENT {$1.hijos.push($2); $$=$1;}
       |SENT{$$={nombre:'cuerpo',hijos:[$1]};};
SENT : DECVAR {$$=$1;}
	   | DECARR {$$=$1;}
     | ELEM {$$=$1;};
DECVAR : TVAR LIDC VALVAR ';' {$$={nombre:'dec',tipo:$1,hijos:[$2,$3]};};
TVAR : tbool {$$={tipo:'bool'};}
	  |tnum {$$={tipo:'num'};}
	  |tstr {$$={tipo:'str'};}
	  |id {$$={tipo:'id',hijos:$1};};
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
	| '!' EXP {$$={nombre:'!',hijos: [$2]};}
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
LC : LCV {$$=$1;}
	| {$$=null;};
