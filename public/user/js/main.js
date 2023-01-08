function removeProduct(cartId, productId) {
  $.ajax({
    url: "/removeProduct",
    data: {
      cart: cartId,
      product: productId,
    },
    method: "post",
    success: (response) => {
      Swal.fire({
        // title: "Product removed from cart!",
        // icon: "success",
        // confirmButtonText: "continue",
        title: 'Are you sure?',
        text: "Remove item from the cart",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire(
            'Deleted!',
            'Your file has been deleted.',
            'success'
          )
        }
      }).then(function (result) {
        console.log(result)
        location.reload();
      });
    },
  });
}

function addToCart(proId) {
  const value = "sorry !!! currently out of stock";
  $.ajax({
    url: "/addToCart/" + proId,
    method: "get",
    success: (response) => {
      if (response.status) {
        let count = $("#cartCount").html();
        count = parseInt(count) + 1;
        
        $("#cartCount").html(count);
        Swal.fire({
          title: "Added to cart!",
          icon: "success",
          confirmButtonText: "continue",
        }).then(function () {
          location.reload()
        });
        
      }
      if (response.productExist) {
        Swal.fire({
          title: "Product exist in cart!",
          icon: "error",
          confirmButtonText: "continue",
        }).then(function () {
          location.reload()
        });
      }if(response.stock){
        Swal.fire({
          title: "Sorry!!! product out of stock .",
          icon: "error",
          confirmButtonText: "continue",
        }).then(function () {
          location.reload();
        });
      }
    },
  });
}
function changeQuantity(cartId, productId, count) {
  let quantity = parseInt(document.getElementById(productId).value);
  count = parseInt(count);
  console.log('change quantity api called');
  $.ajax({
    url: '/changeQuantity',
    data:{
      cart: cartId,
      product: productId,
      count: count,
      quantity: quantity,
    },
    method: 'post',
    success:(response)=>{
      if (response.status) {
        location.reload()
      }
      if (response.stock) {
        Swal.fire({
          title: "Out of stock!",
          icon: "error",
          confirmButtonText: "continue",
        });
      }
    }
  })
}


function addToWishlist(proId) {
  $.ajax({
    url: "/addToWishlist/" + proId,
    method: "get",
    success: (response) => {
      if (response.status) {
        let count = $("#wishCount").html();
        count = parseInt(count) + 1;
        $("#wishCount").html(count);
        Swal.fire({
          title: "Added to wishlist!",
          icon: "success",
          confirmButtonText: "continue",
        }).then(()=>{
          location.reload()
        });
      }
      if (response.productExist) {
        // Swal(resposnse.message);
        Swal.fire({
          title: "Alredy Exist in wishlist",
          icon: "error",
          confirmButtonText: "continue",
        }).then(()=>{
          location.reload()
        });
        // document.getElementById(proId).innerHTML="product already in wishlist";
        //  location.href = "/cart";
      }
      if (response.cart) {
        //  document.getElementById(proId).innerHTML =
        //    "product already in cart";
        Swal.fire({
          title: "Already Exist cart!",
          text: "Please visit cart",
          icon: "error",
          confirmButtonText: "continue",
        }).then(()=>{
          location.reload()
        });
      }
    },
  });
}

function addToCartWish(proId) {
  const value = "sorry !!! currently out of stock";
  $.ajax({
    url: "/addToCart/" + proId,
    method: "get",
    success: (response) => {
      if (response.status) {
        let count = $("#cartCount").html();
        count = parseInt(count) + 1;
        $("#cartCount").html(count);
        Swal.fire({
          title: "Product added to cart!",
          icon: "success",
          confirmButtonText: "continue",
        }).then(function () {
          location.reload();
        });
      }

      // if (response.stock) {
      //   document.getElementById("message").innerHTML = "Out of stock !!!!!!";
      // }
    },
  });
}
function removeWishlistProduct(wishlistId, productId) {
  $.ajax({
    url: "/removewishlistProduct",
    method: "post",
    data: {
      wishlistId,
      productId,
    },
    success: () => {
      Swal.fire({
        title: "Product removed from wishlist!",
        icon: "success",
        confirmButtonText: "continue",
      }).then(function () {
        location.reload();
      });
    },
  });
}