var express = require('express')
var app = express()

var async = require('async');
var Q = require('q');
var fs = require('fs');
var parse = require('csv-parse');
var _=require("underscore");

//specify correct input file names
var inputFile='newvals.csv';
var inputJSONFile = "bafpokemon.json";

var outputFile = "new_bakpokemon.json";

var csvData=[];

var newObj = [];
var status;
var newAttack, newDefense;

function readCSV_updateJSON(){

    var deferred = Q.defer();
    fs.createReadStream(inputFile)
        .pipe(parse({delimiter: ':'}))
        .on('data', function(csvrow) {
            csvData.push(csvrow);
        })
        .on('end',function() {
          //do something wiht csvData

              console.log("^^^^^^^^^ CSV READ COMPLETED !^^^^^^^^");
              //console.log(csvData);

              var obj;


              fs.readFile(inputJSONFile, 'utf8', function (err, data) {
                if (err) throw err;
                obj = JSON.parse(data);
                //console.log(obj);
                getNewObject(obj).then(function(response){
                    deferred.resolve(response);
                });

              });

        });

         return deferred.promise;
}



function getNewObject(obj){
  var deferred = Q.defer();
  _.each( obj, function(content,index) {
  //  console.log("index = ",index);

    //console.log(content);
    if(index == obj.length-1){
      console.log("____reached final element !______");
      deferred.resolve({'status':'completed','newObj':newObj});
    }
  //  console.log("searching for new name " );
        _.each(content,function(data, key){
            //  console.log(key , " <-> ", data);
            //  console.log("______");

            if(status == true){
                if(key == 'stats') {
                  content.stats.attack = parseInt(newAttack);
                  content.stats.defense = parseInt(newDefense);
                //  console.log("_updated __");
                     status = false;
              }
            }

            if(key == 'name') {
            //  console.log(" = ",data);

              var name = data.toLowerCase();
              //search for name in csv

              var array = _.filter(csvData, function(item) {
                  var values = item.toString().split(',');
                  if(values[0].toLowerCase()===name){
                    return true;
                  }
             });
              if(array.length > 0){
                //  console.log(name," exists");
                var values = array.toString().split(',');
                newAttack = values[1];
                newDefense = values[2];
                //    console.log(values[0],values[1],values[2]);
                status = true;
              }else{
                //    console.log(name ,"does not exists");
              }
            }

           })
           newObj.push(content);
      })
   return deferred.promise;
}

readCSV_updateJSON().then(
  function (responseText) {
    console.log("returned finally !");
    console.log(responseText.status);
    // console.log(responseText.newObj);

    fs.writeFile('./'+outputFile, JSON.stringify(responseText.newObj,null, "\t") , 'utf-8', function(err) {
           if (err) {
               console.log(err);
           } else {
               console.log("new JSON saved");
               return true;
           }
       })


  }, function (error) {
      // If there's an error, log the error.
      console.error(error);
  }
);




app.get('/', function (req, res) {
  res.send('Hello World!')
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})
