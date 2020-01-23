const simpleParser = require('mailparser').simpleParser;

simpleParser(source, options, (err, parsed) => {});



let parsed = await simpleParser(source);