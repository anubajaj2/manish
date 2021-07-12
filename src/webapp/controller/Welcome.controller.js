sap.ui.define([
  "sap/ui/demo/cart/controller/BaseController",
  "sap/ui/demo/cart/model/cart",
  "sap/ui/model/json/JSONModel",
  "sap/ui/model/Filter",
  "sap/ui/demo/cart/model/formatter",
  "sap/ui/model/FilterOperator",
  "sap/m/Popover",
  "sap/m/Button",
  "sap/m/library"
], function(BaseController, cart, JSONModel, Filter, formatter, FilterOperator, Popover, Button, library) {
  "use strict";
  var ButtonType = library.ButtonType,
    PlacementType = library.PlacementType;
  return BaseController.extend("sap.ui.demo.cart.controller.Welcome", {
    formatter: formatter,
    onGridItemPress: function(oEvent) {
      //alert("ay");
      if (oEvent.getParameter("listItem").hasStyleClass("colorGreen")) {
        oEvent.getParameter("listItem").removeStyleClass("colorGreen");
      } else {
        oEvent.getParameter("listItem").addStyleClass("colorGreen");
      }
      console.log(oEvent.getParameter("listItem").getContent()[0].getItems()[0].getItems()[0].getText());

    },
    styleFilter: [],
    onStyle: function(oEvent) {
      var value = oEvent.getSource().getText();
      if (oEvent.getParameter('selected')) {
        this.styleFilter.push(new Filter("SubCategory", FilterOperator.EQ, value));
      } else {
        for (var i = 0; i < this.styleFilter.length; i++) {
          if (this.styleFilter[i].oValue1 === value) {
            this.styleFilter.splice(i, 1);
          }
        }
      }
    },
    typeFilter: [],
    onType: function(oEvent) {
      var value = oEvent.getSource().getText() === "STUDDED" ? "S" : "P";
      if (oEvent.getParameter('selected')) {
        this.typeFilter.push(new Filter("Type", FilterOperator.EQ, value));
      } else {
        for (var i = 0; i < this.typeFilter.length; i++) {
          if (this.typeFilter[i].oValue1 === value) {
            this.typeFilter.splice(i, 1);
          }
        }
      }
    },
    karatFilter: [],
    onKarat: function(oEvent) {
      var value = oEvent.getSource().getText() === "22KT" ? "222" : "18";
      if (oEvent.getParameter('selected')) {
        this.karatFilter.push(new Filter("Karat", FilterOperator.EQ, value));
      } else {
        for (var i = 0; i < this.karatFilter.length; i++) {
          if (this.karatFilter[i].oValue1 === value) {
            this.karatFilter.splice(i, 1);
          }
        }
      }
    },
    rateFilter: [],
    onRate: function(oEvent) {
      var value = oEvent.getSource().getName().split('-');
      if (oEvent.getParameter('selected')) {
        if (value.length > 1) {
          this.rateFilter.push(new Filter("Wastage", FilterOperator.BT, value[0], value[1]));
        } else {
          this.rateFilter.push(new Filter("Wastage", FilterOperator.GT, value[0]));
        }
      } else {
        for (var i = 0; i < this.rateFilter.length; i++) {
          if (this.rateFilter[i].oValue1 === value[0]) {
            this.rateFilter.splice(i, 1);
          }
        }
      }
    },
    onWeightRange: function(oEvent) {
      var range = oEvent.getParameter("range");
      this.getView().byId("idMinWeight").setValue(range[0]);
      this.getView().byId("idMaxWeight").setValue(range[1]);
    },
    onMinWeight: function(oEvent) {
      this.getView().byId('range').setRange([parseFloat(this.getView().byId("idMinWeight").getValue()), parseFloat(this.getView().byId("idMaxWeight").getValue())])
    },
    onMaxWeight: function(oEvent) {
      this.getView().byId('range').setRange([parseFloat(this.getView().byId("idMinWeight").getValue()), parseFloat(this.getView().byId("idMaxWeight").getValue())])
    },
    onSearch: function() {
      var oView = this.getView();
      var aFilter = [];
      var nFilter = [];
      var orFilter = [];
      //read categories selected
      var aItems = oView.byId("gridList").getItems();
      for (var i = 0; i < aItems.length; i++) {
        if (aItems[i].hasStyleClass("colorGreen")) {
          aFilter.push(new Filter("Category", FilterOperator.EQ,
            aItems[i].getContent()[0].getItems()[0].getItems()[1].getText()
          ));
        } else {
          nFilter.push(new Filter("Category", FilterOperator.EQ,
            aItems[i].getContent()[0].getItems()[0].getItems()[1].getText()
          ));
        }
      }
      if (aFilter.length > 0) {
        orFilter.push(new Filter(aFilter, false));
        aFilter = [];
      } else {
        orFilter.push(new Filter(nFilter, false));
        nFilter = [];
      }
      if (this.styleFilter.length > 0) {
        orFilter.push(new Filter(this.styleFilter, false));
      }
      // read range Value low and high
      var aRange = oView.byId("range").getRange();
      aFilter.push(new Filter("GrossWeight", FilterOperator.BT, aRange[0], aRange[1]));

      orFilter.push(new Filter(aFilter));
      aFilter = [];

      aFilter.push(new Filter("ProdStatus", FilterOperator.EQ, "A"));

      orFilter.push(new Filter(aFilter));

      if (this.typeFilter.length > 0) {
        orFilter.push(new Filter(this.typeFilter, false));
      }
      if (this.karatFilter.length > 0) {
        orFilter.push(new Filter(this.karatFilter, false));
      }
      if (this.rateFilter.length > 0) {
        orFilter.push(new Filter(this.rateFilter, false));
      }
      var oFilter = new Filter({
        filters: orFilter,
        and: true
      });
      //set filter
      this.getOwnerComponent().getModel("local").setProperty("/searchFilter", oFilter);
      this.getOwnerComponent().getModel("local").setProperty("/searchFlag", true);
      this.getRouter().navTo("productSearch");

    },
    onClear: function() {
      debugger;
    },
    onInit: function() {
      this.oRouter = this.getOwnerComponent().getRouter();
      this.oRouter.getRoute("categories").attachMatched(this._onRouteMatched, this);
      // this.loadCategories();
      // setTimeout(this._initLoad.bind(this),1000);
    },
    // _initLoad: function(){
    // 	var oPage = this.getView().byId("myPage");
    // 	var allBtn = this.getOwnerComponent().getModel("local").getProperty("/cat/category");
    // 	for (var i = 0; i < allBtn.length; i++) {
    // 		var text = allBtn[i].Category;
    // 		oPage.addContent(new sap.m.ToggleButton({
    // 			text: text
    //
    // 		}).addStyleClass('class','sapUiResponsiveMargin sapUiLargeMargin sapUiLargePadding'));
    // 	}
    // },
    onSideNavButtonPress: function() {
      var oToolPage = this.byId("toolPage");
      var bSideExpanded = oToolPage.getSideExpanded();

      this._setToggleButtonTooltip(bSideExpanded);

      oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
    },
    _setToggleButtonTooltip: function(bLarge) {
      var oToggleButton = this.byId('sideNavigationToggleButton');
      if (bLarge) {
        oToggleButton.setTooltip('Large Size Navigation');
      } else {
        oToggleButton.setTooltip('Small Size Navigation');
      }
    },
    // handleUserNamePress: function(event) {
    // 	var that = this;
    //   var oPopover = new Popover({
    //     showHeader: false,
    //     placement: PlacementType.Bottom,
    //     content: [
    //       new Button({
    //         text: 'Feedback',
    //         type: ButtonType.Transparent
    //       }),
    //       new Button({
    //         text: 'Help',
    //         type: ButtonType.Transparent
    //       }),
    //       new Button({
    //         text: 'Logout',
    //         type: ButtonType.Transparent,
    // 				press: that.logOutApp()
    //       })
    //     ]
    //   }).addStyleClass('sapMOTAPopover sapTntToolHeaderPopover');
    //
    //   oPopover.openBy(event.getSource());
    // },
    _onRouteMatched: function(oEvent) {
      this.loadCategories();
      var type = this.getView().getModel("local").getProperty("/CategoryType");
      this.getView().byId("gridList").getBinding("items").filter([new Filter("Type", FilterOperator.EQ, type)]);
    },
    onHeaderButton: function(oEvent) {
      var type = oEvent.getSource().getText().toUpperCase();
      this.getView().getModel("local").setProperty("/CategoryType", type);
      this.getView().byId("gridList").getBinding("items").filter([new Filter("Type", FilterOperator.EQ, type)]);
    },
    onCartClick: function(oEvent) {
      this.oRouter.navTo("checkout");
    },
    onNavButtonPress: function() {
      this.oRouter.navTo("CustomerLanding");
    },
    onClear: function() {
      var gridList = this.getView().byId("gridList").getItems();
      gridList.forEach((item) => {
        item.removeStyleClass("colorGreen");
      });
      var style = this.getView().byId("idStyle").getItems();
      style.forEach((item) => {
        item.setSelected(false);
      });
      this.styleFilter = [];
      var weight = this.getView().byId("idWeight").getItems();
      weight[0].setRange([0, 100]);
      weight[1].setValue(0);
      weight[2].setValue(100);
      this.weightFilter = [];
      var type = this.getView().byId("idType").getItems();
      type.forEach((item) => {
        item.setSelected(false);
      });
      this.typeFilter = [];
      var karat = this.getView().byId("idKarat").getItems();
      karat.forEach((item) => {
        item.setSelected(false);
      });
      this.karatFilter = [];
      var rate = this.getView().byId("idRate").getItems();
      rate.forEach((item) => {
        item.setSelected(false);
      });
      this.rateFilter = [];
    }
  });
});
