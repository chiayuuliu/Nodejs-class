//require兩種寫法,匯入檔案都要用./開頭, 如果匯入內建模組才可以直接用黨名
//要用變數去接,用相對路徑
// 拿到arrow裡面的func, 但也會執行裡面的console
// 個別指定到f1 f3, 因為是obj 名子要設定一樣去接收
const {f1,f3} = require('./arrow-func');

//f2會接受f1 f3, 直接拿到obj
const f2 = require(__dirname + '/arrow-func');


console.log('require:__dirname',__dirname)
console.log(f4(9));
console.log(f5(10));

//f2裡面的f3
console.log(f2.f3(4));


//console.log(f3(2)); // 如果沒有匯出f3會找不到
