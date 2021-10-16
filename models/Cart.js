const db = require('./../modules/connect-mysql');

const tableName = 'carts';
const pkField = 'sid';


class Cart {

    // 預設值是空物件, 設定defaultOb 到data
    constructor(defaultObj={}) {
        // `sid`, `author`, `bookname`, `category_sid`, `book_id`, `publish_date`, `pages`, `price`, `isbn`, `on_sale`, `introduction`
        this.data = defaultObj;
    }
    // 讀取所有資料 + 篩選功能

    static async getList(member_id){
        const sql = `SELECT c.*, p.bookname, p.price FROM carts c 
        JOIN products p 
        ON p.sid=c.product_id
        WHERE member_id=? ORDER BY created_at`;
        const [rs] = await db.query(sql, [member_id]); 
        return rs;
    }



    // 透過商品id 找項目, 參數給0 先給預設值
    static async findItem(member_id=0, product_id=0){
        const sql = `SELECT * FROM ${tableName} WHERE member_id=? AND product_id=?`;
        const [rs] = await db.query(sql, [member_id,product_id]); //把[pk]的值帶入'?'
        if(rs && rs.length===1){
            return rs[0];
        }
        return null; //回傳空值
    }
    

    // 儲存=新增
    // 拿到product物件就可以用這些static方法
    static async add(member_id, product_id, quantity){
        const output = {
            success: false,
            error: ''
        }
        // todo: 三個參數都要有資料判斷
        // 判斷資料是否有重複:如果在購物車資料庫已經有資料就不新增
        if( await Cart.findItem(member_id, product_id, quantity)){
            output.error = "資料重複了"
            return output
        }
        
        const obj = {
            member_id, product_id, quantity
        }

        const sql = `INSERT INTO carts SET ?`;
        const [r] = await db.query(sql, [obj]);
        output.success = !!r.affectedRows ? true : false;
        output.cartList = await Cart.getList(member_id);
        return output;
    }

    // 變更數量
    static async update(member_id, product_id, quantity){
        
    }
    // 移除項目
    static async remove(){
       
    }
    // 清空購物車
    static async clear(){
       
    }
}

module.exports = Cart
