const path = require("path");
const methodNotAllowed = require("../errors/errorHandler")

const dishes = require(path.resolve("src/data/dishes-data"));

const nextId = require("../utils/nextId");

function scan(req,res,next){
  const {dishId} = req.params;
  const foundDish = dishes.find(dish => {
      if(dish.id == dishId)return dish
  })
  if(!foundDish) next({status: 404, message: dishId})
    
  next();
}

//middleware that verifies body
function checksForBody(req,res, next){
  const {data: {name,description,image_url,price} = {}} = req.body;
  //checks if name property is passed and if it is empty
  if(!Object.keys(req.body.data).includes('name') || name === ''){
    next({status: 400, message: 'name'})
  }
  //checks if description property is passed and if description is empty
  if(!Object.keys(req.body.data).includes('description') || description === ''){
    next({status: 400, message: 'description'})
  }
  //checks if image url property is passed and if it is empty
  if(!Object.keys(req.body.data).includes('image_url') || image_url === ''){
    next({status: 400, message: 'image_url'})
  }
  //checks if price property is passed and if it is less than 0 and ifprice is a number
  if(!Object.keys(req.body.data).includes('price') || price <= 0 || typeof(price) !== 'number'){
    next({status: 400, message: 'price'})
  }
  next();
}
//creates a dish to add
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

//function that reads dish array and returns a dish if one is found, otherwise return 404
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
//function that updates dish and checks if dish ID is equal to the parameter
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
    