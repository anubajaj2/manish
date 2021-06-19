sap.ui.define(["sap/ui/demo/cart/controller/BaseController","sap/ui/core/UIComponent","sap/ui/model/json/JSONModel","sap/m/MessageToast","sap/ui/demo/cart/model/formatter","sap/m/MessageBox","sap/ui/model/Filter","sap/ui/model/FilterOperator","sap/m/SelectDialog","sap/ui/export/library","sap/ui/export/Spreadsheet"],function(e,t,o,r,a,i,l,n,u,d,c){"use strict";var g;var h="false";var p=[];var f=d.EdmType;return e.extend("sap.ui.demo.cart.controller.Customers",{formatter:a,onInit:function(){var e=new o({buttonText:"Save",deleteEnabled:false,blockStatus:false});this.setModel(e,"viewModel");var t=this.getRouter();t.attachRoutePatternMatched(this._onRouteMatched,this)},_onRouteMatched:function(e){var t=this;this.getView().setBusy(true);var a=this.getView().getModel("viewModel");a.setProperty("/codeEnabled",true);a.setProperty("/buttonText","Save");a.setProperty("/deleteEnabled",false);a.setProperty("/blockStatus",false);a.setProperty("/emailStatus",true);var s=new o({groupCodeState:"None",emailState:"None"});this.setModel(s,"dataModel");var i=new o;var l=new o;this.ODataHelper.callOData(this.getOwnerComponent().getModel(),"/Customers","GET",{},{},this).then(function(e){i.setData(e);t.getView().setModel(i,"customerModelInfo");t.getView().setBusy(false)}).catch(function(e){t.getView().setBusy(false);r.show("cannot fetch the data")});this.ODataHelper.callOData(this.getOwnerComponent().getModel(),"/Groups","GET",{},{},this).then(function(e){l.setData(e);t.getView().setModel(l,"groupModelInfo")}).catch(function(e){r.show("cannot fetch the data")});this.clearScreen()},onCustomerFilter:function(e){if(!this.oDialog){var t=this.getView().getModel("customerModelInfo").getProperty("/results");var o=new Set;t.forEach(e=>{if(e.City){o.add(e.City)}});t=[];o.forEach(e=>{t.push({City:e})});this.getView().getModel("customerModelInfo").setProperty("/uniqueCities",t);this.oDialog=new u({title:"Select Cities",multiSelect:true,search:this.searchCity.bind(this),confirm:this.filterConfirm.bind(this),cancel:this.filterCancel.bind(this)});this.getView().addDependent(this.oDialog);this.oDialog.setModel(this.getView().getModel("customerModelInfo"));this.oDialog.bindAggregation("items",{path:"/uniqueCities",template:new sap.m.DisplayListItem({label:"{City}"})});this.oDialog.open()}else{this.oDialog.open()}},searchCity:function(e){var t=e.getParameter("value");var o=new l({path:"City",operator:n.Contains,value1:t});this.oDialog.getBinding("items").filter([o])},filterConfirm:function(e){var t=e.getParameter("selectedItems");var o=[];t.forEach(e=>{o.push(new l({path:"City",operator:n.Contains,value1:e.getLabel()}))});this.getView().byId("customerTable").getBinding("rows").filter(new l({filters:o,and:false}))},filterCancel:function(){this.getView().byId("customerTable").getBinding("rows").filter([])},createColumnConfig:function(){var e=[];e.push({label:"Full name",property:"Name",type:f.String});e.push({label:"Code",type:f.String,property:"CustomerCode"});e.push({label:"City",property:"City",type:f.String});e.push({label:"Address",property:"Address",type:f.String});e.push({label:"Mobile",property:"MobilePhone",type:f.String});e.push({label:"E-mail",property:"EmailId",type:f.String});e.push({label:"Status",property:"Status",type:f.String});return e},onDownloadRetailersData:function(){var e,t,o,r,a;if(!this._oTable){this._oTable=this.byId("customerTable")}a=this._oTable;t=a.getBinding("rows");e=this.createColumnConfig();var s=t.getModel();o={workbook:{columns:e,hierarchyLevel:"Level"},dataSource:{type:"odata",dataUrl:t.getDownloadUrl?t.getDownloadUrl():null,serviceUrl:this._sServiceUrl,headers:s.getHeaders?s.getHeaders():null,count:t.getLength?t.getLength():null,useBatch:true},fileName:"Table export sample.xlsx",worker:false};r=new c(o);r.build().finally(function(){r.destroy()})},clearScreen:function(){var e=this.getView().getModel("local").getProperty("/Customer");var t=this.getView().getModel("viewModel");var o=this.getView().getModel("dataModel");var r=this.getView().getModel("local").getProperty("/groupSelected");r.GroupCode="";r.GroupId="";this.getView().getModel("local").setProperty("/groupSelected",r);this.getView().byId("__component0---Customers--Customer--idgpCode").clearSelection();e.CustomerCode="";e.Name="";e.Address="";e.City="";e.MobilePhone="";e.EmailId="";e.Status="";e.Groups=[];t.setProperty("/codeEnabled",true);t.setProperty("/buttonText","Save");t.setProperty("/deleteEnabled",false);t.setProperty("/blockStatus",false);o.setProperty("/groupCodeState","None");o.setProperty("/emailState","None");this.getView().getModel("local").setProperty("/Customer",e)},onCustomerSearch:function(e){var t=e.getSource().getValue();var o=[new l({path:"CustomerCode",operator:n.Contains,value1:t}),new l({path:"EmailId",operator:n.Contains,value1:t}),new l({path:"Name",operator:n.Contains,value1:t})];e.getSource().getParent().getParent().getBinding("rows").filter(new l({filters:o,and:false}))},CodeCheck:function(e){var t=e.getParameter("newValue");var o=this.getView().getModel("viewModel");var r=this.customerCheck(t);this.getView().byId("__component0---Customers--Customer--idName").focus()},groupCodeCheck:function(e){return h="true"},onSelectionFinish:function(){this.getView().byId("__component0---Customers--Customer--idEmail").focus()},onNameEnt:function(e){this.getView().byId("__component0---Customers--Customer--idName").setValue(e.getParameter("value").toUpperCase());this.getView().byId("__component0---Customers--Customer--idAddress").focus()},onAddrEnt:function(e){this.getView().byId("__component0---Customers--Customer--idCity").focus()},onCityEnt:function(e){this.getView().byId("__component0---Customers--Customer--idContact").focus()},onContEnt:function(e){this.getView().byId("__component0---Customers--Customer--idgpCode").focus()},onEmailEnt:function(e){this.getView().byId("__component0---Customers--Customer--idBlock").focus()},onSwitch:function(){return this.onSwitch=true},customerCheck1:function(e){var t=this;var o=this.getView().getModel("customerModelInfo").getData().results;function r(e){return o.filter(function(t){return t.CustomerCode===e})}if(o&&o.length>0){var a=r(e);if(a.length>0){var s=a[0].id}else{var s=""}}return s},onCustomerSelect:function(e){var t=e.getSource().getRows()[e.getSource().getSelectedIndex()].getCells()[0].getText();this.customerCheck(t)},customerCheck:function(e){var t=this;var o=this.getView().getModel("customerModelInfo").getData().results;function r(e){return o.filter(function(t){return t.CustomerCode===e})}if(o&&o.length>0){var a=r(e);if(a.length>0){var s=this.getView().getModel("viewModel");var i=s.getProperty("/blockStatus");var u=this.getView().getModel("local").getProperty("/Customer");u.CustomerCode=a[0].CustomerCode;u.Address=a[0].Address;u.Name=a[0].Name;u.City=a[0].City;u.MobilePhone=a[0].MobilePhone;u.Groups=a[0].Groups;u.EmailId=a[0].EmailId;if(a[0].Status==="U"){s.setProperty("/blockStatus",true)}else if(a[0].Status==="B"){s.setProperty("/blockStatus",false)}if(a[0].id){var d=new l({filters:[new l("RetailerId",n.EQ,a[0].id)]});this.ODataHelper.callOData(this.getOwnerComponent().getModel(),"/RetailerGroups","GET",d,{},this).then(function(e){var o=t.getView().getModel("local").getProperty("/groupSelected");var r=t.getView().getModel("groupModelCode").getData().results;function a(e){return r.filter(function(t){return t.id===e})}for(var s=0;s<e.results.length;s++){var i=e.results[s].GroupId;var l=a(i);var n=t.getView().getModel("local").getProperty("/groupSelected");t.getView().getModel("local").setProperty("/groupSelected/GroupCode",l[s].groupCode);t.getView().getModel("local").setProperty("/groupSelected/GroupId",l[s].id);t.getView().getModel("local").setProperty("/groupSelected/ManuId",e.results[s].id);n.GroupCode=l[s].groupCode;n.GroupId=l[s].id;n.ManuId=l[s].oData.results[s].id;var e=JSON.parse(JSON.stringify(n));p.push(e)}}).catch(function(e){})}this.getView().getModel("local").setProperty("/Customer",u);s.setProperty("/buttonText","Update");s.setProperty("/deleteEnabled",true);s.setProperty("/codeEnabled",false);s.setProperty("/emailStatus",false);return a[0].id}else{}}},CheckEmailExists:function(e){var t=this;var o=this.getView().getModel("customerModelInfo").getData().results;function r(e){return o.filter(function(t){return t.EmailId===e})}var a=r(e);if(a.length>0){return true}},ValidateCustomerData:function(e){e.CustomerCode=e.CustomerCode.toUpperCase();if(e.Name&&e.Name!==""){e.Name=e.Name.toUpperCase()}if(e.Address&&e.Address!==""){e.Address=e.Address.toUpperCase()}if(e.City&&e.City!==""){e.City=e.City.toUpperCase()}if(e.EmailId&&e.EmailId!==""){if(a.checkEmail(this.getView().byId("__component0---Customers--Customer--idEmail"))!==true){return{status:false,error:"InValid EmailId"}}if(a.noSpace(this.getView().byId("__component0---Customers--Customer--idEmail"))!==true){return{status:false,error:"No Space Allowed"}}}return{status:true,error:""}},ValidateDataCreation:function(e){if(this.CheckEmailExists(e.EmailId)===true){return{status:false,error:"EmailId already used for supplier"}}return{status:true,error:""}},saveData:function(e){var t=this;var o=this.getView().getModel("dataModel");var a=this.getView().getModel("viewModel");var s=this.getView().getModel("local").getProperty("/Customer");var u=this.getView().getModel("local").getProperty("/groupSelected");if(s.CustomerCode!==""){var d=JSON.parse(JSON.stringify(s));if(a.oData.blockStatus===false){d.Status="B"}else{d.Status="U"}var c=this.ValidateCustomerData(d);if(c.status===false){i.error(c.error);return}var g=this.customerCheck1(d.CustomerCode);if(g){var p=new l("RetailerId",n.EQ,g);this.ODataHelper.callOData(this.getOwnerComponent().getModel(),"/Customers('"+g+"')","PUT",{},d,this).then(function(e){t.UpdateLocalModel();t.clearScreen();t._onRouteMatched();r.show("Data saved successfully")}).catch(function(e){r.show("Data could not be saved")});if(h==="true"){var t=this;this.updateGroup(p);for(var f=0;f<u.length;f++){var m=t.updateGroupDetails(u,f,g)}}if(this.onSwitch===true){var C={emailId:d.EmailId,name:d.Name,bStat:a.oData.blockStatus,Authorization:this.getModel("local").getProperty("/Authorization")};this.changeUserStatus(C)}}else{var c=this.ValidateDataCreation(d);if(c.status===false){i.error(c.error);return}this.ODataHelper.callOData(this.getOwnerComponent().getModel(),"/Customers","POST",{},d,this).then(function(e){t.clearScreen();r.show("Data saved sucessfully");t._onRouteMatched()}).catch(function(e){r.show("Data could not be saved");t.clearScreen()});var y={name:d.Name,emailId:d.EmailId,role:"Retailer",Authorization:this.getModel("local").getProperty("/Authorization")};this.createUserPayload(y)}}else{var w=this.getView().byId("__component0---Customers--Customer--idCode");w.setValueState("Error");w.setValueStateText("Please enter a Code!")}},updateGroupDetails:function(e,t,o){var a=this;var s=this.getView().getModel("local").getProperty("/RetailerGroup");var i=this.getView().getModel();if(e[t]!==""){s.RetailerId=o;s.GroupId=e[t];s.ChangedBy="";s.ChangedOn="";s.CreatedBy="";s.CreatedOn="";this.ODataHelper.callOData(this.getOwnerComponent().getModel(),"/RetailerGroups","POST",{},s,this).then(function(e){s.RetailerId="";s.GroupId="";s.ChangedBy="";s.ChangedOn="";s.CreatedBy="";s.CreatedOn="";r.show("Data saved successfully");a.UpdateLocalModel()}).catch(function(e){s.RetailerId="";s.GroupId="";s.ChangedBy="";s.ChangedOn="";s.CreatedBy="";s.CreatedOn=""})}},updateGroup:function(e){s;var t=this;this.ODataHelper.callOData(this.getOwnerComponent().getModel(),"/RetailerGroups","GET",{filters:[e]},{},this).then(function(e){for(var o=0;o<e.results.length;o++){t.ODataHelper.callOData(t.getOwnerComponent().getModel(),"/RetailerGroups('"+e.results.id+"')","DELETE ",{},{},t).then(function(e){}).catch(function(e){debugger})}}).catch(function(e){t._onRouteMatched();r.show("Error in Update")})},deleteCustomer:function(e){var t=this;var o=this.getView().getModel("local").getProperty("/Customer");if(o.CustomerCode){var a=this.customerCheck(o.CustomerCode);if(a){this.ODataHelper.callOData(this.getOwnerComponent().getModel(),"/Customers('"+a+"')","DELETE",{},{},this).then(function(e){var o=t.getView().getModel("local").getProperty("/groupSelected");for(var a=0;a<o.length;a++){t.ODataHelper.callOData(t.getOwnerComponent().getModel(),"/RetailerGroups('"+o.ManuId+"')","DELETE ",{},{},t).then(function(e){}).catch(function(e){debugger})}t.clearScreen();t._onRouteMatched();r.show("Entry Deleted Sucessfully")}).catch(function(e){t._onRouteMatched();r.show("Could not delete the entry")})}}},createUserPayload:function(e){$.post("/createNewUser",e).then(function(e){}).fail(function(e){sap.m.MessageBox.error("User Creation failed")})},changeUserStatus:function(e){$.post("/changeUserStatus",e).then(function(e){}).fail(function(e){sap.m.MessageBox.error("Changing User Status failed")})},UpdateLocalModel:function(e){var t=this;var o=this.getView().byId("__component0---Customers--Customer--idCode").getValue();var r=this.getView().getModel("customerModelInfo").getData().results;function a(e){return r.filter(function(t){return t.CustomerCode===e})}if(r&&r.length>0){var s=a(o);if(s.length>0){var i=this.getView().getModel("viewModel");var l=i.getProperty("/blockStatus");var n=this.getView().getModel("local").getProperty("/Customer");s[0].CustomerCode=n.CustomerCode;s[0].Address=n.Address;s[0].Name=n.Name;s[0].City=n.City;s[0].MobilePhone=n.MobilePhone;s[0].EmailId=n.EmailId;s[0].Groups=n.Groups;var u=this.getView().getModel("local").getProperty("/groupSelected");if(l===false){s[0].Status="B"}else if(l===true){s[0].Status="U"}}}}})});