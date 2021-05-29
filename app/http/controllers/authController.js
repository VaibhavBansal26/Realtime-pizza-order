const User =require('../../models/userModel')
const bcrypt = require('bcrypt')
const passport = require('passport')

function authController(){
    return {
        login(req,res){
            res.render('auth/login')
        },
        register(req,res){
            res.render('auth/register')
        },
        postLogin(req,res,next){
            const{email,password} = req.body
            console.log(req.body)
            //Validate request
            if(!email || !password){
                req.flash('error','All fields are reuired')
                return res.redirect('/login')
            }
            passport.authenticate('local',(err,user,info)=>{
                if(err){
                    req.flash('error',info.message)
                    return next(err)
                }
                if(!user){
                    req.flash('error',info.message)
                    return res.redirect('/login')
                }
                req.logIn(user,(err)=>{
                    if(err){
                        req.flash('error',info.message)
                        return next(err)
                    }
                    return res.redirect('/')
                })
            })
            (req,res,next)
        },
        async postRegister(req,res){
            const{name,email,password} = req.body
            console.log(req.body)
            //Validate request
            if(!name || !email || !password){
                req.flash('error','All fields are reuired')
                req.flash('name',name)
                req.flash('email',email)
                return res.redirect('/register')
            }
            //Check if email exist
            User.exists({email:email},(err,result) =>{
                if(result){
                    req.flash('error','All fields are reuired')
                    req.flash('name',name)
                    req.flash('email',email)
                    return res.redirect('/register')
                }
            })
            //Hash password
            const hashedPassword = await bcrypt.hash(password,10)
            //Create a User
            const user = new User({
                name,
                email,
                password:hashedPassword
            })
            user.save().then(()=>{
                //Login user
                return res.redirect('/')
            }).catch(err =>{
                req.flash('error','Something went wrong')
                return res.redirect('/register')
            })
        },
        logout(req,res){
            req.logout()
            return res.redirect('/login')
        }
    }
}

module.exports = authController