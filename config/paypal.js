const paypal = require('paypal-rest-sdk')


paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AQ-OburJQB0-yU-96w1Fg64wrKFU-S_CwLAM01zFOtDWxknlfrHcfngpLPMOUVh_SL8e4XFvNnXPeRpz',
    'client_secret': 'EKL1j25QxZ-lpzL9TXEEn1Vst2haXya8dtB20qrfQKxhWqrKPIKmSd3Effg9zylTDKF8IXaNEBahWpfH'
  });



  

  const create_payment_json = {
    "intent": "sale",
    "payer": {
      "payment_method": "paypal"
    },
    "redirect_urls": {
      "return_url": "http://localhost:8080/successpay",
      "cancel_url": "http://localhost:8080/checkout"
    },
    "transactions": [{
      "item_list": {
        "items": [{
          "name": "item",
          "sku": "item",
          "price": '456',
          "currency": "USD",
          "quantity": 1
        }]
      },
      "amount": {
        "currency": "USD",
        "total": '456'
      },
      "description": "This is the payment description."
    }]
  };
  let a=paypal.payment.create(create_payment_json, async function (error, payment) {
    

    if (error) {
      throw error;
    } else {
      for (let i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === "approval_url") {
          res.redirect(payment.links[i].href);
          // console.log(payment.links[i].rel);

         






        }
      }
    }
  });


