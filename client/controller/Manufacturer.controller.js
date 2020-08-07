sap.ui.define([
  "sap/ui/demo/cart/controller/BaseController",
  "sap/ui/core/UIComponent",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageToast",
  "sap/ui/demo/cart/model/formatter"
], function(BaseController, UIComponent, JSONModel,
  MessageToast, Formatter) {
  "use strict";
  var manufacturerId;
  var changeCheck = 'false';
  var groupID = [];
  return BaseController.extend("sap.ui.demo.cart.controller.Manufacturer", {
    formatter: Formatter,
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
      debugger;
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
      //this.clearScreen();
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
      manufacturerModel.Pattern = "";
      manufacturerModel.Categories = [];
      manufacturerModel.Groups = [];
      viewModel.setProperty("/codeEnabled", true);
      viewModel.setProperty("/buttonText", "Save");
      viewModel.setProperty("/deleteEnabled", false);
      viewModel.setProperty("/blockStatus", false);
      dataModel.setProperty("/groupCodeState", "None");
      dataModel.setProperty("/emailState", "None");
      this.getView().getModel("local").setProperty("/Manufacturer", manufacturerModel);
    },
    manufacturerCheck1: function(code) {
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
          var id = found[0].id;
        }else{
          var id = "";
        }
      }

      return id;

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
          manufacturer.Groups = found[0].Groups;
          manufacturer.Categories = found[0].Categories;
          manufacturer.EmailId = found[0].EmailId;
          manufacturer.Pattern = found[0].Pattern;
          if (found[0].Status === "B") {
            viewModel.setProperty("/blockStatus", true);
          } else if (found[0].Status === "U") {
            viewModel.setProperty("/blockStatus", false);
          }

          if (found[0].id) {
            var oFilter = new sap.ui.model.Filter({
              filters: [
                new sap.ui.model.Filter("ManufacturerId",
                  sap.ui.model.FilterOperator.EQ, found[0].id)
              ]
            });
            this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
                "/ManuGroups", "GET", oFilter, {}, this)
              .then(function(oData) {
                //that.getView().getModel("local").setProperty("/Manufacturer", oData.results[0]);
                 for (var i = 0; i < oData.results.length; i++) {
                   var groupId = oData.results[i].GroupId;
                   var group = getGroupDetail(groupId);
                   debugger;
                   var seletedData = that.getView().getModel("local").getProperty("/groupSelected");
                   that.getView().getModel("local").setProperty("/groupSelected/GroupCode", group[i].groupCode);
                   that.getView().getModel("local").setProperty("/groupSelected/GroupId", group[i].id);
                   that.getView().getModel("local").setProperty("/groupSelected/ManuId", oData.results[i].id);
                   seletedData.GroupCode = group[i].groupCode;
                   seletedData.GroupId = group[i].id;
                   seletedData.ManuId = group[i].oData.results[i].id;
                   var oData = JSON.parse(JSON.stringify(seletedData));
                   groupID.push(oData);
                 }
              })
              .catch(function(oError) {
                // MessageToast.show("Data could not be saved");
              });
          }
         //this.getView().getModel("local").setProperty("/Manufacturer", manufacturer);
          viewModel.setProperty("/buttonText", "Update");
          viewModel.setProperty("/deleteEnabled", true);
          viewModel.setProperty("/codeEnabled", false);
          return found[0].id;
        } else {
          // return false;
        }
      }
    },
    updateGroup: function(oFilter) {
      var that = this;
      this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
          "/ManuGroups", "GET", oFilter, {}, this)
        .then(function(oData) {
          //again update all group codes
          for (var i = 0; i < oData.results.length; i++) {
            that.ODataHelper.callOData(that.getOwnerComponent().getModel(),
                "/ManuGroups('" + oData.results.id + "')", "DELETE ", {}, {}, that)
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
          MessageToast.show("Error in Update");
        });

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
        if (oSaveData.Name && oSaveData.Name !== "") {
          oSaveData.Name = oSaveData.Name.toUpperCase();
        }
        if (oSaveData.Address && oSaveData.Address !== "") {
          oSaveData.Address = oSaveData.Address.toUpperCase();
        }
        if (oSaveData.City && oSaveData.City !== "") {
          oSaveData.City = oSaveData.City.toUpperCase();
        }
        if (oSaveData.EmailId && oSaveData.EmailId !== "") {
          if (Formatter.checkEmail(this.getView().byId("idEmail")) !== true){
            return this.getView().byId("idEmail").setValueState("Error");
          }
        //  oSaveData.EmailId = oSaveData.EmailId.toUpperCase();
        }

        if (viewModel.oData.blockStatus === "true") {
          oSaveData.Status = "B";
        } else {
          oSaveData.Status = "U";
        }
        var id = this.manufacturerCheck1(oSaveData.CustomerCode);
        if (id) {
          var oFilter = new sap.ui.model.Filter({
            filters: [
              new sap.ui.model.Filter("ManufacturerId",
                sap.ui.model.FilterOperator.EQ, id)
            ]
          });
          this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
              "/Manufacturers('" + id + "')", "PUT", {},
              oSaveData, this)
            .then(function(oData) {
              MessageToast.show("Data saved successfully");
              that.UpdateLocalModel();
              that.clearScreen();
            }).catch(function(oError) {
              MessageToast.show("Data could not be saved");
            });
          if (changeCheck === "true") {
            debugger;
            var that = this;
            this.updateGroup(oFilter);
            for (var i = 1; i < groupId.length; i++) {
              var status = that.updateGroupDetails(groupId, i, id);
            }
          }
          //change user status
          if (this.onSwitch === true){
            debugger;
              var changeUserStatus = {
                emailId: oSaveData.EmailId,
                name: oSaveData.Name,
                bStat: viewModel.oData.blockStatus,
                Authorization: this.getModel("local").getProperty("/Authorization")
              };
              this.changeUserStatus(changeUserStatus);
          }

        } else {
          // var manufactureId = [];
          this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
              "/Manufacturers", "POST", {}, oSaveData, this)
            .then(function(oData) {
              debugger;
          /*    var manufactureId = oData.id;
              for (var i = 1; i < groupId.length; i++) {
                debugger;
                var status = that.updateGroupDetails(groupId, i, manufactureId);
              } */
              MessageToast.show("Data saved sucessfully");
              that.clearScreen();
              that._onRouteMatched();
            })
            .catch(function(oError) {
              MessageToast.show("Data could not be saved");
              //that._onRouteMatched();
            });
            //Create new user
            debugger;
              var createUserPayload = {
                name: oSaveData.Name,
                emailId: oSaveData.EmailId,
                role: "Maker",
                Authorization: this.getModel("local").getProperty("/Authorization")
              };
          this.createUserPayload(createUserPayload);

        } //id check
      } else {
        var required = this.getView().byId("idCode");
        required.setValueState("Error");
        required.setValueStateText("Please enter a Code!");
      }
    },
    updateGroupDetails: function(groupId, i, manufactureID) {
      var that = this;
      var manuGroup = this.getView().getModel("local").getProperty("/ManuGroup");
      var oModel = this.getView().getModel();
      if (groupId[i] !== "") {
        manuGroup.ManufacturerId = manufactureID;
        manuGroup.GroupId = groupId[i];
        manuGroup.ChangedBy = "";
        manuGroup.ChangedOn = "";
        manuGroup.CreatedBy = "";
        manuGroup.CreatedOn = "";
        // batchArray.push(
        this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
            "/ManuGroups", "POST", {}, manuGroup, this)
          .then(function(oData) {
            manuGroup.ManufacturerId = "";
            manuGroup.GroupId = "";
            manuGroup.ChangedBy = "";
            manuGroup.ChangedOn = "";
            manuGroup.CreatedBy = "";
            manuGroup.CreatedOn = "";
            MessageToast.show("Data saved successfully");
            that.clearScreen();
            //that._onRouteMatched();
          })
          .catch(function(oError) {
            manuGroup.ManufacturerId = "";
            manuGroup.GroupId = "";
            manuGroup.ChangedBy = "";
            manuGroup.ChangedOn = "";
            manuGroup.CreatedBy = "";
            manuGroup.CreatedOn = "";
            // return false;
            // MessageToast.show("Data could not be saved");
          });
        // );
        // return true;
      }
    },
    onSwitch: function(oEvent) {
      debugger;
      var status = oEvent.getParameters("Selected").state;
      // this.getView().getModel("local").setProperty("/Manufacturer/Block", status);
      return this.onSwitch = true;
    },
  /*  checkEmail: function(oInput) {
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
    },*/
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
    groupCodeCheck: function(oEvent) {
      debugger;
      var input_source = oEvent.getSource();
      changeCheck = 'true';
    },
    CodeCheck: function(oEvent) {
      debugger;
      var text = oEvent.getParameter("newValue");
      var viewModel = this.getView().getModel("viewModel");
    //  var customerId = this.customerCheck(text);
       var manufactureId = this.manufacturerCheck(text);
      this.getView().byId("idName").focus();
    },
    /*onEnter: function(oEvent){
      debugger;
      var that = this;
      var sValue = this.getView().byId("idCode").getValue().toUpperCase();
      this.getView().byId("idCode").setValue(sValue);
      var Filter1 = new sap.ui.model.Filter("CustomerCode", "EQ", sValue);
      this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Manufacturers", "GET", {
          filters: [Filter1]
        }, {}, this)
        .then(function(oData) {
          if (oData.results.length != 0) {
              MessageToast.show("Manufacturer Already Exist");
              that.getView().getModel("local").setProperty("/Manufacturer",oData.results[0]);
        }else{
          MessageToast.show("Create as new Manufacturer");
        }
      });

    },*/
    deleteManufacturer: function(oEvent) {
      debugger;
      var that = this;
      var manufacturerData = this.getView().getModel("local").getProperty("/Manufacturer");
      if (manufacturerData.CustomerCode) {
        var id = this.manufacturerCheck(manufacturerData.CustomerCode);
        if (id) {
          this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
              "/Manufacturers('" + id + "')", "DELETE", {}, {}, this)
            .then(function(oData) {
              debugger;
              var groupId = that.getView().getModel("local").getProperty("/groupSelected");
              //again update all group codes
              for (var i = 0; i < groupId.length; i++) {
                that.ODataHelper.callOData(that.getOwnerComponent().getModel(),
                    "/ManuGroups('" + groupId.ManuId + "')", "DELETE ", {}, {}, that)
                  .then(function(oData) {
                    debugger;
                    // MessageToast.show("Entry deleted sucessfully");
                  })
                  .catch(function(oData) {
                    debugger
                  })
              }
              that.clearScreen();
              that._onRouteMatched();
              MessageToast.show("Entry Deleted Sucessfully");
            })
            .catch(function(oError) {
              that._onRouteMatched();
              MessageToast.show("Could not delete the entry");
            });

          // that.updateGroupDetails(groupId, i, oData);

        }
      }
    },
    onNameEnt: function(oEvent) {
      this.getView().byId("idName").setValue(oEvent.getParameter("value").toUpperCase());
      this.getView().byId("idAddress").focus();
    },
    onAddrEnt: function(oEvent) {
      this.getView().byId("idCity").focus();
    },
    onCityEnt: function(oEvent) {
      this.getView().byId("idContact").focus();
    },
    onContEnt: function(oEvent) {
      this.getView().byId("idgpCode").focus();
    },
    onPatternEnt: function(oEvent) {
      this.getView().byId("idBlock").focus();
    },
    onEmailEnt: function(oEvent) {
      this.getView().byId("idPattern").focus();
    },
    onSelectionFinish:function(){
      debugger;
      this.getView().byId("idCatCode").focus();
    },
    onSelectionFinish1:function(){
      debugger;
      this.getView().byId("idEmail").focus();
    },
    createUserPayload:function(createUserPayload){
      debugger;

      $.post('/createNewUser', createUserPayload)
      .then(function(data){
        debugger;
      })
      .fail(function(error) {
        sap.m.MessageBox.error("User Creation failed");
      });
    },
    changeUserStatus:function(changeUserStatus){
      debugger;

      $.post('/changeUserStatus', changeUserStatus)
      .then(function(data){
        debugger;
      })
      .fail(function(error) {
        sap.m.MessageBox.error("Changing User Status failed");
      });
    },
    UpdateLocalModel:function(data){
      debugger;
        var that = this;
        var code = this.getView().byId("idCode").getValue();
        var manufactureJson = this.getView().getModel("manufactureModelInfo").getData().results;

        function getmanufactureDetail(code) {
          return manufactureJson.filter(
            function(data) {
              return (data.CustomerCode === code);
            });
        }
        if (manufactureJson && manufactureJson.length > 0) {
          var manufactureModelInfo = getmanufactureDetail(code);
          if (manufactureModelInfo.length > 0) {
            var viewModel = this.getView().getModel("viewModel");
            var status = viewModel.getProperty("/blockStatus");
            var omanufacture = this.getView().getModel("local").getProperty("/Manufacturer");

             manufactureModelInfo[0].CustomerCode = omanufacture.CustomerCode;
             manufactureModelInfo[0].Address = omanufacture.Address;
             manufactureModelInfo[0].Name = omanufacture.Name;
             manufactureModelInfo[0].City = omanufacture.City ;
             manufactureModelInfo[0].MobilePhone = omanufacture.MobilePhone;
             manufactureModelInfo[0].EmailId = omanufacture.EmailId;
             manufactureModelInfo[0].Groups = omanufacture.Groups;
             manufactureModelInfo[0].Categories = omanufacture.Categories;
             manufactureModelInfo[0].Pattern = omanufacture.Pattern;
             var group = this.getView().getModel("local").getProperty("/groupSelected");

             debugger;
             if (status === true) {
               manufactureModelInfo[0].Status = "B" ;
             } else if (status === false) {
               manufactureModelInfo[0].Status = "U" ;
             }
           }
          }
        }
  });
});
