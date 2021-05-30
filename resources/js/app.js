import axios from 'axios';
import Noty from 'noty';
import moment from 'moment'
import {initAdmin} from './admin'

let addToCart = document .querySelectorAll('.add-to-cart');
let cartCounter = document.querySelector('#cartCounter')

function updateCart(pizza){
    axios.post('/update-cart',pizza).then( res => {
        console.log(res)
        cartCounter.innerText = res.data.totalQty
        new Noty({
            type:'success',
            timeout:1000,
            text:'Item added to cart'
        }).show();
    }).catch(err =>{
        new Noty({
            type:'error',
            timeout:1000,
            text:'Something went wrong'
        }).show();
    })
}


addToCart.forEach((btn) => {
    btn.addEventListener('click',(e) => {
        let pizza  = JSON.parse(btn.dataset.pizza)
        updateCart(pizza)
        console.log(pizza)
    })
})

const alertMessage = document.querySelector('#success-alert')
if(alertMessage){
    setTimeout(()=>{
        alertMessage.remove()
    },2000)
}




//Rendering updated status
let statuses = document.querySelectorAll('.status_line')
let hiddenInput = document.querySelector('#hiddenInput')
let order = hiddenInput ? hiddenInput.value : null
order = JSON.parse(order)

let time = document.createElement('small')

console.log(order)
function updateStatus(order){
    statuses.forEach((status)=>{
        status.classList.remove('step-completed')
        status.classList.remove('current')
    })
    let stepCompleted = true; 
    statuses.forEach((status) => {
        let dataProp = status.dataset.status
        if(stepCompleted){
            status.classList.add('step-completed')
        }
        if(dataProp === order.status){
            stepCompleted = false
            time.innerText = moment(order.updatedAt).format('hh:mm A')
            status.appendChild(time)
            if(status.nextElementSibling){
                status.nextElementSibling.classList.add('current')
            }
            
        }
    })
}

updateStatus(order);

//Socket
let socket  = io()

//Join - create Room(private room)
if(order){
    socket.emit('join',`order_${order._id}`)
}


let adminAreaPath = window.location.pathname
if(adminAreaPath.includes('admin')){
    initAdmin(socket)
    socket.emit('join','adminRoom')
}


socket.on('orderUpdated',(data)=>{
    const updatedOrder = {...order}
    updatedOrder.updatedAt = moment().format()
    updatedOrder.status = data.status
    updateStatus(updatedOrder)
    //console.log(data)
    new Noty({
        type:'success',
        timeout:1000,
        text:'Order Updated'
    }).show();
})



