const commander = require("commander");
const program = new commander.Command();

program.storeOptionsAsProperties(true);

program
  .requiredOption("-s, --shift <type>")
  .option("-i, --input <type>")
  .option("-o, --output <type>")
  .requiredOption("-a, --action <type>", "");

program.parse(process.argv);

if (program.action === "encode") {
  program.shift = parseInt(program.shift, 10);
}
if (program.action === "decode") {
  program.shift = -1 * parseInt(program.shift, 10);
}

if (program.action !== "encode" && program.action !== "decode") {
  process.stderr.write("ACTION ERROR: input encode or decode as action \n");
  process.exit(1);
}

if (isNaN(program.shift)) {
  process.stderr.write("SHIFT ERROR, input shift as a number \n");
  process.exit(1);
}

const { pipeline, Transform } = require("stream");

const fs = require("fs");

let input_stream, output_stream;

//===================== CAESAR CIPHER FUNCTION === start

function CaesarCipher(str, offset) {
  let charArray = str.split("");
  let result = charArray
    .map(function (char) {
      return shiftChar(char, offset);
    })
    .join("");

  function shiftChar(char, offset) {
    let isAlpha = /[A-z]/;

    if (isAlpha.test(char)) {
      char = String.fromCharCode(char.charCodeAt(0) + offset);
      if ((char > "Z" && char < "a") || char > "z")
        char = String.fromCharCode(char.charCodeAt(0) - 26);
    }
    return char;
  }
  return result;
}

//===================== CAESAR CIPHER FUNCTION === end

const { StringDecoder } = require("string_decoder");

// Handle the raw output from standard input
// (characters, not lines, as is the default).
process.stdin.setRawMode(true);
process.stdin.resume();

class CaesarCharacters extends Transform {
  constructor(options) {
    super(options);

    // The stream will have Buffer chunks. The
    // decoder converts these to String instances.
    this._decoder = new StringDecoder("utf-8");
  }

  _transform(chunk, encoding, callback) {
    // Convert the Buffer chunks to String.
    if (encoding === "buffer") {
      chunk = this._decoder.write(chunk);
    }

    // Use CaesarCipher function
    if ((chunk >= "a" && chunk <= "z") || (chunk >= "A" && chunk <= "Z")) {
      chunk = CaesarCipher(chunk, program.shift);
    }

    // Pass the chunk on.
    callback(null, chunk);
  }
}

const transform_stream = new CaesarCharacters();

if (program.input !== "" && program.output !== "") {
  input_stream = fs.createReadStream(__dirname + "/" + program.input);
  output_stream = fs.createWriteStream(__dirname + "/" + program.output);
  pipeline(input_stream, transform_stream, output_stream, (err) => {
    if (err) {
      console.log("Pipeline failed: ");
    } else {
      console.log("Pipeline succeeded.");
      output_stream.end();
      process.exit(1);
    }
  });
}

if (program.input === "" && program.output === "") {
  let stdin = process.stdin;

  // without this, we would only get streams once enter is pressed
  stdin.setRawMode(true);

  // resume stdin in the parent process (node app won't quit all by itself
  // unless an error or process.exit() happens)
  stdin.resume();

  stdin.setEncoding("utf8");

  // on any data into stdin
  stdin.on("data", function (key) {
    // ctrl-c ( end of text )
    if (key === "\u0003") {
      process.exit();
    }

    key = CaesarCipher(key, program.shift);
    // write the key to stdout all normal like
    process.stdout.write(key);
  });
}

var stdin = process.stdin;

// without this, we would only get streams once enter is pressed
stdin.setRawMode(true);

// resume stdin in the parent process (node app won't quit all by itself
// unless an error or process.exit() happens)
stdin.resume();

// i don't want binary, do you?
stdin.setEncoding("utf8");

// on any data into stdin
stdin.on("data", function (key) {
  // ctrl-c ( end of text )
  if (key === "\u0003") {
    process.exit();
  }
  // write the key to stdout all normal like
  process.stdout.write(key);
});
