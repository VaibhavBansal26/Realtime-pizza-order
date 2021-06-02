import axios from 'axios';
import Noty from 'noty';
import moment from 'moment'
import {loadStripe} from '@stripe/stripe-js';
import { placeOrder } from './apiService';
import { CardWidget } from './cardWidjet';



export async function initStripe(){
    //STRIPE PAYMENT    
    const stripe = await loadStripe('pk_test_51GuCxhGAvbykC2XsnqXirqsc72g94NYqbgF0jUu2TKyoe70pFUhspD0WfwV7aieZqX1M3GxK4GlSJrSYwomzx2Nj00uII6fRQZ');
   
    let card = null;
    // function mountWidget() {
    //         const elements = stripe.elements()

    //     let style = {
    //         base: {
    //         color: '#32325d',
    //         fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
    //         fontSmoothing: 'antialiased',
    //         fontSize: '16px',
    //         '::placeholder': {
    //             color: '#aab7c4'
    //         }
    //         },
    //         invalid: {
    //         color: '#fa755a',
    //         iconColor: '#fa755a'
    //         }
    //     };

    //     card = elements.create('card', { style, hidePostalCode: true })
    //     card.mount('#card-element')
    // }



    const paymentType = document.querySelector('#paymentType');
    paymentType?.addEventListener('change',(e)=>{
        console.log(e.target.value)
        if(e.target.value === 'card'){
            card = new CardWidget(stripe)
            card.mount()
        }else{
            card.destroy()
        }
    })

    //AJAX CALL
    const paymentForm = document.querySelector('#payment-form')
    paymentForm?.addEventListener('submit',async(e) => {
        e.preventDefault();
        let formData = new FormData(paymentForm)
        let formObject = {}
        for(let [key,value] of formData.entries()){
            formObject[key] = value
        }
        console.log(formObject)
        //Verify card
        if (!card) {
            // Ajax
            placeOrder(formObject);
            return;
        }

        const token = await card.createToken()
        formObject.stripeToken = token.id;
        placeOrder(formObject);

        
    })
}