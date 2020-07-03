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
app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({ extended: true }));
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
