sap.ui.define(["sap/ui/demo/cart/controller/BaseController","sap/ui/core/UIComponent","sap/ui/model/json/JSONModel","sap/m/MessageToast","sap/ui/demo/cart/model/formatter"],function(e,t,o,r,a){"use strict";return e.extend("sap.ui.demo.cart.controller.ProductCategory",{onInit:function(){var e=new o({});this.setModel(e,"ProductModel");var t=new o({buttonText:"Save",deleteEnabled:false});this.setModel(t,"viewModel");var r=this.getRouter();r.getRoute("ProductCategory").attachMatched(this._onRouteMatched,this)},_onRouteMatched:function(){var e=this;var t=this.getView().getModel("viewModel");t.setProperty("/codeEnabled",true);t.setProperty("/buttonText","Save");t.setProperty("/deleteEnabled",false);var a=new o({groupCodeState:"None",emailState:"None"});this.setModel(a,"dataModel");this.ODataHelper.callOData(this.getOwnerComponent().getModel(),"/ProductCategories","GET",{},{},this).then(function(t){var r=new o;r.setData(t);var a=[];var s=[];for(var l=0;l<t.results.length;l++){if(a.indexOf(t.results[l].Category)===-1){a.push(t.results[l].Category)}}for(var i=0;i<a.length;i++){var n={};n.Category=a[i];s.push(n)}var u=[];var d=[];for(var l=0;l<t.results.length;l++){if(u.indexOf(t.results[l].SubCategory)===-1){u.push(t.results[l].SubCategory)}}for(var i=0;i<u.length;i++){var n={};n.SubCategory=u[i];d.push(n)}var g=new sap.ui.model.json.JSONModel({category:s,subCatergory:d});e.getView().setModel(g,"ProductCatsModel");e.getView().setModel(r,"ProductModel")}).catch(function(e){r.show("cannot fetch the data")});this.clearScreen();this.firstTwoDisplay()},clearScreen:function(e){var t=this.getView().getModel("local").getProperty("/ProductCategories");var o=this.getView().getModel("viewModel");var r=this.getView().getModel("dataModel");t.Category="";t.SubCategory="";t.Type="";o.setProperty("/codeEnabled",true);o.setProperty("/buttonText","Save");o.setProperty("/deleteEnabled",false);r.setProperty("/groupCodeState","None");r.setProperty("/emailState","None");this.getView().getModel("local").setProperty("ProductCategories",t)},toggleFullScreen:function(){var e="idFullScreenBtn";var t="__component0---idProduct--ProductHeader";this.toggleUiTable(e,t)},CodeCheck:function(e){var t=e.getSource()},productCheck:function(e,t,o){var r=this.getView().getModel("ProductModel").getData().results;function a(e,t,o){return r.filter(function(r){return r.Category===e&&r.SubCategory===t&&r.Type===o})}if(r&&r.length>0){var s=a(e,t,o);if(s.length>0){var l=this.getView().getModel("viewModel");var i=this.getView().getModel("local").getProperty("/ProductCategories");i.Category=s[0].Category;i.SubCategory=s[0].SubCategory;i.Type=s[0].Type;i.NumberOfProducts=s[0].NumberOfProducts;this.getView().getModel("local").setProperty("/ProductCategories",i);l.setProperty("/deleteEnabled",true);l.setProperty("/codeEnabled",false);this.getView().byId("idSubCategory").focus();return s[0].id}else{}}},saveData:function(e){debugger;var t=this;var o=this.getView().getModel("local").getProperty("/ProductCategories");if(o.Category!==""){var a=o.Category=o.Category.toUpperCase();var s=o.SubCategory=o.SubCategory.toUpperCase();var l=o.Type=o.Type.toUpperCase();var i=this.productCheck(a,s,l);var n=JSON.parse(JSON.stringify(o));if(i){debugger;r.show("Data Already Exists")}else{this.ODataHelper.callOData(this.getOwnerComponent().getModel(),"/ProductCategories","POST",{},n,this).then(function(e){r.show("Data saved successfully");t._onRouteMatched()}).catch(function(e){r.show("Data could not be saved")})}}else{var u=this.getView().byId("idCategory");u.setValueState("Error");u.setValueStateText("Please enter a Category!")}},typeCheck:function(e){var t=e.getSource(),o=t.getSelectedKey(),r=t.getValue();if(!o&&r){t.setValueState("Error");t.setValueStateText("Please enter a Type!")}else{t.setValueState("None")}},deleteProduct:function(e){var t=this;var o=this.getView().getModel("local").getProperty("/ProductCategories");if(o.Category!==""){var a=o.Category=o.Category.toUpperCase();var s=o.SubCategory=o.SubCategory.toUpperCase();var l=o.Type=o.Type.toUpperCase();var i=this.productCheck(a,s,l);var n=JSON.parse(JSON.stringify(o));if(i){this.ODataHelper.callOData(this.getOwnerComponent().getModel(),"/ProductCategories('"+i+"')","DELETE",{},{},this).then(function(e){r.show("Deleted successfully");t._onRouteMatched()}).catch(function(e){t._onRouteMatched();r.show("Could not delete the entry")})}else{r.show("Product already in use.Cannot be deleted")}}}})});