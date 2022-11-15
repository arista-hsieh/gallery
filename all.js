const productWrap = document.querySelector(".productWrap");
const productSelect = document.querySelector(".productSelect");
const cartList = document.querySelector(".shoppingCart-tableList");
const discardAllBtn = document.querySelector(".discardAllBtn");
const total = document.querySelector(".js-total")
const order = document.querySelector(".orderInfo-btn")
let productData = [];
let cartData = [];
function productList(){
    axios.get('https://livejs-api.hexschool.io/api/livejs/v1/customer/arista/products')
    .then(function (response) {
    // handle success
    productData = response.data.products;
    renderProductList();
    })
    .catch(function (error) {
    // handle error
    console.log(error);
    })
    .then(function () {
    // always executed
    });
}
function renderProductList(){
    let str = "";
    productData.forEach(function(item){
        str +=`<li class="productCard">
        <h4 class="productType">新品</h4>
        <img src="${item.images}" alt="">
        <a href="#" class="addCardBtn" data-id="${item.id}">加入購物車</a>
        <h3>${item.title}</h3>
        <del class="originPrice">NT$${toThousands(item.origin_price)}</del>
        <p class="nowPrice">NT$${toThousands(item.price)}</p>
    </li>`
    })
    productWrap.innerHTML = str;
}
productList();
getCartList();

productSelect.addEventListener("change",function(e){
    const category = e.target.value;
    if(category == "全部"){
        renderProductList();
        return;
    }
    let str = "";
    productData.forEach(function(item){
        if(item.category == category){
            str +=`<li class="productCard">
            <h4 class="productType">新品</h4>
            <img src="${item.images}" alt="">
            <a href="#" class="addCardBtn" data-id="${item.id}">加入購物車</a>
            <h3>${item.title}</h3>
            <del class="originPrice">NT$${item.origin_price}</del>
            <p class="nowPrice">NT$${item.price}</p>
        </li>`
        }
    })
    productWrap.innerHTML = str;
})
productWrap.addEventListener("click",function(e){
    e.preventDefault();
    let addCartClass = e.target.getAttribute("class");
    if(addCartClass !== "addCardBtn"){
        return;
    }
    let productId = e.target.getAttribute("data-id");
    console.log(productId);
    let numCheck = 1;
    cartData.forEach(function(item){
        if(item.product.id === productId){
            numCheck = item.quantity += 1;
        }
    })
    axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/arista/carts`,{
        "data": {
        "productId": productId,
        "quantity": numCheck
        }
    }).then(function(response){
        getCartList();
    })
})

function getCartList(){
    axios.get("https://livejs-api.hexschool.io/api/livejs/v1/customer/arista/carts")
    .then(function(response){
        total.textContent = toThousands(response.data.finalTotal);
        cartData = response.data.carts;
        let str = "";
        cartData.forEach(function(item){
            str+=`<tr>
            <td>
                <div class="cardItem-title">
                    <img src="${item.product.images}" alt="">
                    <p>${item.product.title}</p>
                </div>
            </td>
            <td>NT$${toThousands(item.product.price)}</td>
            <td>${item.quantity}</td>
            <td>NT$${toThousands(item.product.price*item.quantity)}</td>
            <td class="discardBtn">
                <a href="#" class="material-icons" data-id="${item.id}">
                    clear
                </a>
            </td>
        </tr>`
        })
        cartList.innerHTML = str;
    })
}

cartList.addEventListener("click",function(e){
    e.preventDefault();
    const cartId = e.target.getAttribute("data-id");
    if(cartId==null){
        return;
    }
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/arista/carts/${cartId}`)
    .then(function(response){
        getCartList();
    })

})

discardAllBtn.addEventListener("click",function(e){
    e.preventDefault();
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/arista/carts`)
    .then(function(response){
        alert("刪除全部購物車成功!")
        getCartList();
    })
    .catch(function(response){
        alert("購物車已清空")
    })
})

order.addEventListener("click",function(e){
    e.preventDefault();
    if(cartData.length == 0){
        alert("請加入購物車");
        return;
    }
    const customerName = document.querySelector("#customerName").value;
    const customerPhone = document.querySelector("#customerPhone").value;
    const customerEmail = document.querySelector("#customerEmail").value;
    const customerAddress = document.querySelector("#customerAddress").value;
    const tradeWay = document.querySelector("#tradeWay").value;
    if(customerName==""||customerPhone==""||customerEmail==""||customerAddress==""||tradeWay==""){
        alert("請輸入訂單資訊");
        return;
    }
    axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/arista/orders`,{
        "data": {
        "user": {
        "name": customerName,
        "tel": customerPhone,
        "email": customerEmail,
        "address": customerAddress,
        "payment": tradeWay
        }
        }
    }).then(function(response){
        alert("訂單建立成功");
        getCartList();
        document.querySelector("#customerName").value = "";
        document.querySelector("#customerPhone").value = "";
        document.querySelector("#customerEmail").value = "";
        document.querySelector("#customerAddress").value = "";
        document.querySelector("#tradeWay").value = "ATM";
    })
})

function toThousands(x){
    let parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})*(?!\d))/g,",");
    return parts.join(".");
}