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
      var orFilter = [];
      debugger;
      //read categories selected
      var aItems = oView.byId("gridList").getItems();
      for (var i = 0; i < aItems.length; i++) {
        if (aItems[i].hasStyleClass("colorGreen")) {
          aFilter.push(new Filter("Category", FilterOperator.EQ,
            aItems[i].getContent()[0].getItems()[0].getItems()[0].getText()
          ));
        }
      }
      if (aFilter.length > 0) {
        orFilter.push(new Filter(aFilter, false));
        aFilter = [];
      }
      //read sub categories
      // var aItems2 = this.getView().getParent().getParent().getBeginColumnPages()[0].getContent()[0].getContent()[0].getItems();
      // for (var i = 0; i < aItems2.length; i++) {
      //   if (aItems2[i].hasStyleClass("colorGreen")) {
      //     aFilter.push(new Filter("SubCategory", FilterOperator.EQ,
      //       aItems2[i].getLabel()
      //     ));
      //   }
      // }
      if (this.styleFilter.length > 0) {
        orFilter.push(new Filter(aFilter, false));
        // aFilter = [];
      }
      // read range Value low and high
      var aRange = oView.byId("range").getRange();
      aFilter.push(new Filter("GrossWeight", FilterOperator.BT, aRange[0], aRange[1]));

      orFilter.push(new Filter(aFilter));
      aFilter = [];

      aFilter.push(new Filter("ProdStatus", FilterOperator.EQ, "A"));

      orFilter.push(new Filter(aFilter));
      // aFilter = [];
      //read the type
      // if (oView.byId("togPlain").getPressed()) {
      //   aFilter.push(new Filter("Type", FilterOperator.EQ, "P"));
      // }
      // if (oView.byId("togStudded").getPressed()) {
      //   aFilter.push(new Filter("Type", FilterOperator.EQ, "S"));
      // }
      if (this.typeFilter.length > 0) {
        orFilter.push(new Filter(aFilter, false));
        // aFilter = [];
      }
      if (this.karatFilter.length > 0) {
        orFilter.push(new Filter(aFilter, false));
        // aFilter = [];
      }
      var oFilter = new Filter({
        filters: orFilter,
        and: true
      });
      //set filter
      this.getOwnerComponent().getModel("local").setProperty("/searchFilter", oFilter);

      this.getRouter().navTo("productSearch");

    },
    onClear: function() {

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
    },
    onNavButtonPress: function() {
      this.oRouter.navTo("CustomerLanding");
    }
  });
});
