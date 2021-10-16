const moment = require('moment-timezone')

const http = require('http'),
    fs = require('fs');

    http.createServer((request, response)=>{
        
        fs.readFile(__dirname+'/read.text', (error, data)=>{

        if(error) {
            response.writeHead(500, {'Content-Type': 'text/plain'});
            response.end('500 -read.text not found');
        } else {
            response.writeHead(200, {'Content-Type': 'text/html'});
            response.end(data);
        }
    });
}).listen(3000);
const fm = 'HH:mm:ss';
console.log('啟動3000 on',moment().format(fm))
