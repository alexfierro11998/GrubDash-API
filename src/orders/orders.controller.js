const path = require("path");


const orders = require(path.resolve("src/data/orders-data"));


const nextId = require("../utils/nextId");

//checks body middleware
function checksBody(req,res,next){
  const {data: {deliverTo, mobileNumber, dishes, status} = {} } = req.body;
  const {orderId} = req.params;
  //checks if mobileNumber key is passed and if mobileNumber key is empty
  if(!Object.keys(req.body.data).includes('mobileNumber') || mobileNumber === ''){
    next({status: 400, message: 'mobileNumber'});
  }
  //checks if dishes key is passed and if dishes key is empty
  if(!Object.keys(req.body.data).includes('dishes') || dishes === ''){
    next({status: 400, message: 'dishes'});
  }
  //checks if deliverTo key is passed and if deliverTo key is empty
  if(!Object.keys(req.body.data).includes('deliverTo') || deliverTo === ''){
    next({status: 400, message: 'deliverTo'});
  }
  //checks if dishes key is an array and if dishes array is empty
  if(typeof(dishes) !== 'object' || dishes.length === 0)next({status: 400, message: 'dishes'})
  //scans through each dish and checks if the quantity is equal to zero, if the quantity key is passed, and if the quantity data type is an integer
  dishes.forEach((dish, index) => {
    if(!Object.keys(dish).includes('quantity') || dish.quantity === 0 || !Number.isInteger(dish.quantity)){
      next({status: 400, message: `quantity: ${index}`})
    }
  })
  //checks if status is empty or not one of the desired inputs and if status was passed in
  if(orderId && (!status || status === '' || (status !== 'out-for-delivery' && status !== 'delivered' && status !== 'pending'))){
    next({status: 400, message: 'status'})
  }
  next();
}

//////////////////////////////////////////////////////

//adds a new order and responds with status 201
function add(req,res){
  const {data: {deliverTo, mobileNumber, dishes} = {}} = req.body;
  const newOrder = {
    id: nextId(),
    deliverTo: deliverTo,
    mobileNumber: mobileNumber,
    dishes: dishes
  }
  orders.push(newOrder);
  res.status(201).json({data: newOrder})
}

//scans through dishes to check if the dish parameter exists in the database
function scan(req,res,next){
  const {orderId} = req.params;
  const foundOrder = orders.find(order => {
      if(order.id == orderId)return order
  })
  if(!foundOrder) next({status: 404, message: orderId})
  res.locals.order = foundOrder;  
  next();
}

//updates a dish to desured input and checks if the order ID is equal to the ID in the parameters
function update(req,res,next){
  const orderId = Number(req.params.orderId);
  const {data: {id,deliverTo,mobileNumber,status,dishes} = {}} = req.body;
  if(orderId != id && id){
    next({status: 400, message: `id: ${id}`})
  }
  const foundOrder = res.locals.order;
  foundOrder.deliverTo = deliverTo;
  foundOrder.mobileNumber = mobileNumber;
  foundOrder.status = status;
  foundOrder.dishes = dishes;
  res.json({data: foundOrder})
}

//fetches a order from the database 
function read(req,res,next){
  const {orderId} = req.params;
  const foundOrder = res.locals.order;
  if(foundOrder) res.status(200).json({data: foundOrder})
  next({status: 404, message: "Dish ID not found."})
}
//lists the orders
function list(req,res,next){
    res.status(200).json({data: orders})
}

//scans through the database to find the desired order and deletes the order
function destroy(req,res,next){
  const {orderId} = req.params;
  const foundOrder = orders.find(order => {
    if(order.id == orderId){
      return order
    }
  })
  if(foundOrder){
    console.log(foundOrder)
    if(foundOrder.status !== 'pending'){
      next({status: 400, message: 'pending'})
    }
    orders.splice(foundOrder, 1)
    res.sendStatus(204)
  }
  next({status: 404, message: orderId})
}

module.exports = {
  list,
  read: [scan, read],
  create: [checksBody, add],
  update: [scan, checksBody, update],
  delete: destroy
}