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
var xlsx = require('node-xlsx');
var async = require('async');
//var invoicegenerator = require('./invoice-generator');
// var json2xls = require('json2xls');
var app = express();
app = module.exports = loopback();

// var options = {
//   // key: fs.readFileSync(path.join(__dirname, './cert/bhavytechnologies.com.key')),
//   ca: [fs.readFileSync(path.join(__dirname,'./cert/intermediate.crt'), 'utf8')],
//   cert: fs.readFileSync(path.join(__dirname, './cert/bhavytechnologies.com.crt'))
// };
var ssl = {
	// key: fs.readFileSync(path.join(__dirname, './cert/bhavytechnologies.com.key')),
	cert: fs.readFileSync(path.join(__dirname, './cert/bhavytechnologies.com.crt'), 'utf8'),
	ca: [fs.readFileSync(path.join(__dirname, './cert/intermediate.crt'), 'utf8')]
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
	//https.createServer(ssl,app).listen(443);
	//https.createServer(ssl,app).listen(8446);
	//http.createServer(app).listen(80);
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
		if (!product) {
			res.send("Product doesn't exist!");
			return;
		}
		that.productId = product.id;
		var orderItems = app.models.OrderItem;
		orderItems.findOne({
			where: {
				Material: product.id
			}
		}).
		then(function(result) {
			debugger;
			if (!result) {
				res.send("id :" + that.productId);
			} else {
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

// app.get('/GetOrderNumber',
//   function(req, res) {
//     var Createdby = req.query.CreatedBy;
//     var OrderHeader = app.models.OrderHeader;
//     OrderHeader.count({
//         where: {
//           "CreatedBy": Createdby
//         }
//       })
//       .then(function(count) {
//         debugger;
//         res.send(count);
//       });
//   }
// );

app.get('/LastOrderItem',
	function(req, res) {
		var Createdby = req.query.CreatedBy;
		var OrderHeader = app.models.OrderHeader;
		OrderHeader.find({
				where: {
					"CreatedBy": Createdby
				},
				include: [{
					relation: 'ToOrderItems',
					scope: {
						include: ['ToMaterial', 'ToWeight']
					}
				}],
				order: "CreatedOn DESC",
				limit: 1
			})
			.then(function(orderHeader) {
				var total = 0;
				var totalGold = 0;
				var orderNo = 0;
				orderHeader.forEach((order) => {
					order.__data.ToOrderItems.forEach((item, i) => {
						item = item.__data
						total += item.ToWeight.$Amount + (item.ToWeight.$Piece * item.ToWeight.$MoreAmount) + (item.ToWeight.$GrossWeight - item.ToWeight
							.$LessWeight) * (item.ToMaterial.$Tunch + item.ToMaterial.$Wastage) * (item.ToMaterial.$Karat === "222" ? order.GoldBhav22 :
							order.GoldBhav22) / 100;
						totalGold += ((item.ToWeight.$GrossWeight - item.ToWeight.$LessWeight) * (item.ToMaterial.$Tunch + item.ToMaterial.$Wastage) /
							100);
					});
					orderNo = order.OrderNo;
				});
				res.send({
					Amount: total.toFixed(2),
					FineGold: totalGold.toFixed(3),
					OrderNo: orderNo
				});
			});
	}
);
app.get('/OrderItemApproval',
	function(req, res) {
		debugger;
		var Createdby = req.query.Createdby;
		var limit = parseInt(req.query.limit);
		// var Createdby = '60f7a49be26fabac12b998cd';
		var TagNo = req.query.TagNo;
		var OrderNo = req.query.OrderNo;
		var Category = req.query.Category;
		if (Category && Category !== "undefined") {
			var product = app.models.Product;
			product.find({
					where: {
						and: [{
							"CreatedBy": Createdby
						}, {

							"Category": Category
						}]
					}
					// ,
					// include: [
					//   ['ToOrderItem'],

					//   {
					//     relation: 'ToOrderItem',
					//     scope: {
					//       include: ['ToOrderItems'],
					//       where:{
					//         "ApproverId": Createdby
					//       },
					//       limit:limit,
					//       skip:limit-10
					//     }
					//   },

					// ],
				})
				.then(async function(product) {
					debugger;
					if (product.length > 1) {
						var ordar = [];
						for (var i = 0; i < product.length; i++) {
							var id = product[i].id.toString();

							ordar.push(id);
						}
						var OrderItem = app.models.OrderItem;
						var OrderIt = await OrderItem.find({
								where: {
									and: [{
										"ApproverId": Createdby
									}, {
										"Material": {
											inq: ordar
										}
									}]
								},
								include: [
									['ToMaterial', 'ToWeight', 'ToOrderHeader'],

									{
										relation: 'ToOrderHeader',
										scope: {
											include: ['ToOrderItems']
										}
									}, {
										relation: 'ToMaterial',
										scope: {
											include: ['ToPhotos']
										}
									},

								],
								order: "CreatedOn DESC",
								limit: limit,
								skip: limit - 10
							})
							.then()
						res.send(OrderIt);
					} else {
						var id = product[0].id.toString()
						var OrderItem = app.models.OrderItem;
						var OrderIt = await OrderItem.find({
								where: {
									and: [{
										"ApproverId": Createdby
									}, {
										"Material": id
									}]
								},
								include: [
									['ToMaterial', 'ToWeight', 'ToOrderHeader'],

									{
										relation: 'ToOrderHeader',
										scope: {
											include: ['ToOrderItems']
										}
									}, {
										relation: 'ToMaterial',
										scope: {
											include: ['ToPhotos']
										}
									},

								],
								order: "CreatedOn DESC",
								limit: limit,
								skip: limit - 10
							})
							.then()
						res.send(OrderIt);
					}
				})
				.catch(function(err) {
					debugger;
				});
		} else if (OrderNo && OrderNo !== "undefined") {
			var OrderHeader = app.models.OrderHeader;
			OrderHeader.find({
					where: {
						"InvoiceNo": OrderNo
					},
					limit: limit,
					skip: limit - 10
				})
				.then(function(orderHead) {
					// res.send(orderItems);
					debugger;
					var id = orderHead[0].id.toString()
					var OrderItem = app.models.OrderItem;
					OrderItem.find({
							where: {
								and: [{
									"ApproverId": Createdby
								}, {
									"OrderNo": id
								}]
							},
							include: [
								['ToMaterial', 'ToWeight', 'ToOrderHeader'],

								{
									relation: 'ToOrderHeader',
									scope: {
										include: ['ToOrderItems']
									}
								}, {
									relation: 'ToMaterial',
									scope: {
										include: ['ToPhotos']
									}
								},

							],
							order: "CreatedOn DESC",
							limit: limit,
							skip: limit - 10
						})
						.then(function(orderItems) {
							debugger;
							res.send(orderItems);
						})
						.catch(function(err) {
							debugger;
						});
				})
				.catch(function(err) {
					debugger;
				});
		} else if (TagNo && TagNo !== "undefined") {
			var product = app.models.Product;
			product.find({
					where: {
						and: [{
							"CreatedBy": Createdby
						}, {

							"TagNo": TagNo
						}]
					}
				})
				.then(async function(product) {
					debugger;
					var id = product[0].id.toString()
					var OrderItem = app.models.OrderItem;
					var OrderIt = await OrderItem.find({
							where: {
								and: [{
									"ApproverId": Createdby
								}, {
									"Material": id
								}]
							},
							include: [
								['ToMaterial', 'ToWeight', 'ToOrderHeader'],

								{
									relation: 'ToOrderHeader',
									scope: {
										include: ['ToOrderItems']
									}
								}, {
									relation: 'ToMaterial',
									scope: {
										include: ['ToPhotos']
									}
								},

							],
							order: "CreatedOn DESC",
							limit: limit,
							skip: limit - 10
						})
						.then()
					res.send(OrderIt);
				})
				.catch(function(err) {
					debugger;
				});
		} else {
			var OrderItem = app.models.OrderItem;
			OrderItem.find({
					where: {
						"ApproverId": Createdby
					},
					include: [
						['ToMaterial', 'ToWeight', 'ToOrderHeader'],

						{
							relation: 'ToOrderHeader',
							scope: {
								include: ['ToOrderItems']
							}
						}, {
							relation: 'ToMaterial',
							scope: {
								include: ['ToPhotos']
							}
						},

					],
					order: "CreatedOn DESC",
					limit: limit,
					skip: limit - 10
				})
				.then(function(orderItems) {
					res.send(orderItems);
				})
				.catch(function(err) {
					debugger;
				});
		}

	}
);
// app.get('/OrderItemApproval',
//   function(req, res) {
//     debugger;
//     var Createdby = req.query.Createdby;
//     var limit = parseInt(req.query.limit);
//     var Createdby = '60f7a49be26fabac12b998cd';
//     var TagNo = req.query.TagNo;
//     var OrderNo = req.query.OrderNo;
//     if (!TagNo && !OrderNo) {
//       var OrderItem = app.models.OrderItem;
//       OrderItem.find({
//           where: {
//             "ApproverId": Createdby
//           },
//           include: [
//             ['ToMaterial', 'ToWeight', 'ToOrderHeader'],
//
//             {
//               relation: 'ToOrderHeader',
//               scope: {
//                 include: ['ToOrderItems']
//               }
//             },
//
//           ],
//           order: "CreatedOn DESC",
//           limit: limit,
//           skip: limit - 10
//         })
//         .then(function(orderItems) {
//           res.send(orderItems);
//         })
//         .catch(function(err) {
//           debugger;
//         });
//     } else if (TagNo) {
//       var product = app.models.Product;
//       product.find({
//           where: {
//             and: [{
//                 "CreatedBy": Createdby
//               },
//               {
//                 "TagNo": TagNo
//               }
//             ]
//           }
//           // ,
//           // include: [
//           //   ['ToOrderItem'],
//
//           //   {
//           //     relation: 'ToOrderItem',
//           //     scope: {
//           //       include: ['ToOrderItems'],
//           //       where:{
//           //         "ApproverId": Createdby
//           //       },
//           //       limit:limit,
//           //       skip:limit-10
//           //     }
//           //   },
//
//           // ],
//         })
//         .then(function(product) {
//           debugger;
//           var id = product[0].id.toString()
//           var OrderItem = app.models.OrderItem;
//           OrderItem.find({
//               where: {
//                 and: [{
//                     "ApproverId": Createdby
//                   },
//                   {
//                     "Material": id
//                   }
//                 ]
//               },
//               include: [
//                 ['ToMaterial', 'ToWeight', 'ToOrderHeader'],
//
//                 {
//                   relation: 'ToOrderHeader',
//                   scope: {
//                     include: ['ToOrderItems']
//                   }
//                 },
//
//               ],
//               order: "CreatedOn DESC",
//               limit: limit,
//               skip: limit - 10
//             })
//             .then(function(orderItems) {
//               res.send(orderItems);
//             })
//             .catch(function(err) {
//               debugger;
//             });
//           res.send(orderItems);
//         })
//         .catch(function(err) {
//           debugger;
//         });
//     } else {
//
//     }
//
//   }
// );

app.get('/OrderItemShows',
	function(req, res) {
		debugger;
		var OrderNo = req.query.OrderNo;
		// var Createdby = '60f7dccb3ae72a407443ff0b';
		var OrderItem = app.models.OrderItem;
		OrderItem.find({
				where: {
					"OrderNo": OrderNo
				},
				include: [
					['ToMaterial', 'ToWeight', 'ToOrderHeader', "ToProduct"],

					{
						relation: 'ToOrderHeader',
						scope: {
							include: ['ToOrderItems']
						}
					}, {
						relation: 'ToMaterial',
						scope: {
							include: ['ToPhotos']
						}
					},

				],
				order: "CreatedOn DESC"
			})
			.then(function(orderItems) {
				debugger;
				res.send(orderItems);
			})
			.catch(function(err) {
				debugger;
			});
	}
);

app.get('/LastMonthOrderItems',
	function(req, res) {
		var Createdby = req.query.CreatedBy;
		var date = new Date(),
			y = date.getFullYear(),
			m = date.getMonth();
		var OrderHeader = app.models.OrderHeader;
		OrderHeader.find({
				where: {
					"CreatedBy": Createdby,
					"CreatedOn": {
						between: [new Date(y, m - 1, 1), new Date(y, m, 0)]
					}
				},
				include: [{
					relation: 'ToOrderItems',
					scope: {
						include: ['ToMaterial', 'ToWeight']
					}
				}]
			})
			.then(function(orderHeader) {
				var total = 0,
					totalGold = 0;
				orderHeader.forEach((order) => {
					order.__data.ToOrderItems.forEach((item, i) => {
						item = item.__data
						total += item.ToWeight.$Amount + (item.ToWeight.$Piece * item.ToWeight.$MoreAmount) + (item.ToWeight.$GrossWeight - item.ToWeight
							.$LessWeight) * (item.ToMaterial.$Tunch + item.ToMaterial.$Wastage) * (item.ToMaterial.$Karat === "222" ? order.GoldBhav22 :
							order.GoldBhav22) / 100;
						totalGold += ((item.ToWeight.$GrossWeight - item.ToWeight.$LessWeight) * (item.ToMaterial.$Tunch + item.ToMaterial.$Wastage) /
							100);
					});
				});

				res.send({
					FineGold: totalGold.toFixed(3),
					Amount: total.toFixed(2)
				});
			});
	}
);

app.get('/loadInvoiceDataByOrderId',
	function(req, res) {
		var idOrd = req.query.OrderId;
		var OrderHeader = app.models.OrderHeader;
		OrderHeader.findOne({
				where: {
					id: idOrd
				},
				include: [{
					relation: 'ToOrderItems',
					scope: {
						include: [{
							relation: 'ToMaterial',
							scope: {
								include: ['ToPhotos']
							}
						}, 'ToWeight']
					}
				}]
			})
			.then(function(orderHeader) {
				debugger;
				var total = 0,
					totalGold = 0;
				var invoiceItems = [];
				orderHeader.__data.ToOrderItems.forEach((item, i) => {
					item = item.__data
					invoiceItems.push({
						CODE: item.ToMaterial.$ProductId,
						GROSS_WT: item.ToWeight.$GrossWeight,
						STONE_WT: item.ToWeight.$LessWeight,
						NET_WT: item.ToWeight.$NetWeight,
						KT: item.ToMaterial.$Karat,
						SIZE: item.ToWeight.PairSize,
						PCS: item.ToWeight.$Piece,
						AMOUNT: item.ToWeight.$MoreAmount,
						FINE: parseFloat((item.ToWeight.$NetWeight * (item.ToMaterial.$Tunch + item.ToMaterial.$Wastage) / 100).toFixed(3)),
						TOTAL: item.ToWeight.$Amount + (item.ToWeight.$Piece * item.ToWeight.$MoreAmount),
						IMG: item.ToMaterial.__data.ToPhotos[0].$Content
					});
				});
				// var logo = fs.readFileSync('./server/invoice/mangalam_ornament_logo.png', 'base64');
				res.send({
					// Logo: 'data:image/png;base64,' + logo,
					InvoiceNo: orderHeader.$InvoiceNo,
					InvoiceItems: invoiceItems
				});
			});
	}
);

app.get('/LoadCartItems',
	function(req, res) {
		var Createdby = req.query.CreatedBy;
		async.waterfall([
			function(callback) {
				var CartItem = app.models.CartItem;
				CartItem.find({
						where: {
							"CreatedBy": Createdby
						},
						include: [{
							relation: 'ToMaterial',
							scope: {
								include: [{
									relation: 'ToPhotos',
									limit: 1
								}]
							}
						}, 'ToWeight']
					})
					.then(function(cartItems, err) {
						callback(err, cartItems);
					});
			},
			function(cartItems, callback) {
				app.models.CustomCalculation.find({
						//
					})
					.then(function(customCalculation, err) {
						callback(err, cartItems, customCalculation);
					});
			}
		], function(err, cartItems, customCalculation) {
			res.send({
				cartItems,
				customCalculation
			});
		});
	}
);

app.get('/LoadFavorites',
	function(req, res) {
		var Createdby = req.query.CreatedBy;
		var Favorite = app.models.FavoriteItem;
		Favorite.find({
				where: {
					"CreatedBy": Createdby
				},
				include: [{
					relation: 'ToMaterial',
					scope: {
						include: [{
							relation: 'ToPhotos',
							limit: 1
						}]
					}
				}]
			})
			.then(function(favoriteItems, err) {
				res.send(favoriteItems);
			});
	}
);

app.get('/getpattern',
	function(req, res) {
		var Createdby = req.Createdby;
		// var app = require('../server/server');
		var products = app.models.Product;
		products.find({
				where: {
					"CreatedBy": Createdby
				},
				order: "Count DESC",
				limit: 1
			})
			.then(function(Products) {
				debugger;
				if (Products.length === 0) {
					res.send("0");
				}
				var pCount = Products[0]["Count"];
				res.send(pCount.toString());
			});
	}
);

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
app.get('/getLogo',
	function(req, res) {
		var app = require('../server/server');
		var logo = fs.readFileSync('./server/invoice/mangalam_ornament_logo.png', 'base64');
		res.send(logo);
	}
);
app.post("/OrderItemApproval", async function(req, res) {
	debugger;
	var id = req.body.data.id;
	var status = req.body.data.Status;
	var RejectionReason = req.body.data.RejectionReason;
	var OrderItem = app.models.OrderItem;
	OrderItem.findById(id).then(async function(Order) {
		debugger;
		if (!Order) {
			res.send("No Record Found");
		}
		Order.updateAttributes({
			"Status": status,
			"RejectionReason": RejectionReason,
			"ApprovedOn": new Date()
		});
		var OrderNum = Order.OrderNo.toString();
		var OrderHeader = app.models.OrderHeader;
		var OrderItem = app.models.OrderItem;
		var Orders = await OrderItem.find({
			where: {
				"OrderNo": OrderNum
			}
		}).then();
		var flag = 0;
		var aFlag = 0,
			rFlag = 0;
		for (let index = 0; index < Orders.length; index++) {
			if (Orders[index].Status === "N") {
				flag = 1;
				break;
			} else if (Orders[index].Status === "A") {
				aFlag = aFlag + 1;
			} else if (Orders[index].Status === "R") {
				rFlag = rFlag + 1;
			}
		}
		if (flag === 0) {
			if (rFlag !== 0) {
				var updateOrder = await OrderHeader.findById(OrderNum).then();
				updateOrder.updateAttributes({
					"Status": "P"
				});
			}
			if (rFlag === 0) {
				var updateOrder = await OrderHeader.findById(OrderNum).then();
				updateOrder.updateAttributes({
					"Status": "A"
				});
			}
		}
		res.send("Success");
	})
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
			}, {
				Status: "A"
			}]
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
								}, {
									Status: "A"
								}]
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
// app.post('/pdfInvoice',
//   function(req, res) {
//     // var app = require('../server/server');
//     var data = invoicegenerator(req.body,'./server/'+'pdfInvoice.pdf');
//     // data.pipe(res);
// });
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

app.post('/PurchaseLiteSave', async function(req, res) {
	debugger;
	var app = require('../server/server');
	var oProdWeight = app.models.ProdWeight;
	var oProduct = app.models.Product;
	var oPhoto = app.models.Photo;
	var oCategoies = app.models.Category;
	var payload = req.body.allData;

	try {
		// var Product=await oProduct.create(data.Product);
		for (var i = 0; i < payload.length; i++) {
			var oCat = await oCategoies.find({
				where: {
					ItemCode: payload[i].ItemCode
				}
			});
			debugger;
			var pdt = {
				"ProductId": payload[i].ProductId,
				"TagNo": payload[i].TagNo.toUpperCase(),
				"Name": payload[i].Name,
				"Category": payload[i].ItemCode,
				"Tunch": payload[i].Tunch,
				"Type": payload[i].Type,
				"SubCategory": payload[i].SubCategory,
				"Count": payload[i].Count,
				"Wastage": payload[i].Rate,
				"GrossWeight": payload[i].GWt,
				"AlertQuantity": 0,
				"BatchId": payload[i].BatchId,
				"CreatedBy": payload[i].CreatedBy,
				"ItemCode": oCat[0].id.toString(),
				"Karat": payload[i].Karat,
				"CreatedOn": new Date(),

			};
			var Product = await oProduct.create(pdt);
			debugger;
			var wgt = {
				"ProductId": Product.id,
				"Amount": payload[i].Amount,
				"GrossWeight": payload[i].GWt,
				"LessWeight": payload[i].LessWt,
				"NetWeight": payload[i].NetWt,
				"Fine": payload[i].FineGold,
				"PairSize": payload[i].Size,
				"Remarks": payload[i].Remark,
				"Piece": payload[i].PCS,
				"MoreAmount": payload[i].MoreAmount
			};
			var weight = await oProdWeight.create(wgt);
			debugger;
			if (payload[i].Photo) {
				var seq = 0;
				for (var j = 0; j < payload[i].Photo.length; j++) {
					var pht = {
						"Product": Product.id,
						"FileName": payload[i].Photo[j].Name,
						"Stream": payload[i].Photo[j].Stream,
						"Content": payload[i].Photo[j].Content,
						"SeqNo": seq
					};
					seq = seq + 1;
					var Photo = await oPhoto.create(pht);
					debugger;
				}
			}
		}
		res.send("all data saved successfully");
	} catch (e) {
		debugger;
		res.send(e);
	}
});

app.get('/ReportDownload', function(req, res) {
	debugger;
	var that = this;
	var rowPos = 3.15;
	var CreatedBy = req.query.CreatedBy;
	let rowIndex = 0;
	//read customer name by id, group by group id, city by
	//read kacchi and print report with all coloring, formatting, totaling
	var responseData = [];
	var oSubCounter = {};
	var Product = app.models.Product;

	var async = require('async');
	Product.find({
		where: {
			"CreatedBy": CreatedBy
		},
		include: [
			['ToCategory', 'ToWeights', "ToPhotos"],

		],
		order: "CreatedOn DESC"
	}).then(function(Records, err) {
			debugger;
			if (Records) {
				var excel = require('exceljs');
				var workbook = new excel.Workbook(); //creating workbook
				var sheet = workbook.addWorksheet('MySheet'); //creating worksheet
				var heading = {
					heading: "Product Report"
				};
				sheet.mergeCells('A1:M1');
				sheet.getCell('M1').value = 'Product Report';
				sheet.getCell('A1').alignment = {
					vertical: 'middle',
					horizontal: 'center'
				};

				sheet.getCell('A1').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: '808080'
					}
				};

				//Merging second Row
				sheet.mergeCells('A2:M2');

				//Code for getting current datetime
				var currentdate = new Date();
				var num = Records.length;
				var datetime = currentdate.getDate() + "." +
					(currentdate.getMonth() + 1) + "." +
					currentdate.getFullYear() + " / " +
					currentdate.getHours() + ":" +
					currentdate.getMinutes() + ":" +
					currentdate.getSeconds();
				sheet.getCell('A2').value = 'Products' + '(' + num + ')    ' + '\t' + '\n' + datetime;
				sheet.getCell('A2').alignment = {
					vertical: 'middle',
					horizontal: 'center'
				};

				sheet.getRow(2).font === {
					bold: true
				};

				var header = ["Category", "TagNo", "SubCategory", "Karat", "Gender", "Tunch", "GrossWt", "LessWt", "Fine", "Amount",
					"Remarks", "Status", "Picture"
				];

				sheet.addRow().values = header;

				//Coding for cell color and bold character
				sheet.getCell('A3').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: 'A9A9A9'
					}
				};
				sheet.getCell('B3').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: 'A9A9A9'
					}
				};
				sheet.getCell('C3').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: 'A9A9A9'
					}
				};
				sheet.getCell('D3').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: 'A9A9A9'
					}
				};
				sheet.getCell('E3').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: 'A9A9A9'
					}
				};
				sheet.getCell('F3').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: 'A9A9A9'
					}
				};
				sheet.getCell('G3').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: 'A9A9A9'
					}
				};
				sheet.getCell('H3').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: 'A9A9A9'
					}
				};
				sheet.getCell('I3').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: 'A9A9A9'
					}
				};
				sheet.getCell('J3').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: 'A9A9A9'
					}
				};
				sheet.getCell('K3').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: 'A9A9A9'
					}
				};
				sheet.getCell('L3').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: 'A9A9A9'
					}
				};
				sheet.getCell('M3').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: 'A9A9A9'
					}
				};
				// sheet.getCell('N3').fill = {
				// 	type: 'pattern',
				// 	pattern: 'solid',
				// 	fgColor: {
				// 		argb: 'A9A9A9'
				// 	}
				// };

				var totalG = 0;
				var totalH = 0;
				var totalI = 0;
				var totalJ = 0;
				var totalK = 0;
				//code added by surya 10 nov - start

				// define function to change date format to dd.mm.yyyy using date Object
				function formatDateForEntry(date) {
					var d = new Date(date),
						month = '' + (d.getMonth() + 1),
						day = '' + d.getDate(),
						year = d.getFullYear();

					if (month.length < 2)
						month = '0' + month;
					if (day.length < 2)
						day = '0' + day;

					return [day, month, year].join('.');
				}

				var colMaxLengthA, colMaxLengthB, colMaxLengthC, colMaxLengthD, colMaxLengthE, colMaxLengthF, colMaxLengthG, colMaxLengthH,
					colMaxLengthI, colMaxLengthJ, colMaxLengthK, colMaxLengthL, colMaxLengthM

				for (var i = 0; i < Records["length"]; i++) {
					var items = Records[i].__data;
					var weights = items["ToWeights"];
					var categories = items["ToCategory"];
					var images = items["ToPhotos"];
					for (var j = 0; j < weights.length; j++) {
						var weight = weights[j];
					}
					// for (var l = 0; l < categories.length; l++) {
					var category = categories.__data;
					// }

					for (var k = 0; k < images.length; k++) {
						var image = images[k];
						var myBase64Image = image["Content"];
						// var imageBuffer = decodeBase64Image(myBase64Image);
						var imageId1 = workbook.addImage({
							base64: myBase64Image,
							extension: 'jpeg,jpg,png',
						});
						// sheet.addImage(imageId1, {
						//   ext: { width: 20, height: 20 }
						// });
					}

					// items["CreatedOn"] = formatDateForEntry(items["CreatedOn"]);
					// var item = [items["Name"], items["TagNo"], items["Category"], items["SubCategory"], items["Karat"], items["Gender"], items["Tunch"],
					// 	items["GrossWeight"], weight["LessWeight"], weight["Fine"], weight["Amount"], weight["Remarks"], items["ProdStatus"]
					// ];

					// sheet.addRow().values = item;
					sheet.addImage(imageId1, {
						tl: {
							col: 12.13,
							row: rowPos++
						},
						ext: {
							width: 85,
							height: 58
						}
					});

					var data11 = items["Category"] + ", " + category["Category"];

					items["CreatedOn"] = formatDateForEntry(items["CreatedOn"]);
					var item = [data11, items["TagNo"], items["SubCategory"], items["Karat"], items["Gender"], items["Tunch"],
						items["GrossWeight"], weight["LessWeight"], weight["Fine"], weight["Amount"], items["Name"], items["OverallStatus"]
					];

					totalG = totalG + items["Tunch"];
					totalH = totalH + items["GrossWeight"];
					totalI = totalI + weight["LessWeight"];
					totalJ = totalJ + weight["Fine"];
					totalK = totalK + weight["Amount"];
					sheet.addRow().values = item;
				}

				//Coding for formula and concatenation in the last line
				var totText = Records["length"] + 4;
				var totCol = totText - 1;
				totalG = totalG.toFixed(3);
				totalH = totalH.toFixed(2);
				totalI = totalI.toFixed(2);
				totalJ = totalJ.toFixed(2);
				totalK = totalK.toFixed(2);
				// sheet.getCell('A').value = items["Category"];
				sheet.getCell('A' + totText).value = "TOTAL";
				sheet.getCell('F' + totText).value = totalG;
				sheet.getCell('G' + totText).value = totalH;
				sheet.getCell('H' + totText).value = totalI;
				sheet.getCell('I' + totText).value = totalJ;
				sheet.getCell('J' + totText).value = totalK;

				for (var rowIndex = 4; rowIndex < sheet.rowCount; rowIndex++) {
					sheet.getRow(rowIndex).height = 64;
				}
				sheet.getCell('A' + totText).value = "TOTAL";

				//Coding for rows and column border
				for (var j = 1; j <= totText; j++) {
					if (sheet.getCell('A' + (j)).value == '') {
						sheet.getCell('A' + (j)).fill = {
							type: 'pattern',
							pattern: 'solid',
							bgColor: {
								argb: 'FFFFFF'
							},
							fgColor: {
								argb: 'FFFFFF'
							}
						};

					} else if (sheet.getCell('A' + (j)).value < 0) {
						sheet.getCell('A' + (j)).font = {
							color: {
								argb: 'FF0000'
							},
							bold: true
						};
					} else {
						sheet.getCell('A' + (j)).font = {
							color: {
								argb: '000000'
							},
							bold: true
						};
					}

					if (sheet.getCell('B' + (j)).value == '') {
						sheet.getCell('C' + (j)).fill = {
							type: 'pattern',
							pattern: 'solid',
							bgColor: {
								argb: 'FFFFFF'
							},
							fgColor: {
								argb: 'FFFFFF'
							}
						};

					} else if (sheet.getCell('B' + (j)).value < 0) {
						sheet.getCell('B' + (j)).font = {
							color: {
								argb: 'FF0000'
							},
							bold: true
						};
					} else {
						sheet.getCell('B' + (j)).font = {
							color: {
								argb: '000000'
							},
							bold: true
						};
					}

					////
					// if (sheet.getCell('C' + (j)).value == '') {
					// 	sheet.getCell('C' + (j)).fill = {
					// 		type: 'pattern',
					// 		pattern: 'solid',
					// 		bgColor: {
					// 			argb: 'FFFFFF'
					// 		},
					// 		fgColor: {
					// 			argb: 'FFFFFF'
					// 		}
					// 	};
					//
					// } else if (sheet.getCell('C' + (j)).value < 0) {
					// 	sheet.getCell('C' + (j)).font = {
					// 		color: {
					// 			argb: 'FF0000'
					// 		},
					// 		bold: true
					// 	};
					// } else {
					// 	sheet.getCell('C' + (j)).font = {
					// 		color: {
					// 			argb: '000000'
					// 		},
					// 		bold: true
					// 	};
					// }
					//

					if (sheet.getCell('C' + (j)).value == '') {
						sheet.getCell('C' + (j)).fill = {
							type: 'pattern',
							pattern: 'solid',
							bgColor: {
								argb: 'FFFFFF'
							},
							fgColor: {
								argb: 'FFFFFF'
							}
						};

					} else if (sheet.getCell('C' + (j)).value < 0) {
						sheet.getCell('C' + (j)).font = {
							color: {
								argb: 'FF0000'
							},
							bold: true
						};
					} else {
						sheet.getCell('C' + (j)).font = {
							color: {
								argb: '000000'
							},
							bold: true
						};
					}

					if (sheet.getCell('D' + (j)).value == '') {
						sheet.getCell('D' + (j)).fill = {
							type: 'pattern',
							pattern: 'solid',
							bgColor: {
								argb: 'FFFFFF'
							},
							fgColor: {
								argb: 'FFFFFF'
							}
						};

					} else if (sheet.getCell('D' + (j)).value < 0) {
						sheet.getCell('D' + (j)).font = {
							color: {
								argb: 'FF0000'
							},
							bold: true
						};
					} else {
						sheet.getCell('D' + (j)).font = {
							color: {
								argb: '000000'
							},
							bold: true
						};
					}

					if (sheet.getCell('E' + (j)).value == '') {
						sheet.getCell('E' + (j)).fill = {
							type: 'pattern',
							pattern: 'solid',
							bgColor: {
								argb: 'FFFFFF'
							},
							fgColor: {
								argb: 'FFFFFF'
							}
						};

					} else if (sheet.getCell('E' + (j)).value < 0) {
						sheet.getCell('E' + (j)).font = {
							color: {
								argb: 'FF0000'
							},
							bold: true
						};
					} else {
						sheet.getCell('E' + (j)).font = {
							color: {
								argb: '000000'
							},
							bold: true
						};
					}

					// if (sheet.getCell('F' + (j)).value == '') {
					// 	sheet.getCell('F' + (j)).fill = {
					// 		type: 'pattern',
					// 		pattern: 'solid',
					// 		bgColor: {
					// 			argb: 'FFFFFF'
					// 		},
					// 		fgColor: {
					// 			argb: 'FFFFFF'
					// 		}
					// 	};
					//
					// } else if (sheet.getCell('F' + (j)).value < 0) {
					// 	sheet.getCell('F' + (j)).font = {
					// 		color: {
					// 			argb: 'FF0000'
					// 		},
					// 		bold: true
					// 	};
					// } else {
					// 	sheet.getCell('F' + (j)).font = {
					// 		color: {
					// 			argb: '000000'
					// 		},
					// 		bold: true
					// 	};
					// }

					if (sheet.getCell('F' + (j)).value == '') {
						sheet.getCell('F' + (j)).fill = {
							type: 'pattern',
							pattern: 'solid',
							bgColor: {
								argb: 'FFFFFF'
							},
							fgColor: {
								argb: 'FFFFFF'
							}
						};
						if (j > 3 || j <= (totText - 2)) {
							var valC = sheet.getCell('F' + (j)).value;
							sheet.getCell('F' + (j)).value = valC + '';
							sheet.getCell('F' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					} else if (sheet.getCell('F' + (j)).value < 0) {
						sheet.getCell('F' + (j)).font = {
							color: {
								argb: 'FF0000'
							},
							bold: true
						};
						if (j > 3 || j <= (totText - 2)) {
							var valC = sheet.getCell('F' + (j)).value;
							sheet.getCell('F' + (j)).value = valC + ' ';
							sheet.getCell('F' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					} else {
						sheet.getCell('F' + (j)).font = {
							color: {
								argb: '000000'
							},
							bold: true
						};
						if (j > 3 && j <= (totText)) {
							var valC = sheet.getCell('F' + (j)).value;
							sheet.getCell('F' + (j)).value = valC + ' T';
							sheet.getCell('F' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					}

					if (sheet.getCell('G' + (j)).value == '') {
						sheet.getCell('G' + (j)).fill = {
							type: 'pattern',
							pattern: 'solid',
							bgColor: {
								argb: 'FFFFFF'
							},
							fgColor: {
								argb: 'FFFFFF'
							}
						};
						if (j > 3 || j <= (totText - 2)) {
							var valC = sheet.getCell('G' + (j)).value;
							sheet.getCell('G' + (j)).value = valC + '';
							sheet.getCell('G' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					} else if (sheet.getCell('G' + (j)).value < 0) {
						sheet.getCell('G' + (j)).font = {
							color: {
								argb: 'FF0000'
							},
							bold: true
						};
						if (j > 3 || j <= (totText - 2)) {
							var valC = sheet.getCell('G' + (j)).value;
							sheet.getCell('G' + (j)).value = valC + ' ';
							sheet.getCell('G' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					} else {
						sheet.getCell('G' + (j)).font = {
							color: {
								argb: '000000'
							},
							bold: true
						};
						if (j > 3 && j <= (totText)) {
							var valC = sheet.getCell('G' + (j)).value;
							sheet.getCell('G' + (j)).value = valC + ' gm';
							sheet.getCell('G' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					}
					if (sheet.getCell('H' + (j)).value == '') {
						sheet.getCell('H' + (j)).fill = {
							type: 'pattern',
							pattern: 'solid',
							bgColor: {
								argb: 'FFFFFF'
							},
							fgColor: {
								argb: 'FFFFFF'
							}
						};
						if (j > 3 || j <= (totText - 2)) {
							var valC = sheet.getCell('H' + (j)).value;
							sheet.getCell('H' + (j)).value = valC + '';
							sheet.getCell('H' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					} else if (sheet.getCell('H' + (j)).value < 0) {
						sheet.getCell('H' + (j)).font = {
							color: {
								argb: 'FF0000'
							},
							bold: true
						};
						if (j > 3 || j <= (totText - 2)) {
							var valC = sheet.getCell('H' + (j)).value;
							sheet.getCell('H' + (j)).value = valC + ' ';
							sheet.getCell('H' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					} else {
						sheet.getCell('H' + (j)).font = {
							color: {
								argb: '000000'
							},
							bold: true
						};
						if (j > 3 && j <= (totText)) {
							var valC = sheet.getCell('H' + (j)).value;
							sheet.getCell('H' + (j)).value = valC + ' gm';
							sheet.getCell('H' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					}
					if (sheet.getCell('I' + (j)).value == '') {
						sheet.getCell('I' + (j)).fill = {
							type: 'pattern',
							pattern: 'solid',
							bgColor: {
								argb: 'FFFFFF'
							},
							fgColor: {
								argb: 'FFFFFF'
							}
						};
						if (j > 3 || j <= (totText - 2)) {
							var valC = sheet.getCell('I' + (j)).value;
							sheet.getCell('I' + (j)).value = valC + '';
							sheet.getCell('I' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					} else if (sheet.getCell('I' + (j)).value < 0) {
						sheet.getCell('I' + (j)).font = {
							color: {
								argb: 'FF0000'
							},
							bold: true
						};
						if (j > 3 || j <= (totText - 2)) {
							var valC = sheet.getCell('I' + (j)).value;
							sheet.getCell('I' + (j)).value = valC + ' ';
							sheet.getCell('I' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					} else {
						sheet.getCell('I' + (j)).font = {
							color: {
								argb: '000000'
							},
							bold: true
						};
						if (j > 3 && j <= (totText)) {
							var valC = sheet.getCell('I' + (j)).value;
							sheet.getCell('I' + (j)).value = valC + ' gm';
							sheet.getCell('I' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					}
					if (sheet.getCell('J' + (j)).value == '') {
						sheet.getCell('J' + (j)).fill = {
							type: 'pattern',
							pattern: 'solid',
							bgColor: {
								argb: 'FFFFFF'
							},
							fgColor: {
								argb: 'FFFFFF'
							}
						};

					} else if (sheet.getCell('J' + (j)).value < 0) {
						sheet.getCell('J' + (j)).font = {
							color: {
								argb: 'FF0000'
							},
							bold: true
						};
					} else {
						sheet.getCell('J' + (j)).font = {
							color: {
								argb: '000000'
							},
							bold: true
						};
					}

					if (sheet.getCell('K' + (j)).value == '') {
						sheet.getCell('K' + (j)).fill = {
							type: 'pattern',
							pattern: 'solid',
							bgColor: {
								argb: 'FFFFFF'
							},
							fgColor: {
								argb: 'FFFFFF'
							}
						};

					} else if (sheet.getCell('K' + (j)).value < 0) {
						sheet.getCell('K' + (j)).font = {
							color: {
								argb: 'FF0000'
							},
							bold: true
						};
					} else {
						sheet.getCell('K' + (j)).font = {
							color: {
								argb: '000000'
							},
							bold: true
						};
					}

					if (sheet.getCell('L' + (j)).value == '') {
						sheet.getCell('F' + (j)).fill = {
							type: 'pattern',
							pattern: 'solid',
							bgColor: {
								argb: 'FFFFFF'
							},
							fgColor: {
								argb: 'FFFFFF'
							}
						};
						if (j > 3 || j <= (totText - 2)) {
							var valC = sheet.getCell('L' + (j)).value;
							sheet.getCell('L' + (j)).value = valC + '';
							sheet.getCell('L' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					} else if (sheet.getCell('L' + (j)).value < 0) {
						sheet.getCell('L' + (j)).font = {
							color: {
								argb: 'FF0000'
							},
							bold: true
						};
						if (j > 3 || j <= (totText - 2)) {
							var valC = sheet.getCell('L' + (j)).value;
							sheet.getCell('F' + (j)).value = valC + ' ';
							sheet.getCell('F' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					} else {
						sheet.getCell('L' + (j)).font = {
							color: {
								argb: '000000'
							},
							bold: true
						};
						if (j > 3 && j <= (totText - 1)) {
							var valC = sheet.getCell('L' + (j)).value;
							if (valC === 'A') {
								sheet.getCell('L' + (j)).value = 'Approved';
							} else if (valC === 'R') {
								sheet.getCell('L' + (j)).value = 'Rejected';
							} else if (valC === 'N') {
								sheet.getCell('L' + (j)).value = 'Draft';
							}

							sheet.getCell('L' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					}

					if (sheet.getCell('M' + (j)).value == '') {
						sheet.getCell('M' + (j)).fill = {
							type: 'pattern',
							pattern: 'solid',
							bgColor: {
								argb: 'FFFFFF'
							},
							fgColor: {
								argb: 'FFFFFF'
							}
						};

					} else if (sheet.getCell('M' + (j)).value < 0) {
						sheet.getCell('M' + (j)).font = {
							color: {
								argb: 'FF0000'
							},
							bold: true
						};
					} else {
						sheet.getCell('M' + (j)).font = {
							color: {
								argb: '000000'
							},
							bold: true
						};
					}
					// if (sheet.getCell('N' + (j)).value == '') {
					// 	sheet.getCell('N' + (j)).fill = {
					// 		type: 'pattern',
					// 		pattern: 'solid',
					// 		bgColor: {
					// 			argb: 'FFFFFF'
					// 		},
					// 		fgColor: {
					// 			argb: 'FFFFFF'
					// 		}
					// 	};
					//
					// } else if (sheet.getCell('N' + (j)).value < 0) {
					// 	sheet.getCell('N' + (j)).font = {
					// 		color: {
					// 			argb: 'FF0000'
					// 		},
					// 		bold: true
					// 	};
					// } else {
					// 	sheet.getCell('N' + (j)).font = {
					// 		color: {
					// 			argb: '000000'
					// 		},
					// 		bold: true
					// 	};
					// }

					////
					sheet.getCell('A' + (j)).border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
					};
					sheet.getCell('B' + (j)).border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
					};
					sheet.getCell('C' + (j)).border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
					};
					sheet.getCell('D' + (j)).border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
					};
					sheet.getCell('E' + (j)).border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
					};

					sheet.getCell('F' + (j)).border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
					};
					sheet.getCell('G' + (j)).border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
					};

					sheet.getCell('H' + (j)).border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
					};

					sheet.getCell('I' + (j)).border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
					};

					sheet.getCell('J' + (j)).border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
					};
					sheet.getCell('K' + (j)).border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
					};
					sheet.getCell('L' + (j)).border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
					};
					sheet.getCell('M' + (j)).border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
					};
					// sheet.getCell('N' + (j)).border = {
					// 	top: {
					// 		style: 'thin'
					// 	},
					// 	left: {
					// 		style: 'thin'
					// 	},
					// 	bottom: {
					// 		style: 'thin'
					// 	},
					// 	right: {
					// 		style: 'thin'
					// 	}
					// };

					// code added by surya for autocolumn width - started
					//setting absolute length for column A
					if (j > "2") {

						if (sheet.getCell('A' + (j)).value !== null) {
							if (j == "3") {
								colMaxLengthA = sheet.getCell('A' + (j)).value.length;
							} else {
								if (sheet.getCell('A' + (j)).value.length > colMaxLengthA) {
									colMaxLengthA = sheet.getCell('A' + (j)).value.length;
								}
							}
						}
						if (j == totText) {
							sheet.getColumn('A').width = colMaxLengthA + 7;
						}

						if (sheet.getCell('B' + (j)).value !== null) {
							if (j == "3") {
								colMaxLengthB = sheet.getCell('B' + (j)).value.length;
							} else {
								if (sheet.getCell('B' + (j)).value.length > colMaxLengthB) {
									colMaxLengthB = sheet.getCell('B' + (j)).value.length;
								}
							}
						}
						if (j == totText) {
							sheet.getColumn('B').width = colMaxLengthB + 1;
						}
						//setting absolute length for column B
						if (sheet.getCell('C' + (j)).value !== null) {
							if (j == "3") {
								colMaxLengthC = sheet.getCell('C' + (j)).value.length;
							} else {
								if (sheet.getCell('C' + (j)).value.length > colMaxLengthC) {
									colMaxLengthC = sheet.getCell('C' + (j)).value.length;
								}
							}
						}
						if (j == totText) {
							sheet.getColumn('C').width = colMaxLengthC + 3;
						}
						//setting absolute length for column C
						if (sheet.getCell('D' + (j)).value !== null) {
							if (j == "3") {
								colMaxLengthD = sheet.getCell('D' + (j)).value.length;
							} else {
								if (sheet.getCell('D' + (j)).value.length > colMaxLengthD) {
									colMaxLengthD = sheet.getCell('D' + (j)).value.length;
								}
							}
						}
						if (j == totText) {
							sheet.getColumn('D').width = colMaxLengthD + 5;
						}
						//setting absolute length for column D
						if (sheet.getCell('E' + (j)).value !== null) {
							if (j == "3") {
								colMaxLengthE = sheet.getCell('E' + (j)).value.length;
							} else {
								if (sheet.getCell('E' + (j)).value.length > colMaxLengthE) {
									colMaxLengthE = sheet.getCell('E' + (j)).value.length;
								}
							}
						}
						if (j == totText) {
							sheet.getColumn('E').width = colMaxLengthE + 3;
						}
						//setting absolute length for column E
						if (sheet.getCell('F' + (j)).value !== null) {
							if (j == "3") {
								colMaxLengthF = sheet.getCell('F' + (j)).value.length;
							} else {
								if (sheet.getCell('F' + (j)).value.length > colMaxLengthF) {
									colMaxLengthF = sheet.getCell('F' + (j)).value.length;
								}
							}
						}
						if (j == totText) {
							sheet.getColumn('F').width = colMaxLengthF + 1;
						}

						if (sheet.getCell('G' + (j)).value !== null) {
							if (j == "3") {
								colMaxLengthG = sheet.getCell('G' + (j)).value.length;
							} else {
								if (sheet.getCell('G' + (j)).value.length > colMaxLengthG) {
									colMaxLengthG = sheet.getCell('G' + (j)).value.length;
								}
							}
						}
						if (j == totText) {
							sheet.getColumn('G').width = colMaxLengthG + 3;
						}
						if (sheet.getCell('H' + (j)).value !== null) {
							if (j == "3") {
								colMaxLengthH = sheet.getCell('H' + (j)).value.length;
							} else {
								if (sheet.getCell('A' + (j)).value.length > colMaxLengthH) {
									colMaxLengthH = sheet.getCell('H' + (j)).value.length;
								}
							}
						}
						if (j == totText) {
							sheet.getColumn('H').width = colMaxLengthH + 3;
						}
						if (sheet.getCell('I' + (j)).value !== null) {
							if (j == "3") {
								colMaxLengthI = sheet.getCell('I' + (j)).value.length;
							} else {
								if (sheet.getCell('I' + (j)).value.length > colMaxLengthI) {
									colMaxLengthI = sheet.getCell('I' + (j)).value.length;
								}
							}
						}
						if (j == totText) {
							sheet.getColumn('I').width = colMaxLengthI + 3;
						}
						if (sheet.getCell('J' + (j)).value !== null) {
							if (j == "3") {
								colMaxLengthJ = sheet.getCell('J' + (j)).value.length;
							} else {
								if (sheet.getCell('J' + (j)).value.length > colMaxLengthJ) {
									colMaxLengthJ = sheet.getCell('J' + (j)).value.length;
								}
							}
						}
						if (j == totText) {
							sheet.getColumn('J').width = colMaxLengthJ + 4;
						}
						if (sheet.getCell('K' + (j)).value !== null) {
							if (j == "3") {
								colMaxLengthK = sheet.getCell('K' + (j)).value.length;
							} else {
								if (sheet.getCell('K' + (j)).value.length > colMaxLengthK) {
									colMaxLengthK = sheet.getCell('K' + (j)).value.length;
								}
							}
						}
						if (j == totText) {
							sheet.getColumn('K').width = colMaxLengthK + 5;
						}
						if (sheet.getCell('L' + (j)).value !== null) {
							if (j == "3") {
								colMaxLengthL = sheet.getCell('L' + (j)).value.length;
							} else {
								if (sheet.getCell('L' + (j)).value.length > colMaxLengthL) {
									colMaxLengthL = sheet.getCell('L' + (j)).value.length;
								}
							}
						}
						if (j == totText) {
							sheet.getColumn('L').width = colMaxLengthL + 7;
						}
						if (sheet.getCell('M' + (j)).value !== null) {
							if (j == "3") {
								colMaxLengthM = sheet.getCell('M' + (j)).value.length;
							} else {
								if (sheet.getCell('M' + (j)).value.length > colMaxLengthM) {
									colMaxLengthM = sheet.getCell('M' + (j)).value.length;
								}
							}
						}
						if (j == totText) {
							sheet.getColumn('M').width = colMaxLengthM + 7;
						}
						// if (sheet.getCell('N' + (j)).value !== null) {
						// 	if (j == "3") {
						// 		colMaxLengthN = sheet.getCell('N' + (j)).value.length;
						// 	} else {
						// 		if (sheet.getCell('N' + (j)).value.length > colMaxLengthN) {
						// 			colMaxLengthN = sheet.getCell('N' + (j)).value.length;
						// 		}
						// 	}
						// }
						// if (j == totText) {
						// 	sheet.getColumn('N').width = colMaxLengthN + 7;
						// }
					}
					// code added by surya for autocolumn width - ended

				}

				const tempFileName = 'Product Report' + currentdate.getDate() + "-" + (currentdate.getMonth() + 1) + '-' + currentdate.getFullYear() +
					"-" +
					currentdate.getHours() + ':' + currentdate.getMinutes() + ':' + currentdate.getSeconds() + '.xlsx';

				res.setHeader(
					"Content-Type",
					"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
				);
				res.setHeader(
					"Content-Disposition",
					"attachment; filename=" + tempFileName
				);
				return workbook.xlsx.write(res).then(function(data) {
					console.log(data);
					res.status(200).end();
				});
			}

		}

	).catch(function(oError) {
		res.send("Show Alert");

	});

	//res.send(responseData);

});

app.get('/adminReportDownload', function(req, res) {
	debugger;
	var that = this;
	var rowPos = 3.15;
	var CreatedBy = req.query.CreatedBy;
	let rowIndex = 0;
	//read customer name by id, group by group id, city by
	//read kacchi and print report with all coloring, formatting, totaling
	var responseData = [];
	var oSubCounter = {};
	var Product = app.models.Product;

	var async = require('async');
	Product.find({
		// where: {
		// 	"CreatedBy": CreatedBy
		// },
		include: [
			['ToCategory', 'ToWeights', "ToPhotos", "ToCreatedBy"],

		],
		order: "CreatedOn DESC"
	}).then(function(Records, err) {
			debugger;
			if (Records) {
				var excel = require('exceljs');
				var workbook = new excel.Workbook(); //creating workbook
				var sheet = workbook.addWorksheet('MySheet'); //creating worksheet
				var heading = {
					heading: "Product Report"
				};
				sheet.mergeCells('A1:N1');
				sheet.getCell('N1').value = 'All Products Report';
				sheet.getCell('A1').alignment = {
					vertical: 'middle',
					horizontal: 'center'
				};

				sheet.getCell('A1').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: '808080'
					}
				};

				//Merging second Row
				sheet.mergeCells('A2:N2');

				//Code for getting current datetime
				var currentdate = new Date();
				var num = Records.length;
				var datetime = currentdate.getDate() + "." +
					(currentdate.getMonth() + 1) + "." +
					currentdate.getFullYear() + " / " +
					currentdate.getHours() + ":" +
					currentdate.getMinutes() + ":" +
					currentdate.getSeconds();
				sheet.getCell('A2').value = 'All Products' + '(' + num + ')    ' + '\t' + '\n' + datetime;
				sheet.getCell('A2').alignment = {
					vertical: 'middle',
					horizontal: 'center'
				};

				sheet.getRow(2).font === {
					bold: true
				};

				var header = ["Manufacturer", "Category", "TagNo", "SubCategory", "Karat", "Gender", "Tunch", "GrossWt", "LessWt", "Fine", "Amount",
					"Remarks", "Status", "Picture"
				];

				sheet.addRow().values = header;

				//Coding for cell color and bold character
				sheet.getCell('A3').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: 'A9A9A9'
					}
				};
				sheet.getCell('B3').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: 'A9A9A9'
					}
				};
				sheet.getCell('C3').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: 'A9A9A9'
					}
				};
				sheet.getCell('D3').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: 'A9A9A9'
					}
				};
				sheet.getCell('E3').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: 'A9A9A9'
					}
				};
				sheet.getCell('F3').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: 'A9A9A9'
					}
				};
				sheet.getCell('G3').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: 'A9A9A9'
					}
				};
				sheet.getCell('H3').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: 'A9A9A9'
					}
				};
				sheet.getCell('I3').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: 'A9A9A9'
					}
				};
				sheet.getCell('J3').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: 'A9A9A9'
					}
				};
				sheet.getCell('K3').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: 'A9A9A9'
					}
				};
				sheet.getCell('L3').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: 'A9A9A9'
					}
				};
				sheet.getCell('M3').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: 'A9A9A9'
					}
				};

				sheet.getCell('N3').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: 'A9A9A9'
					}
				};
				// sheet.getCell('N3').fill = {
				// 	type: 'pattern',
				// 	pattern: 'solid',
				// 	fgColor: {
				// 		argb: 'A9A9A9'
				// 	}
				// };

				var totalG = 0;
				var totalH = 0;
				var totalI = 0;
				var totalJ = 0;
				var totalK = 0;
				//code added by surya 10 nov - start

				// define function to change date format to dd.mm.yyyy using date Object
				function formatDateForEntry(date) {
					var d = new Date(date),
						month = '' + (d.getMonth() + 1),
						day = '' + d.getDate(),
						year = d.getFullYear();

					if (month.length < 2)
						month = '0' + month;
					if (day.length < 2)
						day = '0' + day;

					return [day, month, year].join('.');
				}

				var colMaxLengthA, colMaxLengthB, colMaxLengthC, colMaxLengthD, colMaxLengthE, colMaxLengthF, colMaxLengthG, colMaxLengthH,
					colMaxLengthI, colMaxLengthJ, colMaxLengthK, colMaxLengthL, colMaxLengthM, colMaxLengthN

				for (var i = 0; i < Records["length"]; i++) {
					var items = Records[i].__data;
					var weights = items["ToWeights"];
					var categories = items["ToCategory"];
					var images = items["ToPhotos"];
					var manufacturer = items["ToCreatedBy"];
					for (var j = 0; j < weights.length; j++) {
						var weight = weights[j];
					}
					// for (var l = 0; l < categories.length; l++) {
					var category = categories.__data;
					var createdBy1 = manufacturer.__data;
					// }

					for (var k = 0; k < images.length; k++) {
						var image = images[k];
						var myBase64Image = image["Content"];
						// var imageBuffer = decodeBase64Image(myBase64Image);
						var imageId1 = workbook.addImage({
							base64: myBase64Image,
							extension: 'jpeg,jpg,png',
						});
					}

					sheet.addImage(imageId1, {
						tl: {
							col: 13.13,
							row: rowPos++
						},
						ext: {
							width: 85,
							height: 58
						}
					});

					var data11 = items["Category"] + ", " + category["Category"];

					items["CreatedOn"] = formatDateForEntry(items["CreatedOn"]);
					var item = [createdBy1["username"], data11, items["TagNo"], items["SubCategory"], items["Karat"], items["Gender"], items["Tunch"],
						items["GrossWeight"], weight["LessWeight"], weight["Fine"], weight["Amount"], items["Name"], items["OverallStatus"]
					];

					totalG = totalG + items["Tunch"];
					totalH = totalH + items["GrossWeight"];
					totalI = totalI + weight["LessWeight"];
					totalJ = totalJ + weight["Fine"];
					totalK = totalK + weight["Amount"];
					sheet.addRow().values = item;
				}

				//Coding for formula and concatenation in the last line
				var totText = Records["length"] + 4;
				var totCol = totText - 1;
				totalG = totalG.toFixed(3);
				totalH = totalH.toFixed(2);
				totalI = totalI.toFixed(2);
				totalJ = totalJ.toFixed(2);
				totalK = totalK.toFixed(2);
				// sheet.getCell('A').value = items["Category"];
				sheet.getCell('A' + totText).value = "TOTAL";
				sheet.getCell('G' + totText).value = totalG;
				sheet.getCell('H' + totText).value = totalH;
				sheet.getCell('I' + totText).value = totalI;
				sheet.getCell('J' + totText).value = totalJ;
				sheet.getCell('K' + totText).value = totalK;

				for (var rowIndex = 4; rowIndex < sheet.rowCount; rowIndex++) {
					sheet.getRow(rowIndex).height = 64;
				}
				sheet.getCell('A' + totText).value = "TOTAL";

				//Coding for rows and column border
				for (var j = 1; j <= totText; j++) {
					if (sheet.getCell('A' + (j)).value == '') {
						sheet.getCell('A' + (j)).fill = {
							type: 'pattern',
							pattern: 'solid',
							bgColor: {
								argb: 'FFFFFF'
							},
							fgColor: {
								argb: 'FFFFFF'
							}
						};

					} else if (sheet.getCell('A' + (j)).value < 0) {
						sheet.getCell('A' + (j)).font = {
							color: {
								argb: 'FF0000'
							},
							bold: true
						};
					} else {
						sheet.getCell('A' + (j)).font = {
							color: {
								argb: '000000'
							},
							bold: true
						};
					}

					if (sheet.getCell('B' + (j)).value == '') {
						sheet.getCell('C' + (j)).fill = {
							type: 'pattern',
							pattern: 'solid',
							bgColor: {
								argb: 'FFFFFF'
							},
							fgColor: {
								argb: 'FFFFFF'
							}
						};

					} else if (sheet.getCell('B' + (j)).value < 0) {
						sheet.getCell('B' + (j)).font = {
							color: {
								argb: 'FF0000'
							},
							bold: true
						};
					} else {
						sheet.getCell('B' + (j)).font = {
							color: {
								argb: '000000'
							},
							bold: true
						};
					}

					if (sheet.getCell('C' + (j)).value == '') {
						sheet.getCell('C' + (j)).fill = {
							type: 'pattern',
							pattern: 'solid',
							bgColor: {
								argb: 'FFFFFF'
							},
							fgColor: {
								argb: 'FFFFFF'
							}
						};

					} else if (sheet.getCell('C' + (j)).value < 0) {
						sheet.getCell('C' + (j)).font = {
							color: {
								argb: 'FF0000'
							},
							bold: true
						};
					} else {
						sheet.getCell('C' + (j)).font = {
							color: {
								argb: '000000'
							},
							bold: true
						};
					}

					if (sheet.getCell('D' + (j)).value == '') {
						sheet.getCell('D' + (j)).fill = {
							type: 'pattern',
							pattern: 'solid',
							bgColor: {
								argb: 'FFFFFF'
							},
							fgColor: {
								argb: 'FFFFFF'
							}
						};

					} else if (sheet.getCell('D' + (j)).value < 0) {
						sheet.getCell('D' + (j)).font = {
							color: {
								argb: 'FF0000'
							},
							bold: true
						};
					} else {
						sheet.getCell('D' + (j)).font = {
							color: {
								argb: '000000'
							},
							bold: true
						};
					}

					if (sheet.getCell('E' + (j)).value == '') {
						sheet.getCell('E' + (j)).fill = {
							type: 'pattern',
							pattern: 'solid',
							bgColor: {
								argb: 'FFFFFF'
							},
							fgColor: {
								argb: 'FFFFFF'
							}
						};

					} else if (sheet.getCell('E' + (j)).value < 0) {
						sheet.getCell('E' + (j)).font = {
							color: {
								argb: 'FF0000'
							},
							bold: true
						};
					} else {
						sheet.getCell('E' + (j)).font = {
							color: {
								argb: '000000'
							},
							bold: true
						};
					}

					if (sheet.getCell('F' + (j)).value == '') {
						sheet.getCell('F' + (j)).fill = {
							type: 'pattern',
							pattern: 'solid',
							bgColor: {
								argb: 'FFFFFF'
							},
							fgColor: {
								argb: 'FFFFFF'
							}
						};

					} else if (sheet.getCell('F' + (j)).value < 0) {
						sheet.getCell('F' + (j)).font = {
							color: {
								argb: 'FF0000'
							},
							bold: true
						};
					} else {
						sheet.getCell('F' + (j)).font = {
							color: {
								argb: '000000'
							},
							bold: true
						};
					}

					if (sheet.getCell('G' + (j)).value == '') {
						sheet.getCell('G' + (j)).fill = {
							type: 'pattern',
							pattern: 'solid',
							bgColor: {
								argb: 'FFFFFF'
							},
							fgColor: {
								argb: 'FFFFFF'
							}
						};
						if (j > 3 || j <= (totText - 2)) {
							var valC = sheet.getCell('G' + (j)).value;
							sheet.getCell('G' + (j)).value = valC + '';
							sheet.getCell('G' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					} else if (sheet.getCell('G' + (j)).value < 0) {
						sheet.getCell('G' + (j)).font = {
							color: {
								argb: 'FF0000'
							},
							bold: true
						};
						if (j > 3 || j <= (totText - 2)) {
							var valC = sheet.getCell('G' + (j)).value;
							sheet.getCell('G' + (j)).value = valC + ' ';
							sheet.getCell('G' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					} else {
						sheet.getCell('G' + (j)).font = {
							color: {
								argb: '000000'
							},
							bold: true
						};
						if (j > 3 && j <= (totText)) {
							var valC = sheet.getCell('G' + (j)).value;
							sheet.getCell('G' + (j)).value = valC + ' T';
							sheet.getCell('G' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					}

					if (sheet.getCell('H' + (j)).value == '') {
						sheet.getCell('H' + (j)).fill = {
							type: 'pattern',
							pattern: 'solid',
							bgColor: {
								argb: 'FFFFFF'
							},
							fgColor: {
								argb: 'FFFFFF'
							}
						};
						if (j > 3 || j <= (totText - 2)) {
							var valC = sheet.getCell('H' + (j)).value;
							sheet.getCell('H' + (j)).value = valC + '';
							sheet.getCell('H' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					} else if (sheet.getCell('H' + (j)).value < 0) {
						sheet.getCell('H' + (j)).font = {
							color: {
								argb: 'FF0000'
							},
							bold: true
						};
						if (j > 3 || j <= (totText - 2)) {
							var valC = sheet.getCell('H' + (j)).value;
							sheet.getCell('H' + (j)).value = valC + ' ';
							sheet.getCell('H' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					} else {
						sheet.getCell('H' + (j)).font = {
							color: {
								argb: '000000'
							},
							bold: true
						};
						if (j > 3 && j <= (totText)) {
							var valC = sheet.getCell('H' + (j)).value;
							sheet.getCell('H' + (j)).value = valC + ' gm';
							sheet.getCell('H' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					}
					if (sheet.getCell('I' + (j)).value == '') {
						sheet.getCell('I' + (j)).fill = {
							type: 'pattern',
							pattern: 'solid',
							bgColor: {
								argb: 'FFFFFF'
							},
							fgColor: {
								argb: 'FFFFFF'
							}
						};
						if (j > 3 || j <= (totText - 2)) {
							var valC = sheet.getCell('I' + (j)).value;
							sheet.getCell('I' + (j)).value = valC + '';
							sheet.getCell('I' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					} else if (sheet.getCell('I' + (j)).value < 0) {
						sheet.getCell('I' + (j)).font = {
							color: {
								argb: 'FF0000'
							},
							bold: true
						};
						if (j > 3 || j <= (totText - 2)) {
							var valC = sheet.getCell('I' + (j)).value;
							sheet.getCell('I' + (j)).value = valC + ' ';
							sheet.getCell('I' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					} else {
						sheet.getCell('I' + (j)).font = {
							color: {
								argb: '000000'
							},
							bold: true
						};
						if (j > 3 && j <= (totText)) {
							var valC = sheet.getCell('I' + (j)).value;
							sheet.getCell('I' + (j)).value = valC + ' gm';
							sheet.getCell('I' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					}
					if (sheet.getCell('J' + (j)).value == '') {
						sheet.getCell('J' + (j)).fill = {
							type: 'pattern',
							pattern: 'solid',
							bgColor: {
								argb: 'FFFFFF'
							},
							fgColor: {
								argb: 'FFFFFF'
							}
						};
						if (j > 3 || j <= (totText - 2)) {
							var valC = sheet.getCell('J' + (j)).value;
							sheet.getCell('J' + (j)).value = valC + '';
							sheet.getCell('J' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					} else if (sheet.getCell('J' + (j)).value < 0) {
						sheet.getCell('J' + (j)).font = {
							color: {
								argb: 'FF0000'
							},
							bold: true
						};
						if (j > 3 || j <= (totText - 2)) {
							var valC = sheet.getCell('J' + (j)).value;
							sheet.getCell('J' + (j)).value = valC + ' ';
							sheet.getCell('J' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					} else {
						sheet.getCell('J' + (j)).font = {
							color: {
								argb: '000000'
							},
							bold: true
						};
						if (j > 3 && j <= (totText)) {
							var valC = sheet.getCell('J' + (j)).value;
							sheet.getCell('J' + (j)).value = valC + ' gm';
							sheet.getCell('J' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					}
					if (sheet.getCell('K' + (j)).value == '') {
						sheet.getCell('K' + (j)).fill = {
							type: 'pattern',
							pattern: 'solid',
							bgColor: {
								argb: 'FFFFFF'
							},
							fgColor: {
								argb: 'FFFFFF'
							}
						};

					} else if (sheet.getCell('K' + (j)).value < 0) {
						sheet.getCell('K' + (j)).font = {
							color: {
								argb: 'FF0000'
							},
							bold: true
						};
					} else {
						sheet.getCell('K' + (j)).font = {
							color: {
								argb: '000000'
							},
							bold: true
						};
					}

					if (sheet.getCell('L' + (j)).value == '') {
						sheet.getCell('L' + (j)).fill = {
							type: 'pattern',
							pattern: 'solid',
							bgColor: {
								argb: 'FFFFFF'
							},
							fgColor: {
								argb: 'FFFFFF'
							}
						};

					} else if (sheet.getCell('L' + (j)).value < 0) {
						sheet.getCell('L' + (j)).font = {
							color: {
								argb: 'FF0000'
							},
							bold: true
						};
					} else {
						sheet.getCell('L' + (j)).font = {
							color: {
								argb: '000000'
							},
							bold: true
						};
					}

					if (sheet.getCell('M' + (j)).value == '') {
						sheet.getCell('M' + (j)).fill = {
							type: 'pattern',
							pattern: 'solid',
							bgColor: {
								argb: 'FFFFFF'
							},
							fgColor: {
								argb: 'FFFFFF'
							}
						};
						if (j > 3 || j <= (totText - 2)) {
							var valC = sheet.getCell('M' + (j)).value;
							sheet.getCell('M' + (j)).value = valC + '';
							sheet.getCell('M' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					} else if (sheet.getCell('M' + (j)).value < 0) {
						sheet.getCell('M' + (j)).font = {
							color: {
								argb: 'FF0000'
							},
							bold: true
						};
						if (j > 3 || j <= (totText - 2)) {
							var valC = sheet.getCell('M' + (j)).value;
							sheet.getCell('M' + (j)).value = valC + ' ';
							sheet.getCell('M' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					} else {
						sheet.getCell('M' + (j)).font = {
							color: {
								argb: '000000'
							},
							bold: true
						};
						if (j > 3 && j <= (totText - 1)) {
							var valC = sheet.getCell('M' + (j)).value;
							if (valC === 'A') {
								sheet.getCell('M' + (j)).value = 'Approved';
							} else if (valC === 'R') {
								sheet.getCell('M' + (j)).value = 'Rejected';
							} else if (valC === 'N') {
								sheet.getCell('M' + (j)).value = 'Draft';
							}

							sheet.getCell('M' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					}

					if (sheet.getCell('N' + (j)).value == '') {
						sheet.getCell('N' + (j)).fill = {
							type: 'pattern',
							pattern: 'solid',
							bgColor: {
								argb: 'FFFFFF'
							},
							fgColor: {
								argb: 'FFFFFF'
							}
						};

					} else if (sheet.getCell('N' + (j)).value < 0) {
						sheet.getCell('N' + (j)).font = {
							color: {
								argb: 'FF0000'
							},
							bold: true
						};
					} else {
						sheet.getCell('N' + (j)).font = {
							color: {
								argb: '000000'
							},
							bold: true
						};
					}
					// if (sheet.getCell('N' + (j)).value == '') {
					// 	sheet.getCell('N' + (j)).fill = {
					// 		type: 'pattern',
					// 		pattern: 'solid',
					// 		bgColor: {
					// 			argb: 'FFFFFF'
					// 		},
					// 		fgColor: {
					// 			argb: 'FFFFFF'
					// 		}
					// 	};
					//
					// } else if (sheet.getCell('N' + (j)).value < 0) {
					// 	sheet.getCell('N' + (j)).font = {
					// 		color: {
					// 			argb: 'FF0000'
					// 		},
					// 		bold: true
					// 	};
					// } else {
					// 	sheet.getCell('N' + (j)).font = {
					// 		color: {
					// 			argb: '000000'
					// 		},
					// 		bold: true
					// 	};
					// }

					////
					sheet.getCell('A' + (j)).border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
					};
					sheet.getCell('B' + (j)).border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
					};
					sheet.getCell('C' + (j)).border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
					};
					sheet.getCell('D' + (j)).border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
					};
					sheet.getCell('E' + (j)).border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
					};

					sheet.getCell('F' + (j)).border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
					};
					sheet.getCell('G' + (j)).border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
					};

					sheet.getCell('H' + (j)).border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
					};

					sheet.getCell('I' + (j)).border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
					};

					sheet.getCell('J' + (j)).border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
					};
					sheet.getCell('K' + (j)).border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
					};
					sheet.getCell('L' + (j)).border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
					};
					sheet.getCell('M' + (j)).border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
					};

					sheet.getCell('N' + (j)).border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
					};
					// sheet.getCell('N' + (j)).border = {
					// 	top: {
					// 		style: 'thin'
					// 	},
					// 	left: {
					// 		style: 'thin'
					// 	},
					// 	bottom: {
					// 		style: 'thin'
					// 	},
					// 	right: {
					// 		style: 'thin'
					// 	}
					// };

					// code added by surya for autocolumn width - started
					//setting absolute length for column A
					if (j > "2") {

						if (sheet.getCell('A' + (j)).value !== null) {
							if (j == "3") {
								colMaxLengthA = sheet.getCell('A' + (j)).value.length;
							} else {
								if (sheet.getCell('A' + (j)).value.length > colMaxLengthA) {
									colMaxLengthA = sheet.getCell('A' + (j)).value.length;
								}
							}
						}
						if (j == totText) {
							sheet.getColumn('A').width = colMaxLengthA + 7;
						}

						if (sheet.getCell('B' + (j)).value !== null) {
							if (j == "3") {
								colMaxLengthB = sheet.getCell('B' + (j)).value.length;
							} else {
								if (sheet.getCell('B' + (j)).value.length > colMaxLengthB) {
									colMaxLengthB = sheet.getCell('B' + (j)).value.length;
								}
							}
						}
						if (j == totText) {
							sheet.getColumn('B').width = colMaxLengthB + 1;
						}
						//setting absolute length for column B
						if (sheet.getCell('C' + (j)).value !== null) {
							if (j == "3") {
								colMaxLengthC = sheet.getCell('C' + (j)).value.length;
							} else {
								if (sheet.getCell('C' + (j)).value.length > colMaxLengthC) {
									colMaxLengthC = sheet.getCell('C' + (j)).value.length;
								}
							}
						}
						if (j == totText) {
							sheet.getColumn('C').width = colMaxLengthC + 3;
						}
						//setting absolute length for column C
						if (sheet.getCell('D' + (j)).value !== null) {
							if (j == "3") {
								colMaxLengthD = sheet.getCell('D' + (j)).value.length;
							} else {
								if (sheet.getCell('D' + (j)).value.length > colMaxLengthD) {
									colMaxLengthD = sheet.getCell('D' + (j)).value.length;
								}
							}
						}
						if (j == totText) {
							sheet.getColumn('D').width = colMaxLengthD + 5;
						}
						//setting absolute length for column D
						if (sheet.getCell('E' + (j)).value !== null) {
							if (j == "3") {
								colMaxLengthE = sheet.getCell('E' + (j)).value.length;
							} else {
								if (sheet.getCell('E' + (j)).value.length > colMaxLengthE) {
									colMaxLengthE = sheet.getCell('E' + (j)).value.length;
								}
							}
						}
						if (j == totText) {
							sheet.getColumn('E').width = colMaxLengthE + 3;
						}
						//setting absolute length for column E
						if (sheet.getCell('F' + (j)).value !== null) {
							if (j == "3") {
								colMaxLengthF = sheet.getCell('F' + (j)).value.length;
							} else {
								if (sheet.getCell('F' + (j)).value.length > colMaxLengthF) {
									colMaxLengthF = sheet.getCell('F' + (j)).value.length;
								}
							}
						}
						if (j == totText) {
							sheet.getColumn('F').width = colMaxLengthF + 1;
						}

						if (sheet.getCell('G' + (j)).value !== null) {
							if (j == "3") {
								colMaxLengthG = sheet.getCell('G' + (j)).value.length;
							} else {
								if (sheet.getCell('G' + (j)).value.length > colMaxLengthG) {
									colMaxLengthG = sheet.getCell('G' + (j)).value.length;
								}
							}
						}
						if (j == totText) {
							sheet.getColumn('G').width = colMaxLengthG + 3;
						}
						if (sheet.getCell('H' + (j)).value !== null) {
							if (j == "3") {
								colMaxLengthH = sheet.getCell('H' + (j)).value.length;
							} else {
								if (sheet.getCell('H' + (j)).value.length > colMaxLengthH) {
									colMaxLengthH = sheet.getCell('H' + (j)).value.length;
								}
							}
						}
						if (j == totText) {
							sheet.getColumn('H').width = colMaxLengthH + 3;
						}
						if (sheet.getCell('I' + (j)).value !== null) {
							if (j == "3") {
								colMaxLengthI = sheet.getCell('I' + (j)).value.length;
							} else {
								if (sheet.getCell('I' + (j)).value.length > colMaxLengthI) {
									colMaxLengthI = sheet.getCell('I' + (j)).value.length;
								}
							}
						}
						if (j == totText) {
							sheet.getColumn('I').width = colMaxLengthI + 3;
						}
						if (sheet.getCell('J' + (j)).value !== null) {
							if (j == "3") {
								colMaxLengthJ = sheet.getCell('J' + (j)).value.length;
							} else {
								if (sheet.getCell('J' + (j)).value.length > colMaxLengthJ) {
									colMaxLengthJ = sheet.getCell('J' + (j)).value.length;
								}
							}
						}
						if (j == totText) {
							sheet.getColumn('J').width = colMaxLengthJ + 4;
						}
						if (sheet.getCell('K' + (j)).value !== null) {
							if (j == "3") {
								colMaxLengthK = sheet.getCell('K' + (j)).value.length;
							} else {
								if (sheet.getCell('K' + (j)).value.length > colMaxLengthK) {
									colMaxLengthK = sheet.getCell('K' + (j)).value.length;
								}
							}
						}
						if (j == totText) {
							sheet.getColumn('K').width = colMaxLengthK + 5;
						}
						if (sheet.getCell('L' + (j)).value !== null) {
							if (j == "3") {
								colMaxLengthL = sheet.getCell('L' + (j)).value.length;
							} else {
								if (sheet.getCell('L' + (j)).value.length > colMaxLengthL) {
									colMaxLengthL = sheet.getCell('L' + (j)).value.length;
								}
							}
						}
						if (j == totText) {
							sheet.getColumn('L').width = colMaxLengthL + 7;
						}
						if (sheet.getCell('M' + (j)).value !== null) {
							if (j == "3") {
								colMaxLengthM = sheet.getCell('M' + (j)).value.length;
							} else {
								if (sheet.getCell('M' + (j)).value.length > colMaxLengthM) {
									colMaxLengthM = sheet.getCell('M' + (j)).value.length;
								}
							}
						}
						if (j == totText) {
							sheet.getColumn('M').width = colMaxLengthM + 7;
						}
						if (sheet.getCell('N' + (j)).value !== null) {
							if (j == "3") {
								colMaxLengthN = sheet.getCell('N' + (j)).value.length;
							} else {
								if (sheet.getCell('N' + (j)).value.length > colMaxLengthN) {
									colMaxLengthN = sheet.getCell('N' + (j)).value.length;
								}
							}
						}
						if (j == totText) {
							sheet.getColumn('N').width = colMaxLengthN + 7;
						}
					}
					// code added by surya for autocolumn width - ended

				}

				const tempFileName = 'Product Report' + currentdate.getDate() + "-" + (currentdate.getMonth() + 1) + '-' + currentdate.getFullYear() +
					"-" +
					currentdate.getHours() + ':' + currentdate.getMinutes() + ':' + currentdate.getSeconds() + '.xlsx';

				res.setHeader(
					"Content-Type",
					"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
				);
				res.setHeader(
					"Content-Disposition",
					"attachment; filename=" + tempFileName
				);
				return workbook.xlsx.write(res).then(function(data) {
					console.log(data);
					res.status(200).end();
				});
			}

		}

	).catch(function(oError) {
		res.send("Show Alert");

	});

	//res.send(responseData);

});

app.get('/adminReportDownloadbyManufacturer', function(req, res) {
	debugger;
	var that = this;
	var rowPos = 3.15;
	var CreatedBy = req.query.CreatedBy;
	let rowIndex = 0;
	//read customer name by id, group by group id, city by
	//read kacchi and print report with all coloring, formatting, totaling
	var responseData = [];
	var oSubCounter = {};
	var Product = app.models.Product;

	var async = require('async');
	Product.find({
		where: {
			"CreatedBy": CreatedBy
		},
		include: [
			['ToCategory', 'ToWeights', "ToPhotos", "ToCreatedBy"],

		],
		order: "CreatedOn DESC"
	}).then(function(Records, err) {
			debugger;

			if (Records.length === 0 || Records.length === 0 || Records.length === '0' || Records === undefined || Records === "" || Records ===
				" ") {
				res.send("Error");
				return;
			}
			if (Records) {
				var excel = require('exceljs');
				var workbook = new excel.Workbook(); //creating workbook
				var sheet = workbook.addWorksheet('MySheet'); //creating worksheet
				var heading = {
					heading: "Product Report"
				};
				sheet.mergeCells('A1:N1');
				sheet.getCell('N1').value = 'All Products Report';
				sheet.getCell('A1').alignment = {
					vertical: 'middle',
					horizontal: 'center'
				};

				sheet.getCell('A1').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: '808080'
					}
				};

				//Merging second Row
				sheet.mergeCells('A2:N2');

				//Code for getting current datetime
				var currentdate = new Date();
				var num = Records.length;
				var datetime = currentdate.getDate() + "." +
					(currentdate.getMonth() + 1) + "." +
					currentdate.getFullYear() + " / " +
					currentdate.getHours() + ":" +
					currentdate.getMinutes() + ":" +
					currentdate.getSeconds();
				sheet.getCell('A2').value = 'All Products' + '(' + num + ')    ' + '\t' + '\n' + datetime;
				sheet.getCell('A2').alignment = {
					vertical: 'middle',
					horizontal: 'center'
				};

				sheet.getRow(2).font === {
					bold: true
				};

				var header = ["Manufacturer", "Category", "TagNo", "SubCategory", "Karat", "Gender", "Tunch", "GrossWt", "LessWt", "Fine", "Amount",
					"Remarks", "Status", "Picture"
				];

				sheet.addRow().values = header;

				//Coding for cell color and bold character
				sheet.getCell('A3').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: 'A9A9A9'
					}
				};
				sheet.getCell('B3').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: 'A9A9A9'
					}
				};
				sheet.getCell('C3').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: 'A9A9A9'
					}
				};
				sheet.getCell('D3').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: 'A9A9A9'
					}
				};
				sheet.getCell('E3').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: 'A9A9A9'
					}
				};
				sheet.getCell('F3').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: 'A9A9A9'
					}
				};
				sheet.getCell('G3').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: 'A9A9A9'
					}
				};
				sheet.getCell('H3').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: 'A9A9A9'
					}
				};
				sheet.getCell('I3').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: 'A9A9A9'
					}
				};
				sheet.getCell('J3').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: 'A9A9A9'
					}
				};
				sheet.getCell('K3').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: 'A9A9A9'
					}
				};
				sheet.getCell('L3').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: 'A9A9A9'
					}
				};
				sheet.getCell('M3').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: 'A9A9A9'
					}
				};

				sheet.getCell('N3').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: 'A9A9A9'
					}
				};
				// sheet.getCell('N3').fill = {
				// 	type: 'pattern',
				// 	pattern: 'solid',
				// 	fgColor: {
				// 		argb: 'A9A9A9'
				// 	}
				// };

				var totalG = 0;
				var totalH = 0;
				var totalI = 0;
				var totalJ = 0;
				var totalK = 0;
				//code added by surya 10 nov - start

				// define function to change date format to dd.mm.yyyy using date Object
				function formatDateForEntry(date) {
					var d = new Date(date),
						month = '' + (d.getMonth() + 1),
						day = '' + d.getDate(),
						year = d.getFullYear();

					if (month.length < 2)
						month = '0' + month;
					if (day.length < 2)
						day = '0' + day;

					return [day, month, year].join('.');
				}

				var colMaxLengthA, colMaxLengthB, colMaxLengthC, colMaxLengthD, colMaxLengthE, colMaxLengthF, colMaxLengthG, colMaxLengthH,
					colMaxLengthI, colMaxLengthJ, colMaxLengthK, colMaxLengthL, colMaxLengthM, colMaxLengthN

				for (var i = 0; i < Records["length"]; i++) {
					var items = Records[i].__data;
					var weights = items["ToWeights"];
					var categories = items["ToCategory"];
					var images = items["ToPhotos"];
					var manufacturer = items["ToCreatedBy"];
					for (var j = 0; j < weights.length; j++) {
						var weight = weights[j];
					}
					// for (var l = 0; l < categories.length; l++) {
					var category = categories.__data;
					var createdBy1 = manufacturer.__data;
					// }

					for (var k = 0; k < images.length; k++) {
						var image = images[k];
						var myBase64Image = image["Content"];
						// var imageBuffer = decodeBase64Image(myBase64Image);
						var imageId1 = workbook.addImage({
							base64: myBase64Image,
							extension: 'jpeg,jpg,png',
						});
						// sheet.addImage(imageId1, {
						//   ext: { width: 20, height: 20 }
						// });
					}

					// items["CreatedOn"] = formatDateForEntry(items["CreatedOn"]);
					// var item = [items["Name"], items["TagNo"], items["Category"], items["SubCategory"], items["Karat"], items["Gender"], items["Tunch"],
					// 	items["GrossWeight"], weight["LessWeight"], weight["Fine"], weight["Amount"], weight["Remarks"], items["ProdStatus"]
					// ];

					// sheet.addRow().values = item;
					sheet.addImage(imageId1, {
						tl: {
							col: 13.13,
							row: rowPos++
						},
						ext: {
							width: 85,
							height: 58
						}
					});

					var data11 = items["Category"] + ", " + category["Category"];

					items["CreatedOn"] = formatDateForEntry(items["CreatedOn"]);
					var item = [createdBy1["username"], data11, items["TagNo"], items["SubCategory"], items["Karat"], items["Gender"], items["Tunch"],
						items["GrossWeight"], weight["LessWeight"], weight["Fine"], weight["Amount"], items["Name"], items["OverallStatus"]
					];

					totalG = totalG + items["Tunch"];
					totalH = totalH + items["GrossWeight"];
					totalI = totalI + weight["LessWeight"];
					totalJ = totalJ + weight["Fine"];
					totalK = totalK + weight["Amount"];
					sheet.addRow().values = item;
				}

				//Coding for formula and concatenation in the last line
				var totText = Records["length"] + 4;
				var totCol = totText - 1;
				totalG = totalG.toFixed(3);
				totalH = totalH.toFixed(2);
				totalI = totalI.toFixed(2);
				totalJ = totalJ.toFixed(2);
				totalK = totalK.toFixed(2);
				// sheet.getCell('A').value = items["Category"];
				sheet.getCell('A' + totText).value = "TOTAL";
				sheet.getCell('G' + totText).value = totalG;
				sheet.getCell('H' + totText).value = totalH;
				sheet.getCell('I' + totText).value = totalI;
				sheet.getCell('J' + totText).value = totalJ;
				sheet.getCell('K' + totText).value = totalK;

				for (var rowIndex = 4; rowIndex < sheet.rowCount; rowIndex++) {
					sheet.getRow(rowIndex).height = 64;
				}
				sheet.getCell('A' + totText).value = "TOTAL";
				// sheet.getCell('A' + totText).fill = {
				// 	type: 'pattern',
				// 	pattern: 'solid',
				// 	fgColor: {
				// 		argb: 'FFFFFF'
				// 	},
				// 	bgColor: {
				// 		argb: 'A9A9A9'
				// 	}
				// };
				// sheet.getCell('A' + totText).font = {
				// 	color: {
				// 		argb: '000000'
				// 	},
				// 	bold: true
				// };
				//
				// sheet.getCell('B' + totText).fill = {
				// 	type: 'pattern',
				// 	pattern: 'solid',
				// 	fgColor: {
				// 		argb: 'FFFFFF'
				// 	},
				// 	bgColor: {
				// 		argb: 'FFFFFF'
				// 	}
				// };
				// sheet.getCell('B' + totText).font = {
				// 	color: {
				// 		argb: '0000FF'
				// 	},
				// 	bold: true
				// };

				//Coding for rows and column border
				for (var j = 1; j <= totText; j++) {
					if (sheet.getCell('A' + (j)).value == '') {
						sheet.getCell('A' + (j)).fill = {
							type: 'pattern',
							pattern: 'solid',
							bgColor: {
								argb: 'FFFFFF'
							},
							fgColor: {
								argb: 'FFFFFF'
							}
						};

					} else if (sheet.getCell('A' + (j)).value < 0) {
						sheet.getCell('A' + (j)).font = {
							color: {
								argb: 'FF0000'
							},
							bold: true
						};
					} else {
						sheet.getCell('A' + (j)).font = {
							color: {
								argb: '000000'
							},
							bold: true
						};
					}

					if (sheet.getCell('B' + (j)).value == '') {
						sheet.getCell('C' + (j)).fill = {
							type: 'pattern',
							pattern: 'solid',
							bgColor: {
								argb: 'FFFFFF'
							},
							fgColor: {
								argb: 'FFFFFF'
							}
						};

					} else if (sheet.getCell('B' + (j)).value < 0) {
						sheet.getCell('B' + (j)).font = {
							color: {
								argb: 'FF0000'
							},
							bold: true
						};
					} else {
						sheet.getCell('B' + (j)).font = {
							color: {
								argb: '000000'
							},
							bold: true
						};
					}

					if (sheet.getCell('C' + (j)).value == '') {
						sheet.getCell('C' + (j)).fill = {
							type: 'pattern',
							pattern: 'solid',
							bgColor: {
								argb: 'FFFFFF'
							},
							fgColor: {
								argb: 'FFFFFF'
							}
						};

					} else if (sheet.getCell('C' + (j)).value < 0) {
						sheet.getCell('C' + (j)).font = {
							color: {
								argb: 'FF0000'
							},
							bold: true
						};
					} else {
						sheet.getCell('C' + (j)).font = {
							color: {
								argb: '000000'
							},
							bold: true
						};
					}

					if (sheet.getCell('D' + (j)).value == '') {
						sheet.getCell('D' + (j)).fill = {
							type: 'pattern',
							pattern: 'solid',
							bgColor: {
								argb: 'FFFFFF'
							},
							fgColor: {
								argb: 'FFFFFF'
							}
						};

					} else if (sheet.getCell('D' + (j)).value < 0) {
						sheet.getCell('D' + (j)).font = {
							color: {
								argb: 'FF0000'
							},
							bold: true
						};
					} else {
						sheet.getCell('D' + (j)).font = {
							color: {
								argb: '000000'
							},
							bold: true
						};
					}

					if (sheet.getCell('E' + (j)).value == '') {
						sheet.getCell('E' + (j)).fill = {
							type: 'pattern',
							pattern: 'solid',
							bgColor: {
								argb: 'FFFFFF'
							},
							fgColor: {
								argb: 'FFFFFF'
							}
						};

					} else if (sheet.getCell('E' + (j)).value < 0) {
						sheet.getCell('E' + (j)).font = {
							color: {
								argb: 'FF0000'
							},
							bold: true
						};
					} else {
						sheet.getCell('E' + (j)).font = {
							color: {
								argb: '000000'
							},
							bold: true
						};
					}

					if (sheet.getCell('F' + (j)).value == '') {
						sheet.getCell('F' + (j)).fill = {
							type: 'pattern',
							pattern: 'solid',
							bgColor: {
								argb: 'FFFFFF'
							},
							fgColor: {
								argb: 'FFFFFF'
							}
						};

					} else if (sheet.getCell('F' + (j)).value < 0) {
						sheet.getCell('F' + (j)).font = {
							color: {
								argb: 'FF0000'
							},
							bold: true
						};
					} else {
						sheet.getCell('F' + (j)).font = {
							color: {
								argb: '000000'
							},
							bold: true
						};
					}

					if (sheet.getCell('G' + (j)).value == '') {
						sheet.getCell('G' + (j)).fill = {
							type: 'pattern',
							pattern: 'solid',
							bgColor: {
								argb: 'FFFFFF'
							},
							fgColor: {
								argb: 'FFFFFF'
							}
						};
						if (j > 3 || j <= (totText - 2)) {
							var valC = sheet.getCell('G' + (j)).value;
							sheet.getCell('G' + (j)).value = valC + '';
							sheet.getCell('G' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					} else if (sheet.getCell('G' + (j)).value < 0) {
						sheet.getCell('G' + (j)).font = {
							color: {
								argb: 'FF0000'
							},
							bold: true
						};
						if (j > 3 || j <= (totText - 2)) {
							var valC = sheet.getCell('G' + (j)).value;
							sheet.getCell('G' + (j)).value = valC + ' ';
							sheet.getCell('G' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					} else {
						sheet.getCell('G' + (j)).font = {
							color: {
								argb: '000000'
							},
							bold: true
						};
						if (j > 3 && j <= (totText)) {
							var valC = sheet.getCell('G' + (j)).value;
							sheet.getCell('G' + (j)).value = valC + ' T';
							sheet.getCell('G' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					}

					if (sheet.getCell('H' + (j)).value == '') {
						sheet.getCell('H' + (j)).fill = {
							type: 'pattern',
							pattern: 'solid',
							bgColor: {
								argb: 'FFFFFF'
							},
							fgColor: {
								argb: 'FFFFFF'
							}
						};
						if (j > 3 || j <= (totText - 2)) {
							var valC = sheet.getCell('H' + (j)).value;
							sheet.getCell('H' + (j)).value = valC + '';
							sheet.getCell('H' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					} else if (sheet.getCell('H' + (j)).value < 0) {
						sheet.getCell('H' + (j)).font = {
							color: {
								argb: 'FF0000'
							},
							bold: true
						};
						if (j > 3 || j <= (totText - 2)) {
							var valC = sheet.getCell('H' + (j)).value;
							sheet.getCell('H' + (j)).value = valC + ' ';
							sheet.getCell('H' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					} else {
						sheet.getCell('H' + (j)).font = {
							color: {
								argb: '000000'
							},
							bold: true
						};
						if (j > 3 && j <= (totText)) {
							var valC = sheet.getCell('H' + (j)).value;
							sheet.getCell('H' + (j)).value = valC + ' gm';
							sheet.getCell('H' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					}
					if (sheet.getCell('I' + (j)).value == '') {
						sheet.getCell('I' + (j)).fill = {
							type: 'pattern',
							pattern: 'solid',
							bgColor: {
								argb: 'FFFFFF'
							},
							fgColor: {
								argb: 'FFFFFF'
							}
						};
						if (j > 3 || j <= (totText - 2)) {
							var valC = sheet.getCell('I' + (j)).value;
							sheet.getCell('I' + (j)).value = valC + '';
							sheet.getCell('I' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					} else if (sheet.getCell('I' + (j)).value < 0) {
						sheet.getCell('I' + (j)).font = {
							color: {
								argb: 'FF0000'
							},
							bold: true
						};
						if (j > 3 || j <= (totText - 2)) {
							var valC = sheet.getCell('I' + (j)).value;
							sheet.getCell('I' + (j)).value = valC + ' ';
							sheet.getCell('I' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					} else {
						sheet.getCell('I' + (j)).font = {
							color: {
								argb: '000000'
							},
							bold: true
						};
						if (j > 3 && j <= (totText)) {
							var valC = sheet.getCell('I' + (j)).value;
							sheet.getCell('I' + (j)).value = valC + ' gm';
							sheet.getCell('I' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					}
					if (sheet.getCell('J' + (j)).value == '') {
						sheet.getCell('J' + (j)).fill = {
							type: 'pattern',
							pattern: 'solid',
							bgColor: {
								argb: 'FFFFFF'
							},
							fgColor: {
								argb: 'FFFFFF'
							}
						};
						if (j > 3 || j <= (totText - 2)) {
							var valC = sheet.getCell('J' + (j)).value;
							sheet.getCell('J' + (j)).value = valC + '';
							sheet.getCell('J' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					} else if (sheet.getCell('J' + (j)).value < 0) {
						sheet.getCell('J' + (j)).font = {
							color: {
								argb: 'FF0000'
							},
							bold: true
						};
						if (j > 3 || j <= (totText - 2)) {
							var valC = sheet.getCell('J' + (j)).value;
							sheet.getCell('J' + (j)).value = valC + ' ';
							sheet.getCell('J' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					} else {
						sheet.getCell('J' + (j)).font = {
							color: {
								argb: '000000'
							},
							bold: true
						};
						if (j > 3 && j <= (totText)) {
							var valC = sheet.getCell('J' + (j)).value;
							sheet.getCell('J' + (j)).value = valC + ' gm';
							sheet.getCell('J' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					}
					if (sheet.getCell('K' + (j)).value == '') {
						sheet.getCell('K' + (j)).fill = {
							type: 'pattern',
							pattern: 'solid',
							bgColor: {
								argb: 'FFFFFF'
							},
							fgColor: {
								argb: 'FFFFFF'
							}
						};

					} else if (sheet.getCell('K' + (j)).value < 0) {
						sheet.getCell('K' + (j)).font = {
							color: {
								argb: 'FF0000'
							},
							bold: true
						};
					} else {
						sheet.getCell('K' + (j)).font = {
							color: {
								argb: '000000'
							},
							bold: true
						};
					}

					if (sheet.getCell('L' + (j)).value == '') {
						sheet.getCell('L' + (j)).fill = {
							type: 'pattern',
							pattern: 'solid',
							bgColor: {
								argb: 'FFFFFF'
							},
							fgColor: {
								argb: 'FFFFFF'
							}
						};

					} else if (sheet.getCell('L' + (j)).value < 0) {
						sheet.getCell('L' + (j)).font = {
							color: {
								argb: 'FF0000'
							},
							bold: true
						};
					} else {
						sheet.getCell('L' + (j)).font = {
							color: {
								argb: '000000'
							},
							bold: true
						};
					}

					if (sheet.getCell('M' + (j)).value == '') {
						sheet.getCell('M' + (j)).fill = {
							type: 'pattern',
							pattern: 'solid',
							bgColor: {
								argb: 'FFFFFF'
							},
							fgColor: {
								argb: 'FFFFFF'
							}
						};
						if (j > 3 || j <= (totText - 2)) {
							var valC = sheet.getCell('M' + (j)).value;
							sheet.getCell('M' + (j)).value = valC + '';
							sheet.getCell('M' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					} else if (sheet.getCell('M' + (j)).value < 0) {
						sheet.getCell('M' + (j)).font = {
							color: {
								argb: 'FF0000'
							},
							bold: true
						};
						if (j > 3 || j <= (totText - 2)) {
							var valC = sheet.getCell('M' + (j)).value;
							sheet.getCell('M' + (j)).value = valC + ' ';
							sheet.getCell('M' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					} else {
						sheet.getCell('M' + (j)).font = {
							color: {
								argb: '000000'
							},
							bold: true
						};
						if (j > 3 && j <= (totText - 1)) {
							var valC = sheet.getCell('M' + (j)).value;
							if (valC === 'A') {
								sheet.getCell('M' + (j)).value = 'Approved';
							} else if (valC === 'R') {
								sheet.getCell('M' + (j)).value = 'Rejected';
							} else if (valC === 'N') {
								sheet.getCell('M' + (j)).value = 'Draft';
							}

							sheet.getCell('M' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					}

					if (sheet.getCell('N' + (j)).value == '') {
						sheet.getCell('N' + (j)).fill = {
							type: 'pattern',
							pattern: 'solid',
							bgColor: {
								argb: 'FFFFFF'
							},
							fgColor: {
								argb: 'FFFFFF'
							}
						};

					} else if (sheet.getCell('N' + (j)).value < 0) {
						sheet.getCell('N' + (j)).font = {
							color: {
								argb: 'FF0000'
							},
							bold: true
						};
					} else {
						sheet.getCell('N' + (j)).font = {
							color: {
								argb: '000000'
							},
							bold: true
						};
					}
					// if (sheet.getCell('N' + (j)).value == '') {
					// 	sheet.getCell('N' + (j)).fill = {
					// 		type: 'pattern',
					// 		pattern: 'solid',
					// 		bgColor: {
					// 			argb: 'FFFFFF'
					// 		},
					// 		fgColor: {
					// 			argb: 'FFFFFF'
					// 		}
					// 	};
					//
					// } else if (sheet.getCell('N' + (j)).value < 0) {
					// 	sheet.getCell('N' + (j)).font = {
					// 		color: {
					// 			argb: 'FF0000'
					// 		},
					// 		bold: true
					// 	};
					// } else {
					// 	sheet.getCell('N' + (j)).font = {
					// 		color: {
					// 			argb: '000000'
					// 		},
					// 		bold: true
					// 	};
					// }

					////
					sheet.getCell('A' + (j)).border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
					};
					sheet.getCell('B' + (j)).border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
					};
					sheet.getCell('C' + (j)).border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
					};
					sheet.getCell('D' + (j)).border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
					};
					sheet.getCell('E' + (j)).border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
					};

					sheet.getCell('F' + (j)).border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
					};
					sheet.getCell('G' + (j)).border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
					};

					sheet.getCell('H' + (j)).border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
					};

					sheet.getCell('I' + (j)).border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
					};

					sheet.getCell('J' + (j)).border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
					};
					sheet.getCell('K' + (j)).border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
					};
					sheet.getCell('L' + (j)).border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
					};
					sheet.getCell('M' + (j)).border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
					};

					sheet.getCell('N' + (j)).border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
					};
					// sheet.getCell('N' + (j)).border = {
					// 	top: {
					// 		style: 'thin'
					// 	},
					// 	left: {
					// 		style: 'thin'
					// 	},
					// 	bottom: {
					// 		style: 'thin'
					// 	},
					// 	right: {
					// 		style: 'thin'
					// 	}
					// };

					// code added by surya for autocolumn width - started
					//setting absolute length for column A
					if (j > "2") {

						if (sheet.getCell('A' + (j)).value !== null) {
							if (j == "3") {
								colMaxLengthA = sheet.getCell('A' + (j)).value.length;
							} else {
								if (sheet.getCell('A' + (j)).value.length > colMaxLengthA) {
									colMaxLengthA = sheet.getCell('A' + (j)).value.length;
								}
							}
						}
						if (j == totText) {
							sheet.getColumn('A').width = colMaxLengthA + 7;
						}

						if (sheet.getCell('B' + (j)).value !== null) {
							if (j == "3") {
								colMaxLengthB = sheet.getCell('B' + (j)).value.length;
							} else {
								if (sheet.getCell('B' + (j)).value.length > colMaxLengthB) {
									colMaxLengthB = sheet.getCell('B' + (j)).value.length;
								}
							}
						}
						if (j == totText) {
							sheet.getColumn('B').width = colMaxLengthB + 1;
						}
						//setting absolute length for column B
						if (sheet.getCell('C' + (j)).value !== null) {
							if (j == "3") {
								colMaxLengthC = sheet.getCell('C' + (j)).value.length;
							} else {
								if (sheet.getCell('C' + (j)).value.length > colMaxLengthC) {
									colMaxLengthC = sheet.getCell('C' + (j)).value.length;
								}
							}
						}
						if (j == totText) {
							sheet.getColumn('C').width = colMaxLengthC + 3;
						}
						//setting absolute length for column C
						if (sheet.getCell('D' + (j)).value !== null) {
							if (j == "3") {
								colMaxLengthD = sheet.getCell('D' + (j)).value.length;
							} else {
								if (sheet.getCell('D' + (j)).value.length > colMaxLengthD) {
									colMaxLengthD = sheet.getCell('D' + (j)).value.length;
								}
							}
						}
						if (j == totText) {
							sheet.getColumn('D').width = colMaxLengthD + 5;
						}
						//setting absolute length for column D
						if (sheet.getCell('E' + (j)).value !== null) {
							if (j == "3") {
								colMaxLengthE = sheet.getCell('E' + (j)).value.length;
							} else {
								if (sheet.getCell('E' + (j)).value.length > colMaxLengthE) {
									colMaxLengthE = sheet.getCell('E' + (j)).value.length;
								}
							}
						}
						if (j == totText) {
							sheet.getColumn('E').width = colMaxLengthE + 3;
						}
						//setting absolute length for column E
						if (sheet.getCell('F' + (j)).value !== null) {
							if (j == "3") {
								colMaxLengthF = sheet.getCell('F' + (j)).value.length;
							} else {
								if (sheet.getCell('F' + (j)).value.length > colMaxLengthF) {
									colMaxLengthF = sheet.getCell('F' + (j)).value.length;
								}
							}
						}
						if (j == totText) {
							sheet.getColumn('F').width = colMaxLengthF + 1;
						}

						if (sheet.getCell('G' + (j)).value !== null) {
							if (j == "3") {
								colMaxLengthG = sheet.getCell('G' + (j)).value.length;
							} else {
								if (sheet.getCell('G' + (j)).value.length > colMaxLengthG) {
									colMaxLengthG = sheet.getCell('G' + (j)).value.length;
								}
							}
						}
						if (j == totText) {
							sheet.getColumn('G').width = colMaxLengthG + 3;
						}
						if (sheet.getCell('H' + (j)).value !== null) {
							if (j == "3") {
								colMaxLengthH = sheet.getCell('H' + (j)).value.length;
							} else {
								if (sheet.getCell('H' + (j)).value.length > colMaxLengthH) {
									colMaxLengthH = sheet.getCell('H' + (j)).value.length;
								}
							}
						}
						if (j == totText) {
							sheet.getColumn('H').width = colMaxLengthH + 3;
						}
						if (sheet.getCell('I' + (j)).value !== null) {
							if (j == "3") {
								colMaxLengthI = sheet.getCell('I' + (j)).value.length;
							} else {
								if (sheet.getCell('I' + (j)).value.length > colMaxLengthI) {
									colMaxLengthI = sheet.getCell('I' + (j)).value.length;
								}
							}
						}
						if (j == totText) {
							sheet.getColumn('I').width = colMaxLengthI + 3;
						}
						if (sheet.getCell('J' + (j)).value !== null) {
							if (j == "3") {
								colMaxLengthJ = sheet.getCell('J' + (j)).value.length;
							} else {
								if (sheet.getCell('J' + (j)).value.length > colMaxLengthJ) {
									colMaxLengthJ = sheet.getCell('J' + (j)).value.length;
								}
							}
						}
						if (j == totText) {
							sheet.getColumn('J').width = colMaxLengthJ + 4;
						}
						if (sheet.getCell('K' + (j)).value !== null) {
							if (j == "3") {
								colMaxLengthK = sheet.getCell('K' + (j)).value.length;
							} else {
								if (sheet.getCell('K' + (j)).value.length > colMaxLengthK) {
									colMaxLengthK = sheet.getCell('K' + (j)).value.length;
								}
							}
						}
						if (j == totText) {
							sheet.getColumn('K').width = colMaxLengthK + 5;
						}
						if (sheet.getCell('L' + (j)).value !== null) {
							if (j == "3") {
								colMaxLengthL = sheet.getCell('L' + (j)).value.length;
							} else {
								if (sheet.getCell('L' + (j)).value.length > colMaxLengthL) {
									colMaxLengthL = sheet.getCell('L' + (j)).value.length;
								}
							}
						}
						if (j == totText) {
							sheet.getColumn('L').width = colMaxLengthL + 7;
						}
						if (sheet.getCell('M' + (j)).value !== null) {
							if (j == "3") {
								colMaxLengthM = sheet.getCell('M' + (j)).value.length;
							} else {
								if (sheet.getCell('M' + (j)).value.length > colMaxLengthM) {
									colMaxLengthM = sheet.getCell('M' + (j)).value.length;
								}
							}
						}
						if (j == totText) {
							sheet.getColumn('M').width = colMaxLengthM + 7;
						}
						if (sheet.getCell('N' + (j)).value !== null) {
							if (j == "3") {
								colMaxLengthN = sheet.getCell('N' + (j)).value.length;
							} else {
								if (sheet.getCell('N' + (j)).value.length > colMaxLengthN) {
									colMaxLengthN = sheet.getCell('N' + (j)).value.length;
								}
							}
						}
						if (j == totText) {
							sheet.getColumn('N').width = colMaxLengthN + 7;
						}
					}
					// code added by surya for autocolumn width - ended

				}

				const tempFileName = 'Product Report' + currentdate.getDate() + "-" + (currentdate.getMonth() + 1) + '-' + currentdate.getFullYear() +
					"-" +
					currentdate.getHours() + ':' + currentdate.getMinutes() + ':' + currentdate.getSeconds() + '.xlsx';

				res.setHeader(
					"Content-Type",
					"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
				);
				res.setHeader(
					"Content-Disposition",
					"attachment; filename=" + tempFileName
				);
				return workbook.xlsx.write(res).then(function(data) {
					console.log(data);
					res.status(200).end();
				});
			}

		}

	).catch(function(oError) {
		res.send("Show Alert");

	});

	//res.send(responseData);

});

app.get('/AllRetailerReportDownload', function(req, res) {
	debugger;
	var that = this;
	var rowPos = 3.15;
	var CreatedBy = req.query.CreatedBy;
	let rowIndex = 0;
	//read customer name by id, group by group id, city by
	//read kacchi and print report with all coloring, formatting, totaling
	var responseData = [];
	var oSubCounter = {};
	var OrderItem = app.models.OrderItem;

	var async = require('async');
	OrderItem.find({
		// where: {
		// 	"CreatedBy": CreatedBy
		// },
		include: [
			['ToOrderHeader', 'ToMaterial', 'ToWeight', 'ToProduct', 'ToWeights', 'ToCreatedBy'], {
				relation: 'ToMaterial',
				scope: {
					include: ['ToPhotos','ToCategory']
				}
			}

		],
		order: "CreatedOn DESC"
	}).then(function(Records, err) {
			debugger;
			if (Records) {
				var excel = require('exceljs');
				var workbook = new excel.Workbook(); //creating workbook
				var sheet = workbook.addWorksheet('MySheet'); //creating worksheet
				var heading = {
					heading: " Retailer Orders Report"
				};
				sheet.mergeCells('A1:P1');
				sheet.getCell('P1').value = 'All Orders Report';
				sheet.getCell('A1').alignment = {
					vertical: 'middle',
					horizontal: 'center'
				};

				sheet.getCell('A1').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: '808080'
					}
				};

				//Merging second Row
				sheet.mergeCells('A2:P2');

				//Code for getting current datetime
				var currentdate = new Date();
				var num = Records.length;
				var datetime = currentdate.getDate() + "." +
					(currentdate.getMonth() + 1) + "." +
					currentdate.getFullYear() + " / " +
					currentdate.getHours() + ":" +
					currentdate.getMinutes() + ":" +
					currentdate.getSeconds();
				sheet.getCell('A2').value = 'All Orders' + '(' + num + ')    ' + '\t' + '\n' + datetime;
				sheet.getCell('A2').alignment = {
					vertical: 'middle',
					horizontal: 'center'
				};

				sheet.getRow(2).font === {
					bold: true
				};

				var header = ["Retailer", "Category", "TagNo", "SubCategory", "Karat", "Gender", "Tunch", "GrossWt", "LessWt", "Fine", "Amount",
					"Piece", "PairSize","Remarks", "Status", "Picture"];

				sheet.addRow().values = header;

				//Coding for cell color and bold character
				sheet.getCell('A3').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: 'A9A9A9'
					}
				};
				sheet.getCell('B3').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: 'A9A9A9'
					}
				};
				sheet.getCell('C3').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: 'A9A9A9'
					}
				};
				sheet.getCell('D3').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: 'A9A9A9'
					}
				};
				sheet.getCell('E3').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: 'A9A9A9'
					}
				};
				sheet.getCell('F3').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: 'A9A9A9'
					}
				};
				sheet.getCell('G3').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: 'A9A9A9'
					}
				};
				sheet.getCell('H3').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: 'A9A9A9'
					}
				};
				sheet.getCell('I3').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: 'A9A9A9'
					}
				};
				sheet.getCell('J3').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: 'A9A9A9'
					}
				};
				sheet.getCell('K3').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: 'A9A9A9'
					}
				};
				sheet.getCell('L3').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: 'A9A9A9'
					}
				};
				sheet.getCell('M3').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: 'A9A9A9'
					}
				};

				sheet.getCell('N3').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: 'A9A9A9'
					}
				};
				sheet.getCell('O3').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: 'A9A9A9'
					}
				};
				sheet.getCell('P3').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: 'A9A9A9'
					}
				};

				var totalG = 0;
				var totalH = 0;
				var totalI = 0;
				var totalJ = 0;
				var totalK = 0;
				//code added by surya 10 nov - start

				// define function to change date format to dd.mm.yyyy using date Object
				function formatDateForEntry(date) {
					var d = new Date(date),
						month = '' + (d.getMonth() + 1),
						day = '' + d.getDate(),
						year = d.getFullYear();

					if (month.length < 2)
						month = '0' + month;
					if (day.length < 2)
						day = '0' + day;

					return [day, month, year].join('.');
				}

				var colMaxLengthA, colMaxLengthB, colMaxLengthC, colMaxLengthD, colMaxLengthE, colMaxLengthF, colMaxLengthG, colMaxLengthH,
					colMaxLengthI, colMaxLengthJ, colMaxLengthK, colMaxLengthL, colMaxLengthM, colMaxLengthN, colMaxLengthO, colMaxLengthP

				for (var i = 0; i < Records["length"]; i++) {
					var items = Records[i].__data;
					var weights = items["ToWeights"];
					var categories = items["ToMaterial"];
					var products = items["ToProduct"];
					// var categories = items["ToCategory"];
					var images = categories.__data["ToPhotos"];
					var categoryName = categories.__data["ToCategory"];

					var manufacturer = items["ToCreatedBy"];

					var createdBy1 = manufacturer.__data;
					var weight = weights.__data


					for (var k = 0; k < images.length; k++) {
						var image = images[k];
						var myBase64Image = image["Content"];
						// var imageBuffer = decodeBase64Image(myBase64Image);
						var imageId1 = workbook.addImage({
							base64: myBase64Image,
							extension: 'jpeg,jpg,png',
						});
					}

					sheet.addImage(imageId1, {
						tl: {
							col: 15.13,
							row: rowPos++
						},
						ext: {
							width: 85,
							height: 58
						}
					});

					var data11 = categories["Category"] + ", " + categoryName["Category"];

					items["CreatedOn"] = formatDateForEntry(items["CreatedOn"]);
					var item = [createdBy1["username"], data11, categories["TagNo"], categories["SubCategory"], categories["Karat"], categories["Gender"],
						categories["Tunch"],
						weight["GrossWeight"], weight["LessWeight"], weight["Fine"], weight["Amount"], weight["Piece"], weight["PairSize"], categories[
							"Name"], items["Status"]
					];

					totalG = totalG + categories["Tunch"];
					totalH = totalH + categories["GrossWeight"];
					totalI = totalI + weight["LessWeight"];
					totalJ = totalJ + weight["Fine"];
					totalK = totalK + weight["Amount"];
					sheet.addRow().values = item;
				}

				//Coding for formula and concatenation in the last line
				var totText = Records["length"] + 4;
				var totCol = totText - 1;
				totalG = totalG.toFixed(3);
				totalH = totalH.toFixed(2);
				totalI = totalI.toFixed(2);
				totalJ = totalJ.toFixed(2);
				totalK = totalK.toFixed(2);
				// sheet.getCell('A').value = items["Category"];
				sheet.getCell('A' + totText).value = "TOTAL";
				sheet.getCell('G' + totText).value = totalG;
				sheet.getCell('H' + totText).value = totalH;
				sheet.getCell('I' + totText).value = totalI;
				sheet.getCell('J' + totText).value = totalJ;
				sheet.getCell('K' + totText).value = totalK;

				for (var rowIndex = 4; rowIndex < sheet.rowCount; rowIndex++) {
					sheet.getRow(rowIndex).height = 64;
				}
				sheet.getCell('A' + totText).value = "TOTAL";

				//Coding for rows and column border
				for (var j = 1; j <= totText; j++) {
					if (sheet.getCell('A' + (j)).value == '') {
						sheet.getCell('A' + (j)).fill = {
							type: 'pattern',
							pattern: 'solid',
							bgColor: {
								argb: 'FFFFFF'
							},
							fgColor: {
								argb: 'FFFFFF'
							}
						};

					} else if (sheet.getCell('A' + (j)).value < 0) {
						sheet.getCell('A' + (j)).font = {
							color: {
								argb: 'FF0000'
							},
							bold: true
						};
					} else {
						sheet.getCell('A' + (j)).font = {
							color: {
								argb: '000000'
							},
							bold: true
						};
					}

					if (sheet.getCell('B' + (j)).value == '') {
						sheet.getCell('C' + (j)).fill = {
							type: 'pattern',
							pattern: 'solid',
							bgColor: {
								argb: 'FFFFFF'
							},
							fgColor: {
								argb: 'FFFFFF'
							}
						};

					} else if (sheet.getCell('B' + (j)).value < 0) {
						sheet.getCell('B' + (j)).font = {
							color: {
								argb: 'FF0000'
							},
							bold: true
						};
					} else {
						sheet.getCell('B' + (j)).font = {
							color: {
								argb: '000000'
							},
							bold: true
						};
					}

					if (sheet.getCell('C' + (j)).value == '') {
						sheet.getCell('C' + (j)).fill = {
							type: 'pattern',
							pattern: 'solid',
							bgColor: {
								argb: 'FFFFFF'
							},
							fgColor: {
								argb: 'FFFFFF'
							}
						};

					} else if (sheet.getCell('C' + (j)).value < 0) {
						sheet.getCell('C' + (j)).font = {
							color: {
								argb: 'FF0000'
							},
							bold: true
						};
					} else {
						sheet.getCell('C' + (j)).font = {
							color: {
								argb: '000000'
							},
							bold: true
						};
					}

					if (sheet.getCell('D' + (j)).value == '') {
						sheet.getCell('D' + (j)).fill = {
							type: 'pattern',
							pattern: 'solid',
							bgColor: {
								argb: 'FFFFFF'
							},
							fgColor: {
								argb: 'FFFFFF'
							}
						};

					} else if (sheet.getCell('D' + (j)).value < 0) {
						sheet.getCell('D' + (j)).font = {
							color: {
								argb: 'FF0000'
							},
							bold: true
						};
					} else {
						sheet.getCell('D' + (j)).font = {
							color: {
								argb: '000000'
							},
							bold: true
						};
					}

					if (sheet.getCell('E' + (j)).value == '') {
						sheet.getCell('E' + (j)).fill = {
							type: 'pattern',
							pattern: 'solid',
							bgColor: {
								argb: 'FFFFFF'
							},
							fgColor: {
								argb: 'FFFFFF'
							}
						};

					} else if (sheet.getCell('E' + (j)).value < 0) {
						sheet.getCell('E' + (j)).font = {
							color: {
								argb: 'FF0000'
							},
							bold: true
						};
					} else {
						sheet.getCell('E' + (j)).font = {
							color: {
								argb: '000000'
							},
							bold: true
						};
					}

					if (sheet.getCell('F' + (j)).value == '') {
						sheet.getCell('F' + (j)).fill = {
							type: 'pattern',
							pattern: 'solid',
							bgColor: {
								argb: 'FFFFFF'
							},
							fgColor: {
								argb: 'FFFFFF'
							}
						};

					} else if (sheet.getCell('F' + (j)).value < 0) {
						sheet.getCell('F' + (j)).font = {
							color: {
								argb: 'FF0000'
							},
							bold: true
						};
					} else {
						sheet.getCell('F' + (j)).font = {
							color: {
								argb: '000000'
							},
							bold: true
						};
					}

					if (sheet.getCell('G' + (j)).value == '') {
						sheet.getCell('G' + (j)).fill = {
							type: 'pattern',
							pattern: 'solid',
							bgColor: {
								argb: 'FFFFFF'
							},
							fgColor: {
								argb: 'FFFFFF'
							}
						};
						if (j > 3 || j <= (totText - 2)) {
							var valC = sheet.getCell('G' + (j)).value;
							sheet.getCell('G' + (j)).value = valC + '';
							sheet.getCell('G' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					} else if (sheet.getCell('G' + (j)).value < 0) {
						sheet.getCell('G' + (j)).font = {
							color: {
								argb: 'FF0000'
							},
							bold: true
						};
						if (j > 3 || j <= (totText - 2)) {
							var valC = sheet.getCell('G' + (j)).value;
							sheet.getCell('G' + (j)).value = valC + ' ';
							sheet.getCell('G' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					} else {
						sheet.getCell('G' + (j)).font = {
							color: {
								argb: '000000'
							},
							bold: true
						};
						if (j > 3 && j <= (totText)) {
							var valC = sheet.getCell('G' + (j)).value;
							sheet.getCell('G' + (j)).value = valC + ' T';
							sheet.getCell('G' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					}

					if (sheet.getCell('H' + (j)).value == '') {
						sheet.getCell('H' + (j)).fill = {
							type: 'pattern',
							pattern: 'solid',
							bgColor: {
								argb: 'FFFFFF'
							},
							fgColor: {
								argb: 'FFFFFF'
							}
						};
						if (j > 3 || j <= (totText - 2)) {
							var valC = sheet.getCell('H' + (j)).value;
							sheet.getCell('H' + (j)).value = valC + '';
							sheet.getCell('H' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					} else if (sheet.getCell('H' + (j)).value < 0) {
						sheet.getCell('H' + (j)).font = {
							color: {
								argb: 'FF0000'
							},
							bold: true
						};
						if (j > 3 || j <= (totText - 2)) {
							var valC = sheet.getCell('H' + (j)).value;
							sheet.getCell('H' + (j)).value = valC + ' ';
							sheet.getCell('H' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					} else {
						sheet.getCell('H' + (j)).font = {
							color: {
								argb: '000000'
							},
							bold: true
						};
						if (j > 3 && j <= (totText)) {
							var valC = sheet.getCell('H' + (j)).value;
							sheet.getCell('H' + (j)).value = valC + ' gm';
							sheet.getCell('H' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					}
					if (sheet.getCell('I' + (j)).value == '') {
						sheet.getCell('I' + (j)).fill = {
							type: 'pattern',
							pattern: 'solid',
							bgColor: {
								argb: 'FFFFFF'
							},
							fgColor: {
								argb: 'FFFFFF'
							}
						};
						if (j > 3 || j <= (totText - 2)) {
							var valC = sheet.getCell('I' + (j)).value;
							sheet.getCell('I' + (j)).value = valC + '';
							sheet.getCell('I' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					} else if (sheet.getCell('I' + (j)).value < 0) {
						sheet.getCell('I' + (j)).font = {
							color: {
								argb: 'FF0000'
							},
							bold: true
						};
						if (j > 3 || j <= (totText - 2)) {
							var valC = sheet.getCell('I' + (j)).value;
							sheet.getCell('I' + (j)).value = valC + ' ';
							sheet.getCell('I' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					} else {
						sheet.getCell('I' + (j)).font = {
							color: {
								argb: '000000'
							},
							bold: true
						};
						if (j > 3 && j <= (totText)) {
							var valC = sheet.getCell('I' + (j)).value;
							sheet.getCell('I' + (j)).value = valC + ' gm';
							sheet.getCell('I' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					}
					if (sheet.getCell('J' + (j)).value == '') {
						sheet.getCell('J' + (j)).fill = {
							type: 'pattern',
							pattern: 'solid',
							bgColor: {
								argb: 'FFFFFF'
							},
							fgColor: {
								argb: 'FFFFFF'
							}
						};
						if (j > 3 || j <= (totText - 2)) {
							var valC = sheet.getCell('J' + (j)).value;
							sheet.getCell('J' + (j)).value = valC + '';
							sheet.getCell('J' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					} else if (sheet.getCell('J' + (j)).value < 0) {
						sheet.getCell('J' + (j)).font = {
							color: {
								argb: 'FF0000'
							},
							bold: true
						};
						if (j > 3 || j <= (totText - 2)) {
							var valC = sheet.getCell('J' + (j)).value;
							sheet.getCell('J' + (j)).value = valC + ' ';
							sheet.getCell('J' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					} else {
						sheet.getCell('J' + (j)).font = {
							color: {
								argb: '000000'
							},
							bold: true
						};
						if (j > 3 && j <= (totText)) {
							var valC = sheet.getCell('J' + (j)).value;
							sheet.getCell('J' + (j)).value = valC + ' gm';
							sheet.getCell('J' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					}
					if (sheet.getCell('K' + (j)).value == '') {
						sheet.getCell('K' + (j)).fill = {
							type: 'pattern',
							pattern: 'solid',
							bgColor: {
								argb: 'FFFFFF'
							},
							fgColor: {
								argb: 'FFFFFF'
							}
						};

					} else if (sheet.getCell('K' + (j)).value < 0) {
						sheet.getCell('K' + (j)).font = {
							color: {
								argb: 'FF0000'
							},
							bold: true
						};
					} else {
						sheet.getCell('K' + (j)).font = {
							color: {
								argb: '000000'
							},
							bold: true
						};
					}

					if (sheet.getCell('L' + (j)).value == '') {
						sheet.getCell('L' + (j)).fill = {
							type: 'pattern',
							pattern: 'solid',
							bgColor: {
								argb: 'FFFFFF'
							},
							fgColor: {
								argb: 'FFFFFF'
							}
						};

					} else if (sheet.getCell('L' + (j)).value < 0) {
						sheet.getCell('L' + (j)).font = {
							color: {
								argb: 'FF0000'
							},
							bold: true
						};
					} else {
						sheet.getCell('L' + (j)).font = {
							color: {
								argb: '000000'
							},
							bold: true
						};
					}

					if (sheet.getCell('M' + (j)).value == '') {
						sheet.getCell('M' + (j)).fill = {
							type: 'pattern',
							pattern: 'solid',
							bgColor: {
								argb: 'FFFFFF'
							},
							fgColor: {
								argb: 'FFFFFF'
							}
						};

					} else if (sheet.getCell('M' + (j)).value < 0) {
						sheet.getCell('M' + (j)).font = {
							color: {
								argb: 'FF0000'
							},
							bold: true
						};
					} else {
						sheet.getCell('M' + (j)).font = {
							color: {
								argb: '000000'
							},
							bold: true
						};
					}

					if (sheet.getCell('N' + (j)).value == '') {
						sheet.getCell('N' + (j)).fill = {
							type: 'pattern',
							pattern: 'solid',
							bgColor: {
								argb: 'FFFFFF'
							},
							fgColor: {
								argb: 'FFFFFF'
							}
						};

					} else if (sheet.getCell('N' + (j)).value < 0) {
						sheet.getCell('N' + (j)).font = {
							color: {
								argb: 'FF0000'
							},
							bold: true
						};
					} else {
						sheet.getCell('N' + (j)).font = {
							color: {
								argb: '000000'
							},
							bold: true
						};
					}

					if (sheet.getCell('O' + (j)).value == '') {
						sheet.getCell('O' + (j)).fill = {
							type: 'pattern',
							pattern: 'solid',
							bgColor: {
								argb: 'FFFFFF'
							},
							fgColor: {
								argb: 'FFFFFF'
							}
						};
						if (j > 3 || j <= (totText - 2)) {
							var valC = sheet.getCell('O' + (j)).value;
							sheet.getCell('O' + (j)).value = valC + '';
							sheet.getCell('O' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					} else if (sheet.getCell('O' + (j)).value < 0) {
						sheet.getCell('O' + (j)).font = {
							color: {
								argb: 'FF0000'
							},
							bold: true
						};
						if (j > 3 || j <= (totText - 2)) {
							var valC = sheet.getCell('O' + (j)).value;
							sheet.getCell('O' + (j)).value = valC + ' ';
							sheet.getCell('O' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					} else {
						sheet.getCell('O' + (j)).font = {
							color: {
								argb: '000000'
							},
							bold: true
						};
						if (j > 3 && j <= (totText - 1)) {
							var valC = sheet.getCell('O' + (j)).value;
							if (valC === 'A') {
								sheet.getCell('O' + (j)).value = 'Approved';
							} else if (valC === 'R') {
								sheet.getCell('O' + (j)).value = 'Rejected';
							} else if (valC === 'N') {
								sheet.getCell('O' + (j)).value = 'Not Approved';
							}

							sheet.getCell('O' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					}

					if (sheet.getCell('P' + (j)).value == '') {
						sheet.getCell('P' + (j)).fill = {
							type: 'pattern',
							pattern: 'solid',
							bgColor: {
								argb: 'FFFFFF'
							},
							fgColor: {
								argb: 'FFFFFF'
							}
						};

					} else if (sheet.getCell('P' + (j)).value < 0) {
						sheet.getCell('P' + (j)).font = {
							color: {
								argb: 'FF0000'
							},
							bold: true
						};
					} else {
						sheet.getCell('P' + (j)).font = {
							color: {
								argb: '000000'
							},
							bold: true
						};
					}
					// if (sheet.getCell('N' + (j)).value == '') {
					// 	sheet.getCell('N' + (j)).fill = {
					// 		type: 'pattern',
					// 		pattern: 'solid',
					// 		bgColor: {
					// 			argb: 'FFFFFF'
					// 		},
					// 		fgColor: {
					// 			argb: 'FFFFFF'
					// 		}
					// 	};
					//
					// } else if (sheet.getCell('N' + (j)).value < 0) {
					// 	sheet.getCell('N' + (j)).font = {
					// 		color: {
					// 			argb: 'FF0000'
					// 		},
					// 		bold: true
					// 	};
					// } else {
					// 	sheet.getCell('N' + (j)).font = {
					// 		color: {
					// 			argb: '000000'
					// 		},
					// 		bold: true
					// 	};
					// }

					////
					sheet.getCell('A' + (j)).border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
					};
					sheet.getCell('B' + (j)).border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
					};
					sheet.getCell('C' + (j)).border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
					};
					sheet.getCell('D' + (j)).border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
					};
					sheet.getCell('E' + (j)).border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
					};

					sheet.getCell('F' + (j)).border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
					};
					sheet.getCell('G' + (j)).border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
					};

					sheet.getCell('H' + (j)).border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
					};

					sheet.getCell('I' + (j)).border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
					};

					sheet.getCell('J' + (j)).border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
					};
					sheet.getCell('K' + (j)).border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
					};
					sheet.getCell('L' + (j)).border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
					};
					sheet.getCell('M' + (j)).border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
					};

					sheet.getCell('N' + (j)).border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
					};

					sheet.getCell('O' + (j)).border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
					};

					sheet.getCell('P' + (j)).border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
					};
					// sheet.getCell('N' + (j)).border = {
					// 	top: {
					// 		style: 'thin'
					// 	},
					// 	left: {
					// 		style: 'thin'
					// 	},
					// 	bottom: {
					// 		style: 'thin'
					// 	},
					// 	right: {
					// 		style: 'thin'
					// 	}
					// };

					// code added by surya for autocolumn width - started
					//setting absolute length for column A
					if (j > "2") {

						if (sheet.getCell('A' + (j)).value !== null) {
							if (j == "3") {
								colMaxLengthA = sheet.getCell('A' + (j)).value.length;
							} else {
								if (sheet.getCell('A' + (j)).value.length > colMaxLengthA) {
									colMaxLengthA = sheet.getCell('A' + (j)).value.length;
								}
							}
						}
						if (j == totText) {
							sheet.getColumn('A').width = colMaxLengthA + 7;
						}

						if (sheet.getCell('B' + (j)).value !== null) {
							if (j == "3") {
								colMaxLengthB = sheet.getCell('B' + (j)).value.length;
							} else {
								if (sheet.getCell('B' + (j)).value.length > colMaxLengthB) {
									colMaxLengthB = sheet.getCell('B' + (j)).value.length;
								}
							}
						}
						if (j == totText) {
							sheet.getColumn('B').width = colMaxLengthB + 1;
						}
						//setting absolute length for column B
						if (sheet.getCell('C' + (j)).value !== null) {
							if (j == "3") {
								colMaxLengthC = sheet.getCell('C' + (j)).value.length;
							} else {
								if (sheet.getCell('C' + (j)).value.length > colMaxLengthC) {
									colMaxLengthC = sheet.getCell('C' + (j)).value.length;
								}
							}
						}
						if (j == totText) {
							sheet.getColumn('C').width = colMaxLengthC + 3;
						}
						//setting absolute length for column C
						if (sheet.getCell('D' + (j)).value !== null) {
							if (j == "3") {
								colMaxLengthD = sheet.getCell('D' + (j)).value.length;
							} else {
								if (sheet.getCell('D' + (j)).value.length > colMaxLengthD) {
									colMaxLengthD = sheet.getCell('D' + (j)).value.length;
								}
							}
						}
						if (j == totText) {
							sheet.getColumn('D').width = colMaxLengthD + 5;
						}
						//setting absolute length for column D
						if (sheet.getCell('E' + (j)).value !== null) {
							if (j == "3") {
								colMaxLengthE = sheet.getCell('E' + (j)).value.length;
							} else {
								if (sheet.getCell('E' + (j)).value.length > colMaxLengthE) {
									colMaxLengthE = sheet.getCell('E' + (j)).value.length;
								}
							}
						}
						if (j == totText) {
							sheet.getColumn('E').width = colMaxLengthE + 3;
						}
						//setting absolute length for column E
						if (sheet.getCell('F' + (j)).value !== null) {
							if (j == "3") {
								colMaxLengthF = sheet.getCell('F' + (j)).value.length;
							} else {
								if (sheet.getCell('F' + (j)).value.length > colMaxLengthF) {
									colMaxLengthF = sheet.getCell('F' + (j)).value.length;
								}
							}
						}
						if (j == totText) {
							sheet.getColumn('F').width = colMaxLengthF + 1;
						}

						if (sheet.getCell('G' + (j)).value !== null) {
							if (j == "3") {
								colMaxLengthG = sheet.getCell('G' + (j)).value.length;
							} else {
								if (sheet.getCell('G' + (j)).value.length > colMaxLengthG) {
									colMaxLengthG = sheet.getCell('G' + (j)).value.length;
								}
							}
						}
						if (j == totText) {
							sheet.getColumn('G').width = colMaxLengthG + 3;
						}
						if (sheet.getCell('H' + (j)).value !== null) {
							if (j == "3") {
								colMaxLengthH = sheet.getCell('H' + (j)).value.length;
							} else {
								if (sheet.getCell('H' + (j)).value.length > colMaxLengthH) {
									colMaxLengthH = sheet.getCell('H' + (j)).value.length;
								}
							}
						}
						if (j == totText) {
							sheet.getColumn('H').width = colMaxLengthH + 3;
						}
						if (sheet.getCell('I' + (j)).value !== null) {
							if (j == "3") {
								colMaxLengthI = sheet.getCell('I' + (j)).value.length;
							} else {
								if (sheet.getCell('I' + (j)).value.length > colMaxLengthI) {
									colMaxLengthI = sheet.getCell('I' + (j)).value.length;
								}
							}
						}
						if (j == totText) {
							sheet.getColumn('I').width = colMaxLengthI + 3;
						}
						if (sheet.getCell('J' + (j)).value !== null) {
							if (j == "3") {
								colMaxLengthJ = sheet.getCell('J' + (j)).value.length;
							} else {
								if (sheet.getCell('J' + (j)).value.length > colMaxLengthJ) {
									colMaxLengthJ = sheet.getCell('J' + (j)).value.length;
								}
							}
						}
						if (j == totText) {
							sheet.getColumn('J').width = colMaxLengthJ + 4;
						}
						if (sheet.getCell('K' + (j)).value !== null) {
							if (j == "3") {
								colMaxLengthK = sheet.getCell('K' + (j)).value.length;
							} else {
								if (sheet.getCell('K' + (j)).value.length > colMaxLengthK) {
									colMaxLengthK = sheet.getCell('K' + (j)).value.length;
								}
							}
						}
						if (j == totText) {
							sheet.getColumn('K').width = colMaxLengthK + 5;
						}
						if (sheet.getCell('L' + (j)).value !== null) {
							if (j == "3") {
								colMaxLengthL = sheet.getCell('L' + (j)).value.length;
							} else {
								if (sheet.getCell('L' + (j)).value.length > colMaxLengthL) {
									colMaxLengthL = sheet.getCell('L' + (j)).value.length;
								}
							}
						}
						if (j == totText) {
							sheet.getColumn('L').width = colMaxLengthL + 7;
						}
						if (sheet.getCell('M' + (j)).value !== null) {
							if (j == "3") {
								colMaxLengthM = sheet.getCell('M' + (j)).value.length;
							} else {
								if (sheet.getCell('M' + (j)).value.length > colMaxLengthM) {
									colMaxLengthM = sheet.getCell('M' + (j)).value.length;
								}
							}
						}
						if (j == totText) {
							sheet.getColumn('M').width = colMaxLengthM + 7;
						}
						if (sheet.getCell('N' + (j)).value !== null) {
							if (j == "3") {
								colMaxLengthN = sheet.getCell('N' + (j)).value.length;
							} else {
								if (sheet.getCell('N' + (j)).value.length > colMaxLengthN) {
									colMaxLengthN = sheet.getCell('N' + (j)).value.length;
								}
							}
						}
						if (j == totText) {
							sheet.getColumn('N').width = colMaxLengthN + 7;
						}

						if (sheet.getCell('O' + (j)).value !== null) {
							if (j == "3") {
								colMaxLengthO = sheet.getCell('O' + (j)).value.length;
							} else {
								if (sheet.getCell('O' + (j)).value.length > colMaxLengthO) {
									colMaxLengthO = sheet.getCell('O' + (j)).value.length;
								}
							}
						}
						if (j == totText) {
							sheet.getColumn('O').width = colMaxLengthO + 7;
						}

						if (sheet.getCell('P' + (j)).value !== null) {
							if (j == "3") {
								colMaxLengthP = sheet.getCell('P' + (j)).value.length;
							} else {
								if (sheet.getCell('P' + (j)).value.length > colMaxLengthP) {
									colMaxLengthP = sheet.getCell('P' + (j)).value.length;
								}
							}
						}
						if (j == totText) {
							sheet.getColumn('P').width = colMaxLengthP + 7;
						}

					}
					// code added by surya for autocolumn width - ended

				}

				const tempFileName = 'Product Report' + currentdate.getDate() + "-" + (currentdate.getMonth() + 1) + '-' + currentdate.getFullYear() +
					"-" +
					currentdate.getHours() + ':' + currentdate.getMinutes() + ':' + currentdate.getSeconds() + '.xlsx';

				res.setHeader(
					"Content-Type",
					"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
				);
				res.setHeader(
					"Content-Disposition",
					"attachment; filename=" + tempFileName
				);
				return workbook.xlsx.write(res).then(function(data) {
					console.log(data);
					res.status(200).end();
				});
			}

		}

	).catch(function(oError) {
		res.send("Show Alert");

	});

	//res.send(responseData);

});
app.get('/AllRetailerCreatedDownload', function(req, res) {
	debugger;
	var that = this;
	var rowPos = 3.15;
	var CreatedBy = req.query.CreatedBy;
	let rowIndex = 0;
	//read customer name by id, group by group id, city by
	//read kacchi and print report with all coloring, formatting, totaling
	var responseData = [];
	var oSubCounter = {};
	var OrderItem = app.models.OrderItem;

	var async = require('async');
	OrderItem.find({
		where: {
			"CreatedBy": CreatedBy
		},
		include: [
			[ 'ToMaterial', 'ToWeights', 'ToCreatedBy'], {
				relation: 'ToMaterial',
				scope: {
					include: ['ToPhotos','ToCategory']
				}
			}


		],
		order: "CreatedOn DESC"
	}).then(function(Records, err) {
			debugger;
			if (Records.length === 0 || Records.length === 0 || Records.length === '0' || Records === undefined || Records === "" || Records ===
				" ") {
				res.send("Error");
				return;
			}

			if (Records) {
				var excel = require('exceljs');
				var workbook = new excel.Workbook(); //creating workbook
				var sheet = workbook.addWorksheet('MySheet'); //creating worksheet
				var heading = {
					heading: " Retailer Orders Report"
				};
				sheet.mergeCells('A1:P1');
				sheet.getCell('P1').value = 'All Orders Report';
				sheet.getCell('A1').alignment = {
					vertical: 'middle',
					horizontal: 'center'
				};

				sheet.getCell('A1').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: '808080'
					}
				};

				//Merging second Row
				sheet.mergeCells('A2:P2');

				//Code for getting current datetime
				var currentdate = new Date();
				var num = Records.length;
				var datetime = currentdate.getDate() + "." +
					(currentdate.getMonth() + 1) + "." +
					currentdate.getFullYear() + " / " +
					currentdate.getHours() + ":" +
					currentdate.getMinutes() + ":" +
					currentdate.getSeconds();
				sheet.getCell('A2').value = 'Retailer Orders' + '(' + num + ')    ' + '\t' + '\n' + datetime;
				sheet.getCell('A2').alignment = {
					vertical: 'middle',
					horizontal: 'center'
				};

				sheet.getRow(2).font === {
					bold: true
				};

				var header = ["Retailer", "Category", "TagNo", "SubCategory", "Karat", "Gender", "Tunch", "GrossWt", "LessWt", "Fine", "Amount",
					"Piece", "PairSize","Remarks", "Status", "Picture"];

				sheet.addRow().values = header;

				//Coding for cell color and bold character
				sheet.getCell('A3').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: 'A9A9A9'
					}
				};
				sheet.getCell('B3').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: 'A9A9A9'
					}
				};
				sheet.getCell('C3').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: 'A9A9A9'
					}
				};
				sheet.getCell('D3').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: 'A9A9A9'
					}
				};
				sheet.getCell('E3').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: 'A9A9A9'
					}
				};
				sheet.getCell('F3').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: 'A9A9A9'
					}
				};
				sheet.getCell('G3').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: 'A9A9A9'
					}
				};
				sheet.getCell('H3').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: 'A9A9A9'
					}
				};
				sheet.getCell('I3').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: 'A9A9A9'
					}
				};
				sheet.getCell('J3').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: 'A9A9A9'
					}
				};
				sheet.getCell('K3').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: 'A9A9A9'
					}
				};
				sheet.getCell('L3').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: 'A9A9A9'
					}
				};
				sheet.getCell('M3').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: 'A9A9A9'
					}
				};

				sheet.getCell('N3').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: 'A9A9A9'
					}
				};
				sheet.getCell('O3').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: 'A9A9A9'
					}
				};
				sheet.getCell('P3').fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: {
						argb: 'A9A9A9'
					}
				};

				var totalG = 0;
				var totalH = 0;
				var totalI = 0;
				var totalJ = 0;
				var totalK = 0;
				//code added by surya 10 nov - start

				// define function to change date format to dd.mm.yyyy using date Object
				function formatDateForEntry(date) {
					var d = new Date(date),
						month = '' + (d.getMonth() + 1),
						day = '' + d.getDate(),
						year = d.getFullYear();

					if (month.length < 2)
						month = '0' + month;
					if (day.length < 2)
						day = '0' + day;

					return [day, month, year].join('.');
				}

				var colMaxLengthA, colMaxLengthB, colMaxLengthC, colMaxLengthD, colMaxLengthE, colMaxLengthF, colMaxLengthG, colMaxLengthH,
					colMaxLengthI, colMaxLengthJ, colMaxLengthK, colMaxLengthL, colMaxLengthM, colMaxLengthN, colMaxLengthO, colMaxLengthP

				for (var i = 0; i < Records["length"]; i++) {
					var items = Records[i].__data;
					var weights = items["ToWeights"];
					var categories = items["ToMaterial"];
					// var products = items["ToProduct"];
					// var categories = items["ToCategory"];
					var images = categories.__data["ToPhotos"];
					var categoryName = categories.__data["ToCategory"];

					var manufacturer = items["ToCreatedBy"];

					var createdBy1 = manufacturer.__data;
					var weight = weights.__data


					for (var k = 0; k < images.length; k++) {
						var image = images[k];
						var myBase64Image = image["Content"];
						// var imageBuffer = decodeBase64Image(myBase64Image);
						var imageId1 = workbook.addImage({
							base64: myBase64Image,
							extension: 'jpeg,jpg,png',
						});
					}

					sheet.addImage(imageId1, {
						tl: {
							col: 15.13,
							row: rowPos++
						},
						ext: {
							width: 85,
							height: 58
						}
					});

					var data11 = categories["Category"] + ", " + categoryName["Category"];

					items["CreatedOn"] = formatDateForEntry(items["CreatedOn"]);
					var item = [createdBy1["username"], data11, categories["TagNo"], categories["SubCategory"], categories["Karat"], categories["Gender"],
						categories["Tunch"],
						weight["GrossWeight"], weight["LessWeight"], weight["Fine"], weight["Amount"], weight["Piece"], weight["PairSize"], categories[
							"Name"], items["Status"]
					];

					totalG = totalG + categories["Tunch"];
					totalH = totalH + categories["GrossWeight"];
					totalI = totalI + weight["LessWeight"];
					totalJ = totalJ + weight["Fine"];
					totalK = totalK + weight["Amount"];
					sheet.addRow().values = item;
				}

				//Coding for formula and concatenation in the last line
				var totText = Records["length"] + 4;
				var totCol = totText - 1;
				totalG = totalG.toFixed(3);
				totalH = totalH.toFixed(2);
				totalI = totalI.toFixed(2);
				totalJ = totalJ.toFixed(2);
				totalK = totalK.toFixed(2);
				// sheet.getCell('A').value = items["Category"];
				sheet.getCell('A' + totText).value = "TOTAL";
				sheet.getCell('G' + totText).value = totalG;
				sheet.getCell('H' + totText).value = totalH;
				sheet.getCell('I' + totText).value = totalI;
				sheet.getCell('J' + totText).value = totalJ;
				sheet.getCell('K' + totText).value = totalK;

				for (var rowIndex = 4; rowIndex < sheet.rowCount; rowIndex++) {
					sheet.getRow(rowIndex).height = 64;
				}
				sheet.getCell('A' + totText).value = "TOTAL";

				//Coding for rows and column border
				for (var j = 1; j <= totText; j++) {
					if (sheet.getCell('A' + (j)).value == '') {
						sheet.getCell('A' + (j)).fill = {
							type: 'pattern',
							pattern: 'solid',
							bgColor: {
								argb: 'FFFFFF'
							},
							fgColor: {
								argb: 'FFFFFF'
							}
						};

					} else if (sheet.getCell('A' + (j)).value < 0) {
						sheet.getCell('A' + (j)).font = {
							color: {
								argb: 'FF0000'
							},
							bold: true
						};
					} else {
						sheet.getCell('A' + (j)).font = {
							color: {
								argb: '000000'
							},
							bold: true
						};
					}

					if (sheet.getCell('B' + (j)).value == '') {
						sheet.getCell('C' + (j)).fill = {
							type: 'pattern',
							pattern: 'solid',
							bgColor: {
								argb: 'FFFFFF'
							},
							fgColor: {
								argb: 'FFFFFF'
							}
						};

					} else if (sheet.getCell('B' + (j)).value < 0) {
						sheet.getCell('B' + (j)).font = {
							color: {
								argb: 'FF0000'
							},
							bold: true
						};
					} else {
						sheet.getCell('B' + (j)).font = {
							color: {
								argb: '000000'
							},
							bold: true
						};
					}

					if (sheet.getCell('C' + (j)).value == '') {
						sheet.getCell('C' + (j)).fill = {
							type: 'pattern',
							pattern: 'solid',
							bgColor: {
								argb: 'FFFFFF'
							},
							fgColor: {
								argb: 'FFFFFF'
							}
						};

					} else if (sheet.getCell('C' + (j)).value < 0) {
						sheet.getCell('C' + (j)).font = {
							color: {
								argb: 'FF0000'
							},
							bold: true
						};
					} else {
						sheet.getCell('C' + (j)).font = {
							color: {
								argb: '000000'
							},
							bold: true
						};
					}

					if (sheet.getCell('D' + (j)).value == '') {
						sheet.getCell('D' + (j)).fill = {
							type: 'pattern',
							pattern: 'solid',
							bgColor: {
								argb: 'FFFFFF'
							},
							fgColor: {
								argb: 'FFFFFF'
							}
						};

					} else if (sheet.getCell('D' + (j)).value < 0) {
						sheet.getCell('D' + (j)).font = {
							color: {
								argb: 'FF0000'
							},
							bold: true
						};
					} else {
						sheet.getCell('D' + (j)).font = {
							color: {
								argb: '000000'
							},
							bold: true
						};
					}

					if (sheet.getCell('E' + (j)).value == '') {
						sheet.getCell('E' + (j)).fill = {
							type: 'pattern',
							pattern: 'solid',
							bgColor: {
								argb: 'FFFFFF'
							},
							fgColor: {
								argb: 'FFFFFF'
							}
						};

					} else if (sheet.getCell('E' + (j)).value < 0) {
						sheet.getCell('E' + (j)).font = {
							color: {
								argb: 'FF0000'
							},
							bold: true
						};
					} else {
						sheet.getCell('E' + (j)).font = {
							color: {
								argb: '000000'
							},
							bold: true
						};
					}

					if (sheet.getCell('F' + (j)).value == '') {
						sheet.getCell('F' + (j)).fill = {
							type: 'pattern',
							pattern: 'solid',
							bgColor: {
								argb: 'FFFFFF'
							},
							fgColor: {
								argb: 'FFFFFF'
							}
						};

					} else if (sheet.getCell('F' + (j)).value < 0) {
						sheet.getCell('F' + (j)).font = {
							color: {
								argb: 'FF0000'
							},
							bold: true
						};
					} else {
						sheet.getCell('F' + (j)).font = {
							color: {
								argb: '000000'
							},
							bold: true
						};
					}

					if (sheet.getCell('G' + (j)).value == '') {
						sheet.getCell('G' + (j)).fill = {
							type: 'pattern',
							pattern: 'solid',
							bgColor: {
								argb: 'FFFFFF'
							},
							fgColor: {
								argb: 'FFFFFF'
							}
						};
						if (j > 3 || j <= (totText - 2)) {
							var valC = sheet.getCell('G' + (j)).value;
							sheet.getCell('G' + (j)).value = valC + '';
							sheet.getCell('G' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					} else if (sheet.getCell('G' + (j)).value < 0) {
						sheet.getCell('G' + (j)).font = {
							color: {
								argb: 'FF0000'
							},
							bold: true
						};
						if (j > 3 || j <= (totText - 2)) {
							var valC = sheet.getCell('G' + (j)).value;
							sheet.getCell('G' + (j)).value = valC + ' ';
							sheet.getCell('G' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					} else {
						sheet.getCell('G' + (j)).font = {
							color: {
								argb: '000000'
							},
							bold: true
						};
						if (j > 3 && j <= (totText)) {
							var valC = sheet.getCell('G' + (j)).value;
							sheet.getCell('G' + (j)).value = valC + ' T';
							sheet.getCell('G' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					}

					if (sheet.getCell('H' + (j)).value == '') {
						sheet.getCell('H' + (j)).fill = {
							type: 'pattern',
							pattern: 'solid',
							bgColor: {
								argb: 'FFFFFF'
							},
							fgColor: {
								argb: 'FFFFFF'
							}
						};
						if (j > 3 || j <= (totText - 2)) {
							var valC = sheet.getCell('H' + (j)).value;
							sheet.getCell('H' + (j)).value = valC + '';
							sheet.getCell('H' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					} else if (sheet.getCell('H' + (j)).value < 0) {
						sheet.getCell('H' + (j)).font = {
							color: {
								argb: 'FF0000'
							},
							bold: true
						};
						if (j > 3 || j <= (totText - 2)) {
							var valC = sheet.getCell('H' + (j)).value;
							sheet.getCell('H' + (j)).value = valC + ' ';
							sheet.getCell('H' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					} else {
						sheet.getCell('H' + (j)).font = {
							color: {
								argb: '000000'
							},
							bold: true
						};
						if (j > 3 && j <= (totText)) {
							var valC = sheet.getCell('H' + (j)).value;
							sheet.getCell('H' + (j)).value = valC + ' gm';
							sheet.getCell('H' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					}
					if (sheet.getCell('I' + (j)).value == '') {
						sheet.getCell('I' + (j)).fill = {
							type: 'pattern',
							pattern: 'solid',
							bgColor: {
								argb: 'FFFFFF'
							},
							fgColor: {
								argb: 'FFFFFF'
							}
						};
						if (j > 3 || j <= (totText - 2)) {
							var valC = sheet.getCell('I' + (j)).value;
							sheet.getCell('I' + (j)).value = valC + '';
							sheet.getCell('I' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					} else if (sheet.getCell('I' + (j)).value < 0) {
						sheet.getCell('I' + (j)).font = {
							color: {
								argb: 'FF0000'
							},
							bold: true
						};
						if (j > 3 || j <= (totText - 2)) {
							var valC = sheet.getCell('I' + (j)).value;
							sheet.getCell('I' + (j)).value = valC + ' ';
							sheet.getCell('I' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					} else {
						sheet.getCell('I' + (j)).font = {
							color: {
								argb: '000000'
							},
							bold: true
						};
						if (j > 3 && j <= (totText)) {
							var valC = sheet.getCell('I' + (j)).value;
							sheet.getCell('I' + (j)).value = valC + ' gm';
							sheet.getCell('I' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					}
					if (sheet.getCell('J' + (j)).value == '') {
						sheet.getCell('J' + (j)).fill = {
							type: 'pattern',
							pattern: 'solid',
							bgColor: {
								argb: 'FFFFFF'
							},
							fgColor: {
								argb: 'FFFFFF'
							}
						};
						if (j > 3 || j <= (totText - 2)) {
							var valC = sheet.getCell('J' + (j)).value;
							sheet.getCell('J' + (j)).value = valC + '';
							sheet.getCell('J' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					} else if (sheet.getCell('J' + (j)).value < 0) {
						sheet.getCell('J' + (j)).font = {
							color: {
								argb: 'FF0000'
							},
							bold: true
						};
						if (j > 3 || j <= (totText - 2)) {
							var valC = sheet.getCell('J' + (j)).value;
							sheet.getCell('J' + (j)).value = valC + ' ';
							sheet.getCell('J' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					} else {
						sheet.getCell('J' + (j)).font = {
							color: {
								argb: '000000'
							},
							bold: true
						};
						if (j > 3 && j <= (totText)) {
							var valC = sheet.getCell('J' + (j)).value;
							sheet.getCell('J' + (j)).value = valC + ' gm';
							sheet.getCell('J' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					}
					if (sheet.getCell('K' + (j)).value == '') {
						sheet.getCell('K' + (j)).fill = {
							type: 'pattern',
							pattern: 'solid',
							bgColor: {
								argb: 'FFFFFF'
							},
							fgColor: {
								argb: 'FFFFFF'
							}
						};

					} else if (sheet.getCell('K' + (j)).value < 0) {
						sheet.getCell('K' + (j)).font = {
							color: {
								argb: 'FF0000'
							},
							bold: true
						};
					} else {
						sheet.getCell('K' + (j)).font = {
							color: {
								argb: '000000'
							},
							bold: true
						};
					}

					if (sheet.getCell('L' + (j)).value == '') {
						sheet.getCell('L' + (j)).fill = {
							type: 'pattern',
							pattern: 'solid',
							bgColor: {
								argb: 'FFFFFF'
							},
							fgColor: {
								argb: 'FFFFFF'
							}
						};

					} else if (sheet.getCell('L' + (j)).value < 0) {
						sheet.getCell('L' + (j)).font = {
							color: {
								argb: 'FF0000'
							},
							bold: true
						};
					} else {
						sheet.getCell('L' + (j)).font = {
							color: {
								argb: '000000'
							},
							bold: true
						};
					}

					if (sheet.getCell('M' + (j)).value == '') {
						sheet.getCell('M' + (j)).fill = {
							type: 'pattern',
							pattern: 'solid',
							bgColor: {
								argb: 'FFFFFF'
							},
							fgColor: {
								argb: 'FFFFFF'
							}
						};

					} else if (sheet.getCell('M' + (j)).value < 0) {
						sheet.getCell('M' + (j)).font = {
							color: {
								argb: 'FF0000'
							},
							bold: true
						};
					} else {
						sheet.getCell('M' + (j)).font = {
							color: {
								argb: '000000'
							},
							bold: true
						};
					}

					if (sheet.getCell('N' + (j)).value == '') {
						sheet.getCell('N' + (j)).fill = {
							type: 'pattern',
							pattern: 'solid',
							bgColor: {
								argb: 'FFFFFF'
							},
							fgColor: {
								argb: 'FFFFFF'
							}
						};

					} else if (sheet.getCell('N' + (j)).value < 0) {
						sheet.getCell('N' + (j)).font = {
							color: {
								argb: 'FF0000'
							},
							bold: true
						};
					} else {
						sheet.getCell('N' + (j)).font = {
							color: {
								argb: '000000'
							},
							bold: true
						};
					}

					if (sheet.getCell('O' + (j)).value == '') {
						sheet.getCell('O' + (j)).fill = {
							type: 'pattern',
							pattern: 'solid',
							bgColor: {
								argb: 'FFFFFF'
							},
							fgColor: {
								argb: 'FFFFFF'
							}
						};
						if (j > 3 || j <= (totText - 2)) {
							var valC = sheet.getCell('O' + (j)).value;
							sheet.getCell('O' + (j)).value = valC + '';
							sheet.getCell('O' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					} else if (sheet.getCell('O' + (j)).value < 0) {
						sheet.getCell('O' + (j)).font = {
							color: {
								argb: 'FF0000'
							},
							bold: true
						};
						if (j > 3 || j <= (totText - 2)) {
							var valC = sheet.getCell('O' + (j)).value;
							sheet.getCell('O' + (j)).value = valC + ' ';
							sheet.getCell('O' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					} else {
						sheet.getCell('O' + (j)).font = {
							color: {
								argb: '000000'
							},
							bold: true
						};
						if (j > 3 && j <= (totText - 1)) {
							var valC = sheet.getCell('O' + (j)).value;
							if (valC === 'A') {
								sheet.getCell('O' + (j)).value = 'Approved';
							} else if (valC === 'R') {
								sheet.getCell('O' + (j)).value = 'Rejected';
							} else if (valC === 'N') {
								sheet.getCell('O' + (j)).value = 'Not Approved';
							}

							sheet.getCell('O' + (j)).alignment = {
								vertical: 'bottom',
								horizontal: 'right'
							};
						}

					}

					if (sheet.getCell('P' + (j)).value == '') {
						sheet.getCell('P' + (j)).fill = {
							type: 'pattern',
							pattern: 'solid',
							bgColor: {
								argb: 'FFFFFF'
							},
							fgColor: {
								argb: 'FFFFFF'
							}
						};

					} else if (sheet.getCell('P' + (j)).value < 0) {
						sheet.getCell('P' + (j)).font = {
							color: {
								argb: 'FF0000'
							},
							bold: true
						};
					} else {
						sheet.getCell('P' + (j)).font = {
							color: {
								argb: '000000'
							},
							bold: true
						};
					}
					// if (sheet.getCell('N' + (j)).value == '') {
					// 	sheet.getCell('N' + (j)).fill = {
					// 		type: 'pattern',
					// 		pattern: 'solid',
					// 		bgColor: {
					// 			argb: 'FFFFFF'
					// 		},
					// 		fgColor: {
					// 			argb: 'FFFFFF'
					// 		}
					// 	};
					//
					// } else if (sheet.getCell('N' + (j)).value < 0) {
					// 	sheet.getCell('N' + (j)).font = {
					// 		color: {
					// 			argb: 'FF0000'
					// 		},
					// 		bold: true
					// 	};
					// } else {
					// 	sheet.getCell('N' + (j)).font = {
					// 		color: {
					// 			argb: '000000'
					// 		},
					// 		bold: true
					// 	};
					// }

					////
					sheet.getCell('A' + (j)).border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
					};
					sheet.getCell('B' + (j)).border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
					};
					sheet.getCell('C' + (j)).border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
					};
					sheet.getCell('D' + (j)).border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
					};
					sheet.getCell('E' + (j)).border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
					};

					sheet.getCell('F' + (j)).border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
					};
					sheet.getCell('G' + (j)).border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
					};

					sheet.getCell('H' + (j)).border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
					};

					sheet.getCell('I' + (j)).border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
					};

					sheet.getCell('J' + (j)).border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
					};
					sheet.getCell('K' + (j)).border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
					};
					sheet.getCell('L' + (j)).border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
					};
					sheet.getCell('M' + (j)).border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
					};

					sheet.getCell('N' + (j)).border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
					};

					sheet.getCell('O' + (j)).border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
					};

					sheet.getCell('P' + (j)).border = {
						top: {
							style: 'thin'
						},
						left: {
							style: 'thin'
						},
						bottom: {
							style: 'thin'
						},
						right: {
							style: 'thin'
						}
					};
					// sheet.getCell('N' + (j)).border = {
					// 	top: {
					// 		style: 'thin'
					// 	},
					// 	left: {
					// 		style: 'thin'
					// 	},
					// 	bottom: {
					// 		style: 'thin'
					// 	},
					// 	right: {
					// 		style: 'thin'
					// 	}
					// };

					// code added by surya for autocolumn width - started
					//setting absolute length for column A
					if (j > "2") {

						if (sheet.getCell('A' + (j)).value !== null) {
							if (j == "3") {
								colMaxLengthA = sheet.getCell('A' + (j)).value.length;
							} else {
								if (sheet.getCell('A' + (j)).value.length > colMaxLengthA) {
									colMaxLengthA = sheet.getCell('A' + (j)).value.length;
								}
							}
						}
						if (j == totText) {
							sheet.getColumn('A').width = colMaxLengthA + 7;
						}

						if (sheet.getCell('B' + (j)).value !== null) {
							if (j == "3") {
								colMaxLengthB = sheet.getCell('B' + (j)).value.length;
							} else {
								if (sheet.getCell('B' + (j)).value.length > colMaxLengthB) {
									colMaxLengthB = sheet.getCell('B' + (j)).value.length;
								}
							}
						}
						if (j == totText) {
							sheet.getColumn('B').width = colMaxLengthB + 1;
						}
						//setting absolute length for column B
						if (sheet.getCell('C' + (j)).value !== null) {
							if (j == "3") {
								colMaxLengthC = sheet.getCell('C' + (j)).value.length;
							} else {
								if (sheet.getCell('C' + (j)).value.length > colMaxLengthC) {
									colMaxLengthC = sheet.getCell('C' + (j)).value.length;
								}
							}
						}
						if (j == totText) {
							sheet.getColumn('C').width = colMaxLengthC + 3;
						}
						//setting absolute length for column C
						if (sheet.getCell('D' + (j)).value !== null) {
							if (j == "3") {
								colMaxLengthD = sheet.getCell('D' + (j)).value.length;
							} else {
								if (sheet.getCell('D' + (j)).value.length > colMaxLengthD) {
									colMaxLengthD = sheet.getCell('D' + (j)).value.length;
								}
							}
						}
						if (j == totText) {
							sheet.getColumn('D').width = colMaxLengthD + 5;
						}
						//setting absolute length for column D
						if (sheet.getCell('E' + (j)).value !== null) {
							if (j == "3") {
								colMaxLengthE = sheet.getCell('E' + (j)).value.length;
							} else {
								if (sheet.getCell('E' + (j)).value.length > colMaxLengthE) {
									colMaxLengthE = sheet.getCell('E' + (j)).value.length;
								}
							}
						}
						if (j == totText) {
							sheet.getColumn('E').width = colMaxLengthE + 3;
						}
						//setting absolute length for column E
						if (sheet.getCell('F' + (j)).value !== null) {
							if (j == "3") {
								colMaxLengthF = sheet.getCell('F' + (j)).value.length;
							} else {
								if (sheet.getCell('F' + (j)).value.length > colMaxLengthF) {
									colMaxLengthF = sheet.getCell('F' + (j)).value.length;
								}
							}
						}
						if (j == totText) {
							sheet.getColumn('F').width = colMaxLengthF + 1;
						}

						if (sheet.getCell('G' + (j)).value !== null) {
							if (j == "3") {
								colMaxLengthG = sheet.getCell('G' + (j)).value.length;
							} else {
								if (sheet.getCell('G' + (j)).value.length > colMaxLengthG) {
									colMaxLengthG = sheet.getCell('G' + (j)).value.length;
								}
							}
						}
						if (j == totText) {
							sheet.getColumn('G').width = colMaxLengthG + 3;
						}
						if (sheet.getCell('H' + (j)).value !== null) {
							if (j == "3") {
								colMaxLengthH = sheet.getCell('H' + (j)).value.length;
							} else {
								if (sheet.getCell('H' + (j)).value.length > colMaxLengthH) {
									colMaxLengthH = sheet.getCell('H' + (j)).value.length;
								}
							}
						}
						if (j == totText) {
							sheet.getColumn('H').width = colMaxLengthH + 3;
						}
						if (sheet.getCell('I' + (j)).value !== null) {
							if (j == "3") {
								colMaxLengthI = sheet.getCell('I' + (j)).value.length;
							} else {
								if (sheet.getCell('I' + (j)).value.length > colMaxLengthI) {
									colMaxLengthI = sheet.getCell('I' + (j)).value.length;
								}
							}
						}
						if (j == totText) {
							sheet.getColumn('I').width = colMaxLengthI + 3;
						}
						if (sheet.getCell('J' + (j)).value !== null) {
							if (j == "3") {
								colMaxLengthJ = sheet.getCell('J' + (j)).value.length;
							} else {
								if (sheet.getCell('J' + (j)).value.length > colMaxLengthJ) {
									colMaxLengthJ = sheet.getCell('J' + (j)).value.length;
								}
							}
						}
						if (j == totText) {
							sheet.getColumn('J').width = colMaxLengthJ + 4;
						}
						if (sheet.getCell('K' + (j)).value !== null) {
							if (j == "3") {
								colMaxLengthK = sheet.getCell('K' + (j)).value.length;
							} else {
								if (sheet.getCell('K' + (j)).value.length > colMaxLengthK) {
									colMaxLengthK = sheet.getCell('K' + (j)).value.length;
								}
							}
						}
						if (j == totText) {
							sheet.getColumn('K').width = colMaxLengthK + 5;
						}
						if (sheet.getCell('L' + (j)).value !== null) {
							if (j == "3") {
								colMaxLengthL = sheet.getCell('L' + (j)).value.length;
							} else {
								if (sheet.getCell('L' + (j)).value.length > colMaxLengthL) {
									colMaxLengthL = sheet.getCell('L' + (j)).value.length;
								}
							}
						}
						if (j == totText) {
							sheet.getColumn('L').width = colMaxLengthL + 7;
						}
						if (sheet.getCell('M' + (j)).value !== null) {
							if (j == "3") {
								colMaxLengthM = sheet.getCell('M' + (j)).value.length;
							} else {
								if (sheet.getCell('M' + (j)).value.length > colMaxLengthM) {
									colMaxLengthM = sheet.getCell('M' + (j)).value.length;
								}
							}
						}
						if (j == totText) {
							sheet.getColumn('M').width = colMaxLengthM + 7;
						}
						if (sheet.getCell('N' + (j)).value !== null) {
							if (j == "3") {
								colMaxLengthN = sheet.getCell('N' + (j)).value.length;
							} else {
								if (sheet.getCell('N' + (j)).value.length > colMaxLengthN) {
									colMaxLengthN = sheet.getCell('N' + (j)).value.length;
								}
							}
						}
						if (j == totText) {
							sheet.getColumn('N').width = colMaxLengthN + 7;
						}

						if (sheet.getCell('O' + (j)).value !== null) {
							if (j == "3") {
								colMaxLengthO = sheet.getCell('O' + (j)).value.length;
							} else {
								if (sheet.getCell('O' + (j)).value.length > colMaxLengthO) {
									colMaxLengthO = sheet.getCell('O' + (j)).value.length;
								}
							}
						}
						if (j == totText) {
							sheet.getColumn('O').width = colMaxLengthO + 7;
						}

						if (sheet.getCell('P' + (j)).value !== null) {
							if (j == "3") {
								colMaxLengthP = sheet.getCell('P' + (j)).value.length;
							} else {
								if (sheet.getCell('P' + (j)).value.length > colMaxLengthP) {
									colMaxLengthP = sheet.getCell('P' + (j)).value.length;
								}
							}
						}
						if (j == totText) {
							sheet.getColumn('P').width = colMaxLengthP + 7;
						}

					}
					// code added by surya for autocolumn width - ended

				}

				const tempFileName = 'Product Report' + currentdate.getDate() + "-" + (currentdate.getMonth() + 1) + '-' + currentdate.getFullYear() +
					"-" +
					currentdate.getHours() + ':' + currentdate.getMinutes() + ':' + currentdate.getSeconds() + '.xlsx';

				res.setHeader(
					"Content-Type",
					"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
				);
				res.setHeader(
					"Content-Disposition",
					"attachment; filename=" + tempFileName
				);
				return workbook.xlsx.write(res).then(function(data) {
					console.log(data);
					res.status(200).end();
				});
			}

		}

	).catch(function(oError) {
		res.send("Show Alert");

	});

	//res.send(responseData);

});
// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
	if (err) throw err;

	// start the server if `$ node server.js`
	if (require.main === module)
		app.start();
});
