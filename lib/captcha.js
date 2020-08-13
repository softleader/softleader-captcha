const Canvas = require('canvas');
const {v4: uuidv4} = require('uuid');
const redis = require("redis");
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');

exports.serve = (options) => {
    const app = express();

    app.listen(options.port, () => {
        console.log(`Listening on port ${options.port}...`);
    });

    app.use(bodyParser.json());

    app.post('/render', (req, res) => {
        let ttl = req.query.ttl || options.ttl;
        let length = req.query.length || options.length;
        let pattern = req.query.pattern || options.pattern;
        let alphabetCase = req.query.case || options.case;
        let width = options.width
        let height = options.height
        console.log('rendering captcha:', {ttl, length, pattern, alphabetCase, width, height})

        let answer = generateAnswer(pattern, alphabetCase, length);
        console.log('generated answer:', answer);

        let count = 1;
        const redisClient = redis.createClient(options.redisPort, options.redisHost, {password: options.redisPassword});
        redisClient.on("error", function (error) {
            console.error(error);
        });

        saveRedisAsync(redisClient, answer, ttl, count, width, height, res);
    });

    app.delete('/:token/:answer', (req, res) => {
        const token = req.params.token;
        const answer = req.params.answer;
        console.log('check captcha answer than delete:', {token, answer})

        const client = redis.createClient(options.redisPort, options.redisHost, {password: options.redisPassword});
        client.get(mapToKey(token), (err, reply) => {
            if (err) throw err
            if (reply) {
                if (reply === answer) {
                    res.status(200).send()
                } else {
                    res.status(400).send()
                }
                // 無論比對結果如何，都將redis answer清掉
                client.del(mapToKey(token), (err, reply) => {
                    console.log('del key reply:', reply)
                    client.quit(() => console.log('redis client close connection.'));
                });
            } else {
                // redis找不到key，回傳404
                res.status(404).send()
                client.quit(() => console.log('redis client close connection.'));
            }
        });

    })

    // app.get('/:token', (req, res) => {
    //     const token = req.params.token;
    //     console.log('check redis key:', {token})
    //
    //     const client = redis.createClient(options.redisPort, options.redisHost, {password: options.redisPassword});
    //     client.get(mapToKey(token), (err, reply) => {
    //         if (err) throw err
    //         if (reply) {
    //             res.status(200).send()
    //         } else {
    //             // redis找不到key，回傳404
    //             res.status(404).send()
    //         }
    //         client.quit(() => console.log('redis client close connection.'))
    //     });
    // })
}

saveRedisAsync = (redisClient, answer, ttl = 60, count, width, height, clientResponse) => {
    if (count > 10) {
        clientResponse.status(500).send('reach generate token max limit');
        redisClient.quit(() => console.log('redis client close connection.'))
    }

    let token = generateToken();
    console.log('generated redis key:', token);

    redisClient.exists(token.key, (err, res) => {
        if (err) throw err
        if (res === 1) {
            saveRedisAsync(redisClient, answer, ttl, count + 1, width, height, clientResponse);
        } else {
            redisClient.set(token.key, answer, 'EX', ttl, redis.print);
            // 印出存進去的答案
            redisClient.get(token.key, redis.print);

            let dataURL = renderPic(answer, width, height).toDataURL();
            clientResponse.set('X-Captcha-Token', token.token);
            clientResponse.send(dataURL);
            redisClient.quit(() => console.log('redis client close connection.'))
        }
    })
}

generateToken = () => {
    let token = uuidv4().replace(/-/g, '');
    return {
        token,
        key: mapToKey(token)
    }
}

mapToKey = (token) => {
    return `softleader:captcha:${token}`;
}

exports.renderCaptcha = (options) => {
    let width = options.width;
    let height = options.height;
    let alphabetCase = options.case;
    let pattern = options.pattern;
    let answer = generateAnswer(pattern, alphabetCase, options.length);
    console.log('generated answer:', answer);
    let pic = renderPic(answer, width, height)
    if (options.output) {
        downloadImage(pic, options.output);
    } else {
        console.log(pic.toDataURL())
    }
}

saveRedis = (port = '6379', host = '127.0.0.1', password, key, answer, expireTime = 60) => {
    const client = redis.createClient(port, host, {password: password});
    client.on("error", function (error) {
        console.error(error);
    });

    client.exists(key, (err, res) => {
        if (err) throw err
        if (res === 1) {
            throw 'exist key'
        } else {
            client.set(key, answer, 'EX', expireTime, redis.print);
            client.get(key, redis.print);
            client.quit(() => console.log('redis client close connection.'))
        }
    })
}

renderPic = (token, width, height) => {
    let createdCanvas = Canvas.createCanvas(width, height);
    // 獲取該canvas的2D繪圖環境對象
    let ctx = createdCanvas.getContext('2d');
    drawContent(ctx, token, width, height);
    drawInterferenceLine(ctx, width, height);
    drawInterferenceDot(ctx, width, height);
    return createdCanvas;
}

randomColor = (min, max) => {
    let r = randomNum(min, max);
    let g = randomNum(min, max);
    let b = randomNum(min, max);
    return "rgb(" + r + "," + g + "," + b + ")";
}

randomNum = (min, max) => {
    return Math.floor(Math.random() * (max - min) + min);
}

downloadImage = (codeImage, output) => {
    let out = fs.createWriteStream(output);
    let pngStream = codeImage.createPNGStream();
    pngStream.on('data', (chunk => out.write(chunk)))
    pngStream.on('end', () => console.log(`saved png to ${output}`))
}

generateAnswer = (pattern, alphabetCase, length) => {
    let charPool = createCharPool(pattern, alphabetCase);
    return [...Array(length).keys()].map((i) => charPool[randomNum(0, charPool.length)]).join('');
}

createCharPool = (pattern, alphabetCase) => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const digit = '123456789';
    switch (pattern) {
        case 'd':
            return '123456789';
        case 'a':
            if ('u' === alphabetCase) {
                return alphabet;
            } else if ('l' === alphabetCase) {
                return alphabet.toLowerCase();
            } else {
                return alphabet + alphabet.toLowerCase();
            }
        case 'da':
        default:
            if ('u' === alphabetCase) {
                return alphabet + digit;
            } else if ('l' === alphabetCase) {
                return alphabet.toLowerCase() + digit;
            } else {
                return alphabet + alphabet.toLowerCase() + digit;
            }
    }
}

drawContent = (ctx, token, width, height) => {
    ctx.textBaseline = 'middle';
    // 繪製背景色，顏色若太深可能導致看不清
    ctx.fillStyle = randomColor(180, 255);
    // 畫出矩形，要記得ctx.fillStyle放在ctx.fillRect哦。
    ctx.fillRect(0, 0, width, height);
    let code = '';
    // 生成指定位數的驗證碼。
    for (let i = 0; i < token.length; i++) {
        // 隨機獲取str的一個元素。
        let txt = token.charAt(i);
        // 隨機生成字體顏色
        ctx.fillStyle = randomColor(50, 160);
        // 隨機生成字體大小
        ctx.font = randomNum(25, 30) + 'px SimHei';
        ctx.shadowOffsetY = randomNum(-3, 3);
        ctx.shadowBlur = randomNum(-3, 3);
        ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
        let x = width / (parseInt(token.length) + 1) * (i + 1);
        let y = height / 2;
        // 隨機生成旋轉角度。
        let deg = randomNum(-30, 30);
        // 修改坐標原點和旋轉角度
        // 平移元素
        ctx.translate(x, y);
        // 旋轉元素
        ctx.rotate(deg * Math.PI / 180);
        ctx.fillText(txt, 0, 0);
        // 恢復坐標原點和旋轉角度
        ctx.rotate(-deg * Math.PI / 180);
        ctx.translate(-x, -y);
    }
    return code;
}

drawInterferenceLine = (ctx, width, height) => {
    // 干擾線顏色
    ctx.strokeStyle = randomColor(40, 180);
    // 開始繪製
    ctx.beginPath();
    // 起點位置
    ctx.moveTo(randomNum(0, width), randomNum(0, height));
    // 終點位置
    ctx.lineTo(randomNum(0, width), randomNum(0, height));
    ctx.stroke();
}

drawInterferenceDot = (ctx, width, height) => {
    for (let i = 0; i < width / 6; i++) {
        ctx.fillStyle = randomColor(0, 255);
        ctx.beginPath();
        ctx.arc(randomNum(0, width), randomNum(0, height), 1, 0, 2 * Math.PI);
        ctx.fill();
    }
}