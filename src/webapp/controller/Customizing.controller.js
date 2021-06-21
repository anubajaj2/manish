sap.ui.define([
		"sap/ui/demo/cart/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/ui/core/routing/History",
		"sap/m/MessageToast",
		"sap/m/MessageBox",
		"sap/ui/demo/cart/model/formatter"
	],
	function (BaseController, JSONModel, History, MessageToast, MessageBox, formatter) {
		// "use strict";

		return BaseController.extend("sap.ui.demo.cart.controller.Customizing", {
			formatter: formatter,

			onInit: function() {
				var oRouter = this.getRouter();
				oRouter.getRoute("Customizing").attachMatched(this._onRouteMatched, this);
			},
			getRouter: function () {
				return sap.ui.core.UIComponent.getRouterFor(this);
			},
			_onRouteMatched: function(oEvent) {

				setTimeout(function() {sap.m.MessageToast.show("Customizing Screen is Under Construction")}, 1000);
			}


			// onSubmit: function (evt) {
			// 	$(function () {
			// 		$('input:text:first').focus();
			// 		var $inp = $('input:text');
			// 		$inp.bind('keydown', function (e) {
			// 			//var key = (e.keyCode ? e.keyCode : e.charCode);
			// 			var key = e.which;
			// 			if (key == 13) {
			// 				e.preventDefault();
			// 				var nxtIdx = $inp.index(this) + 1;
			// 				$(":input:text:eq(" + nxtIdx + ")").focus();
			// 			}
			// 		});
			// 	});
			// },
			// handleUploadPress: function (oEvent) {
			// 	debugger;
			// 	// console.log(oEvent.getSource().mProperties["title"]);
			// 	console.log(this.getView().byId("uploadTypeSelect").mProperties["value"]);
			// 	var uploadTypeValue = this.getView().byId("uploadTypeSelect").mProperties["value"];
			// 	var that = this;
			// 	var oFileUploader = this.byId("fileUploader");
			// 	this.byId("fileUploader").setAdditionalData(uploadTypeValue);
			// 	if (!oFileUploader.getValue()) {
			// 		MessageToast.show(that.resourceBundle.getText("Choose11"));
			// 		return;
			// 	}

			// 	oFileUploader.getAggregation("parameters")[0].setValue(
			// 		this.getModel("local").getData().CurrentUser)
			// 	oFileUploader.upload();
			// },

			// handleUploadPress1: function (oEvent) {
			// 	debugger;
			// 	// console.log(oEvent.getSource().mProperties["title"]);
			// 	// console.log(this.getView().byId("uploadTypeSelect").mProperties["value"]);
			// 	// var uploadTypeValue = this.getView().byId("uploadTypeSelect").mProperties["value"];
			// 	var that = this;
			// 	var oFileUploader = this.byId("fileUploader1");
			// 	// this.byId("fileUploader1").setAdditionalData(uploadTypeValue);
			// 	if (!oFileUploader.getValue()) {
			// 		MessageToast.show(that.resourceBundle.getText("Choose11"));
			// 		return;
			// 	}

			// 	oFileUploader.getAggregation("parameters")[0].setValue(
			// 		this.getModel("local").getData().CurrentUser)
			// 	oFileUploader.upload();
			// },


			// handleUploadGroupPress: function(){
			// 	debugger;
			// 	var uploadTypeValue = this.getView().byId("uploadTypeSelect").mProperties["value"];
			// 	var oFileUploader = this.byId("fileUploader");
			// 	$.post("/upload", {
			// 		file: oFileUploader.getValue(),
			// 		type: uploadTypeValue
			// 	}).then(function (oData) {
			// 		debugger;
			// 		MessageToast.show(that.resourceBundle.getText("downloaded11"));
			// 	}, function (oError) {
			// 		debugger;
			// 		MessageToast.show(that.resourceBundle.getText("downloaded12"));
			// 	});



			// 	// var oFileUploader1 = this.byId("fileUploader1");
			// 	// $.post("/VictoriaGFS", {
			// 	// 	file: oFileUploader1.getValue(),
			// 	//
			// 	// }).then(function (oData) {
			// 	// 	debugger;
			// 	// 	MessageToast.show(that.resourceBundle.getText("downloaded11"));
			// 	// }, function (oError) {
			// 	// 	debugger;
			// 	// 	MessageToast.show(that.resourceBundle.getText("downloaded12"));
			// 	// });
			// },

			// handleUploadGroupPress1: function(){
			// 	debugger;
			// 	// var uploadTypeValue = this.getView().byId("uploadTypeSelect").mProperties["value"];
			// 	var oFileUploader = this.byId("fileUploader1");
			// 	$.post("/VictoriaGFS", {
			// 		file: oFileUploader.getValue(),

			// 	}).then(function (oData) {
			// 		debugger;
			// 		MessageToast.show(that.resourceBundle.getText("downloaded11"));
			// 	}, function (oError) {
			// 		debugger;
			// 		MessageToast.show(that.resourceBundle.getText("downloaded12"));
			// 	});
			// },

			// handleUploadComplete: function (oEvent) {
			// 	debugger;
			// 	var sResponse = oEvent.getParameter("response");
			// 	var oFiler = oEvent.getSource();
			// 	if (sResponse) {
			// 		var sMsg = "";
			// 		debugger;
			// 		if (JSON.parse(sResponse.split("\">")[1].replace("</pre>", "")).error_code !== 0) {
			// 			sMsg = JSON.parse(sResponse.split("\">")[1].replace("</pre>", "")).err_desc;
			// 		} else {
			// 			sMsg = that.resourceBundle.getText("UploadedSuccessfully");
			// 		}
			// 		MessageToast.show(sMsg);
			// 	}
			// },



			// handleUploadComplete1: function (oEvent) {
			// 	debugger;
			// 	var that =this;
			// 	var sResponse = oEvent.getParameter("response");
			// 	var oFiler = oEvent.getSource();
			// 	if (!sResponse) {
			// 		var sMsg = "";
			// 		debugger;

			// 		// if (JSON.parse(sResponse.split("\">")[1].replace("</pre>", "")).error_code !== 0) {
			// 		// 	sMsg = JSON.parse(sResponse.split("\">")[1].replace("</pre>", "")).err_desc;
			// 		// }
			// 		// else {
			// 			sMsg = that.resourceBundle.getText("UploadedSuccessfully");

			// 		MessageToast.show(sMsg);
			// 	}
			// },

			// onInit: function () {
			// 	this.resourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			// 	var oViewModel1 = new JSONModel({
			// 		"First": "",
			// 		"Second": "",
			// 		"Gold": "",
			// 		"Silver": "",
			// 		"Gold Returns": "",
			// 		"Silver Returns": "",
			// 		"Gold1": "",
			// 		"Silver1": "",
			// 		"Kaccha Gold": "",
			// 		"Kaccha Silver": "",
			// 		"Gold Returns1": "",
			// 		"Silver Returns1": "",
			// 		"Kaccha Gold R": "",
			// 		"Kaccha Silver R": ""

			// 	});
			// 	this.setModel(oViewModel1, "customModel");
			// 	BaseController.prototype.onInit.apply(this);
			// 	var oRouter = this.getRouter();
			// 	oRouter.getRoute("Customizing").attachMatched(this._onRouteMatched, this);
			// 	var that = this;
			// 	var currentUser = this.getModel("local").getProperty("/CurrentUser");
			// 	var loginUser = this.getModel("local").oData.AppUsers[currentUser].UserName;
			// 	loginUser = "Hey " + loginUser;
			// 	this.getView().byId("idUser").setText(loginUser);
			// },

			// getRouter: function () {
			// 	return sap.ui.core.UIComponent.getRouterFor(this);
			// },
			// _onRouteMatched: function () {
			// 	var that = this;
			// 	// that.getView().getModel("local").setProperty("/CustomCalculations");
			// 	this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
			// 			"/CustomCalculations", "GET", {}, {}, this)
			// 		.then(function (oData) {
			// 			var oModelCalculation = new JSONModel();
			// 			oModelCalculation.setData(oData);
			// 			if (oData.results.length > 0) {
			// 				var myData = that.getView().getModel("local").setProperty("/CustomCalculation", oData.results[0], oModelCalculation);
			// 			} else {
			// 				var myData = that.getView().getModel("local").getProperty("/CustomCalculation");
			// 			}
			// 		}).catch(function (oError) {
			// 			MessageToast.show(that.resourceBundle.getText("Fetch11"));
			// 		});
			// },

			// ClearCalculation: function () {
			// 	var that = this;
			// 	that._onRouteMatched();
			// },

			// onliveChange: function (oEvent) {
			// 	var that = this;
			// 	this.byId("idSaveIcon").setColor('red');

			// },
			// onValueChange: function (oEvent) {
			// 	var oFieldLab = oEvent.getSource().getIdForLabel();
			// },

			// ValidateInput: function (i, oObj, n) {
			// 	var that = this;
			// 	var oText = oObj.getFormContainers()[n].getFormElements()[i].getFields()[0].getLabels()[0].getText();
			// 	var oValue = oObj.getFormContainers()[n].getFormElements()[i].getFields()[0].getValue();
			// 	var oIdErr = oObj.getFormContainers()[n].getFormElements()[i].getFields()[0];
			// 	if (oText.includes("Gold") || oText.includes("22")) {
			// 		var valid = that.handleGoldValidation(oValue);
			// 		if (valid === false) {
			// 			oIdErr.setValueState("Error").setValueStateText("Gold value should be between 30000 and 80000");
			// 			return valid;
			// 		} else {
			// 			oIdErr.setValueState("None");
			// 			return valid;
			// 		}
			// 	} else {
			// 		var valid = that.handleSilverValidation(oValue);
			// 		if (valid === false) {
			// 			oIdErr.setValueState("Error").setValueStateText("Silver value should be between 30000 and 110000");
			// 			return valid;
			// 		} else {
			// 			oIdErr.setValueState("None");
			// 			return valid;
			// 		}
			// 	}
			// },

			// SaveCalculation: function (oEvent) {debugger;
			// 	var that = this
			// 	var valid = true;
			// 	var oObj = this.getView().byId("__component0---idCustomizing--idCalculation");
			// 	var oLen = oObj.getFormContainers()[0].getFormElements().length;
			// 	var oLen1 = oObj.getFormContainers()[1].getFormElements().length;
			// 	for (var i = 0; i < oLen; i++) {
			// 		var n = 0;
			// 		var valid = that.ValidateInput(i, oObj, n);
			// 		if (valid === false) {
			// 			break;
			// 		}
			// 	}
			// 	if (valid === true) {
			// 		for (var i = 0; i < oLen1; i++) {
			// 			var n = 1;
			// 			var valid = that.ValidateInput(i, oObj, n);
			// 			if (valid === false) {
			// 				break;
			// 			}
			// 		}
			// 	}
			// 	var oObj = this.getView().byId("__component0---idCustomizing--idWholesale");
			// 	var oLen = oObj.getFormContainers()[0].getFormElements().length;
			// 	var oLen1 = oObj.getFormContainers()[1].getFormElements().length;
			// 	if (valid === true) {
			// 		for (var i = 0; i < oLen; i++) {
			// 			var n = 0;
			// 			var valid = that.ValidateInput(i, oObj, n);
			// 			if (valid === false) {
			// 				break;
			// 			}
			// 		}
			// 	}
			// 	if (valid === true) {
			// 		for (var i = 0; i < oLen1; i++) {
			// 			var n = 1;
			// 			var valid = that.ValidateInput(i, oObj, n);
			// 			if (valid === false) {
			// 				break;
			// 			}
			// 		}
			// 	}
			// 	that.getView().setBusy(true);
			// 	var myData = that.getView().getModel("local").getProperty("/CustomCalculation");
			// 	var id = myData.id;
			// 	// var retVal = that.validateAll(myData);
			// 	if (valid === true) {
			// 		if (id) {
			// 	var that2=that;
			// 	debugger;
			// 	var token=that.getOwnerComponent().getModel("local").getProperty("/AuthorizationToken");
			// 	var lpayload={
			// 		"id":id,
			// 		"EntryLayout":myData.EntryLayout
			// 	};
			// 			$.ajax('/api/CustomCalculations/'+myData.id+'?access_token='+token+'&id='+myData.id,{
			// 			type:"PUT",
			// 			headers: {
			// 		"Content-Type": "application/json",
			// 		"Accept": "application/json",
					
			// 	}, 
			// 	data:JSON.stringify(lpayload),
			// 		success:function(data, status) {
			// 			debugger;


			// 		},
			// 		error:function(xhr, status, error) {
			// 			debugger;
			// 			// sap.ui.getCore().byId("idChangePass--idPassEmail").setValueState("Error");
						
			// 		}
			// 			});
			// 			debugger;
			// 			this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
			// 					"/CustomCalculations('" + myData.id + "')", "PUT", {}, myData, this)
			// 				.then(function (oData) {debugger;
			// 					that.getView().setBusy(false);
			// 					MessageToast.show(that.resourceBundle.getText("Data"));
			// 					that._onRouteMatched();
			// 					that.byId("idSaveIcon").setColor('green');
			// 					// that._onRouteMatched();
			// 				}).catch(function (oError) {
			// 					that.getView().setBusy(false);
			// 					var oPopover = that.getErrorMessage(oError);
			// 				});
			// 		} else {
			// 			this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
			// 					"/CustomCalculations", "POST", {}, myData, this)
			// 				.then(function (oData) {
			// 					that.getView().setBusy(false);
			// 					MessageToast.show(that.resourceBundle.getText("dataSave"));
			// 					that._onRouteMatched();
			// 					that.byId("idSaveIcon").setColor('green');
			// 					// that._onRouteMatched();
			// 				}).catch(function (oError) {
			// 					that.getView().setBusy(false);
			// 					var oPopover = that.getErrorMessage(oError);
			// 				});
			// 		}
			// 	} else {
			// 		that.getView().setBusy(false);
			// 	};

			// 	// else {
			// 	//
			// 	// }
			// },
			// /* =========================================================== */
			// /* internal methods                                            */
			// /* =========================================================== */

			// /**
			//  * Binds the view to the object path.
			//  * @function
			//  * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
			//  * @private
			//  */
			// _onObjectMatched: function (oEvent) {
			// 	var sObjectId = oEvent.getParameter("arguments").objectId;
			// 	this.getModel().metadataLoaded().then(function () {
			// 		var sObjectPath = this.getModel().createKey("city", {
			// 			Id: sObjectId
			// 		});
			// 		this._bindView("/" + sObjectPath);
			// 	}.bind(this));


			// },


			// 		onPressBackup:function(){
			// 				var reportType = "Backup";
			// 				window.open("/VictoriaBackup");
							

			// 		},

			// /**
			//  * Binds the view to the object path.
			//  * @function
			//  * @param {string} sObjectPath path to the object to be bound
			//  * @private
			//  */
			// _bindView: function (sObjectPath) {
			// 	var oViewModel1 = this.getModel("objectView"),
			// 		oDataModel = this.getModel();

			// 	this.getView().bindElement({
			// 		path: sObjectPath,
			// 		events: {
			// 			change: this._onBindingChange.bind(this),
			// 			dataRequested: function () {
			// 				oDataModel.metadataLoaded().then(function () {
			// 					// Busy indicator on view should only be set if metadata is loaded,
			// 					// otherwise there may be two busy indications next to each other on the
			// 					// screen. This happens because route matched handler already calls '_bindView'
			// 					// while metadata is loaded.
			// 					oViewModel1.setProperty("/busy", true);
			// 				});
			// 			},
			// 			dataReceived: function () {
			// 				oViewModel1.setProperty("/busy", false);
			// 			}
			// 		}
			// 	});
			// }
		});
	}
);
