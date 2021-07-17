sap.ui.define([
  "sap/ui/demo/cart/controller/BaseController",
  "sap/ui/demo/cart/model/formatter",
  "sap/m/MessageToast",
  "sap/m/Dialog",
  "sap/m/DialogType",
  'sap/ui/model/Filter',
  'sap/ui/model/FilterOperator',
  "sap/m/Button",
  "sap/m/ButtonType",
], function(Controller, formatter, MessageToast, Dialog, DialogType, Filter, FilterOperator, Button, ButtonType) {
  "use strict";

  return Controller.extend("sap.ui.demo.cart.controller.CustomerLanding", {

    /**
     * Called when a controller is instantiated and its View controls (if available) are already created.
     * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
     * @memberOf victoria.view.App
     */
    formatter: formatter,
    onInit: function() {
      this.oRouter = this.getOwnerComponent().getRouter();
      this.oRouter.getRoute("CustomerLanding").attachMatched(this._onRouteMatched, this);
      var oTodayDealData = [{
          "ImageUrl": "https://images-na.ssl-images-amazon.com/images/I/71ILFcQ7NhL._UX569_.jpg",
          "Price": "11,000"
        },
        {
          "ImageUrl": "https://rukminim1.flixcart.com/image/714/857/k0sgl8w0/ring/r/f/d/free-size-rg00448-11-ring-shi-jewellery-original-imafkhqnxmcfqs4y.jpeg?q=50",
          "Price": "15,000"
        },
        {
          "ImageUrl": "https://images-na.ssl-images-amazon.com/images/I/9127fkG4uaL._UL1500_.jpg",
          "Price": "25,000"
        },
        {
          "ImageUrl": "https://images.naptol.com/usr/local/csp/staticContent/product_images/horizontal/750x750/2-Gold-Jewellery-Sets-with-Free-Payal-2.jpg",
          "Price": "30,000"
        },
        {
          "ImageUrl": "https://www.kindpng.com/picc/m/10-101167_earring-png-free-download-earring-gold-jewellery-png.png",
          "Price": "10,000"
        },
        {
          "ImageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQKZubGFg5OFh0QT-BELj7eFKvY81kLJ3S8ZEU-gly_Bx4j5V5JxaUxK5sFODNDy3bLtF4&usqp=CAU",
          "Price": "20,000"
        },
        {
          "ImageUrl": "https://images-eu.ssl-images-amazon.com/images/I/41ujGjbKqWL._SR600%2C315_PIWhiteStrip%2CBottomLeft%2C0%2C35_PIStarRatingTHREE%2CBottomLeft%2C360%2C-6_SR600%2C315_SCLZZZZZZZ_FMpng_BG255%2C255%2C255.jpg",
          "Price": "8,000"
        },
        {
          "ImageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTn-xtc8axJZYlaexrhPMfm6xvkqCXTUQLNNELMDWWK_CPtbWu1E5iyfhOX49ufxqmm9TM&usqp=CAU",
          "Price": "13000"
        },
        {
          "ImageUrl": "https://www.pngjewelers.com/onlinestore/data/ProductImages/img_1668.jpg",
          "Price": "16,000"
        },
        {
          "ImageUrl": "https://1dayprice.com/wp-content/uploads/2018/06/Stainless-Jewellery.jpg",
          "Price": "22,000"
        },
        {
          "ImageUrl": "https://images.naptol.com/usr/local/csp/staticContent/product_images/horizontal/750x750/Shubh-Muhurat-Jewellery-Collection-1.jpg",
          "Price": "40,000"
        },
        {
          "ImageUrl": "https://media.vogue.fr/photos/5c3619d92818ac394465a5aa/master/w_400%2Cc_limit/aur_lie_bidermann1_jpg_3970.jpg%3Flang%3Deng",
          "Price": "15,000"
        },
        {
          "ImageUrl": "https://cdn.shopify.com/s/files/1/0034/4329/4275/products/product-image-778300819_300x.jpg?v=1571960825",
          "Price": "11,000"
        },
        {
          "ImageUrl": "https://imshopping.rediff.com/imgshop/800-1280/shopping/pixs/16405/p/prnk24._pourni-antique-design-and-gorgeous-golden-finish-necklace-with-stunning-earring-for-bridal-jewellery-set-prnk24.jpg",
          "Price": "29,000"
        },
        {
          "ImageUrl": "https://images-na.ssl-images-amazon.com/images/I/61g8WaOsBiL._UL1100_.jpg",
          "Price": "17,000"
        }
      ];
      this.getOwnerComponent().getModel("local").setProperty("/TodayDeal", oTodayDealData);
    },
    _onRouteMatched: function() {
      setInterval(function() {
        sap.ui.getCore().byId("__component0---idCustomerLanding--caro").next()
      }, 4000);
      var oDeviceModel = this.getOwnerComponent().getModel("device");
      var oSystem = oDeviceModel.getData().system;
      if (oSystem.desktop) {
        this.getView().getModel("local").setProperty("/GridItemCount", 10);
      } else if (oSystem.tablet) {
        this.getView().getModel("local").setProperty("/GridItemCount", 5);
      } else if (oSystem.phone) {
        this.getView().getModel("local").setProperty("/GridItemCount", 2);
      } else {
        this.getView().getModel("local").setProperty("/GridItemCount", 2);
      }
      // this.loadCustomCalculation();
      var currentUser = this.getOwnerComponent().getModel("local").getProperty("/CurrentUser");
      var that = this;
      // var oFilter = [new Filter({
      //   path: 'CreatedBy',
      //   operator: FilterOperator.EQ,
      //   value1: "'" + currentUser + "'"
      // })];
      // that.ODataHelper.callOData(that.getOwnerComponent().getModel(),
      //     "/CartItems", "GET", {
      //       filters: oFilter
      //     }, {}, that)
      //   .then(function(data) {
      //     data.results.forEach((item, i) => {
      //       that.loadProdWeights("'" + currentUser + "'").
      //       then(function(data) {
      //         var tempLoaded = data.ProdWeights;
      //         var addedWeights = that.getOwnerComponent().getModel("local").getProperty("/addedWeights");
      //         var cartItems = that.getOwnerComponent().getModel("local").getProperty("/cartItems");
      //         var allSelectedWeights = [tempLoaded[0]];
      //         var mainProduct = that.getView().getModel().getModel().getProperty("/Products('" + item.ProductId + "')");
      //         var addedWeights = that.getOwnerComponent().getModel("local").getProperty("/addedWeights");
      //         addedWeights.push(allSelectedWeights[0]);
      //         that.getOwnerComponent().getModel("local").setProperty("/addedWeights", addedWeights);
      //         that.addProductToCart(item.id, mainProduct, allSelectedWeights);
      //       });
      //     });
      //   }).catch(function(oError) {
      //     debugger;
      //   });

      $.ajax({
        type: 'GET', // added,
        url: 'LastOrderItem?CreatedBy=' + currentUser,
        success: function(data) {
          that.getView().getModel("local").setProperty("/lastOrder", data);
        },
        error: function(xhr, status, error) {
          sap.m.MessageToast.show("error in fetching data");
        }
      });
      $.ajax({
        type: 'GET', // added,
        url: 'LastMonthOrderItems?CreatedBy=' + currentUser,
        success: function(data) {
          that.getView().getModel("local").setProperty("/lastMonthOrders", data);
        },
        error: function(xhr, status, error) {
          sap.m.MessageToast.show("error in fetching data");
        }
      });
      // var currentUser = this.getOwnerComponent().getModel("local").getProperty("/CurrentUser");
      // var that = this;
      // that.getView().setBusy(true);
      $.ajax({
        type: 'GET', // added,
        url: 'LoadCartItems?CreatedBy=' + currentUser,
        success: function(data) {
          var total = 0,
            totalGold = 0;
          that.getView().getModel("local").setProperty("/CustomCalculations", data.customCalculation[0]);
          data.cartItems.forEach((item, i) => {
            total += item.ToWeight.Amount + (item.ToWeight.GrossWeight - item.ToWeight.LessWeight) * (item.ToMaterial.Tunch + item.ToMaterial.Wastage) * (item.ToMaterial.Karat === "222" ? data.customCalculation[0].Gold : data.customCalculation[0].Gold) / 100;
            totalGold += ((item.ToWeight.GrossWeight - item.ToWeight.LessWeight) * (item.ToMaterial.Tunch + item.ToMaterial.Wastage) / 100);
          });
          that.getView().getModel("local").setProperty("/newOrderInCart", {
            FineGold: totalGold.toFixed(3),
            Amount: total.toFixed(2)
          });
          that.addProductToCart(data.cartItems);
          // that.getView().setBusy(false);
        },
        error: function(xhr, status, error) {
          sap.m.MessageToast.show("error in fetching data");
        }
      });
    },
    addProductToCart: function(dataList) {
      var cartItems = [];
      dataList.forEach((item, i) => {
        var cartItem = {};
        cartItem.id = item.id;
        cartItem.Name = item.ToMaterial.Name;
        cartItem.ProductId = item.ToMaterial.id;
        cartItem.Code = item.ToMaterial.ProductId;
        cartItem.Tunch = item.ToMaterial.Tunch;
        cartItem.Wastage = item.ToMaterial.Wastage;
        cartItem.Karat = item.ToMaterial.Karat;
        cartItem.Category = item.ToMaterial.Category;
        cartItem.SubCategory = item.ToMaterial.SubCategory;
        cartItem.ApproverId = item.ToMaterial.CreatedBy;
        cartItem.PictureUrl = {
          sBase64: item.ToMaterial.ToPhotos[0].Content,
          sUrl: formatter.getImageUrlFromContent(item.ToMaterial.ToPhotos[0].Content)
        };
        cartItem.GrossWeight = item.ToWeight.GrossWeight;
        cartItem.LessWeight = item.ToWeight.LessWeight;
        cartItem.PairSize = item.ToWeight.PairSize;
        cartItem.NetWeight = item.ToWeight.NetWeight;
        cartItem.Amount = item.ToWeight.Amount;
        cartItem.WeightId = item.ToWeight.id;
        cartItems.push(JSON.parse(JSON.stringify(cartItem)));
      });
      this.getOwnerComponent().getModel("local").setProperty("/cartItems", cartItems);
      this.calculateOrderEstimate();
    },
    // onMen: function() {
    //   this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
    //   this.oRouter.navTo("categories");
    //   this.getView().getModel("local").setProperty("/CategoryType", "GENTS");
    // },
    onHeaderButton: function(oEvent) {
      var type = oEvent.getSource().getText().toUpperCase();
      this.getView().getModel("local").setProperty("/CategoryType", type);
      this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
      this.oRouter.navTo("categories");
    },
    onCartClick: function(oEvent) {
      this.getRouter().navTo("checkout");
    }
    /**
     * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
     * (NOT before the first rendering! onInit() is used for that one!).
     * @memberOf victoria.view.App
     */
    //	onBeforeRendering: function() {
    //
    //	},

    /**
     * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
     * This hook is the same one that SAPUI5 controls get after being rendered.
     * @memberOf victoria.view.App
     */
    //	onAfterRendering: function() {
    //
    //	},

    /**
     * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
     * @memberOf victoria.view.App
     */
    //	onExit: function() {
    //
    //	}

  });

});
