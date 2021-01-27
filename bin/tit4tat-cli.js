#! /usr/bin/env node

const fs = require('fs');
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const tit4tat = require('../tit4tat')

// -- command line --------------------------------------------------------

// All the command line flags translate into options
// except the --config flag which is used to load a json config file  containing options

// 1 initialize options
var options = tit4tat.defaultOptions

// 2 parse the cmd line args
const cmdLineArgs = yargs(hideBin(process.argv))
    //.command(['fwd', '$0'], 'replace in forward fashion i.e. s->f'), 
    //.command(['bwd'], 'replace in backward fashion f->s',) 
    .option('order', {

        describe: 'replacement order',
        default: options.order,
        type: 'string',
        choices: ['fwd', 'bwd']
    })
    .option('encoding', {

        default: options.encoding,
        describe: 'encoding for text files',
        type: 'string'
    })
    .option('overwrite', {

        default: options.overwrite,
        describe: 'in place replacement (like sed -i)',
        type: 'boolean'
    })
    .array("filters")
    .describe("filters", "one or more filename filters, e.g. **/*.js")
    .option('verbose', {
        describe: 'dumps useless traces',
        default: options.verbose,
        type: 'boolean'
    })
    .option('quiet', {
        describe: 'dont dump anything on stdout',
        default: options.quiet,
        type: 'boolean'
    })
    .option('text', {
        describe: 'only transform text files',
        default: options.text,
        type: 'boolean'
    })
    .option('src', {

        describe: 'src folder',
        default: options.src,
        type: 'string'
    })
    .option('out', {
        describe: 'output folder used when --overwrite=false',
        default:options.out,
        type: 'string'
    })
    .option('config', {
        describe: 'configuration input file',

        type: 'string'
    })
    .group(['src', 'filters', 'text'], 'Input selection:')
    .group(['overwrite', 'out'], 'Output selection:')
    .group(['order', 'encoding', 'config'], 'Transformation:')
    .demandOption(['config'], 'Please provide a config file for rules e.g. --config=rules.json')
    .epilog(
        "Notes: "+
        "\nThe replacement rules must be defined in a separate config file specified with --config "+
        '\e.g. {"rules":[{"s":"AAA","f":"BBB" }]} will cause all occurences of AAA to be replaced by BBB.'+
        "\n\nWhen --order=fwd (default) the rules are applied in sequence, and each rule replaces all occurences of s by f."+
        " The reverse operation is --order=bwd."+
    '')
    .argv

options = {...options, ...cmdLineArgs }
if (options.verbose) console.log("cmdLineArgs:" + JSON.stringify(cmdLineArgs))

// 3 overwrite options with file content
const optionsFile = cmdLineArgs.config
if (optionsFile) {
    if (!options.quiet) console.log("reading options from " + optionsFile)
    const optionsFromFile = JSON.parse(fs.readFileSync(optionsFile, 'utf8'))
    options = {...options, ...optionsFromFile }
}

// 4 overwrite options (again) with cmd line args
options = {...options, ...cmdLineArgs }

if (!options.quiet) {
    console.log("src:" + options.src)
    if (!options.overwrite)
        console.log("out:" + options.out)
}
if (options.trace) console.log("optionsArgs:" + JSON.stringify(options, null, 2))

tit4tat.tit4tat(options)
    //console.log("after")