sap.ui.define([
	"sap/ui/demo/cart/controller/BaseController",
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel"
], function (BaseController, UIComponent, JSONModel) {
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
			var CreatedBy = this.getView().getModel("local").getProperty("/CurrentUser");
			var that = this;
			$.get("/OrderItemApproval?Createdby=" + CreatedBy)
				.then(function (data) {
					debugger;
					that.getView().getModel("ItemApprovalModel").setProperty("/OrderItems", data);

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
					
				})
				.fail(function (xhr, status, error) {
					// sap.ui.core.BusyIndicator.hide();
					MessageBox.error(error);
					debugger;
				});
		},
		onFilterSelect: function () {
			debugger;
			sap.m.MessageToast("Under Process");
		}
	});
});
