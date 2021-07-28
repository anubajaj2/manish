sap.ui.define([
	"sap/ui/demo/cart/controller/BaseController",
	"sap/ui/core/UIComponent",
	"sap/m/MessageToast",
	"sap/ui/demo/cart/model/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function(BaseController, UIComponent, MessageToast, formatter, JSONModel, Filter,FilterOperator) {
	"use strict";

	return BaseController.extend("sap.ui.demo.cart.controller.ProductApprove", {

		//onInit: function () {
			//this._router = UIComponent.getRouterFor(this);
		//},
		onInit: function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("ProductApprove").attachMatched(this._onRouteMatched, this);

		},
		_onRouteMatched: function(oEvent) {
				// this.loadProductApprovals();
				// var that = this;
				// this._oLocalModel = this.getOwnerComponent().getModel("local");
				// this.firstTwoDisplay();

				// var newDate = new Date();
				// newDate.setHours(0, 0, 0, 0);
				var oSorter = new sap.ui.model.Sorter("CreatedOn", true);
				var oList = this.getView().byId("idListPA");
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
					filters: [new sap.ui.model.Filter("OverallStatus","EQ", "N")],
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

		 onParentClicked:function(oEvent){
			 debugger;
			 var bSelected = oEvent.getParameter("selected");
			 if(this.getView().byId("idListPA").getItems().length === 0){
				 this.getView().byId("idSelected").setSelected(false);
				 MessageToast.show("No Data Found");
				}
			else {
				this.getView().byId("idSelected").setSelected(true);
			}
			 if(bSelected){
				 this.getView().byId("idListPA").selectAll();
			 }
			 else {
			 	this.getView().byId("idListPA").removeSelections(true);
				this.getView().byId("idSelected").setSelected(false);
			 }


			 	// var sPaths = this.getView().byId("idListPA").getSelectedContextPaths();
		 },

		 onApprove : function(){
			 //get list object
			 //get all selected items of list object
			 //for loop item.getBindingConextPath -- /Products('id')
			  var sPaths = this.getView().byId("idListPA").getSelectedContextPaths();
		 	  sPaths.forEach((item,index)=>{
				this.getOwnerComponent().getModel().update(item, {OverallStatus : "A"}, {
					success: function(){
						MessageToast.show("Items Approved Successfully");
						sap.ui.getCore().byId("__component0---ProductApprove--idSelected").setSelected(false)
						// this.getView().byId("idSelected").setSelected(false);
					},
					error: function(oErr){
						MessageToast.show("Problem in Aprooving");
					}});
			});
		 },

		 onReject : function(){
			 var sPaths = this.getView().byId("idListPA").getSelectedContextPaths()
			 sPaths.forEach((item,index)=>{
				 this.getOwnerComponent().getModel().update(item, {OverallStatus : "R"}, {
					 success: function(){
						 MessageToast.show("Items Rejected Successfully");
					 },
					 error: function(oErr){
						 MessageToast.show("Problem in Rejection");
					 }});
			 });
		 },

		 handleChange1:function(oEvent){
			 debugger;
			 var oList = this.getView().byId("idListPA");
					var oBinding = oList.getBinding("items");
					 // var selectedText = oEvent.getSource().getSelectedItem().getText();
					 var key1 = oEvent.getSource().getSelectedKey();
					 // var type1 = oEvent.getSource().getSelectedItem().getAdditionalText();
					 // var categeory1 = oEvent.getSource().getSelectedItem().getText().split(" ")[1];
					 var aFilter = [];
					 var oFilter1 = new Filter("Category", sap.ui.model.FilterOperator.Contains, key1);
					 // var oFilter = new sap.ui.model.Filter({
						// 	 filters: [
						// 		 new Filter("ItemCode", sap.ui.model.FilterOperator.Contains, key1),
						//  		 new Filter("Category", sap.ui.model.FilterOperator.Contains, categeory1)
					 //
						// 	 ],
						// 	 and: false
						//  });

					 aFilter.push(oFilter1);
					 // filter binding

					 oBinding.filter(aFilter);
		 }

			// loadProductApprovals: function(){
			// 	debugger;
			// 		var that = this;
			// 		var oFilter = new sap.ui.model.Filter("Status","EQ", "P");
			// 		this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
			//           "/Products", "GET", {filters: [oFilter]}, {}, this)
			// 	        .then(function(oData) {
			// 		that.getOwnerComponent().getModel("local").setProperty("/list",{
			// 		Products:oData.results
			// 		});
		  //     })
		  //     .catch(function(oError) {
		  //         MessageToast.show("cannot fetch the data");
		  //      });
			// 	}

	});
});
