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
      var that = this;
      $.ajax({
        type: 'GET', // added,
        url: 'getLogo',
        success: function(data) {
          that.logo = data;
        },
        error: function(xhr, status, error) {
          sap.m.MessageToast.show("error in fetching logo");
        }
      });
    },
    _routePatternMatched: function() {
      // this._setLayout("One");
      if (this.getView().byId("wizardNavContainer")._pageStack.length > 1) {
        // this.getView().byId("wizardNavContainer")._pageStack.pop();
        this.getView().byId("wizardNavContainer").to(this.byId("wizardContentPage"));
        this.getView().byId("shoppingCartWizard").setCurrentStep(this.getView().byId("shoppingCartWizard").getSteps()[0]);
      }
      // this.getView().byId("shoppingCartWizard").setCurrentStep(this.getView().byId("shoppingCartWizard").getSteps()[0]);
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
    onDownloadInvoice: function() {

      // var country = this.getCountryNameFromCode(Country);
      var cartItems = this.getOwnerComponent().getModel("local").getProperty("/cartItems"),
        invoiceItems = [],
        that = this;
      cartItems.forEach(function(item) {
        invoiceItems.push({
          CODE: item.Code,
          GROSS_WT: item.GrossWeight,
          STONE_WT: item.LessWeight,
          NET_WT: item.NetWeight,
          KT: item.Karat,
          SIZE: item.PairSize,
          QTY: 1,
          REMARKS: "NONE",
          IMG: item.PictureUrl.sBase64 //"data:image/png;base64," + that.logo
        });
      });
      const invoiceDetail = {
        shipping: {
          name: "NONE",
          email: "NONE",
          mob: "NONE",
          GSTIN: "NONE",
          address: "NONE"
        },
        userDetails: {
          Company: "Mangalam Ornaments",
          Slab: " USER SLAB 1",
          Name: "Amit Singhal",
          Mobile: "9660686771",
          Email: "Smdaishpra@gmail.com",
          City: "Jaipur"
        },
        clientDetails: {
          Company: "Mangalam Ornaments",
          Slab: " USER SLAB 1",
          Name: "Amit Singhal",
          Mobile: "9660686771",
          Email: "Smdaishpra@gmail.com",
          City: "Jaipur"
        },
        items: invoiceItems,
        IGST: "NONE",
        fullAmount: 9999,
        order_number: "NONE",
        paymentMode: "NONE",
        IsWallet: true,
        header: {
          company_name: "MANGALAM",
          company_logo: "data:image/png;base64," + this.logo,
          signature: "NONE",
          // hear \\ is used to change line
          company_address: "NONE",
          GSTIN: "NONE"
        },
        footer: {
          text: "This is a computer generated invoice"
        },
        currency_symbol: "NONE",
        date: {
          billing_date: "NONE",
          due_date: "NONE"
        }
      };

      let header = (doc, invoice) => {

        if (this.logo) {
          doc.image(invoice.header.company_logo, 205, 35, {
              width: 200
            })
            // .fontSize(20)
            // .text(invoice.header.company_name, 220, 57)
            .fontSize(10);
          doc.moveDown();
        } else {
          doc.fontSize(20)
            .text(invoice.header.company_name, 245, 45)
            .fontSize(10)
            // .text("GSTIN: " + invoice.header.GSTIN, 50, 75)
            .moveDown()
        }

        // if (invoice.header.company_address.length !== 0) {
        //   companyAddress(doc, invoice.header.company_address);
        // }

      }

      let customerInformation = (doc, invoice) => {
        doc
          .fillColor("#444444")
          .fontSize(20);
        // generateHr(doc, 110);

        const customerInformationTop = 130;

        doc.fontSize(10)
          .font("Helvetica-Bold")
          .text("Order No:", 30, customerInformationTop - 20)
          .font("Helvetica")
          .text("xxxx", 90, customerInformationTop - 20)
          .font("Helvetica-Bold")
          .text("User Details:", 30, customerInformationTop)
          .font("Helvetica")
          .text("Company:", 30, customerInformationTop + 15)
          .text(invoice.userDetails.Company, 150, customerInformationTop + 15)
          .text("Slab:", 30, customerInformationTop + 30)
          .text(invoice.userDetails.Slab, 150, customerInformationTop + 30)
          .fontSize(10)
          .text("Name:", 30, customerInformationTop + 45)
          .text(invoice.userDetails.Name, 150, customerInformationTop + 45)
          .text("Mobile No:", 30, customerInformationTop + 60)
          .text(invoice.userDetails.Mobile, 150, customerInformationTop + 60)
          .text("E-mail:", 30, customerInformationTop + 75)
          .text(invoice.userDetails.Email, 150, customerInformationTop + 75)
          .text("City:", 30, customerInformationTop + 90)
          .text(invoice.userDetails.City, 150, customerInformationTop + 90)

          .font("Helvetica-Bold")
          .text("Client Details:", 350, customerInformationTop)
          .font("Helvetica")
          .text("Company:", 350, customerInformationTop + 15)
          .text(invoice.clientDetails.Company, 450, customerInformationTop + 15)
          .text("Slab:", 350, customerInformationTop + 30)
          .text(invoice.clientDetails.Slab, 450, customerInformationTop + 30)
          .text("Name:", 350, customerInformationTop + 45)
          .text(invoice.clientDetails.Name, 450, customerInformationTop + 45)
          .text("Mobile No:", 350, customerInformationTop + 60)
          .text(invoice.clientDetails.Mobile, 450, customerInformationTop + 60)
          .text("E-mail:", 350, customerInformationTop + 75)
          // .text(invoice.clientDetails.Email, 450, customerInformationTop + 75)
          .text("City:", 350, customerInformationTop + 90)
          .text(invoice.clientDetails.City, 450, customerInformationTop + 90)
          .moveDown();
      }

      let invoiceTable = (doc, invoice) => {
        let i;
        let invoiceTableTop = 260;
        const currencySymbol = invoice.currency_symbol;
        generateHr(doc, invoiceTableTop - 5);
        doc.font("Helvetica-Bold");
        tableRowIGST(
          doc,
          invoiceTableTop,
          "#",
          "CODE",
          "GROSS WT",
          "STONE WT",
          "NET WT",
          "KT",
          "SIZE",
          "QTY",
          "REMARKS",
          "IMG"
        );
        generateHr(doc, invoiceTableTop + 15);
        doc.font("Helvetica");
        var totalAmount = 0;
        var totalGST = 0;
        var total_gross_wt = 0;
        var total_stone_wt = 0;
        var total_net_wt = 0;
        let position = invoiceTableTop + 15;
        for (i = 0; i < invoice.items.length; i++) {
          const item = invoice.items[i];
          position += 65;
          tableRowIGST(
            doc,
            position,
            i + 1,
            item.CODE,
            item.GROSS_WT,
            item.STONE_WT,
            item.NET_WT,
            item.KT,
            item.SIZE,
            item.QTY,
            item.REMARKS,
            item.IMG
          );
          total_gross_wt += parseFloat(item.GROSS_WT);
          total_stone_wt += parseFloat(item.STONE_WT);
          total_net_wt += parseFloat(item.NET_WT);
          generateHr(doc, position += 65);
          // totalAmount += parseFloat(item.Amount);
          if (invoice.items.length - 1 === i || (i === 3 && invoiceTableTop === 260) || (i - 3) % 5 === 0) {
            generateVr(doc, 30, invoiceTableTop - 5, position);
            generateVr(doc, 45, invoiceTableTop - 5, position);
            generateVr(doc, 135, invoiceTableTop - 5, position);
            generateVr(doc, 195, invoiceTableTop - 5, position);
            generateVr(doc, 255, invoiceTableTop - 5, position);
            generateVr(doc, 295, invoiceTableTop - 5, position);
            generateVr(doc, 335, invoiceTableTop - 5, position);
            generateVr(doc, 375, invoiceTableTop - 5, position);
            generateVr(doc, 435, invoiceTableTop - 5, position);
            generateVr(doc, 570, invoiceTableTop - 5, position);
          }
          if ((i === 3 && invoice.items.length > 4) || (i - 3) % 5 === 0) {
            invoiceTableTop = 40;
            position = 40;
            doc.restore();
            doc.addPage();
            generateHr(doc, invoiceTableTop - 5);
          }
        }
        tableRowIGST(
          doc,
          position + 7,
          i,
          "-",
          total_gross_wt.toFixed(3),
          total_stone_wt.toFixed(3),
          total_net_wt.toFixed(3),
          "-",
          "-",
          "-",
          "-",
          "-"
        );
        generateHr(doc, position + 25);
        // console.log(position);
        if (position > 600) {
          doc.addPage();
          customerInformationOtherDetails(doc, 40);
        } else {
          customerInformationOtherDetails(doc, position);
        }
        // const subtotalPosition = invoiceTableTop + (i + 1) * 35;
        // doc.font("Helvetica-Bold");
        // totalTable(
        //   doc,
        //   subtotalPosition,
        //   "Sub Total:",
        //   formatCurrency(totalAmount.toFixed(2))
        // );
        // const igstPosition = subtotalPosition + 20;
        // doc.font("Helvetica-Bold");
        // totalTable(
        //   doc,
        //   igstPosition,
        //   "IGST:",
        //   "NONE"
        // );
        // var paidToDatePosition = igstPosition + 20;
        // doc.font("Helvetica-Bold");
        // totalTable(
        //   doc,
        //   paidToDatePosition,
        //   "Total:",
        //   formatCurrency(invoice.fullAmount)
        // );
        // let amountInWordsPosition = paidToDatePosition;
        // generateHr(doc, amountInWordsPosition + 20);
        // doc.font("Helvetica-Bold")
        // .text("Amount in Words:", 50, amountInWordsPosition + 30)
        // .text(this.formatter.convertNumberToWords(invoice.fullAmount) + " only", 150, amountInWordsPosition + 30)
        // generateHr(doc, amountInWordsPosition + 50);
        // const signaturePosition = amountInWordsPosition + 205;
        // doc.text(invoice.header.company_name, 430, signaturePosition)
        // .image(invoice.header.signature, 420, signaturePosition + 20, {
        // 	height: 80,
        // 	width: 155
        // })
        // .text("Designated Partner", 440, signaturePosition + 105)
        // .moveDown();
      }
      let customerInformationOtherDetails = (doc, position) => {
        doc
          .fillColor("#444444")
          .fontSize(20);
        let customerInformationBottom = position > 555 ? position + 35 : position + 40;

        doc.fontSize(10)
          .font("Helvetica-Bold")
          .text("Ohter Details:", 30, customerInformationBottom)
          .font("Helvetica")
          .text("Remarks:", 30, customerInformationBottom += 12)
          .text("Bangel size 2-6 aana", 150, customerInformationBottom)
          .text("Purity:", 30, customerInformationBottom += 12)
          .text("22K", 150, customerInformationBottom)
          .text("Gold Color:", 30, customerInformationBottom += 12)
          .text("YELLOW", 150, customerInformationBottom)
          .text("Gold Type:", 30, customerInformationBottom += 12)
          .text("PG", 150, customerInformationBottom)
          .text("Stamp (22K):", 30, customerInformationBottom += 12)
          .text("916", 150, customerInformationBottom)
          .text("Finishing:", 30, customerInformationBottom += 12)
          .text("HIGH POLISH + DULL", 150, customerInformationBottom)
          .text("Rhodium:", 30, customerInformationBottom += 12)
          .text("STONE PART RHODIUM", 150, customerInformationBottom)
          .text("Screw Type:", 30, customerInformationBottom += 12)
          .text("NA", 150, customerInformationBottom)
          .text("Patch Details:", 30, customerInformationBottom += 12)
          .text("NA", 150, customerInformationBottom)
          .text("Ladies Ring Size:", 30, customerInformationBottom += 12)
          .text("12 to 14", 150, customerInformationBottom)
          .text("Gents Ring Size:", 30, customerInformationBottom += 12)
          .text("21 to 25", 150, customerInformationBottom)
          .text("Ladies Bracelet Length:", 30, customerInformationBottom += 12)
          .text("6.75 to 7.25", 170, customerInformationBottom)
          .text("Gents Bracelet Length:", 30, customerInformationBottom += 12)
          .text("8.25 to 8.5", 170, customerInformationBottom)
          .text("Chain Length:", 30, customerInformationBottom += 12)
          .text("21 to 21", 150, customerInformationBottom)
          .text("NK / Mala Length:", 30, customerInformationBottom += 12)
          .text("20 to 21", 150, customerInformationBottom)
          .text("Bangle Size:", 30, customerInformationBottom += 12)
          .text("2.6 to 2.6", 150, customerInformationBottom)
      }
      let footer = (doc, invoice) => {
        if (invoice.footer.text.length !== 0) {
          generateHr(doc, 760);
          doc.fontSize(8).text(invoice.footer.text, 50, 770, {
            align: "right",
            width: 500
          });
        }
        // doc.addPage()
        //   .fillColor('blue')
        //   .text('Here is a link!', 100, 100)
        //   .underline(100, 100, 160, 27, {
        //     color: '#0000FF'
        //   })
        //   .link(100, 100, 160, 27, 'http://google.com/');
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
        sr,
        code,
        gross_wt,
        stone_wt,
        net_wt,
        kt,
        size,
        qty,
        remarks,
        img
      ) => {
        doc
          .fontSize(10)
          .text(sr, 30, y, {
            width: 10,
            align: "center"
          })
          .text(code, 45, y, {
            width: 90,
            align: "center"
          })
          .text(gross_wt, 135, y, {
            width: 60,
            align: "center"
          })
          .text(net_wt, 195, y, {
            width: 60,
            align: "center"
          })
          .text(kt, 255, y, {
            width: 40,
            align: "center"
          })
          .text(size, 295, y, {
            width: 40,
            align: "center"
          })
          .text(qty, 335, y, {
            width: 40,
            align: "center"
          })
          .text(remarks, 375, y, {
            width: 60,
            align: "center"
          });
        if (!img.includes("base64")) {
          doc.text(img, 435, y, {
            width: 135,
            align: "center"
          });
        } else {
          doc.image(img, 435, y - 50, {
            width: 130,
            align: "center"
          });
        }
      }
      let generateHr = (doc, y) => {
        doc
          .strokeColor("#aaaaaa")
          .lineWidth(1)
          .moveTo(30, y)
          .lineTo(570, y)
          .stroke();
      }
      let generateVr = (doc, x, y1, y2) => {
        doc
          .strokeColor("#aaaaaa")
          .lineWidth(1)
          .moveTo(x, y1)
          .lineTo(x, y2)
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
          margin: 25
        });
        var stream = doc.pipe(blobStream());
        header(doc, invoice);
        customerInformation(doc, invoice);
        invoiceTable(doc, invoice);
        // footer(doc, invoice);
        doc.end();
        stream.on('finish', function() {
          // get a blob you can do whatever you like with
          const blob = stream.toBlob('application/pdf');
          // or get a blob URL for display in the browser
          const url = stream.toBlobURL('application/pdf');

          const downloadLink = document.createElement('a');
          downloadLink.href = url;
          downloadLink.download = "invoiceNo" + "_" + "Country" + "_" + invoice.shipping.name;
          downloadLink.click();
        });
      }
      niceInvoice(invoiceDetail);
    }
  });
});
