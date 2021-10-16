const fs = require('fs');

//要寫入的資料
const data = {
    name: 'Doris',
    age:28
};

// 第一個參數(要儲存的檔名), 要儲存的資料格式
fs.writeFile(
    // 用路徑的寫法,路徑+檔名, 跟這支JS相同位置
    //__dirname+'/data.json',
    
    //寫在外面
    'data.json',
    //儲存的資料
    JSON.stringify(data,null,4),

    //callback function
    error=>{
        if(error){
            //如果有錯show錯誤訊息,
            console.log('無法寫入檔案:',error);
            process.exit(); //結束
        }
        console.log('成功')
})

