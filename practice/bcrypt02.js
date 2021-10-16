const bcrypt = require('bcryptjs');
const { data } = require('jquery');

// 測試時間差
(async ()=>{

    const t1 = Date.now();
    
    const hash2 = await bcrypt.hash('doris',8)
    console.log(`hash2:${hash2}`);
    const t2 = Date.now();
    console.log(t2-t1)


    const hash3 = await bcrypt.hash('doris',12)
    console.log(`hash3:${hash3}`);
    const t3 = Date.now();
    console.log(t3-t2)

})();