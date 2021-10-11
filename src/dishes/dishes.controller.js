const path = require("path");
const methodNotAllowed = require("../errors/errorHandler")

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

function scan(req,res,next){
  const {dishId} = req.params;
  const foundDish = dishes.find(dish => {
      if(dish.id == dishId)return dish
  })
  if(!foundDish) next({status: 404, message: dishId})
    
  next();
}

// create function
function checksForBody(req,res, next){
  const {data: {name,description,image_url,price} = {}} = req.body;
  
  if(!Object.keys(req.body.data).includes('name') || name === ''){
    next({status: 400, message: 'name'})
  }
  if(!Object.keys(req.body.data).includes('description') || description === ''){
    next({status: 400, message: 'description'})
  }
  if(!Object.keys(req.body.data).includes('image_url') || image_url === ''){
    next({status: 400, message: 'image_url'})
  }
  if(!Object.keys(req.body.data).includes('price') || price <= 0 || typeof(price) !== 'number'){
    next({status: 400, message: 'price'})
  }
  next();
}

function add(req,res){
  const {data: {name,description,image_url,price} = {}} = req.body;
  const newDish = {
    id: nextId(),
    name: name,
    description: description,
    image_url: image_url,
    price: price
  }
  dishes.push(newDish);
  res.status(201).json({data: newDish})
}

////////////////////////////////////////////////

//read function
function read(req, res, next){
  const {dishId} = req.params;
  const foundDish = dishes.find(current => {
    if(current.id == Number(dishId)){
      return current
    }
  })
  if(foundDish)res.status(200).json({data: foundDish})
  next({status: 404, message: dishId})
} 
////////////////////////////////////////////////
//list function

function list(req,res){
    res.status(200).json({data: dishes})
}
////////////////////////////////////////////////
//update function



function update(req,res,next){
  const dishId = Number(req.params.dishId);
  const {data: {id,name,description,image_url,price} = {}} = req.body;
  if(dishId != id && id){
    next({status: 400, message: `id: ${id}`})
  }
  const foundDish = dishes.find(dish => {
    if(dish.id == dishId){
      return dish;
    }
  })
  foundDish.name = name;
  foundDish.description = description;
  foundDish.image_url = image_url;
  foundDish.price = price;
  res.json({data: foundDish})
}

module.exports = {
    list,
    create: [checksForBody, add],
    read,
    update: [scan,checksForBody,update],
};
    