# tit4tat

Simple utility to replace strings in text files. The replacements are meant to be reversible.

E.g. usages:

* Comment/uncomment log statements
* Cheap obfuscation of variable/function names  

## Install

    $ npm i --save-dev tit4tat

## How to use

* The replacement rules must be defined in a json file specified with --config.  E.g. to replace all occurences of AAA  by BBB:
<pre>
    {"rules":[
        {"s":"AAA",
         "f":"BBB" }
    ]}
</pre>
  
* by default --order=fwd, each rule replaces all occurence of s by f, and the rules are  applied in sequence,

* If you want to perform the reverse operation, --order=bwd will cause the rules to be applied in reverse sequence and replacing rule.f by rule.s

.. that's it

## Simple example: 

How to comment/uncomment console.log lines. (it wont work for multi-line statements)


unlog.json :

    {
    
    "rules":[{
        "s":"console.log",
        "f":"//UNLOGconsole.log"
        }
    ]
    }

Comment out the console.log lines in all text files found in src folder

    $ node_modules/tit4tat/bin/tit4tat-cli.js --src=src --inplace --config=unlog.json


Restore the console.log statements:
<pre>
$ node_modules/tit4tat/bin/tit4tat-cli.js --src=src --inplace --config=unlog.json  <b>--order bwd</b>
</pre>





## Explanation of default output ##
<pre>
    reading options from tools/obfuscate-dist.json  
    src:dist/          <i> <-- out directory not shown coz --inplace=true </i>
    * ti	./bundle.js
      ti	./index.html
<i>
    ^ ^^
    | ||
    | | \
    | |  File was <b>(i)</b>ncluded or<b>(e)</b>xcluded by filters test
    | \
    |  File type is either <b>(t)</b>ext or <b>(b)</b>inary
    \
     A * in first col indicates that a replacement rule was applied
</i>     
</pre>





## Options ##
 
    
    $ node node_modules/tit4tat/bin/cli.js --help

    Input selection:
    --src      src folder                                [string] [default: "src"]
    --filters  one or more filename filters, e.g. **/*.js                  [array]
    --text     only transform text files               [boolean] [default: "true"]

    Output selection:
    --inplace  in place replacement (like sed -i)      [boolean] [default: "true"]
    --out      output folder used when --inplace=false  [string] [default: "/tmp"]

    Transformation:
    --order     replacement order: fwd will replace occurences of rule.s by rule.f
                                [string] [choices: "fwd", "bwd"] [default: "fwd"]
    --encoding  encoding for text files                [string] [default: "utf-8"]
    --config    configuration input file                       [string] [required]

    Options:
    --help                                    Show help                  [boolean]
    --version                                 Show version number        [boolean]
    --verbose                                 dumps useless traces
                                                        [boolean] [default: false]
    --quiet                                   dont dump anything on stdout
                                                        [boolean] [default: false]

The json config file can specify the same options as the command line args. e.g.

    {
       'text':false,
       'inplace':true,
        ...


