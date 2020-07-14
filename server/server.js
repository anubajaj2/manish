var loopback = require('loopback');
var boot = require('loopback-boot');
var bodyParser = require('body-parser');
var session = require('express-session');
var fileUpload = require('express-fileupload');
var fs = require('fs');
var xlstojson = require("xls-to-json-lc");
var xlsxtojson = require("xlsx-to-json-lc");
var express = require('express');
var fs = require('fs');
var app = express();
app = module.exports = loopback();

// parse application/json
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({
// 	extended: true
// }));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true }));
app.use(session({
	secret: 'anuragApp'
}));
app.use(fileUpload());
app.start = function() {
	// start the web server
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
app.post("/Photos",
				 function(req, res){

					var app = require('../server/server');
					var Pics = app.models.Photo;
					Pics.create(req.body.images,function (error, created) {
						debugger;
						if(error){
							res.send({
								error: error
							});
						}else{
							res.send({
								"allImages":created
							});
						}

					}
					);
});

app.post('/changeUserStatus',
	function(req, res) {
		if (!req.body.emailId) {
			res.send('No Email Id');
			return;
		}

		this.AppUser = app.models.AppUser;
		var _this = this;
		_this.AppUser.findOne({ where: { "EmailId": req.body.emailId } }).then(function (appUser) {
				if (appUser) {
						appUser.updateAttributes({
							blocked: req.body.bStat
						});
						res.send("Change Success");
				}else{
					res.send("User not found");
				}
		}).catch(function(err){
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
		_this.AppUser.findOne({ where: { "EmailId": req.body.emailId } }).then(function (appUser) {
				if (appUser) {
						appUser.updateAttributes({
							lastLogin: new Date()
						});
						res.send("Change Success");
				}else{
					res.send("User not found");
				}
		}).catch(function(err){
			res.send("Error Occurred");
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
		this.Token.findById(req.body.Authorization).then(function(token){
			var _this2 = _this;
			_this2.userId = token.userId;
			_this.User.findOne({ where: { email: req.body.emailId } }).then(function (user) {
				if (user) {
							user.updateAttributes({
								password: req.body.newPassword
							});
							var _this3 = _this2;
							_this2.TechnicalId = user.id;
							_this2.AppUser.findOne({ where: { "EmailId": user.email } }).then(function (appUser) {
									if (appUser) {
											appUser.updateAttributes({
												pwdChange: false,
												ChangedBy: _this3.TechnicalId
											});
											res.send("Change Success");
									}
							});
					}else{
						res.send("User Not Found");
					}
			}).catch(function (err) {
					res.send("You are not Authorized to perform this action");
			});
		}).catch(function(err){
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
		this.Token.findById(req.body.Authorization).then(function(token){
			var _this2 = _this;
			_this2.userId = token.userId;
			_this.User.findOne({ where: { email: req.body.emailId } }).then(function (user) {
				if (!user) {
							var _this3 = _this2;
							_this2.User.create({ username: req.body.name, email: req.body.emailId, password: 'Welcome1' }).then(function (user) {
									if (user) {
										var _this4 = _this3;
										_this3.TechnicalId = user.id;
										_this3.AppUser.findOne({ where: { "EmailId": user.email } }).then(function (roleMapping) {
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
														}).then(function (roleMapping) {
															res.send("yes created");
														});
												}
										});
									}
							});
					}else{
						res.send("User Already Exist!!");
					}
			}).catch(function (err) {
					res.send("You are not Authorized to perform this action");
			});
		}).catch(function(err){
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
									var newRec ={};
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
