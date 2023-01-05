const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
// const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.set('strictQuery', true);
mongoose.connect("mongodb+srv://admin_sahil:Test_1234@cluster0.biupg6h.mongodb.net/todolistDB?retryWrites=true&w=majority",{useNewUrlParser: true});

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item",itemsSchema);

const item_1 = new Item({
  name:"Welcome to your To-Do List"
});

const item_2 = new Item({
  name:"Hit + button to add item to the list"
});

const item_3 = new Item({
  name:"Check the box to delete the item from the list"
});

const defaultItems = [item_1,item_2,item_3];

const listSchema = {
  name: String,
  items:[itemsSchema]
};

const List = mongoose.model("List",listSchema);


app.get("/", function(req, res) {

// const day = date.getDate();
  Item.find({},function(err,foundItems){
    if(foundItems.length === 0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("Success!");
        }
      });
      res.redirect("/");
    }else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  })
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const newItem = new Item({
    name: itemName
  });

  if(listName === "Today"){
    newItem.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/" + listName);
    })
  }
});

app.post("/delete",function(req,res){
  const item_id = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(item_id,function(err){
      if(err)
        console.log(err);
      else
        res.redirect("/");
    });
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:item_id}}},function(err,foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    })
  }
})

app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        // console.log("Does not exists");
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      }
      else{
        // console.log("Exists");
        res.render("list",{listTitle:foundList.name,newListItems:foundList.items})
      }
    }
  })


});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
