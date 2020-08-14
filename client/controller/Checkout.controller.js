sap.ui.define([
	"sap/ui/demo/cart/controller/BaseController",
	"sap/ui/demo/cart/model/cart",
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device",
	"sap/ui/demo/cart/model/formatter",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/m/Link",
	"sap/m/MessagePopover",
	"sap/m/MessagePopoverItem",
	"sap/ui/demo/cart/model/EmailType"
], function (
	BaseController,
	cart,
	JSONModel,
	Device,
	formatter,
	MessageBox,
	MessageToast,
	Link,
	MessagePopover,
	MessagePopoverItem,
	EmailType) {
	"use strict";

	return BaseController.extend("sap.ui.demo.cart.controller.Checkout", {
		formatter: formatter,
		onInit: function () {
			this.setModel( this.getOwnerComponent().getModel("local"), "local");
			this._oLocalModel =  this.getOwnerComponent().getModel("local");
			// Assign the model object to the SAPUI5 core
			this.setModel(sap.ui.getCore().getMessageManager().getMessageModel(), "message");
			// switch to single column view for checout process
			this._oRouter = this.getOwnerComponent().getRouter();
			this._oRouter.attachRoutePatternMatched(this._routePatternMatched,this);
		},
		_routePatternMatched: function(){
			this._setLayout("One");
			this.calculateOrderEstimate();
		},
		onChangeQty: function(){
			this.calculateOrderEstimate();
		},
		/**
		 * Only validation on client side, does not involve a back-end server.
		 * @param {sap.ui.base.Event} oEvent Press event of the button to display the MessagePopover
		 */
		onShowMessagePopoverPress: function (oEvent) {
			var oButton = oEvent.getSource();

			var oLink = new Link({
				text: "Show more information",
				href: "http://sap.com",
				target: "_blank"
			});

			/**
			 * Gather information that will be visible on the MessagePopover
			 */
			var oMessageTemplate = new MessagePopoverItem({
				type: '{message>type}',
				title: '{message>message}',
				subtitle: '{message>additionalText}',
				link: oLink
			});

			if (!this.byId("errorMessagePopover")) {
				var oMessagePopover = new MessagePopover(this.createId("messagePopover"), {
					items: {
						path: 'message>/',
						template: oMessageTemplate
					},
					afterClose: function () {
						oMessagePopover.destroy();
					}
				});
				this._addDependent(oMessagePopover);
			}

			oMessagePopover.openBy(oButton);
		},

		//To be able to stub the addDependent function in unit test, we added it in a separate function
		_addDependent: function (oMessagePopover) {
			this.getView().addDependent(oMessagePopover);
		},
		/**
		 * Called from <code>ordersummary</code>
		 * shows warning message and cancels order if confirmed
		 */
		handleWizardCancel: function () {
			var sText = this.getResourceBundle().getText("checkoutControllerAreYouSureCancel");
			this._handleSubmitOrCancel(sText, "warning", "home");
		},

		/**
		 * Called from <code>ordersummary</code>
		 * shows warning message and submits order if confirmed
		 */
		handleWizardSubmit: function () {
			var sText = this.getResourceBundle().getText("checkoutControllerAreYouSureSubmit");
			this._handleSubmitOrCancel(sText, "confirm", "ordercompleted");
		},

		/**
		 * Called from <code>_handleSubmitOrCancel</code>
		 * resets Wizard after submitting or canceling order
		 */
		backToWizardContent: function () {
			this.byId("wizardNavContainer").backToPage(this.byId("wizardContentPage").getId());
		},

		/**
		 * Removes validation error messages from the previous step
		 */
		_clearMessages: function () {
			sap.ui.getCore().getMessageManager().removeAllMessages();
		},

		/**
		 * Checks the corresponding step after activation to decide whether the user can proceed or needs
		 * to correct the input
		 */
		checkContentStep: function(){

		},
		checkPaymentTypeStepStep: function(){
			return true;
		},
		onCheckStepActivation: function(oEvent) {
			this._clearMessages();
			var sWizardStepId = oEvent.getSource().getId();
			switch (sWizardStepId) {
			case this.createId("contentsStep"):
				this.checkContentStep();
				break;
			case this.createId("paymentTypeStep"):
				this.checkPaymentTypeStepStep();
				break;
			}
		},

		checkInvoiceStep: function () {
			//this._checkStep("invoiceStep", ["invoiceAddressAddress", "invoiceAddressCity", "invoiceAddressZip", "invoiceAddressCountry"]);
		},
		/**
		 * Hides button to proceed to next WizardStep if validation conditions are not fulfilled
		 * @param {string} sStepName - the ID of the step to be checked
		 * @param {array} aInputIds - Input IDs to be checked
		 * @private
		 */
		_checkStep: function (sStepName, aInputIds) {
			var oWizard = this.byId("shoppingCartWizard"),
				oStep = this.byId(sStepName),
				bEmptyInputs = this._checkInputFields(aInputIds),
				bValidationError = !!sap.ui.getCore().getMessageManager().getMessageModel().getData().length;

			if (!bValidationError && !bEmptyInputs) {
				oWizard.validateStep(oStep);
			} else {
				oWizard.invalidateStep(oStep);
			}
		},

		/**
		 * Called from  Wizard on <code>complete</code>
		 * Navigates to the summary page in case there are no errors
		 */
		checkCompleted: function () {
			if (sap.ui.getCore().getMessageManager().getMessageModel().getData().length > 0) {
				MessageBox.error(this.getResourceBundle().getText("popOverMessageText"));
			} else {
				var orderHeaderPayload = this.getOwnerComponent().getModel("local").getProperty("/OrderHeader");
				var orderItemPayload = this.getOwnerComponent().getModel("local").getProperty("/OrderItem");
				var cartItems = this.getOwnerComponent().getModel("local").getProperty("/cartItems");
				var allWeightsSel = this.getOwnerComponent().getModel("local").getProperty("/addedWeights");
				orderHeaderPayload.OrderNo = 2;
				orderHeaderPayload.Date = Date();
				orderHeaderPayload.ApprovedOn = Date();
				orderHeaderPayload.Customer = this.getOwnerComponent().getModel("local").getProperty("/CustomerData/id");
				var that = this;
				that.ODataHelper.callOData(that.getOwnerComponent().getModel(),
							"/OrderHeaders", "POST", {}, orderHeaderPayload, that)
							.then(function(data) {
								// cartItems.forEach((item,index)=>{
								// 	orderItemPayload.OrderNo = data.id;
								// 	oderItemPayload.Material = item.ProductId;
								// 	orderItemPayload.WeightId = item.WeightId;
								// 	debugger;
								// 	this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
								// 				"/OrderItems", "POST", {}, orderItemPayload, this)
								// 				.then(function(data) {
								// 					// MessageToast.show("Product Created Successfully");
								// 				}).catch(function(oError) {
								// 					// MessageBox.error("Error while saving product data");
								// 				});
								// });
								MessageToast.show("Product Created Successfully");
							}).catch(function(oError) {
								MessageBox.error("Error while saving product data");
							});

				this.byId("wizardNavContainer").to(this.byId("summaryPage"));
			}
		},
		restartOrder: function(){
			this.cleanApp();
			this._oRouter.navTo("categories");
		},
		closeApp: function(){
			window.close();
		},
		/**
		 * navigates to "home" for further shopping
		 */
		onReturnToShopButtonPress: function () {
			this.firstTwoDisplay();
			this.getRouter().navTo("categories");
		},



		/**
		 * gets customData from ButtonEvent
		 * and navigates to WizardStep
		 * @private
		 * @param {sap.ui.base.Event} oEvent the press event of the button
		 */
		_navBackToStep: function (oEvent) {
			var sStep = oEvent.getSource().data("navBackTo");
			var oStep = this.byId(sStep);
			this._navToWizardStep(oStep);
		},

		/**
		 * navigates to WizardStep
		 * @private
		 * @param {Object} oStep WizardStep DOM element
		 */
		_navToWizardStep: function (oStep) {
			var oNavContainer = this.byId("wizardNavContainer");
			var _fnAfterNavigate = function () {
				this.byId("shoppingCartWizard").goToStep(oStep);
				// detaches itself after navigaton
				oNavContainer.detachAfterNavigate(_fnAfterNavigate);
			}.bind(this);

			oNavContainer.attachAfterNavigate(_fnAfterNavigate);
			oNavContainer.to(this.byId("wizardContentPage"));
		}
	});
});
