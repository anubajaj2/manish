sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/m/MessageToast",
  "sap/ui/core/UIComponent",
  "sap/ui/core/routing/History",
  "sap/ui/demo/cart/model/cart",
  "sap/ui/demo/cart/dbapi/dbapi",
  "sap/f/LayoutType",
  "sap/ui/demo/cart/model/formatter",
  "sap/ui/core/Fragment",
  "sap/m/MessageBox"
], function(Controller, MessageToast, UIComponent, History, cart, ODataHelper, LayoutType, formatter, Fragment, MessageBox) {
  "use strict";

  return Controller.extend("sap.ui.demo.cart.controller.BaseController", {
    cart: cart,
    ODataHelper: ODataHelper,
    formatter: formatter,
    allImageURLs: [],
    cleanApp: function() {
      this.getOwnerComponent().getModel("local").setProperty("/cartItems", []);
    },
    /**
     * Convenience method for accessing the router.
     * @public
     * @returns {sap.ui.core.routing.Router} the router for this component
     */
    onInit: function() {
      this.idleLogout();
    },
    closePopover: function() {
      this._oPopover.destroy();
      this._oPopover = null;
    },
    onUserPress: function(oEvent) {
      debugger;
      var oButton = oEvent.getSource();
      // create popover
      if (!this._oPopover) {
        Fragment.load({
          id: "popoverNavCon",
          name: "sap.ui.demo.cart.fragments.Profile",
          controller: this
        }).then(function(oPopover) {
          this._oPopover = oPopover;
          this.getView().addDependent(this._oPopover);
          this._oPopover.openBy(oButton);
          if (this.getView().getModel("local").getProperty("/Role") != "Retailer") {
            // this._oPopover.getContent()[0].getPages()[0].getContent()[0].getItems()[1].setVisible(false)
          }
        }.bind(this));
      } else {
        this._oPopover.openBy(oButton);
        if (this.getView().getModel("local").getProperty("/Role") != "Retailer") {
          // this._oPopover.getContent()[0].getPages()[0].getContent()[0].getItems()[1].setVisible(false)
        }
      }
    },

    showHome: function() {
      this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
      this.oRouter.navTo("Maker");
      this.closePopover();
    },

    showApprovals: function() {
      debugger;
      this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
      this.oRouter.navTo("MyApproval");
      this.closePopover();
    },

    showBookedProd: function() {
      debugger;
      this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
      this.oRouter.navTo("ChangeStock");
      this.closePopover();
    },

    showItemsApproval: function() {
      debugger;
      this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
      this.oRouter.navTo("ItemsApproval");
      this.closePopover();
    },

    showProducts: function() {
      debugger;
      this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
      this.oRouter.navTo("MyProduct");
      this.closePopover();
    },

    showProfile: function(oEvent) {
      this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
      this.oRouter.navTo("Profile");
      this.closePopover();
      // this._oPopover.setContentWidth("25%");
      // this._oPopover.setContentHeight("60%");
      // var oNavCon = Fragment.byId("popoverNavCon", "navCon");
      // var oDetailPage = Fragment.byId("popoverNavCon", "detail");
      // oNavCon.to(oDetailPage);
      // this._oPopover.focus();
    },

    onPressAbout: function() {
      var that = this;
      if (!that.About) {
        that.About = new sap.ui.xmlfragment("sap.ui.demo.cart.fragments.About", that);
        that.getView().addDependent(that.About);
      }


      that.About.open();
    },

    onCloseAbout: function() {
      this.About.close();
    },
    onOrders: function(oEvent) {
      if (this.getView().getModel("local").getProperty("/Role") === "Retailer") {
        this.getRouter().navTo("orders");
      }
    },
    onNavBack: function(oEvent) {
      this._oPopover.setContentWidth("18%");
      this._oPopover.setContentHeight("30%");
      var oNavCon = Fragment.byId("popoverNavCon", "navCon");
      oNavCon.back();
      this._oPopover.focus();
    },
    _allWeights: [],
    reverseSort: function(data, text) {
      var arr = [];
      for (var i = 0; i < data.length; i++) {
        arr.push(data[i].split('/')[data[i].split('/').length - 1]);
      }
      arr.sort(function(a, b) {
        return b - a
      });
      var retSet = [];
      for (var i = 0; i < arr.length; i++) {
        retSet.push("/" + text + "/" + arr[i]);
      }
      return retSet;
    },
    _deletedImages: [],
    ProdWeights: [],
    validateProductData: function() {
      var allWeights = this.getView().getModel("local").getProperty("/ProdWeights");
      var Product = this.getView().getModel("local").getProperty("/Product");

      if (Product.ProductId === "" || Product.ProductId === "null") {
        return {
          "status": false,
          "error": "Product Id not valid"
        };
      }
      if (Product.Name === "" || Product.Name === "null") {
        return {
          "status": false,
          "error": "Product Name not valid"
        };
      }
      if (Product.Tunch === "" || Product.Tunch === "null" || Product.Tunch === "0" || parseInt(Product.Tunch) === 0) {
        return {
          "status": false,
          "error": "Tunch is not valid"
        };
      }
      if (parseInt(Product.Tunch) > 100) {
        return {
          "status": false,
          "error": "Tunch is not valid"
        };
      }
      if (parseInt(Product.Wastage) > 100) {
        return {
          "status": false,
          "error": "Wastage is not valid"
        };
      }
      if (parseInt(Product.Making) > 9999) {
        return {
          "status": false,
          "error": "Making not valid"
        };
      }
      if (allWeights.length <= 0) {
        return {
          "status": false,
          "error": "at least one weight required"
        };
      }
      for (var i = 0; i < allWeights.length; i++) {
        if (allWeights[i].Fine === "" || allWeights[i].Fine === "0" || parseInt(allWeights[i].Fine) === 0 || parseInt(allWeights[i].Fine) <
          0 || allWeights[i].Fine === "null") {
          return {
            "status": false,
            "error": "Fine cannot be calculated"
          };
        }
      }

      return {
        "status": true,
        "error": ""
      };
    },
    prepareFinalData: function(ProductId) {
      //check if allWeights has product id to create association
      var allWeights = this.getView().getModel("local").getProperty("/ProdWeights");
      for (var i = 0; i < allWeights.length; i++) {
        allWeights[i].ProductId = ProductId;
      }

      var allImages = this.getView().getModel("local").getProperty("/allImages");
      //check if image has product id to create association
      for (var j = 0; j < allImages.length; j++) {
        if (!allImages[j].id) {
          allImages[j].Product = ProductId;
        }
      }
      this.getView().getModel("local").setProperty("/allImages", allImages);
      this.getView().getModel("local").setProperty("/ProdWeights", allWeights);
    },
    performCameraSave: function(ProductId) {
      //Commit to be done
      //Validate everything before saving images, deleting images or upserting data
      this.prepareFinalData(ProductId);
      //delete the images which are marked for deletion from server
      //based on collection for deletetioon this._deletedImages
      //if no images to be deleted nothing happen
      this.massImageDelete();
      //upload only images which has no id
      //all will be uploaded in one shot and ui will update with
      //stored images back on screen
      this.handleUploadPress();
      //upsert all records of all weights again of "A" - Available only
      //API will flush and recreate every record again
      //this way no need to compare changes, or new recods
      //if no records in weight table nothing will happen
      this.upsertWeights();
      this.getView().getModel("local").setProperty("/checkChange", false);
    },
    loadProdWeights: function(productId) {
      var that = this;
      return new Promise(function(resolve, reject) {
        $.post('/GetProdWeights', {
            "productId": productId
          })
          .done(function(data, status) {
            that.getView().getModel("local").setProperty("/ProdWeights", data.ProdWeights);
            resolve(data);
          })
          .fail(function(xhr, status, error) {
            reject(error);
          });
      });

    },
    loadProdInitImages: function(productId) {

    },
    loadProdAllImages: function(productId) {
      var that = this;
      $.post('/GetAllPhotos', {
          "productId": productId
        })
        .done(function(data, status) {
          that._deletedImages = [];
          that.getView().getModel("local").setProperty("/allImages", data.allImages);
          that.processImages();
        })
        .fail(function(xhr, status, error) {

        });
    },
    loadProductData: function(productId) {
      var that = this;
      if (productId !== "" && !productId) {
        return;
      }
      this.loadProdAllImages(productId);
      this.loadProdWeights(productId);
    },
    mode: "Create",
    cancelSave: function() {
      var that = this;
      if (that.getView().getModel("local").getProperty("/checkChange") === true) {
        MessageBox.confirm("Unsaved data will be lost", {
          title: "Confirmation",
          type: "Warning",
          onClose: function(reply) {
            if (reply === "OK") {
              that._deletedImages = [];
              that.getView().getModel("local").setProperty("/Product", {
                "id": "",
                "ProductId": "",
                "Name": "",
                "Category": "",
                "SubCategory": "",
                "Type": "S",
                "PairType": 2,
                "ShortDescription": "null",
                "ItemType": "G",
                "Karat": "22/22",
                "Gender": "F",
                "OverallStatus": "N",
                "HindiName": "",
                "Tunch": 0,
                "Wastage": 0,
                "Making": 0,
                "ApprovedOn": "",
                "AlertQuantity": 0,
                "CreatedBy": "",
                "CreatedOn": "",
                "ChangedBy": "",
                "ChangedOn": ""
              });
              that.mode = "Create";
              that.setMode();
            } else {
              //do nothing
              return false;
            }
          }
        })
      } else {
        this._deletedImages = [];
        this.getView().getModel("local").setProperty("/ProdWeights", [{
          "ProductId": "null",
          "PairSize": 0,
          "OtherChrg": 0,
          "GrossWeight": 0,
          "LessWeight": 0,
          "NetWeight": 0,
          "Quantity": 1,
          "Fine": 0,
          "MoreAmount": 0,
          "Amount": 0,
          "Values": [],
          "Status": "A",
          "SoldOn": new Date(),
          "OrderId": "",
          "Remarks": "null",
          "CreatedOn": new Date(),
          "CreatedBy": ""
        }]);
        this.getView().getModel("local").setProperty("/allImages", []);
        this.getView().getModel("local").setProperty("/deleteImages", []);
        that.getView().getModel("local").setProperty("/checkChange", false);
        return true;
      }

    },
    setMode: function() {
      if (this.mode === "Edit") {
        this.getView().byId("idName").setEnabled(false);
        this.getView().byId("idPName").focus();
      } else if (this.mode = "Copy") {
        var prodWeights = this.getView().getModel("local").getProperty("/ProdWeights");
        prodWeights.forEach((item) => {
          item.ProductId = "";
          item.SoldOn = new Date();
          item.CreatedOn = new Date();
          delete item.id;
        });
        this.getView().getModel("local").setProperty("/ProdWeights", prodWeights);
        var allImages = this.getView().getModel("local").getProperty("/allImages");
        allImages.forEach((item) => {
          item.Product = "";
          item.CreatedOn = new Date();
          delete item.id;
        });
        this.getView().getModel("local").setProperty("/allImages", allImages);
        this.getView().getModel("local").setProperty("/deleteImages", []);
        this.getView().getModel("local").setProperty("/checkChange", false);
        if (this.getView().byId("idName")) {
          this.getView().byId("idName").setEnabled(true);
        }
      } else {
        this._deletedImages = [];
        this.getView().getModel("local").setProperty("/ProdWeights", [{
          "ProductId": "null",
          "PairSize": 0,
          "OtherChrg": 0,
          "GrossWeight": 0,
          "LessWeight": 0,
          "NetWeight": 0,
          "Quantity": 1,
          "Fine": 0,
          "MoreAmount": 0,
          "Amount": 0,
          "Values": [],
          "Status": "A",
          "SoldOn": new Date(),
          "OrderId": "",
          "Remarks": "null",
          "CreatedOn": new Date(),
          "CreatedBy": ""
        }]);
        this.getView().getModel("local").setProperty("/allImages", []);
        this.getView().getModel("local").setProperty("/deleteImages", []);
        this.getView().getModel("local").setProperty("/checkChange", false);
        if (this.getView().byId("idName")) {
          this.getView().byId("idName").setEnabled(true);
        }

      }
    },
    massImageDelete: function() {
      var that = this;
      this._deletedImages = this.getView().getModel("local").getProperty("/deleteImages");
      if (!this._deletedImages) {
        return;
      }
      if (this._deletedImages.length === 0) {
        return;
      }
      $.post('/DeletePhotos', {
          "images": this._deletedImages
        })
        .done(function(data, status) {
          that.getView().getModel("local").setProperty("/deleteImages", []);
        })
        .fail(function(xhr, status, error) {

        });
    },
    upsertWeights: function() {
      debugger;
      var that = this;
      var allWeights = this.getView().getModel("local").getProperty("/ProdWeights");
      if (allWeights.length === 0) {
        return;
      }
      //check if product id is set properly
      //and fine is calculated
      $.post('/ProdWeights', {
          "ProdWeights": allWeights
        })
        .done(function(data, status) {
          that.ProdWeights = data.ProdWeights;
          that.getView().getModel("local").setProperty("/ProdWeights", that.ProdWeights);
        })
        .fail(function(xhr, status, error) {
          MessageBox.error("Internal error occurred");
        });
    },
    loadCustomCalculation: function() {
      var that = this;
      this.ODataHelper.callOData(that.getOwnerComponent().getModel(),
          "/CustomCalculations", "GET", {}, {}, this)
        .then(function(data) {
          that.getView().getModel("local").setProperty("/CustomCalculations", data.results[0]);
        });
    },
    handleUploadPress: function(oEvent) {
      //https://sap.github.io/ui5-webcomponents/playground/components/FileUploader/
      var imagesPost = [];
      var allImages = this.getView().getModel("local").getProperty("/allImages");
      for (var i = 0; i < allImages.length; i++) {
        if (!allImages[i].id) {
          imagesPost.push({
            "SeqNo": i,
            "Product": allImages[i].Product,
            "Stream": allImages[i].Stream,
            "Content": allImages[i].Content,
            "Filename": "",
            "Filetype": "",
            "ViewCount": 0,
            "LastDate": new Date(),
            "CreatedBy": this.getView().getModel("local").getProperty("/CurrentUser"),
            "CreatedOn": new Date()
          });
        }
      }
      if (imagesPost.length === 0) {
        return;
      }
      var that = this;
      $.post('/Photos', {
          "images": imagesPost
        })
        .done(function(data, status) {
          that.getView().getModel("local").setProperty("/allImages", data.allImages);
          that.processImages();
        })
        .fail(function(xhr, status, error) {

        });

    },
    processImages: function() {
      var allImages = this.getView().getModel("local").getProperty("/allImages");
      for (var i = 0; i < allImages.length; i++) {
        allImages[i].Stream = formatter.getImageUrlFromContent(allImages[i].Content);
      }
      this.getView().getModel("local").setProperty("/allImages", allImages);
    },
    calculateOrderEstimate: function() {
      var allItems = this.getModel("local").getProperty("/cartItems");
      var totalAmount = 0;
      var totalGm = 0;
      var customCalculation = this.getModel("local").getProperty("/CustomCalculations");
      for (var i = 0; i < allItems.length; i++) {
        totalGm += parseFloat(((allItems[i].NetWeight * (allItems[i].Tunch + allItems[i].Wastage) / 100).toFixed(3)));
        totalAmount += (allItems[i].Amount + (allItems[i].Piece * allItems[i].MoreAmount) + (parseFloat(((allItems[i].NetWeight * (allItems[i].Tunch + allItems[i].Wastage) / 100).toFixed(3))) * customCalculation.Gold));
      }
      this.getModel("local").setProperty("/fineGm", totalGm.toFixed(3));
      this.getModel("local").setProperty("/fineRs", totalAmount.toFixed(2));
    },
    firstTwoDisplay: function() {
      this.getModel("local").setProperty("/layout", LayoutType.TwoColumnsMidExpanded);
    },
    lastTwoDisplay: function(oView) {

      this.getModel("local").setProperty("/layout", LayoutType.ThreeColumnsMidExpanded);
    },
    getRouter: function() {
      return UIComponent.getRouterFor(this);
    },
    loadCategories: function(subCats) {
      var that = this;
      this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
          "/Categories", "GET", {}, {}, this)
        .then(function(oData) {
          that.getOwnerComponent().getModel("local").setProperty("/Categories", oData.results);
          // var a = [];
          // var b = [];
          // for (var i = 0; i < oData.results.length; i++) {
          //   if (a.indexOf(oData.results[i].Category) === -1) {
          //     a.push(oData.results[i]);
          //   }
          // }
          // //SubCategory
          // var c = [];
          // var d = [];
          // if (subCats) {
          //   if (subCats.length > 0) {
          //     for (var i = 0; i < oData.results.length; i++) {
          //       for (var j = 0; j < subCats.length; j++) {
          //         if (subCats[j] === oData.results[i].id) {
          //           c.push(oData.results[i]);
          //         }
          //       }
          //     }
          //   }
          // } else {
          //   for (var i = 0; i < oData.results.length; i++) {
          //     if (c.indexOf(oData.results[i].SubCategory) === -1) {
          //       c.push(oData.results[i]);
          //     }
          //   }
          // }
          // a = that.removeDuplicates(a, "Category");
          // c = that.removeDuplicates(c, "SubCategory");
          // that.getOwnerComponent().getModel("local").setProperty("/cat", {
          //   category: a,
          //   subCatergory: c,
          //   type: [{
          //     Type: "Plain",
          //     Key: "P"
          //   }, {
          //     Type: "Studded",
          //     Key: "S"
          //   }]
          // });
        })
        .catch(function(oError) {
          MessageToast.show("cannot fetch the data");
        });
    },

    loadProductCategories: function(subCats) {
      var that = this;
      this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
          "/ProductCategories", "GET", {}, {}, this)
        .then(function(oData) {
          // that.getOwnerComponent().getModel("local").setProperty("/Categories", oData.results);
          var a = [];
          var b = [];
          for (var i = 0; i < oData.results.length; i++) {
            if (a.indexOf(oData.results[i].Category) === -1) {
              a.push(oData.results[i]);
            }
          }
          //SubCategory
          var c = [];
          var d = [];
          if (subCats) {
            if (subCats.length > 0) {
              for (var i = 0; i < oData.results.length; i++) {
                for (var j = 0; j < subCats.length; j++) {
                  if (subCats[j] === oData.results[i].id) {
                    c.push(oData.results[i]);
                  }
                }
              }
            }
          } else {
            for (var i = 0; i < oData.results.length; i++) {
              if (c.indexOf(oData.results[i].SubCategory) === -1) {
                c.push(oData.results[i]);
              }
            }
          }
          a = that.removeDuplicates(a, "Category");
          c = that.removeDuplicates(c, "SubCategory");
          that.getOwnerComponent().getModel("local").setProperty("/cat", {
            category: a,
            subCatergory: c,
            type: [{
              Type: "Plain",
              Key: "P"
            }, {
              Type: "Studded",
              Key: "S"
            }]
          });
        })
        .catch(function(oError) {
          MessageToast.show("cannot fetch the data");
        });
    },

    removeDuplicates: function(originalArray, prop) {
      var newArray = [];
      var lookupObject = {};

      for (var i in originalArray) {
        lookupObject[originalArray[i][prop]] = originalArray[i];
      }

      for (i in lookupObject) {
        newArray.push(lookupObject[i]);
      }
      return newArray;
    },

    /**
     * Convenience method for getting the view model by name.
     * @public
     * @param {string} [sName] the model name
     * @returns {sap.ui.model.Model} the model instance
     */
    getModel: function(sName) {
      return this.getView().getModel(sName);
    },

    /**
     * Convenience method for setting the view model.
     * @public
     * @param {sap.ui.model.Model} oModel the model instance
     * @param {string} sName the model name
     * @returns {sap.ui.mvc.View} the view instance
     */
    setModel: function(oModel, sName) {
      return this.getView().setModel(oModel, sName);
    },

    logOutApp: function(Reload) {
      debugger;
      // this.getOwnerComponent().getModel().setProperty("/ID", "");
      var that = this;
      // var accessToken = that.getView().getModel("local").getProperty("/Authorization");
      var accessToken = that.getView().getModel().getHeaders().Authorization;
      if (accessToken) {
        $.post('/api/Users/logout?access_token=' + accessToken, {})
          .done(function(data, status) {
            that.getView().getModel("local").setProperty("/Authorization", "");

            that.getView().getModel().setHeaders({
              "Authorization": ""
            });
            that.redirectLoginPage("X", Reload);
          })
          .fail(function(xhr, status, error) {
            sap.m.MessageBox.error("Logout failed");
          });

        // that.redirectLoginPage("X", Reload);

      } else {

        that.redirectLoginPage("X", Reload);
      }

    },

    redirectLoginPage: function(logOut, Reload) {
      debugger;
      var that = this;
      var accessToken = that.getView().getModel().getHeaders().Authorization;
      if (logOut == "X" && Reload != "X") {
        // $.post('/api/Users/logout?access_token=' + accessToken, {})
        // 	.done(function(data, status) {
        // 		that.getView().getModel("local").setProperty("/Authorization", "");
        //
        // 		that.getView().getModel().setHeaders({
        // 			"Authorization": ""
        // 		});
        // 		// that.redirectLoginPage("X", Reload);
        // 	})
        // 	.fail(function(xhr, status, error) {
        // 	MessageBox.alert("Logout Successful");
        // 	});
        MessageBox.alert("Logout Successful");
      } else if (Reload != "X") {
        MessageBox.alert("Page expired, please login again!");
      }
      window.top.location.href = "/";
    },

    idleLogout: function() {
      var t;
      var that = this;
      window.onbeforeunload = function() {
        that.logOutApp("X");
      }

      window.onload = resetTimer;
      window.onmousemove = resetTimer;
      window.onmousedown = resetTimer; // catches touchscreen presses as well
      window.ontouchstart = resetTimer; // catches touchscreen swipes as well
      window.onclick = resetTimer; // catches touchpad clicks as well
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
        t = setTimeout(yourFunction, 3600000); // time is in milliseconds
      }

    },
    /**
     * Getter for the resource bundle.
     * @public
     * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
     */
    getResourceBundle: function() {
      return this.getOwnerComponent().getModel("i18n").getResourceBundle();
    },

    /**
     * Handler for the Avatar button press event
     * @public
     */
    onAvatarPress: function() {
      var sMessage = this.getResourceBundle().getText("avatarButtonMessageToastText");
      MessageToast.show(sMessage);
    },

    /**
     * React to FlexibleColumnLayout resize events
     * Hides navigation buttons and switches the layout as needed
     * @param {sap.ui.base.Event} oEvent the change event
     */
    onStateChange: function(oEvent) {
      /*var sLayout = oEvent.getParameter("layout"),
      				iColumns = oEvent.getParameter("maxColumnsCount");
      			if (iColumns === 1) {
      				this.getModel("appView").setProperty("/smallScreenMode", true);
      			} else {
      				this.getModel("appView").setProperty("/smallScreenMode", false);
      				// swich back to two column mode when device orientation is changed
      				if (sLayout === "OneColumn") {
      					this._setLayout("Two");
      				}
      			}*/
    },

    /**
     * Sets the flexible column layout to one, two, or three columns for the different scenarios across the app
     * @param {string} sColumns the target amount of columns
     * @private
     */
    _setLayout: function(sColumns) {
      if (sColumns) {
        this.getModel("local").setProperty("/layout", sColumns + "Column" + (sColumns === "One" ? "" : "sMidExpanded"));
      }
    },

    /**
     * Apparently, the middle page stays hidden on phone devices when it is navigated to a second time
     * @private
     */
    _unhideMiddlePage: function() {

      // TODO: bug in sap.f router, open ticket and remove this method afterwards
      setTimeout(function() {
        this.getOwnerComponent().getRootControl().getContent()[0].getPages()[1].byId("layout").getCurrentMidColumnPage().removeStyleClass(
          "sapMNavItemHidden");
      }.bind(this), 0);
    },

    /**
     * Navigates back in browser history or to the home screen
     */
    onBack: function() {
      this._unhideMiddlePage();
      var oHistory = History.getInstance();
      var oPrevHash = oHistory.getPreviousHash();
      if (oPrevHash !== undefined) {
        window.history.go(-1);
      } else {
        this.getRouter().navTo("categories");
      }
    },

    handleGoldValidation: function(oValue) {
      var oGold1 = parseFloat(oValue, 10);
      if ((oGold1 < 30000 ||
          oGold1 > 80000) && oGold1 > 0) {
        var valid = false;
        return valid;
      } else {
        var valid = true;
        return valid;
      }

    },

    handleSilverValidation: function(oValue) {
      var oSilver1 = parseFloat(oValue, 10);
      if ((oSilver1 < 30000 ||
          oSilver1 > 110000) && oSilver1 > 0) {
        var valid = false;
        return valid;
      } else {
        var valid = true;
        return valid;
      }

    },

    /**
     * Called, when the add button of a product is pressed.
     * Saves the product, the i18n bundle, and the cart model and hands them to the <code>addToCart</code> function
     * @public
     */
    onAddToCart: function() {
      var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
      var oEntry = arguments[0].getSource().getBindingContext().getObject();
      var oCartModel = this.getView().getModel("cartProducts");
      cart.addToCart(oResourceBundle, oEntry, oCartModel);
    },
    generateInvoiceWithOrderId(orderId) {
      if (!orderId) {
        MessageBox.error("Invalid Order Id");
        return;
      }
      var that = this;
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
        orderNo: "N/A",
        remarks: "N/A",
        items: [],
        IGST: "NONE",
        fullAmount: 9999,
        order_number: "NONE",
        paymentMode: "NONE",
        IsWallet: true,
        header: {
          company_name: "MANGALAM",
          company_logo: "",
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
      this.getView().setBusy(true);
      $.ajax({
        type: 'GET', // added,
        url: 'loadInvoiceDataByOrderId?OrderId=' + orderId,
        success: function(data) {
          invoiceDetail.items = data.InvoiceItems;
          invoiceDetail.orderNo = data.InvoiceNo;
          invoiceDetail.header.company_logo = data.Logo;
          that.downloadInvoice(invoiceDetail);
          that.getView().setBusy(false);
        },
        error: function(xhr, status, error) {
          sap.m.MessageToast.show("error in fetching data");
        }
      });
    },
    downloadInvoice: function(invoiceDetail) {

      let header = (doc, invoice) => {

        if (this.logo) {
          doc.image(invoice.header.company_logo, 205, 35, {
              width: 200
            })
            .fontSize(10);
          doc.moveDown();
        } else {
          doc.fontSize(20)
            .text(invoice.header.company_name, 245, 45)
            .fontSize(10)
            .moveDown()
        }
      }

      let customerInformation = (doc, invoice) => {
        doc
          .fillColor("#444444")
          .fontSize(20);

        const customerInformationTop = 130;

        doc.fontSize(10)
          .font("Helvetica-Bold")
          .text("Order No:", 30, customerInformationTop - 20)
          .font("Helvetica")
          .text(invoice.orderNo, 90, customerInformationTop - 20)
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
          .text("Remarks:", 30, customerInformationTop + 108)
          .font("Helvetica")
          .text(invoice.remarks, 150, customerInformationTop + 108)

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
          "GRS-STN",
          "NET WT",
          "KT",
          "SIZE",
          "PCS",
          "AMOUNT",
          "FINE",
          "TOTAL",
          "IMG"
        );
        generateHr(doc, invoiceTableTop + 15);
        doc.font("Helvetica");
        var totalAmount = 0;
        var totalGST = 0;
        var total_amount = 0;
        var total_fine = 0;
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
            item.GROSS_WT + '-' + item.STONE_WT,
            item.NET_WT,
            item.KT,
            item.SIZE,
            item.PCS,
            item.AMOUNT,
            item.FINE,
            item.TOTAL,
            item.IMG
          );
          total_amount += parseFloat(item.TOTAL);
          total_fine += parseFloat(item.FINE);
          total_net_wt += parseFloat(item.NET_WT);
          generateHr(doc, position += 65);
          // totalAmount += parseFloat(item.Amount);
          if (invoice.items.length - 1 === i || (i === 3 && invoiceTableTop === 260) || (i - 3) % 5 === 0) {
            generateVr(doc, 30, invoiceTableTop - 5, position);
            generateVr(doc, 45, invoiceTableTop - 5, position);
            generateVr(doc, 95, invoiceTableTop - 5, position);
            generateVr(doc, 150, invoiceTableTop - 5, position);
            generateVr(doc, 200, invoiceTableTop - 5, position);
            generateVr(doc, 230, invoiceTableTop - 5, position);
            generateVr(doc, 260, invoiceTableTop - 5, position);
            generateVr(doc, 285, invoiceTableTop - 5, position);
            generateVr(doc, 340, invoiceTableTop - 5, position);
            generateVr(doc, 390, invoiceTableTop - 5, position);
            generateVr(doc, 445, invoiceTableTop - 5, position);
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
          "-",
          total_net_wt.toFixed(3),
          "-",
          "-",
          "-",
          "-",
          total_fine.toFixed(3),
          parseInt(total_amount),
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
        gross_stone,
        net_wt,
        kt,
        size,
        pcs,
        amount,
        fine,
        total,
        img
      ) => {
        doc
          .fontSize(10)
          .text(sr, 30, y, {
            width: 10,
            align: "center"
          })
          .text(code, 45, y, {
            width: 50,
            align: "center"
          })
          .text(gross_stone, 95, y, {
            width: 55,
            align: "center"
          })
          .text(net_wt, 150, y, {
            width: 50,
            align: "center"
          })
          .text(kt, 200, y, {
            width: 30,
            align: "center"
          })
          .text(size, 230, y, {
            width: 30,
            align: "center"
          })
          .text(pcs, 260, y, {
            width: 25,
            align: "center"
          })
          .text(amount, 285, y, {
            width: 55,
            align: "center"
          })
          .text(fine, 340, y, {
            width: 50,
            align: "center"
          })
          .text(total, 390, y, {
            width: 55,
            align: "center"
          });
        if (!img.includes("base64")) {
          doc.text(img, 445, y, {
            width: 125,
            align: "center"
          });
        } else {
          doc.image(img, 445, y - 50, {
            width: 120,
            height: 100,
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
          downloadLink.download = invoice.orderNo;
          downloadLink.click();
        });
      }
      niceInvoice(invoiceDetail);
    }
  });
});
