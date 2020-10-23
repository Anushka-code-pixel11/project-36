var dog, happyDog;
var database;
var foodS, foodStock;
var Dog;
var foodObj;
var lastFed;
var gameState;
var readState;
var bedroom,garden,washroom;
var currentTime;

function preload(){
  dog = loadImage("images/dog.png");
  happyDog = loadImage("images/happy.png");
  sadDog = loadImage("images/deadDog.png");
  washroom = loadImage("images/washRoom.png");
  bedroom = loadImage("images/bedRoom.png");
  garden = loadImage("images/garden.png");
}

function setup() {
  database = firebase.database();
  console.log(database);

  var canvas = createCanvas(500,500);
  
  Dog = createSprite(250,300,10,10);
  Dog.addImage(dog);
  Dog.scale = 0.2;

  foodObj = new Food();

  foodStock = database.ref("Food");
  foodStock.on("value",readStock);

  readState = database.ref('gameState');
  readState.on("value",function (data){
    gameState = data.val();
  });

  feed = createButton("Feed the dog");
  feed.position(700,95);
  feed.mousePressed(feedDog);

  addFood = createButton("add the food");
  addFood.position(800,95);
  addFood.mousePressed(addFoods);
}

function draw() {  
  background(46, 139, 87);

  fedTime = database.ref("FeedTime");
  fedTime.on("value",function(data){
    lastFed = data.val();
  });

  if(lastFed >= 12){
    stroke("red");
    fill("cyan");
    textSize(15);
    text("Last Feed: " + lastFed % 12 + "PM",350,30);
  }
  else if(lastFed === 0){
    stroke("red");
    fill("cyan");
    textSize(15);
    text("Last Feed: 12 AM",350,30);
  }
  else {
    stroke("red");
    fill("cyan");
    textSize(15);
    text("Last Feed: " + lastFed + "AM",350,30);
  }

  if(gameState !== "hungry"){
    feed.hide();
    addFood.hide();
    Dog.remove();
  } else {
    feed.show();
    addFood.show();
    Dog.addImage(sadDog);
  }

  currentTime = hour();

  if(currentTime === (lastFed + 1)){
    update("Playing");
    foodObj.garden();
  } else if( currentTime === (lastFed + 2)){
    update("Sleeping");
    foodObj.bedroom();
  } else if(currentTime > (lastFed + 2) && currentTime <= (lastFed + 4)){
    update("Bathing");
    foodObj.washroom();
  } else {
    update("hungry");
    foodObj.display();
  }

  foodObj.display();

  drawSprites();
  
  stroke("pink");
  fill("cyan");
  text("Food Remaining: " + foodS, 130,200);

  

}

function readStock(data){
  foodS = data.val();
  foodObj.updateFoodStock(foodS);
}

function feedDog(){
  Dog.addImage(happyDog);

  foodObj.updateFoodStock(foodObj.getFoodStock() -1);
  database.ref('/').update({
    Food: foodObj.getFoodStock(),
    FeedTime:hour()
  });
}

function addFoods(){
  foodS ++;
  database.ref('/').update({
    Food:foodS
  });
} 

function update(state){
  database.ref('/').update({
    gameState: state
  });
}