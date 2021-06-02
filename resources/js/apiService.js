import axios from 'axios';
import Noty from 'noty';
import moment from 'moment'

export function placeOrder(formObject){
    axios.post('/orders',formObject).then((res)=>{
        console.log(res.data)
        new Noty({
            type:'success',
            timeout:1000,
            text:res.data.success
        }).show();
        setTimeout(()=>{
            window.location.href = '/customer/orders'
        },1000)
    }).catch((err)=>{
        console.log(err)
        new Noty({
            type:'error',
            timeout:1000,
            text:'Something went wrong'
        }).show();
    })
}