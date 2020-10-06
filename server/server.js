var loopback = require('loopback');
var boot = require('loopback-boot');
var https = require('https');
var http = require('http');
var bodyParser = require('body-parser');
var session = require('express-session');
var fileUpload = require('express-fileupload');
var fs = require('fs');
var xlstojson = require("xls-to-json-lc");
var xlsxtojson = require("xlsx-to-json-lc");
var express = require('express');
var path = require('path');
var invoicegenerator = require('./invoice-generator');
// var json2xls = require('json2xls');
var app = express();
app = module.exports = loopback();

// var options = {
//   key: fs.readFileSync(path.join(__dirname, './cert/key.pem')).toString(),
//   cert: fs.readFileSync(path.join(__dirname, './cert/cert.pem')).toString()
// };
var ssl = {
    cert: fs.readFileSync(path.join(__dirname,'./cert/bhavytechnologies.com.crt'), 'utf8'),
    ca: [fs.readFileSync(path.join(__dirname,'./cert/intermediate.crt'), 'utf8')]
};
// parse application/json
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({
// 	extended: true
// }));
app.use(bodyParser.json({
  limit: '50mb'
}));
app.use(bodyParser.urlencoded({
  limit: '50mb',
  extended: true
}));
app.use(session({
  secret: 'anuragApp'
}));
app.use(fileUpload());
// app.use (function (req, res, next) {
//         if (req.secure) {
//                 // request was via https, so do no special handling
//                 next();
//         } else {
//                 // request was via http, so redirect to https
//                 res.redirect('https://' + req.headers.host + req.url);
//         }
// });

app.start = function() {
  // start the web server
  https.createServer(ssl,app).listen(443);
  http.createServer(app).listen(80);
  return app.listen(function() {
		app.emit('started');
		var baseUrl = app.get('url').replace(/\/$/, '');
		console.log('Web server listening at: %s', baseUrl);
		if (app.get('loopback-component-explorer')) {
			var explorerPath = app.get('loopback-component-explorer').mountPath;
			console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
		}
  });
};


// app.post("/DownloadRetailersData", function(req, res) {
//   var app = require('../server/server');
//   var Customer = app.models.Customer;
//   var json = [];
//   Customer.find({})
//     .then(function(data) {
//       data.forEach((item) => {
//         json.push({
//           "Name": item.Name,
//           "Code": item.CustomerCode,
//           "City": item.City,
//           "Address": item.Address,
//           "Mobile": item.MobilePhone,
//           "E-mail": item.EmailId
//         });
//       });
//       var xls = json2xls(json);
//       var currentdate = new Date();
//       // debugger;
//       var fileDate = currentdate.getDate() + "_" + (currentdate.getMonth() + 1) + "_" +
//         currentdate.getFullYear() + "_" + currentdate.getHours() + "" + currentdate.getMinutes() + "" +
//         currentdate.getSeconds();
//       var tempFilePath = './server/retailerReports/Retailers' +fileDate+ '.xlsx';
//       var filePath = './retailerReports/Retailers' +fileDate+ '.xlsx';
//       // debugger;
//       // var filePath = 'data.xlsx';
//       fs.writeFileSync(tempFilePath, xls, 'binary');
//       // var base64 = xls.toString('base64');
//       // res.send(base64);
//       // res.xls('data.xlsx', json);
//       // // Coding to download in a folder
//       var options = {
//         root: path.join(__dirname)
//       };
//       res.sendFile(filePath, options, function(err) {
//         if (err) {
//           console.log('Not Sent:', 'Retailers.xlsx'+err);
//           // next(err);
//         } else {
//           console.log('Sent:', 'Retailers.xlsx');
//         }
//       });
//     });
// });
app.post("/DeleteProduct", function(req, res) {
  var app = require('../server/server');
  var that = this;
  if (!req.body.productCode) {
    return;
  }
  var products = app.models.Product;
  products.findOne({
    where: {
      ProductId: req.body.productCode
    }
  }).
  then(function(product) {
    if(!product){
      res.send("Product doesn't exist!");
      return;
    }
    that.productId = product.id;
    var orderItems = app.models.OrderItem;
    orderItems.findOne({
      where : {
        Material : product.id
      }
    }).
    then(function(result){
      debugger;
      if(!result){
        res.send("id :"+that.productId);
      }
      else{
        res.send("No!, Order is created with this product");
      }
    });
  });
});
app.get("/ToProdPhoto", function(req, res) {
  var app = require('../server/server');
  debugger;
});

app.post("/GetAllPhotos", function(req, res) {
  var app = require('../server/server');
  if (!req.body.productId) {
    return;
  }
  var Pics = app.models.Photo;
  Pics.find({
    where: {
      Product: req.body.productId
    }
  }).
  then(function(allImages) {
    res.send({
      "allImages": allImages
    });
  });
});

app.post("/DeletePhotos", function(req, res) {
  var app = require('../server/server');
  var Pics = app.models.Photo;
  if (!req.body.images) {
    return;
  }
  var images = req.body.images;
  for (var i = 0; i < images.length; i++) {
    Pics.destroyById(images[i].id).then(function(token) {
      res.send("deleted");
    });
  }

});

app.post("/DeletePhoto", function(req, res) {
  var app = require('../server/server');
  var Pics = app.models.Photo;
  if (!req.body.id) {
    return;
  }
  Pics.destroyById(req.body.id).then(function(token) {
    res.send("deleted");
  });
});

app.use(function(req, res, next) {
  // var Token = app.models.AccessToken;
  // if(req.method === "GET"){
  // 	next();
  // }else{
  // 	if(!req.headers.authorization){
  // 		res.send("Secure API, Authorization Error");
  // 		return;
  // 	}
  // 	Token.findById(req.headers.authorization).then(function(token){
  // 		if(token){
  // 			next();
  // 		}else{
  // 			res.send("Token Expired");
  // 			return;
  // 		}
  // 	});
  // }
  next();

});

app.post("/Photos",
  function(req, res) {
    var app = require('../server/server');
    var Pics = app.models.Photo;
    if (!req.body.images) {
      return;
    }
    var productId = req.body.images[0].Product;
    Pics.create(req.body.images, function(error, created) {
      debugger;
      if (error) {
        res.send({
          error: error
        });
      } else {
        //Read all images of the given product and send
        Pics.find({
          where: {
            Product: productId
          }
        }).
        then(function(allImages) {
          res.send({
            "allImages": allImages
          });
        });
      }
    });
  });


app.post("/SoldProduct", function(req, res) {
  var app = require('../server/server');
  var ProdWeight = app.models.ProdWeight;
  var record = req.body.record;
  if (!req.body.record.id) {
    return;
  }
  ProdWeight.findById(req.body.record.id).then(
    function(product) {
      if (!product) {
        res.send("No Record Found");
        return;
      }
      product.updateAttributes({
        "Status": "S",
        "SoldOn": new Date(),
        "OrderId": record.OrderId,
        "Remarks": record.Remarks
      });
      res.send("updated " + product.id);
    }
  );

});

app.post("/UpdateProdWeight", function(req, res) {
  var app = require('../server/server');
  var ProdWeight = app.models.ProdWeight;
  var record = req.body.record;
  if (!req.body.record.id) {
    return;
  }
  ProdWeight.findById(req.body.record.id).then(
    function(product) {
      if (!product) {
        res.send("record not found");
        return;
      }
      product.updateAttributes({
        "PairSize": record.PairSize,
        "StonePc": record.StonePc,
        "StoneRs": record.StoneRs,
        "StoneAmt": record.StoneAmt,
        "StoneWeight": record.StoneWeight,
        "StonePc1": record.StonePc1,
        "StoneWeight1": record.StoneWeight1,
        "StoneRs1": record.StoneRs1,
        "StoneAmt1": record.StoneAmt1,
        "MoPc": record.MoPc,
        "MoWeight": record.MoWeight,
        "MoRs": record.MoRs,
        "MoAmt": record.MoAmt,
        "OtherChrg": record.OtherChrg,
        "GrossWeight": record.GrossWeight,
        "LessWeight": record.LessWeight,
        "NetWeight": record.NetWeight,
        "Quantity": record.Quantity,
        "Fine": record.Fine,
        "Amount": record.Amount,
        "Remarks": record.Remarks
      });
      res.send("updated record with id ", product.id);
    }
  );

});

app.post("/GetProdWeights", function(req, res) {
  var app = require('../server/server');
  var ProdWeight = app.models.ProdWeight;
  if (!req.body.productId) {
    res.send("please pass productId");
  }
  var productId = req.body.productId;
  ProdWeight.find({
    where: {
      and: [{
          ProductId: productId
        },
        {
          Status: "A"
        }
      ]
    }
  }).
  then(function(ProdWeights) {
    res.send({
      "ProdWeights": ProdWeights
    });
  });
});

app.post("/DeleteProdWeights", function(req, res) {
  var app = require('../server/server');
  var ProdWeight = app.models.ProdWeight;
  var ProdWeights = req.body.ProdWeights;
  if (!req.body.ProdWeights) {
    return;
  }
  for (var i = 0; i < ProdWeights.length; i++) {
    ProdWeight.destroyById(ProdWeights[i].id).then(function(token) {

    });
  }

});

app.post("/ProdWeights",
  function(req, res) {
    var app = require('../server/server');
    var ProdWeight = app.models.ProdWeight;
    if (!req.body.ProdWeights) {
      res.send("nothing to create");
      return;
    }
    var productId = req.body.ProdWeights[0].ProductId;
    if (!productId) {
      res.send("product id not passed");
      return;
    }
    ProdWeight.destroyAll({
      ProductId: productId,
      Status: "A"
    }, function() {
      ProdWeight.create(req.body.ProdWeights,
        function(error, created) {
          if (error) {
            res.send({
              error: error
            });
          } else {
            //Read all images of the given product and send
            ProdWeight.find({
              where: {
                and: [{
                    ProductId: productId
                  },
                  {
                    Status: "A"
                  }
                ]
              }
            }).
            then(function(ProdWeights) {
              res.send({
                "ProdWeights": ProdWeights
              });
            });
          }
        }
      );
    });

  });

app.post('/changeUserStatus',
  function(req, res) {
    if (!req.body.emailId) {
      res.send('No Email Id');
      return;
    }

    this.AppUser = app.models.AppUser;
    var _this = this;
    _this.AppUser.findOne({
      where: {
        "EmailId": req.body.emailId
      }
    }).then(function(appUser) {
      if (appUser) {
        appUser.updateAttributes({
          blocked: req.body.bStat
        });
        res.send("Change Success");
      } else {
        res.send("User not found");
      }
    }).catch(function(err) {
      res.send("Error Occurred");
    });

  }
);

app.post('/updateLastLogin',
  function(req, res) {
    if (!req.body.emailId) {
      res.send('No Email Id');
      return;
    }
    this.AppUser = app.models.AppUser;
    var _this = this;
    _this.AppUser.findOne({
      where: {
        "EmailId": req.body.emailId
      }
    }).then(function(appUser) {
      if (appUser) {
        appUser.updateAttributes({
          lastLogin: new Date()
        });
        res.send("Change Success");
      } else {
        res.send("User not found");
      }
    }).catch(function(err) {
      res.send("Error Occurred");
    });

  }
);
app.post('/pdfInvoice',
  function(req, res) {
    // var app = require('../server/server');
    var data = invoicegenerator(req.body,'./server/'+'pdfInvoice.pdf');
    // data.pipe(res);
});
app.post('/invoice',
  function(req, res) {
    fs.readFile('./server/sampledata/invoice.html', null, function(error, data) {
      if (error) {
        res.send("Error In Printing Invoice " + error);
        return;
      } else {
        var dataList = data.toString().split('$break;');
        var oItems = '';
        var oItem = dataList[1];
        req.body.first.forEach((item) => {
          if (item) {
            item = item[0] + item.slice(1).toLowerCase();
          }
          dataList[0] = dataList[0].replace('{$Detail}', item);
        });
        req.body.second.forEach((item, index) => {
          oItem = oItem.replace('{$ItemDetail}', item);
          if (++index % 5 === 0 && index) {
            oItems += oItem;
            oItem = dataList[1];
          }
        });
        req.body.third.forEach((item) => {
          dataList[2] = dataList[2].replace('{$Total}', item);
        });
        data = dataList[0] + oItems + dataList[2];
        res.send(data);
        return;
      }
    });
  }
);
app.post('/changePassword',
  function(req, res) {
    if (!req.body.emailId) {
      res.send('No Email Id');
      return;
    }
    if (!req.body.newPassword) {
      //Retailer, Admin, Maker
      res.send('Password is empty');
      return;
    }
    if (!req.body.Authorization) {
      res.send('No Authorization');
      return;
    }

    this.Token = app.models.AccessToken;
    this.User = app.models.User;
    this.Role = app.models.Role;
    this.AppUser = app.models.AppUser;
    this.RoleMapping = app.models.RoleMapping;
    var _this = this;
    this.Token.findById(req.body.Authorization).then(function(token) {
      var _this2 = _this;
      _this2.userId = token.userId;
      _this.User.findOne({
        where: {
          email: req.body.emailId
        }
      }).then(function(user) {
        if (user) {
          user.updateAttributes({
            password: req.body.newPassword
          });
          var _this3 = _this2;
          _this2.TechnicalId = user.id;
          _this2.AppUser.findOne({
            where: {
              "EmailId": user.email
            }
          }).then(function(appUser) {
            if (appUser) {
              appUser.updateAttributes({
                pwdChange: false,
                ChangedBy: _this3.TechnicalId
              });
              res.send("Change Success");
            }
          });
        } else {
          res.send("User Not Found");
        }
      }).catch(function(err) {
        res.send("You are not Authorized to perform this action");
      });
    }).catch(function(err) {
      res.send("You are not Authorized to perform this action");
    });

  }
);

app.post('/createNewUser',
  function(req, res) {
    if (!req.body.name) {
      res.send('No user name sent');
      return;
    }
    if (!req.body.emailId) {
      res.send('No Email Id');
      return;
    }
    if (!req.body.role) {
      //Retailer, Admin, Maker
      res.send('No Role');
      return;
    }
    if (!req.body.Authorization) {
      res.send('No Authorization');
      return;
    }

    this.Token = app.models.AccessToken;
    this.User = app.models.User;
    this.Role = app.models.Role;
    this.AppUser = app.models.AppUser;
    this.RoleMapping = app.models.RoleMapping;
    var _this = this;
    this.Token.findById(req.body.Authorization).then(function(token) {
      var _this2 = _this;
      _this2.userId = token.userId;
      _this.User.findOne({
        where: {
          email: req.body.emailId
        }
      }).then(function(user) {
        if (!user) {
          var _this3 = _this2;
          _this2.User.create({
            username: req.body.name,
            email: req.body.emailId,
            password: 'Welcome1'
          }).then(function(user) {
            if (user) {
              var _this4 = _this3;
              _this3.TechnicalId = user.id;
              _this3.AppUser.findOne({
                where: {
                  "EmailId": user.email
                }
              }).then(function(roleMapping) {
                debugger;
                if (!roleMapping) {
                  _this4.AppUser.create({
                    TechnicalId: _this4.TechnicalId,
                    EmailId: req.body.emailId,
                    UserName: req.body.name,
                    Role: req.body.role,
                    CreatedOn: new Date(),
                    CreatedBy: _this4.userId,
                    blocked: false,
                    pwdChange: true,
                    lastLogin: new Date()
                  }).then(function(roleMapping) {
                    res.send("yes created");
                  });
                }
              });
            }
          });
        } else {
          res.send("User Already Exist!!");
        }
      }).catch(function(err) {
        res.send("You are not Authorized to perform this action");
      });
    }).catch(function(err) {
      res.send("You are not Authorized to perform this action");
    });

  }
);

app.post('/upload',
  function(req, res) {
    if (!req.files.myFileUpload) {
      res.send('No files were uploaded.');
      return;
    }

    var sampleFile;
    var exceltojson;

    sampleFile = req.files.myFileUpload;
    var createdBy = req.body.createdBy;
    if (createdBy === "" || createdBy === null) {
      res.json({
        error_code: 1,
        err_desc: "Name is empty"
      });
      return "Error";
    }
    sampleFile.mv('./uploads/' + req.files.myFileUpload.name, function(err) {
      if (err) {
        console.log("eror saving");
      } else {
        console.log("saved");
        if (req.files.myFileUpload.name.split('.')[req.files.myFileUpload.name.split('.').length - 1] === 'xlsx') {
          exceltojson = xlsxtojson;
          console.log("xlxs");
        } else {
          exceltojson = xlstojson;
          console.log("xls");
        }
        try {
          exceltojson({
            input: './uploads/' + req.files.myFileUpload.name,
            output: null, //since we don't need output.json
            lowerCaseHeaders: true
          }, function(err, result) {
            if (err) {
              return res.json({
                error_code: 1,
                err_desc: err,
                data: null
              });
            }
            res.json({
              error_code: 0,
              err_desc: null,
              data: result
            });

            var getMyDate = function(strDate) {
              var qdat = new Date();
              var x = strDate;
              qdat.setYear(parseInt(x.substr(0, 4)));
              qdat.setMonth(parseInt(x.substr(4, 2)) - 1);
              qdat.setDate(parseInt(x.substr(6, 2)));
              return qdat;
            };
            var Category = app.models.ProductCategory;
            var uploadType = "Inquiry";
            ///*****Code to update the batchs
            this.allResult = [];
            ///Process the result json and send to mongo for creating all inquiries
            for (var j = 0; j < result.length; j++) {
              var singleRec = result[j];

              switch (uploadType) {
                case "Inquiry":
                  var newRec = {};
                  newRec.Category = singleRec.category;
                  newRec.SubCategory = singleRec.subcategory;
                  newRec.Type = singleRec.type;
                  //singleRec.Date = getMyDate(singleRec.Date);
                  Category.findOrCreate({
                      where: {
                        and: [{
                          Category: newRec.Category
                        }, {
                          SubCategory: newRec.SubCategory
                        }, {
                          Type: newRec.Type
                        }]
                      }
                    }, newRec)
                    .then(function(inq) {
                      debugger;
                      console.log("created successfully");
                    })
                    .catch(function(err) {
                      console.log(err);
                    });
                  break;

              }
            }

          });
        } catch (e) {
          console.log("error");
          res.json({
            error_code: 1,
            err_desc: "Corupted excel file"
          });
        }

      }
    })
  }
);
// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});
