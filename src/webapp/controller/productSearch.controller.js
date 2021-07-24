sap.ui.define([
  "sap/ui/demo/cart/controller/BaseController",
  "sap/ui/demo/cart/model/formatter",
  "sap/ui/Device",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/m/MessageToast",
  "sap/ui/model/json/JSONModel",
  "sap/ui/core/Fragment",
  "sap/m/Image",
  "sap/m/Dialog",
  "sap/m/Carousel",
  "sap/m/Button",
  "sap/m/MessageBox",
  "sap/m/SelectDialog"
], function(
  BaseController,
  formatter,
  Device,
  Filter,
  FilterOperator,
  MessageToast,
  JSONModel,
  Fragment,
  Image, Dialog, Carousel, Button, MessageBox, SelectDialog) {
  "use strict";

  return BaseController.extend("sap.ui.demo.cart.controller.productSearch", {
    formatter: formatter,
    onInit: function() {
      debugger;
      this._oRouter = this.getOwnerComponent().getRouter();
      //this._oRouter.getRoute("productSearch").attachMatched(this._onRouteMatched, this);
      this._oRouter.getRoute("productSearch").attachMatched(this._onRouteMatched, this);
      this._oLocalModel = this.getOwnerComponent().getModel("local");
      this.oBtns = [];
    },
    _onRouteMatched: function(oEvent) {
      //if previous route is search then only we search
      var oList = this.getView().byId("gridList");
      if (this._oLocalModel.getProperty("/searchFlag")) {
        oList.getBinding("items");
        var searchFilter = this._oLocalModel.getProperty("/searchFilter");
        oList.getBinding("items").filter(searchFilter);
        this.loadedWeights = [];
        // oList.bindItems({
        // 	path : '/Products',
        // 	parameters: {
        //      expand: "ToPhotos",
        // 		 top: 1
        //   }
        // });
        oList.attachUpdateFinished(this.counter, this);
        this._oLocalModel.setProperty("/searchFlag", false);
      }
      var cartItems = this._oLocalModel.getProperty("/cartItems");
      oList.getItems().forEach((item) => {
        item.getContent()[2].getItems()[0].setType(formatter.isInCart(item.getBindingContextPath().split("'")[1], cartItems) ? "Emphasized" : "Default");
      });
    },
    onGridView: function(oEvent) {
      var oControl = this.getView().byId("gridList");
      if (oControl.getCustomLayout().getBoxWidth() === "19.5%") {
        oControl.getCustomLayout().setBoxWidth("32.6%");
        oControl.getItems().forEach(function(item) {
          item.getContent()[1].setHeight("22rem");
          item.getContent()[1].getItems()[0].setHeight("22rem");
        });
        oEvent.getSource().setType("Emphasized");
      } else {
        oControl.getCustomLayout().setBoxWidth("19.5%");
        oControl.getItems().forEach(function(item) {
          item.getContent()[1].setHeight("15rem");
          item.getContent()[1].getItems()[0].setHeight("15rem");
        });
        oEvent.getSource().setType("Default")
      }
    },
    counter: function(oEvent) {
      // debugger;
      var items = oEvent.getSource().getItems();
      var oLocal = this.getView().getModel("local");
      var oDataModel = this.getView().getModel();
      for (var i = 0; i < items.length; i++) {
        var sPath = items[i].getBindingContextPath();
        var picsSize = oDataModel.getProperty(sPath + "/ToPhotos");
        // for (var i = 0; i < picsSize.length; i++) {
        // 		var sImage = sPath + "/ToPhotos/" + i + "/Content" ;
        // 	var sUrl = formatter.getImageUrlFromContent(oDataModel.getProperty(sImage));
        //   if(!this.allImageURLs[sImage]){
        // 	 	 this.allImageURLs[sImage] =  sUrl;
        //  }
        // }
        var sImage = sPath + "/ToPhotos/0/Content";
        var sBase64 = oDataModel.getProperty(sImage);
        var sUrl = formatter.getImageUrlFromContent(sBase64);
        if (!this.allImageURLs[sImage]) {
          this.allImageURLs[sImage] = {
            sUrl,
            sBase64
          };
        }

        if (picsSize.length > 1) {
          var sImage = sPath + "/ToPhotos/1/Content";
          var sBase64 = oDataModel.getProperty(sImage);
          var sUrl = formatter.getImageUrlFromContent(sBase64);
          if (!this.allImageURLs[sImage]) {
            this.allImageURLs[sImage] = {
              sUrl,
              sBase64
            };
          }
        }

        if (picsSize.length > 2) {
          var sImage = sPath + "/ToPhotos/2/Content";
          var sBase64 = oDataModel.getProperty(sImage);
          var sUrl = formatter.getImageUrlFromContent(sBase64);
          if (!this.allImageURLs[sImage]) {
            this.allImageURLs[sImage] = {
              sUrl,
              sBase64
            };
          }
        }
        if (picsSize.length > 3) {
          var sImage = sPath + "/ToPhotos/3/Content";
          var sBase64 = oDataModel.getProperty(sImage);
          var sUrl = formatter.getImageUrlFromContent(sBase64);
          if (!this.allImageURLs[sImage]) {
            this.allImageURLs[sImage] = {
              sUrl,
              sBase64
            };
          }
        }
        if (picsSize.length > 4) {
          var sImage = sPath + "/ToPhotos/4/Content";
          var sBase64 = oDataModel.getProperty(sImage);
          var sUrl = formatter.getImageUrlFromContent(sBase64);
          if (!this.allImageURLs[sImage]) {
            this.allImageURLs[sImage] = {
              sUrl,
              sBase64
            };
          }
        }
        //items[i].setIcon(sUrl);
        items[i].getContent()[1].getItems()[0].setSrc(sUrl);
        if (oEvent.getSource().getCustomLayout().getBoxWidth() === "19.5%") {
          items[i].getContent()[1].setHeight("15rem");
          items[i].getContent()[1].getItems()[0].setHeight("15rem");
        }
      }
    },
    onImageOut: function(oEvent) {
      var sPath = oEvent.getSource().getParent().getParent().getBindingContextPath();
      var sImage = sPath + "/ToPhotos/1/Content";
      if (this.allImageURLs[sImage]) {
        oEvent.getSource().setSrc(this.allImageURLs[sImage].sUrl);
      }
    },
    onImageIn: function(oEvent) {
      var sPath = oEvent.getSource().getParent().getParent().getBindingContextPath();
      var sImage = sPath + "/ToPhotos/0/Content";
      oEvent.getSource().setSrc(this.allImageURLs[sImage].sUrl);
    },
    addProductToCart: function(id, productRec, allSelectedWeights, PictureUrl, oBtn) {
      var cartItems = this.getOwnerComponent().getModel("local").getProperty("/cartItems");
      var cartItem = {};
      cartItem.id = id;
      cartItem.Name = productRec.Name;
      cartItem.ProductId = productRec.id;
      cartItem.Code = productRec.ProductId;
      cartItem.Tunch = productRec.Tunch;
      cartItem.Wastage = productRec.Wastage;
      cartItem.Karat = productRec.Karat;
      cartItem.Category = productRec.Category;
      cartItem.SubCategory = productRec.SubCategory;
      cartItem.ApproverId = productRec.CreatedBy;
      cartItem.PictureUrl = PictureUrl;
      for (var i = 0; i < allSelectedWeights.length; i++) {
        cartItem.GrossWeight = allSelectedWeights[i].GrossWeight;
        cartItem.LessWeight = allSelectedWeights[i].LessWeight;
        cartItem.PairSize = allSelectedWeights[i].PairSize;
        cartItem.NetWeight = allSelectedWeights[i].NetWeight;
        cartItem.Amount = allSelectedWeights[i].Amount;
        cartItem.MoreAmount = allSelectedWeights[i].MoreAmount;
        cartItem.Piece = allSelectedWeights[i].Piece;
        cartItem.WeightId = allSelectedWeights[i].id;
        // this.getOwnerComponent().getModel("local").getProperty("/oCartBtns")[cartItem.ProductId] = oBtn;
        cartItems.push(JSON.parse(JSON.stringify(cartItem)));
      }
      this.getOwnerComponent().getModel("local").setProperty("/cartItems", cartItems);
      this.calculateOrderEstimate();
    },
    removeProductFromCart: function(productRec, selectedWeights) {
      var cartItems = this.getOwnerComponent().getModel("local").getProperty("/cartItems");
      for (var i = 0; i < cartItems.length; i++) {
        if (cartItems[i].WeightId === selectedWeights.id) {
          cartItems.splice(i, 1);
          break;
        }
      }
      this.getOwnerComponent().getModel("local").setProperty("/cartItems", cartItems);
    },
    selectedWeights: function(oEvent) {
      var allSelectedWeights = [];
      var selectedItems = oEvent.getParameter("selectedItems");
      var mainProduct = this.oBtn.getParent().getModel().getProperty(this.sPath);
      if (selectedItems.length > 0) {
        for (var i = 0; i < selectedItems.length; i++) {
          var selectedWeight = selectedItems[i].getModel().getProperty(selectedItems[i].getBindingContextPath());
          var addedWeights = this.getOwnerComponent().getModel("local").getProperty("/addedWeights");
          addedWeights.push(selectedWeight);
          this.getOwnerComponent().getModel("local").setProperty("/addedWeights", addedWeights);
          allSelectedWeights.push(selectedWeight);
        }
      }

      this.addProductToCart(mainProduct, allSelectedWeights, this.allImageURLs[this.sPath + "/ToPhotos/0/Content"]);

    },
    loadedWeights: [],
    closeWeights: function() {
      this.oDialog.close();
    },
    onAddToCart: function(oEvent) {
      var oBtn = oEvent.getSource();
      //get binding path of parent list item
      var sPath = oBtn.getParent().getBindingContext().getPath();
      this.oBtn = oBtn;
      this.sPath = sPath;
      var that = this;
      this.loadProdWeights(sPath.split("'")[sPath.split("'").length - 2]).
      then(function(data) {
        var tempLoaded = data.ProdWeights;
        var addedWeights = that.getOwnerComponent().getModel("local").getProperty("/addedWeights");
        var cartItems = that.getOwnerComponent().getModel("local").getProperty("/cartItems");
        if (oBtn.getType() === "Emphasized") {
          for (var j = 0; j < addedWeights.length; j++) {
            if (tempLoaded[0].id === addedWeights[j].id) {
              addedWeights.splice(j, 1);
              // oBtn.setType("Default");
              break;
            }
          }
          for (var j = 0; j < cartItems.length; j++) {
            if (tempLoaded[0].id === cartItems[j].WeightId) {
              that.ODataHelper.callOData(that.getOwnerComponent().getModel(),
                  "/CartItems('" + cartItems[j].id + "')", "DELETE", {}, {}, that)
                .then(function(data) {
                  cartItems.splice(j, 1);
                  oBtn.setType("Default");
                  MessageToast.show("Removed from cart");
                }).catch(function(oError) {
                  MessageBox.error("Error while deleting cart item");
                });
              break;
            }
          }
        } else {
          oBtn.setType("Emphasized");
          var allSelectedWeights = [tempLoaded[0]];
          var mainProduct = that.oBtn.getParent().getModel().getProperty(that.sPath);
          var addedWeights = that.getOwnerComponent().getModel("local").getProperty("/addedWeights");
          addedWeights.push(allSelectedWeights[0]);
          that.getOwnerComponent().getModel("local").setProperty("/addedWeights", addedWeights);
          var cartItemPayload = {
            Material: mainProduct.id,
            ProductCode: mainProduct.ProductId,
            WeightId: addedWeights[0].id,
            Quantity: 1
          };
          that.ODataHelper.callOData(that.getOwnerComponent().getModel(),
              "/CartItems", "POST", {}, cartItemPayload, that)
            .then(function(data) {
              MessageToast.show("Added to cart");
              that.addProductToCart(data.id, mainProduct, allSelectedWeights, that.allImageURLs[that.sPath + "/ToPhotos/0/Content"], oBtn);
            }).catch(function(oError) {
              MessageBox.error("Error while saving cart item");
            });
        }
      });
      // }
      // else {
      //   var tempLoaded = JSON.parse(JSON.stringify(this.loadedWeights[sPath]));
      //   var addedWeights = this.getOwnerComponent().getModel("local").getProperty("/addedWeights");
      //   var cartItems = this.getOwnerComponent().getModel("local").getProperty("/cartItems");
      //   if (oBtn.getType() === "Emphasized") {
      //     for (var j = 0; j < addedWeights.length; j++) {
      //       if (tempLoaded[0].id === addedWeights[j].id) {
      //         addedWeights.splice(j, 1);
      //         oBtn.setType("Default");
      //         break;
      //       }
      //     }
      //     for (var j = 0; j < cartItems.length; j++) {
      //       if (tempLoaded[0].id === cartItems[j].WeightId) {
      //         cartItems.splice(j, 1);
      //         MessageToast.show("Removed to cart");
      //         oBtn.setType("Default");
      //         break;
      //       }
      //     }
      //   } else {
      //     oBtn.setType("Emphasized");
      //     var allSelectedWeights = [tempLoaded[0]];
      //     var mainProduct = that.oBtn.getParent().getModel().getProperty(that.sPath);
      //     var addedWeights = that.getOwnerComponent().getModel("local").getProperty("/addedWeights");
      //     addedWeights.push(allSelectedWeights[0]);
      //     that.getOwnerComponent().getModel("local").setProperty("/addedWeights", addedWeights);
      //     that.addProductToCart(mainProduct, allSelectedWeights, that.allImageURLs[that.sPath + "/ToPhotos/0/Content"], oBtn);
      //     MessageToast.show("Added to cart");
      //   }
      // }
    },
    handleFavoritePress: function(oEvent) {
      var oBtn = oEvent.getSource();
      var that = this;
      this.loadProdWeights(this.onMoreBtnsPath.split("'")[this.onMoreBtnsPath.split("'").length - 2]).
      then(function(data) {
        that._oLocalModel.setProperty("/ProdWeights", data.ProdWeights);
        // oBtn.setType("Emphasized");
        // oBtn.setEnabled(false);
        var allSelectedWeights = [data.ProdWeights[0]];
        var mainProduct = oBtn.getParent().getModel().getProperty(that.onMoreBtnsPath);
        var addedWeights = that.getOwnerComponent().getModel("local").getProperty("/addedWeights");
        addedWeights.push(allSelectedWeights[0]);
        that.getOwnerComponent().getModel("local").setProperty("/addedWeights", addedWeights);
        var cartItemPayload = {
          Material: mainProduct.id,
          ProductCode: mainProduct.ProductId,
          WeightId: addedWeights[0].id
        };
        that.ODataHelper.callOData(that.getOwnerComponent().getModel(),
            "/FavoriteItems", "POST", {}, cartItemPayload, that)
          .then(function(data) {
            oBtn.setText("Remove Favorite");
            MessageToast.show("Added to favorites");
          }).catch(function(oError) {
            MessageBox.error("Error while saving favorite item");
          });
      });
    },
    onMore: function(oEvent) {
      // debugger;
      var oButton = oEvent.getSource(),
        oView = this.getView();
      this.onMoreBtnsPath = oButton.getParent().getBindingContext().getPath();
      // create popover
      if (!this._pPopover) {
        this._pPopover = Fragment.load({
          id: oView.getId(),
          name: "sap.ui.demo.cart.fragments.ProductPopover",
          controller: this
        }).then(function(oPopover) {
          oView.addDependent(oPopover);
          return oPopover;
        });
      }
      this._pPopover.then(function(oPopover) {
        // oPopover.bindElement(sPath);
        oPopover.openBy(oButton);
      });
    },
    handleExpandPress: function(oEvent) {
      this.onImageOpen(this.onMoreBtnsPath);
    },
    onCartClick: function(oEvent) {
      this.getRouter().navTo("checkout");
    },
    getGridItemById: function(productId) {
      var gridList = this.getView().byId("gridList").getItems();
      for (var i = 0; i < gridList.length; i++) {
        if (gridList[i].getBindingContextPath().indexOf(productId) != -1) {
          return gridList[i];
        }
      }
    },
    getButtonInsideGrid: function(productId) {
      var oItem = this.getGridItemById(productId);
      return oItem.getContent()[2].getItems()[0];
    },
    alldeleted: [],
    onCartItemDelete: function(oEvent) {
      var oObj = oEvent.getParameter("listItem").getModel("local").getProperty(oEvent.getParameter("listItem").getBindingContextPath());
      var productId = oObj.id;
      this.removeProductFromCart(oObj);
      var oBtn = this.getButtonInsideGrid(productId);
      oBtn.setIcon("sap-icon://cart-3");
      oBtn.setType("Default");
      oBtn.setPressed(false);
    },
    onOrder: function() {
      MessageToast.show("Order has been sent for approval, please check your email!");
    },
    onCloseCart: function() {
      this._oPopoverCart.close();
    },
    afterCartClose: function() {
      this._oPopoverCart.destroy();
      this._oPopoverCart = null;
    },
    onProduct: function(oEvent) {
      var sIndex = oEvent.getSource().getBindingContext().sPath.split("Products")[1];
      this.getRouter().navTo("product", {
        key: sIndex
      });
      var oBtn = oEvent.getSource().getParent().getParent().getContent()[2].getItems()[0];
      this.getOwnerComponent().getModel("local").getProperty("/oCartBtns")[sIndex.split("'")[1]] = oBtn;
    },
    onImageOpen: function(sPath) {
      // var sPath = oEvent.getSource().getParent().getBindingContext().getPath();
      var aImages = [];
      for (var i = 0; i < 5; i++) {
        var sImage = sPath + "/ToPhotos/" + i + "/Content";
        if (this.allImageURLs[sImage]) {
          aImages.push(new Image({
            src: this.allImageURLs[sImage].sUrl
          }));
        }
      }
      // if(!this.allImageURLs[sImage]){
      // 	 this.allImageURLs[sImage] =  sUrl;
      // }
      // if (!this.pressDialog) {
      this.pressDialog = new Dialog({
        // title: "Available Images",
        // stretch: true,
        // contentHeight: "110%",
        contentWidth: "75%",
        resizable: true,
        showHeader: false,
        draggable: true,
        content: new Carousel({
          pages: aImages
        }),
        customHeader: new sap.m.OverflowToolbar({
          design: "Transparent",
          style: "Clear",
          content: [new sap.m.ToolbarSpacer(), new Button({
            type: "Emphasized",
            icon: "sap-icon://decline",
            press: function() {
              this.pressDialog.close();
            }.bind(this)
          })]
        })
        // beginButton: new Button({
        //   type: "Emphasized",
        //   icon : "sap-icon://decline",
        //   press: function() {
        //     this.pressDialog.close();
        //   }.bind(this)
        // })
      });
      //to get access to the global model
      this.getView().addDependent(this.pressDialog);
      // }
      this.pressDialog.open();
      this.pressDialog.setInitialFocus(this.pressDialog.getCustomHeader().getContent()[1])
      // this.pressDialog.setContentHeight("100%");
    },
    onFullScreen: function() {
      this.getRouter().navTo("comparisonCart");
    },
    onSelectProduct: function(oEvent) {
      //popover of product details
      var oButton = oEvent.getSource();
      //get binding path of parent list item
      var sPath = oButton.getParent().getBindingContext().getPath();
      // this.sPath = sPath;
      var that = this;
      // if (!this.loadedWeights[sPath]) {
      //   this.loadProdWeights(sPath.split("'")[sPath.split("'").length - 2])
      //     .then(function(data) {
      //       that.loadedWeights[sPath] = data.ProdWeights;
      //       that.getView().getModel("local").setProperty("/ProdWeights", data.ProdWeights);
      //     });
      // } else {
      //   var tempLoaded = JSON.parse(JSON.stringify(this.loadedWeights[sPath]));
      //   var addedWeights = this.getOwnerComponent().getModel("local").getProperty("/addedWeights");
      //   this.getView().getModel("local").setProperty("/ProdWeights", tempLoaded);
      // }
      // debugger;
      if (!this._oPopover) {
        Fragment.load({
          name: "sap.ui.demo.cart.fragments.productDetails",
          controller: this
        }).then(function(oPopover) {
          this._oPopover = oPopover;
          this.getView().addDependent(this._oPopover);
          this._oPopover.bindElement(sPath);
          this._oPopover.openBy(oButton);
        }.bind(this));
      } else {
        this._oPopover.bindElement({
          path: sPath
        });
        this._oPopover.openBy(oButton);
      }
    },
    handleCloseButton: function() {
      this._oPopover.close();
    },
    onExit: function() {
      if (this._oPopover) {
        this._oPopover.destroy();
      }
    },
    onRefresh: function() {
      // trigger search again and hide pullToRefresh when data ready
      var oProductList = this.byId("gridList");
      var bShowSearchResults = false;
      var oBinding = oProductList.getBinding("items");
      var fnHandler = function() {
        //this.byId("pullToRefresh").hide();
        oBinding.detachDataReceived(fnHandler);
      }.bind(this);
      oBinding.attachDataReceived(fnHandler);

      if (oBinding) {
        if (bShowSearchResults) {
          var oFilter = new Filter("Name", FilterOperator.Contains, oSearchField.getValue());
          oBinding.filter([oFilter]);
        } else {
          oBinding.filter([]);
        }
      }
    },
    /**
     * Always navigates back to category overview
     * @override
     */
    onBack: function() {
      this.getRouter().navTo("categories");
    }
  });
});
