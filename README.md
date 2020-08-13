# softleader-captcha
SoftLeader Captcha

## Usage

```shell
Usage: index [options] [command]

Options:
  -V, --version     output the version number
  -h, --help        display help for command

Commands:
  render [options]  Render captcha picture
  serve [options]   Start a web server to serve RESTful render api
  help [command]    display help for command
```

### render

```shell
Usage: index render [options]

Render captcha picture

Options:
  -l, --length [length]    Specify the length of captcha. (default: 4)
  -p, --pattern [pattern]  d: all digit, a: all alphabet, da: digit & alphabet. (default: "da")
  -c, --case [case]        u: upper case, l: lower case, ci: case insensitive. (default: "ci")
  --width [width]          Specify the width of image. (default: 100)
  --height [height]        Specify the height of image. (default: 40)
  -o, --output [output]    Write to a file, instead of STDOUT
  -h, --help               display help for command
```

### serve

```shell
Usage: index serve [options]

Start a web server to serve RESTful render api

Options:
  -l, --length [length]              Specify the length of captcha. (default: 4)
  -p, --pattern [pattern]            d: all digit, a: all alphabet, da: digit & alphabet. (default: "da")
  -c, --case [case]                  u: upper case, l: lower case, ci: case insensitive. (default: "ci")
  --width [width]                    Specify the width of image. (default: 100)
  --height [height]                  Specify the height of image. (default: 40)
  --port [port]                      Specify server port. (default: 80)
  -t ,--ttl [ttl]                    Expire time of redis key(unit: seconds). (default: 60)
  --redis-port [redis-port]          redis port (default: 6379)
  --redis-host [redis-host]          redis host (default: "127.0.0.1")
  --redis-password [redis-password]  redis password
  -h, --help                         display help for command
```

## Getting started

### Node.js

如果你的 runtime 環境有 [Node.js](https://nodejs.org/en/) 以及 source code, 你可以在 source code 根目錄執行:

```shell
node index.js -h
```

### Docker

如果你的 runtime 有 [Docker](https://www.docker.com/), 可以執行:

```shell
docker run softleader/captcha -h
```
