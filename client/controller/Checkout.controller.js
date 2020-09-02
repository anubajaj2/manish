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
  "sap/ui/demo/cart/model/EmailType",
  'sap/ui/core/HTML'
], function(
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
  EmailType,
  HTML) {
  "use strict";

  return BaseController.extend("sap.ui.demo.cart.controller.Checkout", {
    formatter: formatter,
    onInit: function() {
      this.setModel(this.getOwnerComponent().getModel("local"), "local");
      this._oLocalModel = this.getOwnerComponent().getModel("local");
      // Assign the model object to the SAPUI5 core
      this.setModel(sap.ui.getCore().getMessageManager().getMessageModel(), "message");
      // switch to single column view for checout process
      this._oRouter = this.getOwnerComponent().getRouter();
      //this._oRouter.attachRoutePatternMatched(this._routePatternMatched,this);
      this._oRouter.getRoute("checkout").attachMatched(this._routePatternMatched, this);
    },
    _routePatternMatched: function() {
      this._setLayout("One");
      if(this.getView().byId("wizardNavContainer")._pageStack.length>1){
        this.getView().byId("wizardNavContainer")._pageStack.pop();
        this.getView().byId("shoppingCartWizard").setCurrentStep(this.getView().byId("shoppingCartWizard").getSteps()[0]);
      }
      this.calculateOrderEstimate();
    },
    onChangeQty: function() {
      this.calculateOrderEstimate();
    },
    /**
     * Only validation on client side, does not involve a back-end server.
     * @param {sap.ui.base.Event} oEvent Press event of the button to display the MessagePopover
     */
    onShowMessagePopoverPress: function(oEvent) {
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
          afterClose: function() {
            oMessagePopover.destroy();
          }
        });
        this._addDependent(oMessagePopover);
      }

      oMessagePopover.openBy(oButton);
    },

    //To be able to stub the addDependent function in unit test, we added it in a separate function
    _addDependent: function(oMessagePopover) {
      this.getView().addDependent(oMessagePopover);
    },
    /**
     * Called from <code>ordersummary</code>
     * shows warning message and cancels order if confirmed
     */
    handleWizardCancel: function() {
      var sText = this.getResourceBundle().getText("checkoutControllerAreYouSureCancel");
      this._handleSubmitOrCancel(sText, "warning", "home");
    },

    /**
     * Called from <code>ordersummary</code>
     * shows warning message and submits order if confirmed
     */
    handleWizardSubmit: function() {
      var sText = this.getResourceBundle().getText("checkoutControllerAreYouSureSubmit");
      this._handleSubmitOrCancel(sText, "confirm", "ordercompleted");
    },

    /**
     * Called from <code>_handleSubmitOrCancel</code>
     * resets Wizard after submitting or canceling order
     */
    backToWizardContent: function() {
      this.byId("wizardNavContainer").backToPage(this.byId("wizardContentPage").getId());
    },

    /**
     * Removes validation error messages from the previous step
     */
    _clearMessages: function() {
      sap.ui.getCore().getMessageManager().removeAllMessages();
    },

    /**
     * Checks the corresponding step after activation to decide whether the user can proceed or needs
     * to correct the input
     */
    checkContentStep: function() {

    },
    checkPaymentTypeStepStep: function() {
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

    checkInvoiceStep: function() {
      //this._checkStep("invoiceStep", ["invoiceAddressAddress", "invoiceAddressCity", "invoiceAddressZip", "invoiceAddressCountry"]);
    },
    /**
     * Hides button to proceed to next WizardStep if validation conditions are not fulfilled
     * @param {string} sStepName - the ID of the step to be checked
     * @param {array} aInputIds - Input IDs to be checked
     * @private
     */
    _checkStep: function(sStepName, aInputIds) {
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
    getOrderSummary: function(cartItems, that) {
      var html = "";
      var totalAmount = 0;
      var totalWeight = 0;
      cartItems.forEach((oItem) => {
        html += "<li><p style=\"font-weight:500;font-size:larger;\"> Name : " + oItem.Category + " - " + oItem.SubCategory + " - " + oItem.Name +
          "<br> Gross Weight : " + oItem.GrossWeight + " g" +
          ", &nbsp;&nbsp;&nbsp;&nbsp;Net Weight : " + oItem.NetWeight + " g" +
          "<br>Amount : " + oItem.Amount + " INR</p></li>";
        totalAmount += oItem.Amount;
        totalWeight += oItem.GrossWeight;
      });
      html = "<h1 style=\"color:green; font-weight:800; font-size:xx-large;\">Order Summary</h1><hr>" + "<ol>" + html + "</ol>" +
        "<p style=\"color:green; font-weight:600; font-size:x-large;\">Total Amount : " + totalAmount + " INR&nbsp;&nbsp;&nbsp;&nbsp; " +
        " &nbsp;&nbsp;&nbsp;&nbsp;Total Weight : " + totalWeight + " g</p>";
      var orderNo = that.getOwnerComponent().getModel("local").getProperty("/orderNo");
      html += "<p style=\"color:blue; font-weight:600; font-size:x-large;\">Your Order Number is " + orderNo + " , Please check your email for more details</p>";
      that.getOwnerComponent().getModel("local").setProperty("/OrderSummaryHTML", html);
    },
    saveOrderItem: function(id, cartItems, orderItemPayload, that, index = 0) {
      // MessageToast.show("Successfully"+id);
      if (index < cartItems.length) {
        orderItemPayload.OrderNo = id;
        orderItemPayload.Material = cartItems[index].ProductId;
        orderItemPayload.WeightId = cartItems[index].WeightId;
        that.ODataHelper.callOData(that.getOwnerComponent().getModel(),
            "/OrderItems", "POST", {}, orderItemPayload, that)
          .then(function(data) {
            that.saveOrderItem(id, cartItems, orderItemPayload, that, ++index);
            MessageToast.show("Order items saved successfully");
          }).catch(function(oError) {
            MessageBox.error("Error while saving order Item data");
          });
      } else {
        that.getView().setBusy(false);
        that.getOrderSummary(cartItems, that);
        that.byId("wizardNavContainer").to(this.byId("summaryPage"));
      }
    },

    /**
     * Called from  Wizard on <code>complete</code>
     * Navigates to the summary page in case there are no errors
     */
    checkCompleted: function() {
      if (sap.ui.getCore().getMessageManager().getMessageModel().getData().length > 0) {
        MessageBox.error(this.getResourceBundle().getText("popOverMessageText"));
      } else {
        var orderHeaderPayload = this.getOwnerComponent().getModel("local").getProperty("/OrderHeader");
        var cartItems = this.getOwnerComponent().getModel("local").getProperty("/cartItems");
        var orderItemPayload = this.getOwnerComponent().getModel("local").getProperty("/OrderItem");
        // var allWeightsSel = this.getOwnerComponent().getModel("local").getProperty("/addedWeights");
        orderHeaderPayload.OrderNo = this.getOwnerComponent().getModel("local").getProperty("/orderNo");
        orderHeaderPayload.Date = Date();
        orderHeaderPayload.ApprovedOn = Date();
        orderHeaderPayload.Customer = this.getOwnerComponent().getModel("local").getProperty("/CustomerData/id");
        this.getOwnerComponent().getModel("local").setProperty("/OrderHeader", orderHeaderPayload);
        var that = this;
        if (cartItems.length) {
          this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
              "/OrderHeaders", "POST", {}, orderHeaderPayload, this)
            .then(function(data) {
              that.saveOrderItem(data.id, cartItems, orderItemPayload, that);
              // MessageToast.show("Product Created Successfully");
            }).catch(function(oError) {
              MessageBox.error("Error while saving product data");
            });
          that.getView().setBusy(true);
        } else {
          MessageBox.error("Cart is Empty");
        }
      }
    },

    restartOrder: function() {
      this.cleanApp();
      this._oRouter.navTo("categories");
    },
    closeApp: function() {
      window.close();
    },
    /**
     * navigates to "home" for further shopping
     */
    onReturnToShopButtonPress: function() {
      this.firstTwoDisplay();
      this.getRouter().navTo("categories");
    },



    /**
     * gets customData from ButtonEvent
     * and navigates to WizardStep
     * @private
     * @param {sap.ui.base.Event} oEvent the press event of the button
     */
    _navBackToStep: function(oEvent) {
      var sStep = oEvent.getSource().data("navBackTo");
      var oStep = this.byId(sStep);
      this._navToWizardStep(oStep);
    },

    /**
     * navigates to WizardStep
     * @private
     * @param {Object} oStep WizardStep DOM element
     */
    _navToWizardStep: function(oStep) {
      var oNavContainer = this.byId("wizardNavContainer");
      var _fnAfterNavigate = function() {
        this.byId("shoppingCartWizard").goToStep(oStep);
        // detaches itself after navigaton
        oNavContainer.detachAfterNavigate(_fnAfterNavigate);
      }.bind(this);

      oNavContainer.attachAfterNavigate(_fnAfterNavigate);
      oNavContainer.to(this.byId("wizardContentPage"));
    }
  });
});
