#!/usr/bin/env node

const program = require('commander');
const packageJson = require('./package.json');
const captcha = require('./lib/captcha');

program
    .command('render')
    .description('Render captcha picture')
    .option('-l, --length [length]', 'Specify the length of captcha.', 4)
    .option('-p, --pattern [pattern]', 'd: all digit, a: all alphabet, da: digit & alphabet.', 'da')
    .option('-c, --case [case]', 'u: upper case, l: lower case, ci: case insensitive.', 'ci')
    .option('--width [width]', 'Specify the width of image.', 100)
    .option('--height [height]', 'Specify the height of image.', 40)
    .option('-o, --output [output]', 'Write to a file, instead of STDOUT')
    .action(captcha.renderCaptcha);

program
    .command('serve')
    .description('Start a web server to serve RESTful render api')
    .option('-l, --length [length]', 'Specify the length of captcha.', 4)
    .option('-p, --pattern [pattern]', 'd: all digit, a: all alphabet, da: digit & alphabet.', 'da')
    .option('-c, --case [case]', 'u: upper case, l: lower case, ci: case insensitive.', 'ci')
    .option('--width [width]', 'Specify the width of image.', 100)
    .option('--height [height]', 'Specify the height of image.', 40)
    .option('--port [port]', 'Specify server port.', 80)
    // .option('--host [host]', 'Specify server host.', '0.0.0.0')
    .option('-t ,--ttl [ttl]', 'Expire time of redis key(unit: seconds).', 60)
    .option('--redis-port [redis-port]', 'redis port', 6379)
    .option('--redis-host [redis-host]', 'redis host', '127.0.0.1')
    .option('--redis-password [redis-password]', 'redis password')
    .action(captcha.serve);

program
    .version(packageJson.version)
    .parse(process.argv);
