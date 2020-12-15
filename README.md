# tit4tat

simple utility to replace strings in text files.

install:

    npm i --save-dev tit4tat


options:

    node node_modules/tit4tat/bin/cli.js --help


usage:

    node_modules/tit4tat/bin/cli.js --config unlog.json


e.g. unlog.json :

    {
    
    "rules":[{
        "s":"console.log",
        "f":"//UNLOGconsole.log"
        }
    ]
    }




