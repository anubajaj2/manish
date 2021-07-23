sap.ui.define([
	"sap/ui/demo/cart/controller/BaseController",
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (BaseController, UIComponent, JSONModel,History,Filter,FilterOperator) {
	"use strict";

	return BaseController.extend("sap.ui.demo.cart.controller.MyItemsApproval", {
		onInit: function () {
			// this._router = UIComponent.getRouterFor(this);
			var oRouter = this.getRouter();
			var odataModel = new JSONModel({
				"groupCodeState": "None",
				"emailState": "None",
				"PatternState": "None"
			});
			debugger;
			this.setModel(odataModel, "ItemApprovalModel")
			oRouter.getRoute("ItemsApproval").attachMatched(this._onRouteMatched, this);
		},
		
		_onRouteMatched: function () {
			debugger;
			// var cUser = this.getView().getModel("local").getProperty("/CurrentUser");;
			// var oFilter = new sap.ui.model.Filter("ApproverId", sap.ui.model.FilterOperator.EQ, cUser);
			// this.getView().byId("idOrderItemTable").getBinding("items").filter(oFilter);
			if (this.getOwnerComponent().getModel('local').getProperty('/Authorization') === "") {
				this.logOutApp();
			}
			var CreatedBy = this.getView().getModel("local").getProperty("/CurrentUser");
			var oFilter1 = new sap.ui.model.Filter("ApproverId", sap.ui.model.FilterOperator.EQ, "'" + CreatedBy + "'");
			var that=this;
			this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
			"/OrderItems/$count", "GET", { filters: [oFilter1]}, {}, this)
			
			.then(function (oData) {
				that.TotalDataCount=parseInt(oData);
				if(that.TotalDataCount<=10){
					that.getView().byId("idPreviousButton").setEnabled(false);
					that.getView().byId("idNextButton").setEnabled(false);	
				}
				else{
					that.getView().byId("idPreviousButton").setEnabled(false);
				}
			  
			}).catch(function (oError) {
			  debugger;
			});
			this.RowCount=10;
			this.onLoadData();
		},
		onSearch:function(oEvent){
			debugger;
			this.onLoadData(oEvent.getSource().getValue());
		},
		onLoadData:function(search){
			var CreatedBy = this.getView().getModel("local").getProperty("/CurrentUser");
			var that = this;
			$.get("/OrderItemApproval?Createdby=" + CreatedBy+"&limit="+this.RowCount+"&search="+search)
				.then(function (data) {
					debugger;
					that.getView().getModel("ItemApprovalModel").setProperty("/OrderItems", data);

				})
				.catch(function(err){
					sap.m.MessageToast.show("error fatching data");
				});

		},
		onStatusChange: function (oEvent) {
			debugger;
			var oPath = oEvent.getSource().getParent().getBindingContextPath();
			var oModel = this.getView().getModel("ItemApprovalModel").getProperty(oPath);
			var payload = {
				'id': oModel.id,
				'Status': oModel.Status
			}
			$.post('/OrderItemApproval', {
				"data": payload,
			})
				.done(function (data, status) {
					debugger;
					$.get("/OrderItemApproval?Createdby=" + CreatedBy)
				.then(function (data) {
					debugger;
					that.getView().getModel("ItemApprovalModel").setProperty("/OrderItems", data);

				});

				})
				.fail(function (xhr, status, error) {
					// sap.ui.core.BusyIndicator.hide();
					MessageBox.error(error);
					debugger;
				});
		},
		onFilterSelect: function (oEvent) {
			debugger;
			var oBinding = this.getView().byId("idOrderItemTable").getBinding("items");
				var sKey = oEvent.getParameter("key");
				var aFilters = [];
				var oFilter1;
				var oFilter2;

			if (sKey === "All") {
				// oFilter1 = new Filter("OrderStatus", sap.ui.model.FilterOperator.EQ, "");
				oFilter1 = [];


			} else if (sKey === "New") {
				oFilter1 = new Filter("Status", sap.ui.model.FilterOperator.EQ, 'N');


			} else if (sKey === "Approved") {
				oFilter1 = new Filter("Status", sap.ui.model.FilterOperator.EQ, "A");
			} else if (sKey === "Rejected") {
				oFilter1 = new Filter("Status", sap.ui.model.FilterOperator.EQ, "R");
			}

			aFilters.push(oFilter1);
			oBinding.filter(aFilters);

		},
		onNavBack: function() {
			debugger;
			var oHistory = History.getInstance();
			var oPrevHash = oHistory.getPreviousHash();
			if (oPrevHash !== undefined) {
				window.history.go(-1);
			} else {
				this.getRouter().navTo("Profile");
			}
		},
		onPrevious:function(){
			this.RowCount=this.RowCount-10;
			this.onLoadData();
			if(this.RowCount===0){
				this.getView().byId("idPreviousButton").setEnabled(false);
			}
			else{
				this.getView().byId("idPreviousButton").setEnabled(true);		
			}
			if(this.TotalDataCount<=this.RowCount){
				this.getView().byId("idNextButton").setEnabled(false);
			}
			else{
				this.getView().byId("idNextButton").setEnabled(true);
			}
		},
		onNext:function(){
			this.RowCount=this.RowCount+10;
			this.onLoadData();
			this.getView().byId("idPreviousButton").setEnabled(true);
			if(this.TotalDataCount<=this.RowCount){
				this.getView().byId("idNextButton").setEnabled(false);
			}
			else{
				this.getView().byId("idNextButton").setEnabled(true);
			}
			if(this.RowCount===0){
				this.getView().byId("idPreviousButton").setEnabled(false);
			}
			else{
				this.getView().byId("idPreviousButton").setEnabled(true);		
			}
		}
	});
});
