sap.ui.define([
	"sap/ui/demo/cart/controller/BaseController",
	"sap/m/MessageToast",
	"sap/m/Dialog",
	"sap/m/DialogType",
	"sap/m/Button",
	"sap/m/ButtonType",
], function(Controller, MessageToast, Dialog, DialogType, Button, ButtonType) {
	"use strict";

	return Controller.extend("sap.ui.demo.cart.controller.MainApp", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf victoria.view.App
		 */
		//	onInit: function() {
		//
		//	},
		idleLogout: function() {
			var t;
			var that = this;
			// window.onbeforeunload = function() {
			//  that.logOutApp("X");
			// }

			window.onload = resetTimer;
			window.onmousemove = resetTimer;
			window.onmousedown = resetTimer;  // catches touchscreen presses as well
			window.ontouchstart = resetTimer; // catches touchscreen swipes as well
			window.onclick = resetTimer;      // catches touchpad clicks as well
			window.onkeypress = resetTimer;
			window.addEventListener('scroll', resetTimer, true); // improved; see comments

			function yourFunction() {
					// your function for too long inactivity goes here
					// e.g. window.location.href = 'logout.php';
					sap.m.MessageBox.alert("Page expired, please login again!");
					window.top.location.href = "/";
			}

			function resetTimer() {
					clearTimeout(t);
					t = setTimeout(yourFunction, 3600000);  // time is in milliseconds
			}
		},
		onLogout: function(){
			this.logOutApp();
		},
		onInit: function() {
			//var oModel = Models.createFruitModel();
			//sap.ui.getCore().setModel(oModel);
			this.idleLogout();
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
		},
		onSubmit: function(){
			this.Login();
		},

    onLivePassword: function(oEvent){
      console.log("Test")
		},

		Login: function(){

			var loginPayload = {
				"email": this.getView().byId("userid").getValue(),
				"password": this.getView().byId("pwd").getValue(),
			};
			var that = this;
			that.getView().setBusy(true);
			if(!loginPayload.email || !loginPayload.password){
				sap.m.MessageBox.error("User/password cannot be empty");
				return; //--- Added - Swaroop
			}

			$.post('/api/Users/login', loginPayload)
		    .done(function(data, status){
					debugger;
							that.getView().getModel("local").setProperty("/Authorization", data.id);
							that.getView().getModel().setHeaders({
								"Authorization": data.id
							});
							that.secureToken = data.id;
							that.getView().getModel("local").setProperty("/CurrentUser", data.userId);
							that.getView().getModel().setUseBatch(false);
							var that2 = that;

							//Check the role and set it after that navigate to App
							//that.oRouter.navTo("newlead");

							var aFilter = [ new sap.ui.model.Filter("TechnicalId",
							sap.ui.model.FilterOperator.EQ, data.userId) ];
							var oParameters = {
								filters: aFilter
							};
							var found = false;
							var AppUsers = [];
							that.ODataHelper.callOData(that.getOwnerComponent().getModel(),
							 "/AppUsers", "GET", {}, {}, that)
								.then(function(oData) {
									if (oData.results.length != 0) {
										for (var i = 0; i < oData.results.length; i++) {
											AppUsers[oData.results[i].TechnicalId] = oData.results[i];
											if( oData.results[i].TechnicalId === data.userId ){
												found = true;
												that2.getView().getModel("local").setProperty("/Role", oData.results[i].Role);
												that2.getOwnerComponent().getModel("local").setProperty("/Role", oData.results[i].Role);
												that2.getView().getModel("local").setProperty("/UserName", oData.results[i].UserName);
												that2.getView().getModel("local").setProperty("/pwdChange",oData.results[i].pwdChange);
												that2.ODataHelper.callOData(that2.getOwnerComponent().getModel(),
									          "/AppUsers('" + oData.results[i].id + "')",
									          "PUT", {}, {
									            lastLogin: new Date()
									          }, that2);
											}
										}

										if(found === true){
											if(that2.getView().getModel("local").getProperty("/pwdChange")===true){
												that2.getView().setBusy(false);
													var oSubmitDialog = new Dialog({
														type: DialogType.Message,
														title: "Change Password",
														content: [
															new sap.m.Input("newPassword",{
																placeholder: "New password",
																type : "Password",
																liveChange: function (oEvent) {
																	var sText = oEvent.getParameter("value");
																	oSubmitDialog.getBeginButton().setEnabled(sText.length > 5);
																}.bind(this)
															}),
															new sap.m.Input("confirmPassword", {
																placeholder: "Confirm Passoword",
																type : "Password"
															})
														],
														beginButton: new Button({
															type: ButtonType.Emphasized,
															text: "Submit",
															enabled: false,
															press: function (oEvent) {
																var newPassword = oEvent.getSource().oParent.getContent()[0].getValue();
																var confirmPassword = oEvent.getSource().oParent.getContent()[1].getValue();
																if(newPassword === confirmPassword){
																	that2.getView().setBusy(true);
																	$.post('/changePassword', {
																		"emailId" : that.getView().byId("userid").getValue(),
																		"newPassword" : newPassword,
																		"Authorization" : that.getView().getModel("local").getProperty("/Authorization"),
																	})
																    .done(function(data, status){
																			that2.getView().setBusy(false);
																			MessageToast.show("Password Changed Successfully");
																			oSubmitDialog.close();
																		})
																		.fail(function(xhr, status, error) {
																					that2.getView().setBusy(false);
																					MessageToast.show("Password Change Failed");
																    });

																}
																else{
																	MessageToast.show("Password didn't matched");
																}
																// debugger;

															}.bind(this)
														}),
														endButton: new Button({
															text: "Cancel",
															press: function () {
																oSubmitDialog.close();
															}.bind(this)
														})
													});
												 	oSubmitDialog.open();
											 }
											else{
												that2.getView().getModel("local").setProperty("/AppUsers", AppUsers);
												// debugger;
											if(that2.getView().getModel("local").getProperty("/Role") === "Retailer"){
												var Filter1 = new sap.ui.model.Filter("EmailId", "EQ", that2.getView().byId("userid").getValue());
												var that3 = that2;
												that2.ODataHelper.callOData(that.getOwnerComponent().getModel(),
												 "/Customers", "GET", {
						 								filters: [Filter1]
						 							}, {}, that2)
													.then(function(oData) {
														that2.getView().setBusy(false);
														debugger;
														that3.getOwnerComponent().getModel("local").setProperty("/CustomerData",oData.results[0]);

														if(that3.getOwnerComponent().getModel("local").getProperty("/CustomerData/Status")==="U"){
															that2.oRouter.navTo("CustomerLanding");
														}
														else{
															MessageToast.show("You are blocked, Please contact admin");
														}
												});
											}else if(that2.getView().getModel("local").getProperty("/Role") === "Admin"){
												that2.getView().setBusy(false);
												that2.oRouter.navTo("Group");
											}else if(that2.getView().getModel("local").getProperty("/Role") === "Maker"){
												var Filter1 = new sap.ui.model.Filter("EmailId", "EQ", that2.getView().byId("userid").getValue());
												var that3 = that2;
												that2.ODataHelper.callOData(that.getOwnerComponent().getModel(),
												 "/Manufacturers", "GET", {
						 								filters: [Filter1]
						 							}, {}, that2)
													.then(function(oData) {
														that2.getView().setBusy(false);
														that3.getView().getModel("local").setProperty("/ManufacturerData",oData.results[0]);
														if(that3.getView().getModel("local").getProperty("/ManufacturerData/Status")==="U"){
															// that2.oRouter.navTo("AddProduct");
															 that2.oRouter.navTo("Maker");
														}
														else{
															MessageToast.show("User is blocked, Please contact admin");
														}
												});
											}
											else{
												that2.getView().setBusy(false);
												sap.m.MessageBox.error("The user is not authorized, Please Contact Mr. Amit");
											}
										}
										}else{
											that.getView().setBusy(false);
											sap.m.MessageBox.error("The user is not authorized, Please Contact Mr. Amit");
										}
									}
								}).catch(function(oError) {
									that.getView().setBusy(false);
								});

				})
		    .fail(function(xhr, status, error) {
					// debugger;
							that.getView().setBusy(false);
							sap.m.MessageBox.error("Login Failed, Please enter correct credentials");
		    });

		}


		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf victoria.view.App
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf victoria.view.App
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf victoria.view.App
		 */
		//	onExit: function() {
		//
		//	}

	});

});
