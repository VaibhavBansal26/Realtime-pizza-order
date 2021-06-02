
const Order = require('../../../models/orderModel')
const moment = require('moment')
const stripe = require('stripe')(process.env.STRIPE_PRIVATE_KEY)

function orderController(){
    return{
        store(req,res){
            const{phone,address,stripeToken,paymentType} = req.body
            if(!phone || !address){
                return res.status(422).json({success:'All fields are required'})

            }
            const order = new Order({
                customerId:req.user._id,
                items:req.session.cart.items,
                phone,
                address
            })
            order.save().then(result =>{
                Order.populate(result,{path:'customerId'},(err,placedOrder)=>{
                    //req.flash('success','Order placed')
                    //Stripe payment
                    if(paymentType === 'card'){
                        stripe.charges.create({
                            amount:req.session.cart.totalPrice * 100,
                            source:stripeToken,
                            currency:'inr',
                            description:`Pizza order:${placedOrder._id}`
                        }).then(()=>{
                            placedOrder.paymentStatus = true;
                            placedOrder.paymentType = paymentType;
                            placedOrder.save().then((r)=>{
                                const eventEmitter = req.app.get('eventEmitter')
                                eventEmitter.emit('orderPlaced',r)
                                delete req.session.cart
                                return res.json({success:'Payment done. Order placed successfully'})
                            }).catch((err)=>{
                                console.log(err)
                            })
                        }).catch((err)=>{
                            console.log(err)
                            delete req.session.cart
                            return res.json({success:'Payment failed . Order placed successfully - pay cash on delivery'})
                        })
                    }
                    //Event Emitter
                    // const eventEmitter = req.app.get('eventEmitter')
                    // eventEmitter.emit('orderPlaced',placedOrder)
                    
                    
                    //return res.redirect('/customer/orders')
                })
            }).catch(err=>{
                //req.flash('error','Something went wrong')
                return res.status(500).json({success:'Something went wrong'})
                //return res.redirect('/cart')
            })
        },
        async index(req,res){
            const orders = await Order.find({customerId:req.user._id},null,{sort:{'createdAt':-1}})
            res.header('Cache-Control', 'no-store')
            res.render('customer/orders',{orders:orders,moment:moment})
            console.log(orders)
        },

        async show(req,res){
            const order = await Order.findById(req.params.id)
            //User authorize
            if(req.user._id.toString() === order.customerId.toString()){
                return res.render('customer/singleOrder',{order})
            }
            return res.redirect('/')
        }
    }
}

module.exports = orderController