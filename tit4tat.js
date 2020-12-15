

// TRAP https://github.com/microsoft/vscode/issues/57954



exports.defaultOptions = {
  // when true dont output anything on stdout
  quiet: false,
  // dump some useless debugging msg
  verbose: false,
  // order is either 'fwd' forward (default) or 'bwd' for backward
  order: "fwd",
  // encoding for input/output files
  encoding: "utf-8",
  // transformation rules
  // each rule has 2 terms, "s" the input string and "f" the replacement
  rules: [],
  // replace in place, like sed -i (either set this to true or specify out)
  inplace: false,
  // directory of files to be transformed
  // Warning: absolute path wont work with filters 
  // @see https://github.com/douzi8/file-match/issues/3
  src: "./src",
  // filter filenames (using file-match packages)
  filters: ['**/*'],
  // only apply transformations to text files (using istextorbinary packages)
  text: true,
  // destination of output, when inplace is false
  out: "/tmp"
}


var fs = require('fs');
const path = require('path');
const { isText, isBinary, getEncoding } = require('istextorbinary')


const { exit } = require('process');
//const { option } = require('yargs');
var fileMatch = require('file-match');
const replaceAll = require('string.prototype.replaceall');


/**
 * transform the input using a single rule
 */
function processRule(options, input, ruleIdx) {
    const rule = options.rules[ruleIdx]

    var retVal = null

    if (options.order == 'fwd')
        retVal = replaceAll(input, rule.s, rule.f);

    else if (options.order == 'bwd')
        retVal = replaceAll(input, rule.f, rule.s);
    else 
    throw "options.order? "+options.order
    if (options.verbose) console.log((retVal == input ? "=" : "M") + " processRule #" + ruleIdx + " " + JSON.stringify(rule));
    return retVal

}

/**
 * transform the input using all rules sequentially
 * @param {*} data the string to be transformed
 * @param {*} options 
 
 */
function processString(options, data) {
    var current = data
        //if (options.trace) console.log("current:", current);
    if (options.order == 'fwd') {
        for (var ruleIdx = 0; ruleIdx < options.rules.length; ruleIdx++)
            current = processRule(options, current, ruleIdx)
    } else if (options.order == 'bwd') {
        for (var ruleIdx = options.rules.length - 1; ruleIdx >= 0; ruleIdx--)
            current = processRule(options, current, ruleIdx)

    } else
        throw "order?:" + options.order

    return current
}

/**
 * returns the path file for the given input filename
 * @param {*} options 
 * @param {*} filename 
 */
function getInputPath(options, filename) {
    return options.src + "/" + filename
}

/**
 * returns the destination file for the given input filename
 * also ensures the destination dir exists
 * @param {*} options 
 * @param {*} filename 
 */
function getOutputPath(options, filename) {
    var retVal = null
    if (options.inplace)
        retVal = getInputPath(options, filename)
    else {
        retVal = options.out + "/" + filename
        const parent = path.dirname(retVal)
        fs.mkdirSync(parent, { recursive: true });

    }
    return retVal
}

/**
 * transform a file
 * @param {*} input: name of input file 
 * @param {*} options 
  
 */
function processFile(options, filename) {
    const inputPath = getInputPath(options, filename)
    var modifStatus = null
    if (options.verbose) console.log("processFile", inputPath);
    const outputPath = getOutputPath(options, filename)

    var filter = fileMatch(
        options.filters
    );

    const nameOk = filter(filename);
    const textOk = (!options.text || isText(inputPath))
    if (nameOk && textOk) {
        // transform the file
        const data = fs.readFileSync(inputPath, options.encoding)
        const processed = processString(options, data)
        fs.writeFileSync(outputPath, processed, options.encoding);
        modifStatus = (processed != data) ? "*" : " ";

    } else {
        // just copy binary file
        fs.copyFileSync(inputPath, outputPath)
        modifStatus = " ";
    }



    if (!options.quiet)
        console.log(modifStatus + " " + (textOk ? "t" : "b") + (nameOk ? "i" : "e") + "\t" + filename) //+" -> "+outputPath);

}



/**
 * return all files found in dir
 * 
 * @param {*} options:  not used
 * @param {*} dir 
 */
function listFiles(options, rootDir, dir) {
    if (options.verbose) console.log("listFiles " + rootDir + " + " + dir)
    var retVal = []
    var actual = rootDir + "/" + dir
    const fd = fs.lstatSync(actual)
    if (fd.isDirectory()) {
        var entries = fs.readdirSync(actual);
        for (var i in entries) {
            const entry = dir + "/" + entries[i]
            retVal = retVal.concat(listFiles(options, rootDir, entry))
        }
    } else if (fd.isFile()) {
        retVal.push(dir)
    } else {
        if (!options.quiet) console.log("skipping " + entry)
    }
    return retVal
}

exports.tit4tat=function tit4tat(optionsp) {
    const options = {...exports.defaultOptions, ...optionsp }

    if (!options.inplace && !options.out) {
        throw "out must be defined when inplace is not set"
    }

    // convert to absolute path
    options.src = path.resolve(options.src)
    if (options.out)
        options.out = path.resolve(options.out)

    if (options.verbose) console.log("options:" + JSON.stringify(options, null, 2))


    // ensure the destination dir exists
    if (options.out)
        fs.mkdirSync(options.out, { recursive: true });

    const files = listFiles(options, options.src, '.')
    if (options.verbose) console.log("files: " + files.length)
    for (var i in files) {
        if (options.verbose) console.log("file " + i + "/" + files.length + " " + files[i])
        processFile(options, files[i])
    }


    if (options.verbose) console.log("done")



}

