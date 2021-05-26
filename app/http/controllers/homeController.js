
const Menu = require('../../models/menuModel')

function homeController(){
    return {
        async index(req,res){
            const pizzas = await Menu.find()
            return res.render('home',{pizzas:pizzas})
        }
    }
}

module.exports = homeController


//Menu.find().then(function(pizzas){
    //     console.log(pizzas)
    //     return res.render('home',{pizzas:pizzas})
    // })