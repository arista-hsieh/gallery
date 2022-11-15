let orderData = [];
const orderList = document.querySelector(".js-orderList")

function init(){
    getOrderList();
}
init();

function renderC3(){
     // C3.js
    let total = {};
    orderData.forEach(function(item){
        item.products.forEach(function(productItem){
            if(total[productItem.category]==undefined){
                total[productItem.category]=productItem.price*productItem.quantity;
            }else{
                total[productItem.category] += productItem.price * productItem.quantity;
            }
        })
    })
    console.log(total);
    let categoryAry = Object.keys(total);
    console.log(categoryAry);
    let newData = [];
    categoryAry.forEach(function(item){
        let ary = [];
        ary.push(item);
        ary.push(total[item]);
        newData.push(ary);
    })
    console.log(newData);
let chart = c3.generate({
    bindto: '#chart', // HTML 元素綁定
    data: {
        type: "pie",
        columns: newData,
        colors:{
            "其他":"#DACBFF",
            "窗簾":"#9D7FEA",
            "收納": "#5434A7",
            "床架": "#301E5F",
        }
    }
});
}

function getOrderList(){
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/admin/arista/orders`,{
        headers:{
            "Authorization":"2TT6NWY7qcSZieUybo01dizyyOm1",
        }
    })
    .then(function(response){
        orderData = response.data.orders;
        let str = "";
        orderData.forEach(function(item){
            const timeStamp = new Date(item.createdAt*1000);
            const orderTime = `${timeStamp.getFullYear()}/${timeStamp.getMonth()+1}/${timeStamp.getDate()}`;
            let productStr = "";
            item.products.forEach(function(productItem){
                productStr += `<p>${productItem.title}x${productItem.quantity}</p>`
            })
            let orderStatus ="";
            if(item.paid==true){
                orderStatus="已處理"
            }else{
                orderStatus="未處理"
            }
            str += `<tr>
            <td>${item.id}</td>
            <td>
                <p>${item.user.name}</p>
                <p>${item.user.tel}</p>
            </td>
            <td>${item.user.address}</td>
            <td>${item.user.email}</td>
            <td>
                ${productStr}
            </td>
            <td>${orderTime}</td>
            <td>
                <a class="orderStatus" data-status="${item.paid}" href="#" data-id="${item.id}">${orderStatus}</a>
            </td>
            <td>
                <input type="button" data-id="${item.id}" class="delSingleOrder-Btn js-orderDelete" value="刪除">
            </td>
        </tr>`
        })
        orderList.innerHTML = str;
        renderC3();
    })
}

orderList.addEventListener("click",function(e){
    e.preventDefault();
    const targetClass = e.target.getAttribute("class");
    let id = e.target.getAttribute("data-id")
    if(targetClass == "delSingleOrder-Btn js-orderDelete"){
        deleteOrderItem(id);
        return;
    }
    if(targetClass == "orderStatus"){
        let status = e.target.getAttribute("data-status");
        let id = e.target.getAttribute("data-id")
        changeOrderStatus(status,id);
        return;
    }
})

function changeOrderStatus(status,id){
    let newStatus;
    if(status=="true"){
        newStatus=false;
    }else{
        newStatus=true;
    }
    axios.put(`https://livejs-api.hexschool.io/api/livejs/v1/admin/arista/orders/`,{
        "data": {
        "id": id,
        "paid": newStatus
        }
    },{
        headers:{
            "Authorization":"2TT6NWY7qcSZieUybo01dizyyOm1",
        }
    })
    .then(function(response){
        alert("修改訂單成功");
        getOrderList();
    })
}

function deleteOrderItem(id){
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/arista/orders/${id}`,{
        headers:{
            "Authorization":"2TT6NWY7qcSZieUybo01dizyyOm1",
        }
    })
    .then(function(response){
        alert("刪除該筆訂單成功");
        getOrderList();
    })
}

const discardAllBtn = document.querySelector(".discardAllBtn");
discardAllBtn.addEventListener("click",function(e){
    e.preventDefault();
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/arista/orders`,{
        headers:{
            "Authorization":"2TT6NWY7qcSZieUybo01dizyyOm1",
        }
    })
    .then(function(response){
        alert("刪除全部訂單成功");
        getOrderList();
    })
})
