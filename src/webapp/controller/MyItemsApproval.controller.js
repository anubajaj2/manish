sap.ui.define([
	"sap/ui/demo/cart/controller/BaseController",
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function(BaseController, UIComponent, JSONModel, History, Filter, FilterOperator) {
	"use strict";

	return BaseController.extend("sap.ui.demo.cart.controller.MyItemsApproval", {
		onInit: function() {
			// this._router = UIComponent.getRouterFor(this);
			var oRouter = this.getRouter();
			var odataModel = new JSONModel({
				"groupCodeState": "None",
				"emailState": "None",
				"PatternState": "None"
			});
			debugger;
			this.setModel(odataModel, "ItemApprovalModel");
			oRouter.getRoute("ItemsApproval").attachMatched(this._onRouteMatched, this);
		},

		_onRouteMatched: function() {
			debugger;
			// var cUser = this.getView().getModel("local").getProperty("/CurrentUser");;
			// var oFilter = new sap.ui.model.Filter("ApproverId", sap.ui.model.FilterOperator.EQ, cUser);
			// this.getView().byId("idOrderItemTable").getBinding("items").filter(oFilter);
			if (this.getOwnerComponent().getModel('local').getProperty('/Authorization') === "") {
				this.logOutApp();
			}
			this.onCountLoad();
			this.RowCount = 10;
			this.onLoadData();
		},
		onCountLoad:function(){
			var CreatedBy = this.getView().getModel("local").getProperty("/CurrentUser");
			var oFilter1 = new sap.ui.model.Filter("ApproverId", sap.ui.model.FilterOperator.EQ, "'" + CreatedBy + "'");
			var oFilter2 = new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.EQ, "N");
			var oFilter3 = new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.EQ, "A");
			var oFilter4 = new sap.ui.model.Filter("Status", sap.ui.model.FilterOperator.EQ, "R");
			var that = this;
			this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
				"/OrderItems/$count", "GET", {
					filters: [oFilter1]
				}, {}, this)

			.then(function(oData) {
				that.TotalDataCount = parseInt(oData);
				that.getView().getModel("ItemApprovalModel").setProperty("/AllDataCount", oData);
				// if (that.TotalDataCount <= 10) {
				// 	that.getView().byId("idPreviousButton").setEnabled(false);
				// 	that.getView().byId("idNextButton").setEnabled(false);
				// } else {
				// 	that.getView().byId("idPreviousButton").setEnabled(false);
				// }

			}).catch(function(oError) {
				debugger;
			});
			this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
				"/OrderItems/$count", "GET", {
					filters: [oFilter1,oFilter2]
				}, {}, this)
			.then(function(oData) {
				that.TotalDataCount = parseInt(oData);
				that.getView().getModel("ItemApprovalModel").setProperty("/NewDataCount", oData);
			}).catch(function(oError) {
				debugger;
			});
			this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
				"/OrderItems/$count", "GET", {
					filters: [oFilter1,oFilter3]
				}, {}, this)
			.then(function(oData) {
				that.TotalDataCount = parseInt(oData);
				that.getView().getModel("ItemApprovalModel").setProperty("/ApproveDataCount", oData);
			}).catch(function(oError) {
				debugger;
			});
			this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
				"/OrderItems/$count", "GET", {
					filters: [oFilter1,oFilter4]
				}, {}, this)
			.then(function(oData) {
				that.TotalDataCount = parseInt(oData);
				that.getView().getModel("ItemApprovalModel").setProperty("/RejectedDataCount", oData);
			}).catch(function(oError) {
				debugger;
			});
		},
		// onSearch: function(oEvent) {
		// 	debugger;
		// 	this.onLoadData(oEvent.getSource().getValue());
		// },
		onCategorySearch:function(oEvent){
			debugger;
			// oEvent.getSource().getId();
			// var value=oEvent.getSource().getValue();
			// var CreatedBy = this.getView().getModel("local").getProperty("/CurrentUser");
			// var that = this;
			this.RowCount=10;
			this.getView().byId("idTagSearch").setValue("");
			this.getView().byId("idOrderSearch").setValue("");
			this.onLoadData();
			// $.get("/OrderItemApproval?Createdby=" + CreatedBy + "&limit=" + this.RowCount + "&Category=" + value)
			// 	.then(function(data) {
			// 		debugger;
			// 		that.getView().getModel("ItemApprovalModel").setProperty("/OrderItems", data);

			// 	})
			// 	.catch(function(err) {
			// 		sap.m.MessageToast.show("error fatching data");
			// 	});
		},
		onTagNoSearch:function(oEvent){
			debugger;
			// oEvent.getSource().getId();
			// var value=oEvent.getSource().getValue();
			// var CreatedBy = this.getView().getModel("local").getProperty("/CurrentUser");
			// var that = this;
			this.RowCount=10;
			this.getView().byId("idOrderSearch").setValue("");
			this.getView().byId("idCategorySearch").setValue("");
			this.onLoadData();
			// $.get("/OrderItemApproval?Createdby=" + CreatedBy + "&limit=" + this.RowCount + "&TagNo=" + value)
			// 	.then(function(data) {
			// 		debugger;
			// 		that.getView().getModel("ItemApprovalModel").setProperty("/OrderItems", data);

			// 	})
			// 	.catch(function(err) {
			// 		sap.m.MessageToast.show("error fatching data");
			// 	});
		},
		onOrderNumberSearch:function (oEvent) {
			// oEvent.getSource().getId();
			// var value=oEvent.getSource().getValue();
			// var CreatedBy = this.getView().getModel("local").getProperty("/CurrentUser");
			// var that = this;
			this.RowCount=10;
			this.getView().byId("idTagSearch").setValue("");
			this.getView().byId("idCategorySearch").setValue("");
			this.onLoadData();
			// $.get("/OrderItemApproval?Createdby=" + CreatedBy + "&limit=" + this.RowCount + "&OrderNo=" + value)
			// 	.then(function(data) {
			// 		debugger;
			// 		that.getView().getModel("ItemApprovalModel").setProperty("/OrderItems", data);

			// 	})
			// 	.catch(function(err) {
			// 		sap.m.MessageToast.show("error fatching data");
			// 	});
		},
		onLoadData: function() {
			var CreatedBy = this.getView().getModel("local").getProperty("/CurrentUser");
			var that = this;
			var TagNo,OrderNo,Category;
			if(this.getView().byId("idOrderSearch").getValue()){
				OrderNo=this.getView().byId("idOrderSearch").getValue();
			}
			else if(this.getView().byId("idTagSearch").getValue()){
				TagNo=this.getView().byId("idTagSearch").getValue();
			}
			else if(this.getView().byId("idCategorySearch").getValue()){
				Category=this.getView().byId("idCategorySearch").getValue();
			}
			$.get("/OrderItemApproval?Createdby=" + CreatedBy + "&limit=" + this.RowCount + "&TagNo=" + TagNo+"&OrderNo="+OrderNo+"&Category="+Category)
				.then(function(data) {
					debugger;
					if(data===[]){
						that.getView().byId("idPreviousButton").setEnabled(true);
					that.getView().byId("idNextButton").setEnabled(false);
					return;
					}
					that.getView().getModel("ItemApprovalModel").setProperty("/OrderItems", data);

				})
				.catch(function(err) {
					sap.m.MessageToast.show("error fatching data");
				});

		},
		onStatusChange: function(oEvent) {
			debugger;
			var selectedKey1 = oEvent.getSource().getSelectedKey();
			this.oPath = oEvent.getSource().getParent().getBindingContextPath();
			var oModel = this.getView().getModel("ItemApprovalModel").getProperty(this.oPath);
			this.payload = {
				'id': oModel.id,
				'Status': oModel.Status
			};
			var in1 = new sap.m.Input({
				width: "80%"
			});
			var Label = new sap.m.Label({
				text: "Rejection Reason"
			});
			if(!this.dialog){
			this.dialog = new sap.m.Dialog({
				title: "Rejection Reason",
				content: [
					in1
				],
		
				beginButton: new sap.m.Button({
					text: "Ok",
					icon: "sap-icon://accept",
					type: "Emphasized",
					press: function(oEvent) {
						debugger;
						if(!oEvent.getSource().getParent().getContent()[0].getValue()){
							sap.m.MessageToast.show("Please enter the reason");
							return;
						}
						this.payload.RejectionReason=oEvent.getSource().getParent().getContent()[0].getValue();
						this.onItemStatusChange(this.payload);
						this.dialog.close();
					}.bind(this)
				}),
				endButton: new sap.m.Button({
					text: "Cancel",
					icon: "sap-icon://sys-cancel",
					type: "Reject",
					press: function() {
						var oModel = this.getView().getModel("ItemApprovalModel").getProperty(this.oPath);
						oModel.Status="N";
						this.getView().getModel("ItemApprovalModel").setProperty(this.oPath,oModel);
						this.dialog.close();
					}.bind(this)
				})
			});
			}
			if (selectedKey1 === "R") {

				this.dialog.open();
			}
			else{
				this.onItemStatusChange(this.payload);
			}

			// var oPath = oEvent.getSource().getParent().getBindingContextPath();
			// var oModel = this.getView().getModel("ItemApprovalModel").getProperty(oPath);
			// var payload = {
			// 	'id': oModel.id,
			// 	'Status': oModel.Status
			// };
			// $.post('/OrderItemApproval', {
			// 		"data": payload
			// 	})
			// 	.done(function(data, status) {
			// 		debugger;
			// 		$.get("/OrderItemApproval?Createdby=" + CreatedBy)
			// 			.then(function(data) {
			// 				debugger;
			// 				that.getView().getModel("ItemApprovalModel").setProperty("/OrderItems", data);

			// 			});

			// 	})
			// 	.fail(function(xhr, status, error) {
			// 		// sap.ui.core.BusyIndicator.hide();
			// 		MessageBox.error(error);
			// 		debugger;
			// 	});
		},
		onItemStatusChange:function(payload){
			$.post('/OrderItemApproval', {
					"data": payload
				})
				.done(function(data, status) {
					debugger;
					$.get("/OrderItemApproval?Createdby=" + CreatedBy)
						.then(function(data) {
							debugger;
							that.getView().getModel("ItemApprovalModel").setProperty("/OrderItems", data);

						});

				})
				.fail(function(xhr, status, error) {
					// sap.ui.core.BusyIndicator.hide();
					sap.m.MessageBox.error(error);
					debugger;
				});
		},
		onFilterSelect: function(oEvent) {
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
		onPrevious: function() {
			this.RowCount = this.RowCount - 10;
			this.onLoadData();
			if (this.RowCount === 0) {
				this.getView().byId("idPreviousButton").setEnabled(false);
			} else {
				this.getView().byId("idPreviousButton").setEnabled(true);
			}
			if (this.TotalDataCount <= this.RowCount) {
				this.getView().byId("idNextButton").setEnabled(false);
			} else {
				this.getView().byId("idNextButton").setEnabled(true);
			}
		},
		onNext: function() {
			this.RowCount = this.RowCount + 10;
			this.onLoadData();
			this.getView().byId("idPreviousButton").setEnabled(true);
			if (this.TotalDataCount <= this.RowCount) {
				this.getView().byId("idNextButton").setEnabled(false);
			} else {
				this.getView().byId("idNextButton").setEnabled(true);
			}
			if (this.RowCount === 0) {
				this.getView().byId("idPreviousButton").setEnabled(false);
			} else {
				this.getView().byId("idPreviousButton").setEnabled(true);
			}
		}
	});
});
