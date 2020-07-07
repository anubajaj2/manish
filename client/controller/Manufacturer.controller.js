sap.ui.define([
  "sap/ui/demo/cart/controller/BaseController",
  "sap/ui/core/UIComponent",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageToast",
  "sap/ui/demo/cart/model/formatter"
], function(BaseController, UIComponent, JSONModel,
  MessageToast, formatter) {
  "use strict";
  var manufacturerId;
  return BaseController.extend("sap.ui.demo.cart.controller.Manufacturer", {
    formatter: formatter,
    onInit: function() {
      var oViewDetailModel = new JSONModel({
        "buttonText": "Save",
        "deleteEnabled": false,
        "blockStatus": false
      });
      this.setModel(oViewDetailModel, "viewModel");

      var oRouter = this.getRouter();
      oRouter.getRoute("Manufacturer").attachMatched(this._onRouteMatched, this);
      // this._router = UIComponent.getRouterFor(this);
    },
    _onRouteMatched: function(oEvent) {
      debugger;
      var that = this;
      var viewModel = this.getView().getModel("viewModel");
      viewModel.setProperty("/codeEnabled", true);
      viewModel.setProperty("/buttonText", "Save");
      viewModel.setProperty("/deleteEnabled", false);
      viewModel.setProperty("/blockStatus", false);
      var odataModel = new JSONModel({
        "groupCodeState": "None",
        "emailState": "None"
      });
      this.setModel(odataModel, "dataModel");

      this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
          "/Manufacturers", "GET", {}, {}, this)
        .then(function(oData) {
          debugger;
          var oModelManufacturer = new JSONModel();
          oModelManufacturer.setData(oData);
          that.getView().setModel(oModelManufacturer, "manufactureModelInfo");
        }).catch(function(oError) {
          MessageToast.show("cannot fetch the data");
        });

      this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
          "/Groups", "GET", {}, {}, this)
        .then(function(oData) {
          var oModelGroup = new JSONModel();
          oModelGroup.setData(oData);
          that.getView().setModel(oModelGroup, "groupModelCode");
        }).catch(function(oError) {
          MessageToast.show("cannot fetch the data");
        });
      //
      this.clearScreen();
    },
    clearScreen: function() {
      debugger;
      var manufacturerModel = this.getView().getModel("local").getProperty("/Manufacturer");
      var viewModel = this.getView().getModel("viewModel");
      var dataModel = this.getView().getModel("dataModel");
      var group = this.getView().getModel("local").getProperty("/groupSelected");
      group.GroupCode = "";
      group.GroupId = "";
      this.getView().getModel("local").setProperty("/groupSelected", group);
      manufacturerModel.CustomerCode = "";
      manufacturerModel.Name = "";
      manufacturerModel.Address = "";
      manufacturerModel.City = "";
      manufacturerModel.MobilePhone = "";
      manufacturerModel.EmailId = "";
      manufacturerModel.Status = "";
      viewModel.setProperty("/codeEnabled", true);
      viewModel.setProperty("/buttonText", "Save");
      viewModel.setProperty("/deleteEnabled", false);
      viewModel.setProperty("/blockStatus", false);
      dataModel.setProperty("/groupCodeState", "None");
      dataModel.setProperty("/emailState", "None");
      this.getView().getModel("local").setProperty("/Manufacturer", manufacturerModel);
    },
    manufacturerCheck: function(code) {
      debugger;
      var that = this;
      var manufacturerJson = this.getView().getModel("manufactureModelInfo").getData().results;

      function getmanufacturerDetail(code) {
        return manufacturerJson.filter(
          function(data) {
            return (data.CustomerCode === code);
          });
      }
      if (manufacturerJson && manufacturerJson.length > 0) {
        var found = getmanufacturerDetail(code);
        if (found.length > 0) {
          var viewModel = this.getView().getModel("viewModel");
          var status = viewModel.getProperty("/blockStatus");
          var manufacturer = this.getView().getModel("local").getProperty("/Manufacturer");
          manufacturer.CustomerCode = found[0].CustomerCode;
          manufacturer.Address = found[0].Address;
          manufacturer.Name = found[0].Name;
          manufacturer.City = found[0].City;
          manufacturer.MobilePhone = found[0].MobilePhone;
          manufacturer.EmailId = found[0].EmailId;
          if (found[0].Status === "B") {
            viewModel.setProperty("/blockStatus", true);
          } else if (found[0].Status === "U") {
            viewModel.setProperty("/blockStatus", false);
          }
          if (found[0].id) {
            var oFilter = new sap.ui.model.Filter({
              filters: [
                new sap.ui.model.Filter("ManufacturerId",
                  sap.ui.model.FilterOperator.Equals, found[0].id)
              ]
            });
            this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
                "/ManuGroups", "GET", oFilter, {}, this)
              .then(function(oData) {
                debugger;
                var groups = that.getView().getModel("local").getProperty("/groupSelected");
                var groupModelJson = that.getView().getModel("groupModelCode").getData().results;
                var groupID = [];

                function getGroupDetail(groupId) {
                  return groupModelJson.filter(
                    function(data) {
                      return (data.id === groupId);
                    });
                }
                for (var i = 0; i < oData.results.length; i++) {
                  var groupId = oData.results[i].GroupId;
                  var group = getGroupDetail(groupId);
                  that.getView().getModel("local").setProperty("/groupSelected/GroupCode", groups);
                  that.getView().getModel("local").setProperty("/groupSelected/GroupId", groupId);
                  that.getView().getModel("local").setProperty("/groupSelected/ManuId", id);
                }
              })
              .catch(function(oError) {
                // MessageToast.show("Data could not be saved");
              });
          }
          this.getView().getModel("local").setProperty("/Manufacturer", manufacturer);
          viewModel.setProperty("/buttonText", "Update");
          viewModel.setProperty("/deleteEnabled", true);
          viewModel.setProperty("/codeEnabled", false);
          return found[0].id;
        } else {
          // return false;
        }
      }
    },
    saveData: function(oEvent) {
      debugger;
      var that = this;
      var dataModel = this.getView().getModel("dataModel");
      var viewModel = this.getView().getModel("viewModel");
      var manufacturerData = this.getView().getModel("local").getProperty("/Manufacturer");
      var groupId = this.getView().getModel("local").getProperty("/groupSelected/GroupId");
      if (manufacturerData.CustomerCode !== "") {

        var oSaveData = JSON.parse(JSON.stringify(manufacturerData));
        oSaveData.CustomerCode = oSaveData.CustomerCode.toUpperCase();
        oSaveData.Name = oSaveData.Name.toUpperCase();
        oSaveData.Address = oSaveData.Address.toUpperCase();
        oSaveData.City = oSaveData.City.toUpperCase();
        oSaveData.EmailId = oSaveData.EmailId.toUpperCase();
        if (viewModel.oData.blockStatus = true) {
          oSaveData.Status = "B";
        } else {
          oSaveData.Status = "U";
        }
        var id = this.manufacturerCheck(oSaveData.CustomerCode);
        if (id) {

          var oFilter = new sap.ui.model.Filter({
            filters: [
              new sap.ui.model.Filter("ManufacturerId",
                sap.ui.model.FilterOperator.Equals, id)
            ]
          });
          this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
              "/Manufacturers('" + id + "')", "PUT", {},
              oSaveData, this)
            .then(function(oData) {

              that.ODataHelper.callOData(this.getOwnerComponent().getModel(),
                  "/ManuGroups", "GET", oFilter, {}, that)
                .then(function(oData) {
                  //again update all group codes
                  for (var i = 0; i < oData.results.length; i++) {
                    that.ODataHelper.callOData(this.getOwnerComponent().getModel(),
                        "/ManuGroups('" + oData.results.id + "')", "DELETE ", {}, {}, that)
                      .then(function(oData) {
                        debugger;
                        MessageToast.show("Entry deleted sucessfully");
                      })
                      .catch(function(oData) {
                        debugger
                      })
                  }
                  debugger;
                  // that.updateGroupDetails(groupId, i, oData);
                })
                .catch(function(oError) {
                  that._onRouteMatched();
                  MessageToast.show("Could not delete the entry");
                });

              MessageToast.show("Data saved successfully");
              that._onRouteMatched();
            }).catch(function(oError) {
              MessageToast.show("Data could not be saved");
            });
        } else {
          // var manufactureId = [];
          this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
              "/Manufacturers", "POST", {}, oSaveData, this)
            .then(function(oData) {
              manufacturerId = oData.id;
              var count = 0;
              recursion();
              debugger;
              function recursion() {
                if (count < groupId.length) {
                var return = that.updateGroupDetails(groupId , count , manufacturerId);
                if (return === 'true') {
                  count++;
                  recursion();
                }else {
                  // retr
                }
                }
              }

            })
            .catch(function(oError) {

            });

        } //id check
      } else {
        var required = this.getView().byId("idCode");
        required.setValueState("Error");
        required.setValueStateText("Please enter a Code!");
      }
    },
    updateGroupDetails: function(groupId, i, manufactureID) {
      debugger;
      var manuGroup = this.getView().getModel("local").getProperty("/ManuGroup");
      manuGroup.ManufacturerId = manufactureID;
      manuGroup.GroupId = groupId;
      manuGroup.ChangedBy = "";
      manuGroup.ChangedOn = "";
      manuGroup.CreatedBy = "";
      manuGroup.CreatedOn = "";
      this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
          "/ManuGroups", "POST", {}, manuGroup, this)
        .then(function(oData) {
          manuGroup.ManufacturerId = "";
          manuGroup.GroupId = "";
          manuGroup.ChangedBy = "";
          manuGroup.ChangedOn = "";
          manuGroup.CreatedBy = "";
          manuGroup.CreatedOn = "";
          return true;
          // MessageToast.show("Data saved successfully");
        })
        .catch(function(oError) {
          manuGroup.ManufacturerId = "";
          manuGroup.GroupId = "";
          manuGroup.ChangedBy = "";
          manuGroup.ChangedOn = "";
          manuGroup.CreatedBy = "";
          manuGroup.CreatedOn = "";
          return false;
          MessageToast.show("Data could not be saved");
        });
    },
    onSwitch: function(oEvent) {
      debugger;
      var status = oEvent.getParameters("Selected").state;
      // this.getView().getModel("local").setProperty("/Manufacturer/Block", status);
    },
    checkEmail: function(oInput) {
      if (oInput) {
        var email = oInput.getParameter("newValue");
        var dataModel = this.getView().getModel("dataModel");
        var mailregex = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;
        if (!email.match(mailregex)) {
          dataModel.setProperty("/emailState", "Error");
        } else {
          dataModel.setProperty("/emailState", "None");
          this.getView().getModel("local").setProperty("/Manufacturer/EmailId", email);
        }
      }
    },
    onSelectionChange: function(oEvent) {
      debugger;
      var oSrc = oEvent.getSource();
      var aItems = oSrc.getSelectedItems();
      if (aItems.length > 0) {
        debugger;
        for (var i = 0; i < aItems.length; i++) {

        }
      }
      // this._selectedItems(aItems);
    },
    CodeCheck: function(oEvent) {
      debugger;
      var input_source = oEvent.getSource();
      var id = input_source.getSelectedKey();
      var text = input_source.getSelectedItem().getText();
      var viewModel = this.getView().getModel("viewModel");
      var manufactureId = this.manufacturerCheck(text);
      // if (id) {
      //   this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
      //       "/Manufacturers('" + id + "')", "GET", {},
      //       oSaveData, this)
      //     .then(function(oData) {
      //       var manufacturerData = this.getView().getModel("local").getProperty("/Manufacturer");
      //       var groupId = this.getView().getModel("local").getProperty("/groupSelected/GroupId");
      //       manufacturerData.CustomerCode = oData.result[0];
      //       manufacturerData.Name = oData.result[0];
      //       manufacturerData.Address = oData.result[0];
      //       manufacturerData.City = oData.result[0];
      //       manufacturerData.EmailId = oData.result[0];
      //       if (oData.result[0]) {
      //         viewModel.oData.blockStatus = true;
      //       } else {
      //         viewModel.oData.blockStatus = false;
      //       }
      //       // MessageToast.show("Data saved successfully");
      //       // that._onRouteMatched();
      //     }).catch(function(oError) {
      //       MessageToast.show("Data could not be saved");
      //     });
      // }
      debugger;
      $('#idCode').keypress(function(event) {
        if (event.keyCode == 13) {
          $('#idName').focus();
        }
      });
    },
    deleteManufacturer: function(oEvent) {
      var that = this;
      var manufacturerData = this.getView().getModel("local").getProperty("/Manufacturer");
      if (manufacturerData.CustomerCode) {
        var id = this.manufacturerCheck(manufacturerData.CustomerCode);
        if (id) {
          // debugger;
          // var oFilter = new sap.ui.model.Filter({
          //   filters: [
          //     new sap.ui.model.Filter("ManufacturerId",
          //       sap.ui.model.FilterOperator.Equals, id)
          //   ]
          // });
          this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
              "/Manufacturers('" + id + "')", "DELETE", {}, {}, this)
            .then(function(oData) {
              debugger;

              var groupId = that.getView().getModel("local").getProperty("/groupSelected");
              //again update all group codes
              for (var i = 0; i < groupId.length; i++) {
                that.ODataHelper.callOData(this.getOwnerComponent().getModel(),
                    "/ManuGroups('" + groupId.ManuId + "')", "DELETE ", {}, {}, that)
                  .then(function(oData) {
                    debugger;
                    // MessageToast.show("Entry deleted sucessfully");
                  })
                  .catch(function(oData) {
                    debugger
                  })
              }
            })
            .catch(function(oError) {
              that._onRouteMatched();
              MessageToast.show("Could not delete the entry");
            });

          // that.updateGroupDetails(groupId, i, oData);

        }
      }
    }
  });
});
