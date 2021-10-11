const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

//checks body middleware
function checksBody(req,res,next){
  const {data: {deliverTo, mobileNumber, dishes, status} = {} } = req.body;
  const {orderId} = req.params;
  if(!Object.keys(req.body.data).includes('mobileNumber') || mobileNumber === ''){
    next({status: 400, message: 'mobileNumber'});
  }
  if(!Object.keys(req.body.data).includes('dishes') || dishes === ''){
    next({status: 400, message: 'dishes'});
  }
  if(!Object.keys(req.body.data).includes('deliverTo') || deliverTo === ''){
    next({status: 400, message: 'deliverTo'});
  }
  if(typeof(dishes) !== 'object' || dishes.length === 0)next({status: 400, message: 'dishes'})
  dishes.forEach((dish, index) => {
    if(!Object.keys(dish).includes('quantity') || dish.quantity === 0 || !Number.isInteger(dish.quantity)){
      next({status: 400, message: `quantity: ${index}`})
    }
  })
  if(orderId && (!status || status === '' || (status !== 'out-for-delivery' && status !== 'delivered' && status !== 'pending'))){
    next({status: 400, message: 'status'})
  }
  next();
}

function checksDishProps(req,res,next){
  const {data: {dishes} = {}} = req.body;

  next();
}

//////////////////////////////////////////////////////
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

function scan(req,res,next){
  const {orderId} = req.params;
  const foundDish = orders.find(order => {
      if(order.id == orderId)return order
  })
  if(!foundDish) next({status: 404, message: orderId})
    
  next();
}

function update(req,res,next){
  const orderId = Number(req.params.orderId);
  const {data: {id,deliverTo,mobileNumber,status,dishes} = {}} = req.body;
  if(orderId != id && id){
    next({status: 400, message: `id: ${id}`})
  }
  const foundOrder = orders.find(order => {
    if(order.id == orderId){
      return order;
    }
  })
  foundOrder.deliverTo = deliverTo;
  foundOrder.mobileNumber = mobileNumber;
  foundOrder.status = status;
  foundOrder.dishes = dishes;
  res.json({data: foundOrder})
}

function searchForItem(req,res,next){
  const {data: {id,deliverTo, mobileNumber, dishes, dish} = {}} = req.body;
  const {orderId} = req.params;
  const foundOrder = orders.find(order => {
    if(order.id == id){
      return(order)
    }
  })
  if(orderId != id && id) next({status: 400, message: `id: ${id}`})
  if(!foundOrder && id)next({status: 404, message: `id: ${id}`});
  next();
}

function read(req,res,next){
  const {orderId} = req.params;
  const foundOrder = orders.find(order => {
    if(orderId == order.id)return order
  })
  if(foundOrder) res.status(200).json({data: foundOrder})
  next({status: 404, message: "Dish ID not found."})
}

function list(req,res,next){
    res.status(200).json({data: orders})
}

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
  read,
  create: [checksBody, add],
  update: [scan, checksBody, update],
  delete: destroy
}