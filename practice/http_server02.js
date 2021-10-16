// 如果有發req進來就寫入檔案 
const http = require('http')

const moment = require('moment-timezone')

const fs = require('fs');

const server = http.createServer((req,res)=>{
    // 設定擋頭 形式 
    res.writeHead(200, {
        'Content-Type': 'text/html'
    });

    // 這個檔案表示瀏覽器送給server的內容
    fs.writeFile(
        'headers.txt',
        JSON.stringify(req.headers,null,4),
        error=>{
            if(error){
                res.end(`<h1>錯誤${error}</h1>`)
            }else{
                res.end(`<h1>ok123</h1>`)
            }
        }
    )
})

//server.listen(3000); //port號
server.listen(3000, ()=>{
    const fm = 'YYYY-MM-DD HH:mm:ss';
    console.log(`啟動: 3000`, moment().format(fm));

});