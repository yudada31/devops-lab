/*!
 * express
 * Copyright(c) 2009-2013 TJ Holowaychuk
 * Copyright(c) 2013 Roman Shtylman
 * Copyright(c) 2014-2015 Douglas Christopher Wilson
 * MIT Licensed
 */



'use strict';

const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const app = express();
const dhost = process.env.MYSQL_HOST;
const dport = process.env.MYSQL_PORT;
const ddatabase = process.env.MYSQL_DATABASE;
const dlogin = process.env.MYSQL_LOGIN;
const dpassword = process.env.MYSQL_PASSWORD;

app.use(bodyParser.urlencoded({
    extended: true
}));

var db = mysql.createConnection({
    host: MYSQL_HOST,
    user: MYSQL_LOGIN,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE,
    port: MYSQL_PORT
    
});

///Firewall////
 app.use(function(req, res, next) {
 	if ("key" in req.query) {
 		var key = req.query["key"];
 		var query = "SELECT * FROM users WHERE apikey='" + key + "'";
 		db.query(query, function(err, result, fields) {
 			if (err) throw err;
 			if (result.length > 0) {
 				next();
 			}
 			else {
                 res.status(403).send("Access denied").end();
 			}
 		});
 	} else {
         res.status(403).send("Access denied").end();
 	}
 });


// Query calculate days left before no more food
app.get('/food-stats', function (req, res) {

    db.query("SELECT A.name FROM animals A JOIN food F on A.id = F.id", function (err, result, fields) {
        if (err) throw err;

        var name = result[0].name;

        db.query("SELECT F.quantity FROM animals A JOIN food F on A.id = F.id", function (err, result, fields) {
            if (err) throw err;

            var quantity = result[0].quantity;

            db.query("SELECT A.food FROM animals A JOIN food F on A.id = F.id", function (err, result, fields) {
                if (err) throw err;

                var food = result[0].food;

                var response = {
                    "Name": name,
                    "Remaining_time": (quantity / food)
                };
                res.send(JSON.stringify(response));
            });
        });
    });
});


/// POST FOR ANIMAL
app.post('/animals', function (req, res) {
    var name = req.body.name;
    var breed = req.body.breed;
    var food_per_day = req.body.food_per_day;
    var birthday = req.body.birthday;
    var entry_date = req.body.entry_date;
    var id_cage = req.body.id_cage;

    var query = "INSERT INTO animals (`name`, `breed`, `food_per_day`, `birthday`, `entry_date`, `id_cage`) VALUES ('" + name + "', '" + breed + "', '" + food_per_day + "', '" + birthday + "', '" + entry_date + "', '" + id_cage + "')";
    db.query(query, function (err, result, fields) {
        if (err) throw err;
        res.send(JSON.stringify("Success"));
    });
});
/// POST FOR CAGE
app.post('/cages', function (req, res) {
    var name = req.body.name;
    var desc = req.body.description;
    var area = req.body.area;

    var query = "INSERT INTO cages (`name`, `description`, `area`) VALUES ('" + name + "', '" + desc + "', '" + area + "')";
    db.query(query, function (err, result, fields) {
        if (err) throw err;
        res.send(JSON.stringify("Success"));
    });
});
///POST FOR FOOD
app.post('/food', function (req, res) {
    var name = req.body.name;
    var aid = req.body.id_animal;
    var quantity = req.body.quantity;

    var query = "INSERT INTO food (`name`, `id_animal`, `quantity`) VALUES ('" + name + "', '" + aid + "', '" + quantity + "')";
    db.query(query, function (err, result, fields) {
        if (err) throw err;
        res.send(JSON.stringify("Success"));
    });
});
///POST FOR STAFF
app.post('/staff', function (req, res) {
    var fname = req.body.firstname;
    var lname = req.body.lastname;
    var sal = req.body.wage;

    var query = "INSERT INTO staff (`firstname`, `lastname`, `wage`) VALUES ('" + fname + "', '" + lname + "', '" + sal + "')";
    db.query(query, function (err, result, fields) {
        if (err) throw err;
        res.send(JSON.stringify("Success"));
    });
});

////////////RELATIONSHIPS BETWEEN ANIMALs AND FOOD////////
app.get('/animals/:id/food', function (req, res) {
    var id = req.params.id;
    var query = "SELECT food.id, food.name, food.quantity FROM animals INNER JOIN food ON animals.id = food.id_animal WHERE animals.id=" + id;
    db.query(query, function (err, result, fields) {
        if (err) throw err;
        res.send(JSON.stringify(result));
    });
});
app.get('/animals/:id/food/:fid', function (req, res) {
    var AID = req.params.id;
    var FID = req.params.fid;
    var query = "SELECT food.id, food.name, food.quantity FROM animals INNER JOIN food ON animals.id = food.id_animal WHERE animals.id=" + AID + " AND food.id=" + FID;
    db.query(query, function (err, result, fields) {
        if (err) throw err;
        res.send(JSON.stringify(result));
    });
});
///reverse///
app.get('/food/:id/animals', function (req, res) {
    var id = req.params.id;
    var query = "SELECT animals.id, animals.name, animals.breed, animals.food_per_day, animals.birthday, animals.entry_date, animals.id_cage FROM animals INNER JOIN food ON animals.id = food.id_animal WHERE food.id=" + id;
    db.query(query, function (err, result, fields) {
        if (err) throw err;
        res.send(JSON.stringify(result));
    });
});
app.get('/food/:id/animals/:aid', function (req, res) {
    var AID = req.params.aid;
    var FID = req.params.id;
    var query = "SELECT animals.id, animals.name, animals.breed, animals.food_per_day, animals.birthday, animals.entry_date, animals.id_cage FROM animals INNER JOIN food ON animals.id = food.id_animal WHERE animals.id=" + AID + " AND food.id=" + FID;
    db.query(query, function (err, result, fields) {
        if (err) throw err;
        res.send(JSON.stringify(result));
    });
});
////////////RELATIONSHIPS BETWEEN ANIMALs AND CAGE////////
app.get('/animals/:id/cages', function (req, res) {
    var id = req.params.id;
    var query = "SELECT cages.id, cages.name, cages.description, cages.area FROM animals INNER JOIN cages ON animals.id_cage = cages.id WHERE animals.id=" + id;
    db.query(query, function (err, result, fields) {
        if (err) throw err;
        res.send(JSON.stringify(result));
    });
});
app.get('/animals/:id/cages/:cid', function (req, res) {
    var AID = req.params.id;
    var CID = req.params.cid;
    var query = "SELECT cages.id, cages.name, cages.description, cages.area FROM animals INNER JOIN cages ON animals.id_cage = cages.id WHERE animals.id=" + AID + " AND cages.id=" + CID;
    db.query(query, function (err, result, fields) {
        if (err) throw err;
        res.send(JSON.stringify(result));
    });
});

//////reverse/////
app.get('/cages/:id/animals', function (req, res) {
    var id = req.params.id;
    var query = "SELECT animals.id, animals.name, animals.breed, animals.food_per_day, animals.birthday, animals.entry_date, animals.id_cage FROM animals INNER JOIN cages ON animals.id_cage = cages.id WHERE cages.id=" + id;
    db.query(query, function (err, result, fields) {
        if (err) throw err;
        res.send(JSON.stringify(result));
    });
});
app.get('/cages/:id/animals/:aid', function (req, res) {
    var AID = req.params.id;
    var CID = req.params.aid;
    var query = "SELECT animals.id, animals.name, animals.breed, animals.food_per_day, animals.birthday, animals.entry_date, animals.id_cage FROM animals INNER JOIN cages ON animals.id_cage = cages.id WHERE animals.id=" + AID + " AND cages.id=" + CID;
    db.query(query, function (err, result, fields) {
        if (err) throw err;
        res.send(JSON.stringify(result));
    });
});

///GET FOR ANIMAL
app.get('/animals', function (req, res) {
    var query = "SELECT * FROM animals";
    var conditions = ["name", "breed", "food_per_day", "birthday", "entry_date"];

    if ("fields" in req.query) {
        query = query.replace("*", req.query["fields"]);
    }

    for (var index in conditions) {
        if (conditions[index] in req.query) {
            if (query.indexOf("WHERE") < 0) {
                query += " WHERE";
            } else {
                query += " AND";
            }
            query += " " + conditions[index] + " = '" + req.query[conditions[index]] + "' ";
        }
    }

    if ("sort" in req.query) {
        var sort = req.query["sort"].split(",");
        query += " ORDER BY";
        for (var index in sort) {
            var direction = sort[index].substr(0, 1);
            var field = sort[index].substr(1);
            query += " " + field;
            if (direction == "-")
                query += " DESC,";
            else
                query += " ASC,";
        }
        query = query.slice(0, -1);
    }

    if ("limit" in req.query) {
        query += " LIMIT " + req.query["limit"];
        if ("offset" in req.query) {
            query += " OFFSET " + req.query["offset"];
        }
    }

    db.query(query, function (err, result, fields) {
        if (err) throw err;
        res.send(JSON.stringify(result));
    });
});

///GET FOR CAGE
app.get('/cages', function (req, res) {
    var query = "SELECT * FROM cages"
    var conditions = ["name", "description", "area"];
    if ("fields" in req.query) {
        query = query.replace("*", req.query["fields"]);
    }

    for (var index in conditions) {
        if (conditions[index] in req.query) {
            if (query.indexOf("WHERE") < 0) {
                query += " WHERE";
            } else {
                query += " AND";
            }
            query += " " + conditions[index] + " = '" + req.query[conditions[index]] + "' ";
        }
    }

    if ("sort" in req.query) {
        var sort = req.query["sort"].split(",");
        query += " ORDER BY";
        for (var index in sort) {
            var direction = sort[index].substr(0, 1);
            var field = sort[index].substr(1);
            query += " " + field;
            if (direction == "-")
                query += " DESC,";
            else
                query += " ASC,";
        }
        query = query.slice(0, -1);
    }

    if ("limit" in req.query) {
        query += " LIMIT " + req.query["limit"];
        if ("offset" in req.query) {
            query += " OFFSET " + req.query["offset"];
        }
    }


    db.query(query, function (err, result, fields) {
        if (err) throw err;
        res.send(JSON.stringify(result));
    });
});
///GET FOR FOOD
app.get('/food', function (req, res) {
    var query = "SELECT * FROM food";
    var conditions = ["name", "id_animal", "quantity"];
    if ("fields" in req.query) {
        query = query.replace("*", req.query["fields"]);
    }

    for (var index in conditions) {
        if (conditions[index] in req.query) {
            if (query.indexOf("WHERE") < 0) {
                query += " WHERE";
            } else {
                query += " AND";
            }
            query += " " + conditions[index] + " = '" + req.query[conditions[index]] + "' ";
        }
    }

    if ("sort" in req.query) {
        var sort = req.query["sort"].split(",");
        query += " ORDER BY";
        for (var index in sort) {
            var direction = sort[index].substr(0, 1);
            var field = sort[index].substr(1);
            query += " " + field;
            if (direction == "-")
                query += " DESC,";
            else
                query += " ASC,";
        }
        query = query.slice(0, -1);
    }

    if ("limit" in req.query) {
        query += " LIMIT " + req.query["limit"];
        if ("offset" in req.query) {
            query += " OFFSET " + req.query["offset"];
        }
    }


    db.query(query, function (err, result, fields) {
        if (err) throw err;
        res.send(JSON.stringify(result));
    });
});
///GET FOR STAFF
app.get('/staff', function (req, res) {
    var query = "SELECT * FROM staff";
    var conditions = ["firstname ", "lastname", "wage"];

    if ("fields" in req.query) {
        query = query.replace("*", req.query["fields"]);
    }

    for (var index in conditions) {
        if (conditions[index] in req.query) {
            if (query.indexOf("WHERE") < 0) {
                query += " WHERE";
            } else {
                query += " AND";
            }
            query += " " + conditions[index] + " = '" + req.query[conditions[index]] + "' ";
        }
    }

    if ("sort" in req.query) {
        var sort = req.query["sort"].split(",");
        query += " ORDER BY";
        for (var index in sort) {
            var direction = sort[index].substr(0, 1);
            var field = sort[index].substr(1);
            query += " " + field;
            if (direction == "-")
                query += " DESC,";
            else
                query += " ASC,";
        }
        query = query.slice(0, -1);
    }

    if ("limit" in req.query) {
        query += " LIMIT " + req.query["limit"];
        if ("offset" in req.query) {
            query += " OFFSET " + req.query["offset"];
        }
    }


    db.query(query, function (err, result, fields) {
        if (err) throw err;
        res.send(JSON.stringify(result));
    });
});


///PUT FOR ANIMAL	
app.put('/animals/:id', function (req, res) {
    var id = req.params.id;
    var conditions = ["name", "breed", "food_per_day", "birthday", "entry_date"];
    var query = "UPDATE animals ";
    for (var index in conditions) {
        if (conditions[index] in req.body) {
            if (query.indexOf("SET") < 0) {
                query += "SET ";
            } else {
                query += ", ";
            }
            query += " " + conditions[index] + " = '" + req.body[conditions[index]] + "' ";
        }

    }
    query += " WHERE id = '" + id + "'";

    db.query(query, function (err, result, fields) {
        if (err) throw err;
        res.send(JSON.stringify("Success"));
    });
});

///PUT FOR cage	
app.put('/cages/:id', function (req, res) {
    var id = req.params.id;
    var conditions = ["name", "description", "area"];
    var query = "UPDATE cages ";
    for (var index in conditions) {
        if (conditions[index] in req.body) {
            if (query.indexOf("SET") < 0) {
                query += "SET ";
            } else {
                query += ", ";
            }
            query += " " + conditions[index] + " = '" + req.body[conditions[index]] + "' ";
        }

    }
    query += " WHERE id = '" + id + "'";

    db.query(query, function (err, result, fields) {
        if (err) throw err;
        res.send(JSON.stringify("Success"));
    });
});

///PUT FOR food	
app.put('/food/:id', function (req, res) {
    var id = req.params.id;
    var conditions = ["name", "id_animal", "quantity"];
    var query = "UPDATE food ";
    for (var index in conditions) {
        if (conditions[index] in req.body) {
            if (query.indexOf("SET") < 0) {
                query += "SET ";
            } else {
                query += ", ";
            }
            query += " " + conditions[index] + " = '" + req.body[conditions[index]] + "' ";
        }

    }
    query += " WHERE id = '" + id + "'";

    db.query(query, function (err, result, fields) {
        if (err) throw err;
        res.send(JSON.stringify("Success"));
    });
});

///PUT FOR staff	
app.put('/staff/:id', function (req, res) {
    var id = req.params.id;
    var conditions = ["firstname", "lastname", "wage"];
    var query = "UPDATE staff ";
    for (var index in conditions) {
        if (conditions[index] in req.body) {
            if (query.indexOf("SET") < 0) {
                query += "SET ";
            } else {
                query += ", ";
            }
            query += " " + conditions[index] + " = '" + req.body[conditions[index]] + "' ";
        }

    }
    query += " WHERE id = '" + id + "'";

    db.query(query, function (err, result, fields) {
        if (err) throw err;
        res.send(JSON.stringify("Success"));
    });
});

////////DELETE///////////////
app.delete('/animals', function (req, res) {
    var query = "DELETE FROM animals";
    db.query(query, function (err, result, fields) {
        if (err) throw err;
        res.send(JSON.stringify("Success"));
    });
});

//Delete an animal
app.delete('/animals/:id', function (req, res) {
    var id = req.params.id;
    var query = "DELETE FROM animals WHERE id=" + id;
    db.query(query, function (err, result, fields) {
        if (err) throw err;
        res.send(JSON.stringify("Success"));
    });
});

//Delete all cage
app.delete('/cages', function (req, res) {
    var query = "DELETE FROM cages";
    db.query(query, function (err, result, fields) {
        if (err) throw err;
        res.send(JSON.stringify("Success"));
    });
});

//Delete a cage
app.delete('/cages/:id', function (req, res) {
    var id = req.params.id;
    var query = "DELETE FROM cages WHERE id=" + id;
    db.query(query, function (err, result, fields) {
        if (err) throw err;
        res.send(JSON.stringify("Success"));
    });
});

//Delete all food
app.delete('/food', function (req, res) {
    var query = "DELETE FROM food";
    db.query(query, function (err, result, fields) {
        if (err) throw err;
        res.send(JSON.stringify("Success"));
    });
});

//Delete a food
app.delete('/food/:id', function (req, res) {
    var id = req.params.id;
    var query = "DELETE FROM food WHERE id=" + id;
    db.query(query, function (err, result, fields) {
        if (err) throw err;
        res.send(JSON.stringify("Success"));
    });
});

//Delete all staff
app.delete('/staff', function (req, res) {
    var query = "DELETE FROM staff";
    db.query(query, function (err, result, fields) {
        if (err) throw err;
        res.send(JSON.stringify("Success"));
    });
});

//Delete a staff
app.delete('/staff/:id', function (req, res) {
    var id = req.params.id;
    var query = "DELETE FROM staff WHERE id=" + id;
    db.query(query, function (err, result, fields) {
        if (err) throw err;
        res.send(JSON.stringify("Success"));
    });
});

app.get('/animals/:id', function (req, res) {
    var id = req.params.id;
    var query = "SELECT * FROM animals WHERE id=" + id;
    db.query(query, function (err, result, fields) {
        if (err) throw err;
        res.send(JSON.stringify(result));
    });
});

app.get('/cages/:id', function (req, res) {
    var id = req.params.id;
    var query = "SELECT * FROM cages WHERE id=" + id;
    db.query(query, function (err, result, fields) {
        if (err) throw err;
        res.send(JSON.stringify(result));
    });
});

app.get('/food/:id', function (req, res) {
    var id = req.params.id;
    var query = "SELECT * FROM food WHERE id=" + id;
    db.query(query, function (err, result, fields) {
        if (err) throw err;
        res.send(JSON.stringify(result));
    });
});

app.get('/staff/:id', function (req, res) {
    var id = req.params.id;
    var query = "SELECT * FROM staff WHERE id=" + id;
    db.query(query, function (err, result, fields) {
        if (err) throw err;
        res.send(JSON.stringify(result));
    });
});
console.log('hello');
app.listen(3000, function () {
    db.connect(function (err) {
        if (err) throw err;
        console.log('Connection to database successful!');
    });
    console.log('Example app listening on port 3000!');
});