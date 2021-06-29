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
      if (this.getView().byId("wizardNavContainer")._pageStack.length > 1) {
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
    onCartItemDelete: function(oEvent) {
      var that = this;
      var oObj = oEvent.getParameter("listItem").getModel("local").getProperty(oEvent.getParameter("listItem").getBindingContextPath());
      MessageBox.confirm("Item will be deleted!", {
        title: "Confirm",
        onClose: (oAction) => {
          if (oAction === "OK") {
            that.removeProductFromCart(oObj);
          }
        },
        styleClass: "sapUiSizeCompact",
      });
    },
    removeProductFromCart: function(productRec) {
      var cartItems = this.getOwnerComponent().getModel("local").getProperty("/cartItems");
      var allWeightsSel = this.getOwnerComponent().getModel("local").getProperty("/addedWeights");
      for (var j = 0; j < allWeightsSel.length; j++) {
        if (allWeightsSel[j].id === productRec.WeightId) {
          allWeightsSel.splice(j, 1);
          break;
        }
      }
      for (var i = 0; i < cartItems.length; i++) {
        if (cartItems[i].WeightId === productRec.WeightId) {
          var item = this.getOwnerComponent().getModel("local").getProperty("/oCartBtns")[cartItems[i].ProductId];
          item.setType("Default");
          item.setEnabled(true);
          cartItems.splice(i, 1);
          break;
        }
      }
      this.getOwnerComponent().getModel("local").setProperty("/cartItems", cartItems);
      this.getOwnerComponent().getModel("local").setProperty("/addedWeights", allWeightsSel);
      this.calculateOrderEstimate();
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
        html += "<li><p style=\"font-weight:500;font-size:larger;\"> Item : " + oItem.Category + " / " + oItem.SubCategory + " / " + oItem.Name +
          "<br> Gross Weight : " + oItem.GrossWeight + " g" +
          ", &nbsp;&nbsp;&nbsp;&nbsp;Net Weight : " + oItem.NetWeight + " g" +
          "<br>Amount : " + oItem.Amount + " INR</p></li>";
        totalAmount += oItem.Amount;
        totalWeight += oItem.GrossWeight;
      });
      var customer = this.getOwnerComponent().getModel("local").getProperty("/CustomerData");
      html = "<h1 style=\"color:green; font-weight:800; font-size:xx-large;\">Order Summary</h1><hr>" +
        "<p style=\"color:green; font-weight:600; font-size:x-large;\">Name : " + customer.Name + " &nbsp;&nbsp;&nbsp;&nbsp; " +
        " &nbsp;&nbsp;&nbsp;&nbsp;Date : " + Date().slice(0, 24) + " IST<br>Code &nbsp;: " + customer.CustomerCode + "</p>" + "<ol>" + html + "</ol>" +
        "<p style=\"color:green; font-weight:600; font-size:x-large;\">Total Amount : " + totalAmount + " INR&nbsp;&nbsp;&nbsp;&nbsp; " +
        " &nbsp;&nbsp;&nbsp;&nbsp;Total Weight : " + totalWeight.toFixed(2) + " g</p>";
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
        // detaches itself after navigatond
        oNavContainer.detachAfterNavigate(_fnAfterNavigate);
      }.bind(this);

      oNavContainer.attachAfterNavigate(_fnAfterNavigate);
      oNavContainer.to(this.byId("wizardContentPage"));
    },
    onDownloadInvoice: function(){

  			// var country = this.getCountryNameFromCode(oDetail.Country);
  			var country = oDetail.Country;
  			var billingDate = new Date(oDetail.Date).toDateString().slice(4).split(" ");
  			billingDate = billingDate[0] + " " + billingDate[1] + ", " + billingDate[2];
  			var dueDate = null;
  			if (oDetail.DueDate) {
  				dueDate = new Date(oDetail.DueDate).toDateString().slice(4).split(" ");
  				dueDate = dueDate[0] + " " + dueDate[1] + ", " + dueDate[2];
  			}
  			var products = [{
  				"Course": oDetail.CourseName,
  				"HSN": "999293",
  				"Qty": 1,
  				"Rate": oDetail.GSTType !== "NONE" ? (parseFloat(oDetail.Amount) * 100 / 118).toFixed(2) : oDetail.Amount,
  				"IGST": (oDetail.GSTType !== "NONE" ? 18 : 0),
  				"Amount": oDetail.GSTType !== "NONE" ? (parseFloat(oDetail.Amount) * 100 / 118).toFixed(2) : oDetail.Amount
  			}];
  			const invoiceDetail = {
  				shipping: {
  					name: oDetail.CompanyName ? oDetail.CompanyName : oDetail.ParticipentName,
  					email: oDetail.Email,
  					mob: (oDetail.ContactNo ? "+" + oDetail.ContactNo : ""),
  					GSTIN: (oDetail.GSTIN !== null ? oDetail.GSTIN : ""),
  					address: (oDetail.Address != null ? oDetail.Address + ", " : "") + (oDetail.City != "null" ? oDetail.City + ", " : "") + (oDetail.State ? oDetail.State + ", " : "") + country
  				},
  				items: products,
  				IGST: oDetail.GSTType !== "NONE" ? 18 : 0,
  				fullAmount: parseFloat(oDetail.Amount).toFixed(2),
  				order_number: invoiceNo,
  				paymentMode: oDetail.PaymentMode,
  				IsWallet: oDetail.IsWallet,
  				header: {
  					company_name: (oDetail.AccountNo).indexOf("114705500444") !== -1 ? "Soyuz Technologies LLP" : "Anubhav Trainings",
  					company_logo: (oDetail.AccountNo).indexOf("114705500444") !== -1 ? "data:image/png;base64," + this.logo : "data:image/png;base64," + this.AnubhavTrainingslogo,
  					signature: (oDetail.AccountNo).indexOf("114705500444") !== -1 ? "data:image/png;base64," + this.soyuz_signature : "data:image/png;base64," + this.anubhav_signature,
  					// hear \\ is used to change line
  					company_address: (oDetail.AccountNo).indexOf("114705500444") !== -1 ? "EPS-FF-073A, Emerald Plaza,\\Golf Course Extension Road,\\Sector 65, Gurgaon,\\Haryana-122102" : "B-25 Shayona shopping center,\\Near Shayona Party Plot,\\Chanikyapuri, Ahemdabad\\Pin - 380061",
  					GSTIN: (oDetail.GSTType !== "NONE" ? "06AEFFS9740G1ZS" : "")
  				},
  				footer: {
  					text: "This is a computer generated invoice"
  				},
  				currency_symbol: oDetail.Currency,
  				date: {
  					billing_date: billingDate,
  					due_date: dueDate ? dueDate : ""
  				}
  			};

  			let header = (doc, invoice) => {

  				if (this.logo) {
  					doc.image(invoice.header.company_logo, 50, 45, {
  							width: 50
  						})
  						.fontSize(20)
  						.text(invoice.header.company_name, 110, 57)
  						.fontSize(10);
  					if (oDetail.GSTType !== "NONE" && (oDetail.AccountNo === "114705500444")) {
  						doc.text("GSTIN: " + invoice.header.GSTIN, 112, 87);
  					}
  					doc.moveDown();
  				} else {
  					doc.fontSize(20)
  						.text(invoice.header.company_name, 50, 45)
  						.fontSize(10)
  						.text("GSTIN: " + invoice.header.GSTIN, 50, 75)
  						.moveDown()
  				}

  				if (invoice.header.company_address.length !== 0) {
  					companyAddress(doc, invoice.header.company_address);
  				}

  			}

  			let customerInformation = (doc, invoice) => {
  				doc
  					.fillColor("#444444")
  					.fontSize(20);
  				if (oDetail.Notes) {
  					doc.text("Performa Invoice", 50, 160);
  				} else {
  					doc.text("Invoice", 50, 160);
  				}

  				generateHr(doc, 185);

  				const customerInformationTop = 200;

  				doc.fontSize(10)
  					.text("Name:", 50, customerInformationTop)
  					.font("Helvetica-Bold")
  					.text(invoice.shipping.name, 150, customerInformationTop)
  					.font("Helvetica")
  					.text("E-mail:", 50, customerInformationTop + 15)
  					.text(invoice.shipping.email, 150, customerInformationTop + 15);
  				// if (oDetail.GSTType !== "NONE") {
  				doc.text("GSTIN:", 50, customerInformationTop + 45 - 15)
  					.text(invoice.shipping.GSTIN, 150, customerInformationTop + 45 - 15);
  				// }
  				doc.fontSize(10)
  					.text("Address:", 50, customerInformationTop + 60 - 15)
  					.text(invoice.shipping.address, 150, customerInformationTop + 60 - 15)

  					.text("Invoice Number:", 350, customerInformationTop)
  					.font("Helvetica-Bold")
  					.text(invoice.order_number, 450, customerInformationTop)
  					.font("Helvetica")
  					.text("Invoice Date:", 350, customerInformationTop + 15)
  					.text(invoice.date.billing_date, 450, customerInformationTop + 15)
  					.text("Due Date:", 350, customerInformationTop + 30)
  					.text(invoice.date.due_date, 450, customerInformationTop + 30)
  					.moveDown();

  				generateHr(doc, 280);
  			}

  			let invoiceTable = (doc, invoice) => {
  				let i;
  				const invoiceTableTop = 300;
  				const currencySymbol = invoice.currency_symbol;
  				doc.font("Helvetica-Bold");
  				if (oDetail.GSTType === "SGST") {
  					tableRowSGST(
  						doc,
  						invoiceTableTop,
  						"Description",
  						"Rate",
  						"SGST",
  						"CGST",
  						"Amount"
  					);
  				} else {
  					tableRowIGST(
  						doc,
  						invoiceTableTop,
  						"Description",
  						"Rate",
  						"IGST",
  						"Amount"
  					);
  				}
  				generateHr(doc, invoiceTableTop + 20);
  				doc.font("Helvetica");
  				var totalAmount = 0;
  				var totalGST = 0;
  				for (i = 0; i < invoice.items.length; i++) {
  					const item = invoice.items[i];
  					const position = invoiceTableTop + (i + 1) * 30;
  					if (oDetail.GSTType === "SGST") {
  						item.SGST = item.IGST / 2;
  						item.CGST = item.IGST / 2;
  						tableRowSGST(
  							doc,
  							position,
  							item.Course + (oDetail.GSTType !== "NONE" ? "\nHSN/SAC: " + item.HSN : ""),
  							item.Rate,
  							item.SGST,
  							item.CGST,
  							item.Amount
  						);
  					} else {
  						tableRowIGST(
  							doc,
  							position,
  							item.Course + "\nHSN/SAC: " + item.HSN,
  							item.Rate,
  							item.IGST,
  							item.Amount
  						);
  					}
  					totalAmount += parseFloat(item.Amount);
  					generateHr(doc, position + 28);
  				}
  				if (oDetail.GSTType === "SGST") {
  					const subtotalPosition = invoiceTableTop + (i + 1) * 35;
  					doc.font("Helvetica-Bold");
  					totalTable(
  						doc,
  						subtotalPosition,
  						"Sub Total:",
  						formatCurrency(totalAmount.toFixed(2))
  					);
  					const sgstPosition = subtotalPosition + 20;
  					doc.font("Helvetica-Bold");
  					totalTable(
  						doc,
  						sgstPosition,
  						"SGST:",
  						formatCurrency(oDetail.GSTType !== "NONE" ? (totalAmount * 0.09).toFixed(2) : 0)
  					);
  					const cgstPosition = sgstPosition + 20;
  					doc.font("Helvetica-Bold");
  					totalTable(
  						doc,
  						cgstPosition,
  						"CGST:",
  						formatCurrency(oDetail.GSTType !== "NONE" ? (totalAmount * 0.09).toFixed(2) : 0)
  					);
  					var paidToDatePosition = cgstPosition + 20;
  					doc.font("Helvetica-Bold");
  					totalTable(
  						doc,
  						paidToDatePosition,
  						"Total (" + oDetail.Currency + "):",
  						formatCurrency(invoice.fullAmount)
  					);
  				} else {
  					const subtotalPosition = invoiceTableTop + (i + 1) * 35;
  					doc.font("Helvetica-Bold");
  					totalTable(
  						doc,
  						subtotalPosition,
  						"Sub Total:",
  						formatCurrency(totalAmount.toFixed(2))
  					);
  					const igstPosition = subtotalPosition + 20;
  					doc.font("Helvetica-Bold");
  					totalTable(
  						doc,
  						igstPosition,
  						"IGST:",
  						formatCurrency(oDetail.GSTType !== "NONE" ? (totalAmount * 0.18).toFixed(2) : 0)
  					);
  					var paidToDatePosition = igstPosition + 20;
  					doc.font("Helvetica-Bold");
  					totalTable(
  						doc,
  						paidToDatePosition,
  						"Total (" + oDetail.Currency + "):",
  						formatCurrency(invoice.fullAmount)
  					);
  				}
  				let amountInWordsPosition = paidToDatePosition;
  				generateHr(doc, amountInWordsPosition + 20);
  				doc.font("Helvetica-Bold")
  					.text("Amount in Words:", 50, amountInWordsPosition + 30)
  					.text(this.formatter.convertNumberToWords(invoice.fullAmount) + " only", 150, amountInWordsPosition + 30)
  				generateHr(doc, amountInWordsPosition + 50);
  				if (oDetail.Notes) {
  					doc.font("Helvetica-Bold")
  						.text("Notes: ", 50, amountInWordsPosition + 75)
  						.font("Helvetica")
  						.text(oDetail.Notes, 50, amountInWordsPosition + 90)
  						.font("Helvetica-Bold")
  						.text("Remarks: ", 50, amountInWordsPosition + 165)
  						.font("Helvetica")
  						.text(oDetail.CourseName + "Training fee for " + oDetail.Email + ". Please note that the actual invoice will be generated after payment.", 50, amountInWordsPosition + 180)
  						.font("Helvetica-Bold")
  						.text("Terms: ", 50, amountInWordsPosition + 215)
  						.font("Helvetica")
  						.text(oDetail.Terms ? oDetail.Terms : "", 50, amountInWordsPosition + 230);
  				}
  				if ((!oDetail.Notes) && oDetail.Reference !== "null") {
  					doc.font("Helvetica-Bold")
  						.text("Remarks: ", 50, amountInWordsPosition + 215)
  						.font("Helvetica")
  						.text("Thanks for making payment on" + invoice.date.billing_date + "with reference no " + (oDetail.Reference !== "null" ? oDetail.Reference : ""), 50, amountInWordsPosition + 230);
  				}

  				const signaturePosition = amountInWordsPosition + 205;
  				if (oDetail.AccountNo === "114705500444") {
  					doc.text(invoice.header.company_name, 430, signaturePosition)
  						.image(invoice.header.signature, 440, signaturePosition + 20, {
  							height: 50,
  							width: 110
  						})
  						.text("Designated Partner", 440, signaturePosition + 80)
  						.moveDown();
  				} else {
  					doc.text(invoice.header.company_name, 430, signaturePosition)
  						.image(invoice.header.signature, 420, signaturePosition + 20, {
  							height: 80,
  							width: 155
  						})
  						.text("Designated Partner", 440, signaturePosition + 105)
  						.moveDown();
  				}
  			}

  			let footer = (doc, invoice) => {
  				if (invoice.footer.text.length !== 0) {
  					generateHr(doc, 760);
  					doc.fontSize(8).text(invoice.footer.text, 50, 770, {
  						align: "right",
  						width: 500
  					});
  				}
  			}

  			let totalTable = (
  				doc,
  				y,
  				name,
  				description
  			) => {
  				doc
  					.fontSize(10)
  					.text(name, 380, y, {
  						width: 90,
  						align: "right"
  					})
  					.text(description, 0, y, {
  						align: "right"
  					})
  			}

  			let tableRowIGST = (
  				doc,
  				y,
  				desc,
  				rate,
  				igst,
  				amount
  			) => {
  				doc
  					.fontSize(10)
  					.text(desc, 50, y)
  					.text(rate, 300, y, {
  						width: 90,
  						align: "right"
  					})
  					.text(igst + "%", 380, y, {
  						width: 90,
  						align: "right"
  					})
  					.text(amount, 0, y, {
  						align: "right"
  					});
  			}

  			let tableRowSGST = (
  				doc,
  				y,
  				desc,
  				rate,
  				sgst,
  				cgst,
  				amount
  			) => {
  				doc
  					.fontSize(10)
  					.text(desc, 50, y)
  					.text(rate, 260, y, {
  						width: 90,
  						align: "right"
  					})
  					.text(sgst + "%", 320, y, {
  						width: 90,
  						align: "right"
  					})
  					.text(cgst + "%", 380, y, {
  						width: 90,
  						align: "right"
  					})
  					.text(amount, 0, y, {
  						align: "right"
  					});
  			}

  			let generateHr = (doc, y) => {
  				doc
  					.strokeColor("#aaaaaa")
  					.lineWidth(1)
  					.moveTo(50, y)
  					.lineTo(550, y)
  					.stroke();
  			}

  			let formatCurrency = (value, symbol = "") => {
  				if (value) {
  					var x = value.toString().split('.');
  					var y = (x.length > 1 ? "." + x[1] : "");
  					x = x[0];
  					var lastThree = x.substring(x.length - 3);
  					var otherNumbers = x.substring(0, x.length - 3);
  					if (otherNumbers != '')
  						lastThree = ',' + lastThree;
  					var res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
  					return res + y + symbol;
  				} else {
  					return value + symbol;
  				}
  			}

  			let getNumber = str => {
  				if (str.length !== 0) {
  					var num = str.replace(/[^0-9]/g, '');
  				} else {
  					var num = 0;
  				}

  				return num;
  			}

  			let checkIfTaxAvailable = tax => {
  				let validatedTax = getNumber(tax);
  				if (Number.isNaN(validatedTax) === false && validatedTax <= 100 && validatedTax > 0) {
  					var taxValue = tax;
  				} else {
  					var taxValue = '---';
  				}

  				return taxValue;
  			}

  			let applyTaxIfAvailable = (price, gst) => {


  				let validatedTax = getNumber(gst);
  				if (Number.isNaN(validatedTax) === false && validatedTax <= 100) {
  					let taxValue = '.' + validatedTax;
  					var itemPrice = price * (1 + taxValue);
  				} else {
  					var itemPrice = price * (1 + taxValue);
  				}

  				return itemPrice;
  			}

  			let companyAddress = (doc, address) => {
  				let str = address;
  				// let chunks = str.match(/.{0,25}(\s|$)/g);
  				let chunks = str.split("\\");
  				let first = 50;
  				chunks.forEach(function(i, x) {
  					doc.fontSize(10).text(chunks[x], 300, first, {
  						align: "right"
  					});
  					first = +first + 15;
  				});
  			}

  			let niceInvoice = (invoice) => {
  				var doc = new PDFDocument({
  					size: "A4",
  					margin: 40
  				});
  				var stream = doc.pipe(blobStream());
  				header(doc, invoice);
  				customerInformation(doc, invoice);
  				invoiceTable(doc, invoice);
  				footer(doc, invoice);
  				doc.end();
  				stream.on('finish', function() {
  					// get a blob you can do whatever you like with
  					const blob = stream.toBlob('application/pdf');
  					// or get a blob URL for display in the browser
  					const url = stream.toBlobURL('application/pdf');

  					const downloadLink = document.createElement('a');
  					downloadLink.href = url;
  					downloadLink.download = invoiceNo + "_" + oDetail.Country + "_" + invoice.shipping.name;
  					downloadLink.click();
  				});
  			}
  			niceInvoice(invoiceDetail);
    }
  });
});
