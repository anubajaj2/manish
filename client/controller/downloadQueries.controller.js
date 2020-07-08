sap.ui.define([
	"sap/ui/demo/cart/controller/BaseController",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/demo/cart/model/formatter"
], function(Controller, MessageBox, MessageToast, Formatter) {
	"use strict";

	return Controller.extend("sap.ui.demo.cart.controller.downloadQueries", {
		formatter: Formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf sap.ui.demo.cart.view.View2
		 */
		onInit: function() {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.attachRoutePatternMatched(this.herculis, this);

		},
		JSON2CSV: function(objArray) {
    var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
    var str = '';
    var line = '';

    if ($("#labels").is(':checked')) {
        var head = array[0];
        if ($("#quote").is(':checked')) {
            for (var index in array[0]) {
                var value = index + "";
                line += '"' + value.replace(/"/g, '""') + '",';
            }
        } else {
            for (var index in array[0]) {
                line += index + ',';
            }
        }

        line = line.slice(0, -1);
        str += line + '\r\n';
    }

    for (var i = 0; i < array.length; i++) {
        var line = '';

        if ($("#quote").is(':checked')) {
            for (var index in array[i]) {
                var value = array[i][index] + "";
                line += '"' + value.replace(/"/g, '""') + '",';
            }
        } else {
            for (var index in array[i]) {
                line += array[i][index] + ',';
            }
        }

        line = line.slice(0, -1);
        str += line + '\r\n';
    }
    return str;
},
		updateInq: function(oEvent){
				var that = this;
				//gtest
				// $.post('/upload', {
				// 	files: oEvent.getSource().getFocusDomRef().files[0]
				// })
			  //   .done(function(data, status){
				// 				sap.m.MessageBox.error("Done");
				// 	})
			  //   .fail(function(xhr, status, error) {
				// 				sap.m.MessageBox.error("Error in upload");
			  //   });
		},
		TakeBackup: function(){
			$.post('/TakeBackup')
				.done(function(data, status){
							sap.m.MessageBox.error("Backup taken successfully");
				})
				.fail(function(xhr, status, error) {
							sap.m.MessageBox.error("Error in backup");
				});
		},
		fillColl: function(){
			var that = this;
			this.Students = [];
			this.Courses = [];
			that.ODataHelper.callOData(that.getOwnerComponent().getModel(), "/Students", "GET", {
			}, null, that)
			.then(function(oData) {
				if (oData.results.length > 0) {
					for (var i = 0; i < oData.results.length; i++) {
						that.Students[oData.results[i].id] = oData.results[i];
					}
					debugger;
					//console.log(oData.results.length);
				}
			}).catch(function(oError) {
				debugger;
			});
			that.ODataHelper.callOData(that.getOwnerComponent().getModel(), "/Courses", "GET", {
			}, null, that)
			.then(function(oData) {
				if (oData.results.length > 0) {
					for (var i = 0; i < oData.results.length; i++) {
						that.Courses[oData.results[i].id] = oData.results[i];
					}
					debugger;
					//console.log(oData.results.length);
				}
			}).catch(function(oError) {
				debugger;
			});


		},
		handleUploadComplete: function(oEvent) {
			var sResponse = oEvent.getParameter("response");
			if (sResponse) {
				var sMsg = "";
				debugger;
				var m = /^\[(\d\d\d)\]:(.*)$/.exec(sResponse);
				if (m[1] == "200") {
					$.post('/upload', {
						files: oEvent.getSource().getFocusDomRef().files[0]
					})
				    .done(function(data, status){
									sap.m.MessageBox.error("Done");
						})
				    .fail(function(xhr, status, error) {
									sap.m.MessageBox.error("Error in upload");
				    });
					sMsg = "Return Code: " + m[1] + "\n" + m[2] + "(Upload Success)";
					oEvent.getSource().setValue("");
				} else {
					sMsg = "Return Code: " + m[1] + "\n" + m[2] + "(Upload Error)";
				}

				MessageToast.show(sMsg);
			}
		},

		handleUploadPress: function(oEvent) {
			var oFileUploader = this.byId("fileUploader");
			oFileUploader.upload();
		},
		onBack: function(){
			sap.ui.getCore().byId("idApp").to("idView1");
		},
		onSave: function(){
			//TODO: Save to Coustomer Reg. table
			console.log(this.getView().getModel("local").getProperty("/newBatch"));
		},
		onExecute: function(){

		},
		onStartChange: function(oEvent){
			var dateString = oEvent.getSource().getValue();
			var from = dateString.split(".");
			var dateObject = new Date(from[2], from[1] - 1, from[0]);
			var endDate = this.formatter.getIncrementDate(dateObject,2.5);
			this.getView().getModel("local").setProperty("/newBatch/endDate", endDate);
			var blogDate = this.formatter.getIncrementDate(dateObject,8);
			this.getView().getModel("local").setProperty("/newBatch/blogDate", blogDate);
			console.log(endDate);
			console.log(blogDate);
		},
		herculis: function(oEvent){

			this.getView().getModel("local").setProperty("/newBatch/startDate", this.formatter.getFormattedDate(0));
			this.getView().getModel("local").setProperty("/newBatch/demoDate", this.formatter.getFormattedDate(0));
			this.getView().getModel("local").setProperty("/newBatch/endDate", this.formatter.getFormattedDate(2.5));
			this.getView().getModel("local").setProperty("/newBatch/blogDate", this.formatter.getFormattedDate(8));
			///TODO: Fill the Customer Set and Course Set from REST API

		}

	});
});
