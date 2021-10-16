const f1 = a=> a*a;

const f3 = a=>a*a*a;

// console.log(f1(5));
// console.log('arrow',__dirname)

//module.exports = f1; //只有匯出f1

//匯出兩個func EX6寫法
module.exports = {f1,f3}; 
