const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

/**
 * 
 **************VALIDATION HANDLERS**************
 */

// check if the dish has a name.
// needed in order to move onto 'create()' and 'update()'.
function bodyHasName(req, res, next) {
    const { data: { name } = {} } = req.body
    // if dish has a name, move request onto next function.
    if (name) {
        res.locals.name = name
        return next()
    } else {
        // if no name, stop executing and return object 
        // with error 'status' code and message.
        next({
            status: 400,
            message: `A 'name' property is required.`,
        })
    }
}


// check if dish has description.
// needed in order to move onto 'create()' and 'update()'.
function bodyHasDescription(req, res, next) {
    const { data: { description } = {} } = req.body
    // if description, move request to next function
    if (description) {
        res.locals.description = description
        return next()
    } else {
        next({
            status: 400,
            message: `A 'description' property is required.`,
        })
    }
}


// check if the dish has a price.
// needed in order to move onto 'create()' and 'update()'.
function bodyHasPrice(req, res, next) {
    const { data: { price } = {} } = req.body
    // if no price, move request to next function
    if (price) {
        res.locals.price = price
        return next()
    } else {
        //if no price, return error status code with message
        next({
            status: 400,
            message: `A 'price' property is required.`,
        })
    }
}


// check if dish price provided is valid.
// needed to move onto 'create()'
function bodyHasValidPrice(req, res, next) {
    const { data: { price } = {} } = req.body
    
    if (price > -1) {
        res.locals.price = price
        return next()
    } else {
        //if invalid price, return error status code with message.
        next({
            status: 400,
            message: `price cannot be less than 0.`,
        })
    }
}


// check if dish price is valid for 'udpate()'.
// needed to move onto 'update()'
function bodyHasValidPriceForUpdate(req, res, next) {
    const { data: { price } = {} } = req.body
    //if price is invalid (price <= 0 OR not an integer), 
    //return error status code with message.
    if (res.locals.price <= 0 || typeof res.locals.price !== "number") {
        next({
            status: 400,
            message: `price must be an integer greater than $0.`,
        })
    } else {
        return next()
    }
}


// check if dish has an image property.
// needed to move onto 'create()' and 'update()'.
function bodyHasImg(req, res, next) {
    const { data: { image_url } = {} } = req.body
    //if there is an image url, move on to next function.
    if (image_url) {
        res.locals.image_url = image_url
        return next()
    } else {
        //if no image url, return object for error status code and message.
        next({
            status: 400,
            message: `An 'image_url' property is required.`
        })
    }
}


// check if the dish exists by checking the dish id. 
// needed in order to move onto 'read()' and 'update()'.
function dishExists(req, res, next) {
    const { dishId } = req.params
    // create a variable for the dish that matches the dish's id
    const matchingDish = dishes.find((dish) => dish.id === dishId)
    // if there is a matching dish, move onto the next function
    if (matchingDish) {
      res.locals.matchingDish = matchingDish
      // console.log("res locals =>",res.locals, "<=")
      return next()
    }
    // otherwise, return the following message
    next({
      status: 404,
      message: `Dish id not found: ${dishId}`,
    })
}

// check if the data id matches it's parameters id
// needed in order to move onto 'update' handler
function dishIdMatchesDataId(req, res, next) {
    const { data: { id } = {} } = req.body
    const dishId = req.params.dishId
    // if the id is defined, not null, not a string, and not the dishId
    if (id !== "" && id !== dishId && id !== null && id !== undefined) {
      // return the following message
      next({
        status: 400,
        message: `id ${id} must match dataId provided in parameters`,
      })
    }
    // otherwise, move onto the next function
    return next()
}


/**
 * 
 **************ROUTE HANDLERS**************
 */

//CREATE
function createDish (req,res) {
    const { data: { name, description, price, image_url } = {} } = req.body;

    const newDish = {
        id: nextId(),
        name,
        description,
        price,
        image_url,
    }
    dishes.push(newDish);

    res.status(201).json({ data: newDish});
}

//READ
function getDish(req, res){
    const dishId = req.params.dishId;

    // find the matching dish from the parameters
    const matchingDish = dishes.find((dish) => dish.id === dishId);

    //write to locals
    res.json({data: res.locals.matchingDish});
}

function list(req,res) {
    res.json( { data : dishes } );
}

//UPDATE
function updateDish(req, res) {
    const dishId = req.params.dishId;

    // find the matching dish from the parameters
    const matchingDish = dishes.find((dish) => dish.id === dishId);
    const { data: { name, description, price, image_url } = {} } = req.body;

    //stuff matching data into data structure
    matchingDish.description = description;
    matchingDish.name = name;
    matchingDish.price = price;
    matchingDish.image_url = image_url;
    
    res.json({data: matchingDish});

}

//DELETE
//Delete not supported for Dishes...

module.exports ={
    list,
    read: [
        dishExists,
        getDish,
    ],
    create: [
        bodyHasName,
        bodyHasDescription,
        bodyHasPrice,
        bodyHasValidPrice,
        bodyHasImg,
        createDish,
    ] ,
    update: [
        dishExists,
        dishIdMatchesDataId,
        bodyHasName,
        bodyHasDescription,
        bodyHasPrice,
        bodyHasValidPriceForUpdate,
        bodyHasImg,
        updateDish,
    ]
}