sap.ui.define(["sap/ui/demo/cart/controller/BaseController","sap/m/MessageToast","sap/m/Dialog","sap/m/DialogType","sap/m/Button","sap/m/ButtonType"],function(e,t,o,s,a,r){"use strict";return e.extend("sap.ui.demo.cart.controller.MainApp",{idleLogout:function(){var e;var t=this;window.onbeforeunload=function(){t.logOutApp("X")};window.onload=s;window.onmousemove=s;window.onmousedown=s;window.ontouchstart=s;window.onclick=s;window.onkeypress=s;window.addEventListener("scroll",s,true);function o(){sap.m.MessageBox.alert("Page expired, please login again!");window.top.location.href="/"}function s(){clearTimeout(e);e=setTimeout(o,36e5)}},onLogout:function(){this.logOutApp()},onInit:function(){this.idleLogout();this.oRouter=sap.ui.core.UIComponent.getRouterFor(this)},onSubmit:function(){this.Login()},onLivePassword:function(e){console.log("Test")},Login:function(){var e={email:this.getView().byId("userid").getValue(),password:this.getView().byId("pwd").getValue()};var l=this;l.getView().setBusy(true);if(!e.email||!e.password){sap.m.MessageBox.error("User/password cannot be empty");return}$.post("/api/Users/login",e).done(function(e,n){debugger;l.getView().getModel("local").setProperty("/Authorization",e.id);l.getView().getModel().setHeaders({Authorization:e.id});l.secureToken=e.id;l.getView().getModel("local").setProperty("/CurrentUser",e.userId);l.getView().getModel().setUseBatch(false);var i=l;var u=[new sap.ui.model.Filter("TechnicalId",sap.ui.model.FilterOperator.EQ,e.userId)];var g={filters:u};var d=false;var w=[];l.ODataHelper.callOData(l.getOwnerComponent().getModel(),"/AppUsers","GET",{},{},l).then(function(n){if(n.results.length!=0){for(var u=0;u<n.results.length;u++){w[n.results[u].TechnicalId]=n.results[u];if(n.results[u].TechnicalId===e.userId){d=true;i.getView().getModel("local").setProperty("/Role",n.results[u].Role);i.getView().getModel("local").setProperty("/UserName",n.results[u].UserName);i.getView().getModel("local").setProperty("/pwdChange",n.results[u].pwdChange);i.ODataHelper.callOData(i.getOwnerComponent().getModel(),"/AppUsers('"+n.results[u].id+"')","PUT",{},{lastLogin:new Date},i)}}if(d===true){if(i.getView().getModel("local").getProperty("/pwdChange")===true){i.getView().setBusy(false);var g=new o({type:s.Message,title:"Change Password",content:[new sap.m.Input("newPassword",{placeholder:"New password",type:"Password",liveChange:function(e){var t=e.getParameter("value");g.getBeginButton().setEnabled(t.length>5)}.bind(this)}),new sap.m.Input("confirmPassword",{placeholder:"Confirm Passoword",type:"Password"})],beginButton:new a({type:r.Emphasized,text:"Submit",enabled:false,press:function(e){var o=e.getSource().oParent.getContent()[0].getValue();var s=e.getSource().oParent.getContent()[1].getValue();if(o===s){i.getView().setBusy(true);$.post("/changePassword",{emailId:l.getView().byId("userid").getValue(),newPassword:o,Authorization:l.getView().getModel("local").getProperty("/Authorization")}).done(function(e,o){i.getView().setBusy(false);t.show("Password Changed Successfully");g.close()}).fail(function(e,o,s){i.getView().setBusy(false);t.show("Password Change Failed")})}else{t.show("Password didn't matched")}}.bind(this)}),endButton:new a({text:"Cancel",press:function(){g.close()}.bind(this)})});g.open()}else{i.getView().getModel("local").setProperty("/AppUsers",w);if(i.getView().getModel("local").getProperty("/Role")==="Retailer"){var c=new sap.ui.model.Filter("EmailId","EQ",i.getView().byId("userid").getValue());var p=i;i.ODataHelper.callOData(l.getOwnerComponent().getModel(),"/Customers","GET",{filters:[c]},{},i).then(function(e){i.getView().setBusy(false);p.getView().getModel("local").setProperty("/CustomerData",e.results[0]);if(p.getView().getModel("local").getProperty("/CustomerData/Status")==="U"){i.oRouter.navTo("categories")}else{t.show("You are blocked, Please contact admin")}})}else if(i.getView().getModel("local").getProperty("/Role")==="Admin"){i.getView().setBusy(false);i.oRouter.navTo("Group")}else if(i.getView().getModel("local").getProperty("/Role")==="Maker"){var c=new sap.ui.model.Filter("EmailId","EQ",i.getView().byId("userid").getValue());var p=i;i.ODataHelper.callOData(l.getOwnerComponent().getModel(),"/Manufacturers","GET",{filters:[c]},{},i).then(function(e){i.getView().setBusy(false);p.getView().getModel("local").setProperty("/ManufacturerData",e.results[0]);if(p.getView().getModel("local").getProperty("/ManufacturerData/Status")==="U"){i.oRouter.navTo("AddProduct")}else{t.show("User is blocked, Please contact admin")}})}else{i.getView().setBusy(false);sap.m.MessageBox.error("The user is not authorized, Please Contact Mr. Amit")}}}else{l.getView().setBusy(false);sap.m.MessageBox.error("The user is not authorized, Please Contact Mr. Amit")}}}).catch(function(e){l.getView().setBusy(false)})}).fail(function(e,t,o){l.getView().setBusy(false);sap.m.MessageBox.error("Login Failed, Please enter correct credentials")})}})});