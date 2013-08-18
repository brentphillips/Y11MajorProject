/**
 * Created with JetBrains WebStorm.
 * User: dave
 * Date: 26/05/13
 * Time: 5:01 PM
 * To change this template use File | Settings | File Templates.
 */

var mongo = require('mongodb');
var fs = require('fs');

var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;

var server = new Server('localhost', 27017, {auto_reconnect: true});
var db = new Db('BlogPosts', server);

db.open(function(err, db) {
    if (err) throw err;
    console.log("Connected to " + db.databaseName + " database");
});

var emptydatabase = ""

exports.clear = function(req, res){

    db.collection('blogposts', function(err, collection) {
        if (err) throw err;
        collection.remove(function(err, result) {
            if (err) throw err;
            res.redirect("/showBlog");
        });
    });


};

exports.load = function(req, res){

    var buf = [];

    fs.readFile('blogposts.csv', function(err, data) {
        if (err) throw err;

        buf = data.toString().split("#");

        console.log(buf);

        for(var i = 0; i < buf.length; i++) {

            var blogpostsObj = {};
            var blogpostsRec = [];

            blogpostsRec = buf[i].split("|");

            blogpostsObj.Title = blogpostsRec[0].replace("\r\n", "");
            blogpostsObj.Heading = blogpostsRec[1];
            blogpostsObj.Name = blogpostsRec[2];
            blogpostsObj.Date = new Date();
            blogpostsObj.Posts = blogpostsRec[4];
            blogpostsObj.Tags = blogpostsRec[5];
            blogpostsObj.Image = blogpostsRec[6];


            db.collection('blogposts', function(err, collection) {
                if (err) throw err;
                collection.insert( blogpostsObj , {safe:true}, function(err, result) {
                    if (err) throw err;
                });
            });

        }



        res.redirect('/showBlog')

    } )

};

exports.list = function (req, res){

    db.collection('blogposts', function(err, collection) {
        if (err) throw err;
        collection.find().toArray(function(err, docs) {
            if (err) throw err;
            docs.reverse();
            console.log(docs)
            if(docs.length < 1) {
                res.render('table', { title: 'Blog Posts', tab: "list" , blogposts: docs , isemptyarr: "This blog is empty!"});
            }
            else {
                res.render('table', { title: 'Blog Posts', tab: "list" , blogposts: docs });
            }
        });
    });

};

exports.addForm = function (req, res){

    res.render('addForm', { title: 'Add Blog', tab: "add" });

};

exports.addRecord = function (req, res){
    db.collection('blogposts', function(err, collection) {
        if (err) throw err;
        console.log(req.body);
        req.body.Date = new Date();//Date().getDay() + "/" + Date().getMonth() + "/" + Date().getYear() + " at " + Date().getTime();
        collection.insert( req.body , function(err, result) {
            if (err) throw err;
            res.render('addRecord', { title: 'Add Blog', tab: "add" , row: req.body });
        });
    });



};

exports.updateForm = function (req, res){

    var obj_id = new BSON.ObjectID(req.params._id); // This converts the _id into a proper ObjectId for the .remove

    db.collection('blogposts', function(err, collection) {
        if (err) throw err;
        console.log(req.param);
        collection.findOne({ _id: obj_id }, function(err, result) {
            if (err) throw err;
            res.render('updateForm', { title: 'Add Blog', tab: "list", row: result });
        });
    });
};

exports.updateRecord = function (req, res){

    var obj_id = new BSON.ObjectID(req.params._id); // This converts the _id into a proper ObjectId for the .update

    db.collection('blogposts', function(err, collection) {
        if (err) throw err;
        console.log(req.body);
        collection.update( { _id: obj_id }, req.body , function(err, result) {
            if (err) throw err;
            res.redirect('/list');
        });
    });

};

exports.remove = function (req, res){

    var obj_id = new BSON.ObjectID(req.params._id); // This converts the _id into a proper ObjectId for the .remove

    db.collection('blogposts', function(err, collection) {
        if (err) throw err;
        console.log(req.query);
        collection.remove({ _id: obj_id }, function(err, result) {
            if (err) throw err;
            res.redirect("/showBlog");
        });

    });

};


exports.searchForm = function (reg, res){
    res.render('search', { title: 'Search The Blog', tab: "search" })
}



exports.sortForm = function (reg, res){
    res.render('sort', { title: 'Sort The Blog', tab: "sort" })
}

exports.about = function (reg, res){
    res.render('about', { title: 'About The Blog', tab: "about" })
}


exports.doSearch = function (req, res) {

    db.collection('blogposts', function(err, collection) {
        if (err) throw err;
        collection.find().toArray(function(err, allPosts) {
            if (err) throw err;
            var searchCriteria = req.body.searchfield
            if (allPosts.length != 0) {
                doSortFunction(allPosts)
                console.log(searchCriteria)
                console.log(allPosts)
                //Begin Binary Search
                    var lower = 0;
                    var upper = allPosts.length - 1;
                    var FoundIt = "false";
                    console.log(searchCriteria);
                    console.log(allPosts[9].Title)
                    do {                                   // ((FoundIt === true) || (lower > upper))
                        var middle = ((upper + lower)/2);
                        middle = Math.floor(middle)
                        if (searchCriteria == allPosts[middle].Title) {
                            FoundIt = "true"
                            var positionfound = middle
                        }
                        else if (searchCriteria < allPosts[middle].Title) {
                            upper = middle - 1
                        }
                        else {
                            lower = middle + 1
                        }
                    }
                    while ((FoundIt === "false") && (lower <= upper))
                    if (FoundIt === "true") {
                        var result = allPosts[positionfound];
                    }
                    else {
                        var result = ["Not Found"];
                    }

            }
            else {
                var result = ["Not Blog"]
            }



            //TODO: put the search in here and search through allPosts for the required row and put that row in resultPost

            if(result == "Not Found") {
                res.render('table', { title: 'Search Result', tab: "search" , blogposts: [] , isemptyarr: "There is no such Blog Entry!" });
            }
            else if (result == "Not Blog") {
                res.render('table', { title: 'Search Result', tab: "search" , blogposts: [] , isemptyarr: "There are no Blog Entries!" });
            }
            else {
                res.render('table', { title: 'Search Result', tab: "search" , blogposts: [result]});
            }
        });
    });
}

exports.doSort = function (req, res) {

    db.collection('blogposts', function(err, collection) {
        if (err) throw err;
        collection.find().toArray(function(err, allPosts) {
            if (err) throw err;
            var sortcriteria = req.body
            console.log(sortcriteria)

            doSortFunction(allPosts);
            res.render('table', { title: 'Sort Result', tab: "sort" , blogposts: allPosts });

        });
    });
}

var doSortFunction = function (allPosts) {
    var last = allPosts.length - 1
    var swapped = true
    while (swapped) {
        swapped = false
        var i = 0
        var temp = 0
        while (i<last) {
            if (allPosts[i].Title > allPosts[i+1].Title) {
                temp = allPosts[i]
                allPosts[i] = allPosts[i+1]
                allPosts[i+1] = temp
                swapped = true
            }
            i++
        }
        last--
    }


}