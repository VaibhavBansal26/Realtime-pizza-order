const Order = require('../../../models/orderModel')

function adminOrderController(){
    return{
        index(req,res){
            Order.find({status:{$ne:'completed'}},null,{sort:{'createdAt':-1}})
            .populate('customerId','-password').exec((err,orders)=>{
                if(req.xhr){
                    return res.json(orders)
                }else{
                    return res.render('admin/adminOrder',{orders:orders})
                }
            })
        }
    }
}

module.exports = adminOrderController