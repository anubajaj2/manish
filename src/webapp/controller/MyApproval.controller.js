sap.ui.define([
	"sap/ui/demo/cart/controller/BaseController",
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"sap/ui/demo/cart/model/formatter",
	"sap/m/MessageToast",
	"sap/ui/model/Filter"
], function(BaseController, UIComponent, JSONModel,
						History,
						formatter,
						MessageToast,
						Filter) {
	"use strict";

	return BaseController.extend("sap.ui.demo.cart.controller.MyApproval", {
		formatter: formatter,
		onInit : function () {
			var oRouter = this.getRouter();
			oRouter.getRoute("MyApproval").attachMatched(this._onRouteMatched, this);
		},
		 _onRouteMatched : function(){
			var that = this;
			this._oLocalModel = this.getOwnerComponent().getModel("local");
			this.firstTwoDisplay();


			var newDate = new Date();
			newDate.setHours(0, 0, 0, 0);
			var oSorter = new sap.ui.model.Sorter("CreatedOn", true);
			var oList = this.getView().byId("myProducts");
			oList.bindAggregation("items", {
				path: '/Products',
				parameters: {
		       expand: "ToPhotos",
					 top: 1
		    },
				template: new sap.m.ObjectListItem({
					title: "{ProductId}- {Name}",
					intro: "{Category} / {SubCategory}",
					number: "{GrossWeight} gm",
					numberUnit: "{Tunch} T {Wastage} T",
					firstStatus: new sap.m.ObjectStatus({
						text: {	path: 'OverallStatus', formatter: formatter.prodText },
						state: {	path: 'OverallStatus', formatter: formatter.prodState }
					})
				}),
				filters: [new Filter("CreatedBy", "EQ",
				"\'" + that.getView().getModel("local").getProperty("/CurrentUser") + "\'")],
				sorter: oSorter
			});
			oList.attachUpdateFinished(this.counter, this);


		 },
		 counter: function(oEvent){
			 // debugger;
			 var items = oEvent.getSource().getItems();
			 var oLocal = this.getView().getModel("local");
			 var oDataModel = this.getView().getModel();
			 for (var i = 0; i < items.length; i++) {
			 	var sPath = items[i].getBindingContextPath();
				var sImage = sPath + "/ToPhotos/0/Content" ;
				var sUrl = formatter.getImageUrlFromContent(oDataModel.getProperty(sImage));
				items[i].setIcon(sUrl);
			 }
		 },
		 _odataExampleCall: function() {
			 this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
 			 "/YOURENTITYNAME", "GET", {}, {}, this)
 				.then(function(data) {
 					that._oLocalModel.setProperty("/globalProperty",data.results);
 				}).catch(function(oError) {
 						MessageToast.show("cannot fetch the data");
 				});
		 },
		_onObjectMatched : function (oEvent) {

		},
		getRouter: function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},
		_bindView : function (sObjectPath) {

		},
		_onBindingChange : function () {

		}
	});
});
