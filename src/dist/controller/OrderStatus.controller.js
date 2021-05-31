sap.ui.define(["sap/ui/demo/cart/controller/BaseController","sap/ui/core/UIComponent","sap/m/MessageToast","sap/ui/model/json/JSONModel","sap/ui/demo/cart/model/formatter"],function(t,e,r,s,i){"use strict";return t.extend("sap.ui.demo.cart.controller.OrderStatus",{formatter:i,onInit:function(){var t=this.getOwnerComponent().getRouter();t.getRoute("OrderStatus").attachMatched(this._onRouteMatched,this)},_onRouteMatched:function(t){if(!this.orderStatusList){this.getView().setBusy(true);this.loadOrderStatus()}},setOrderStatus:function(t,e){var r=0;var s=0;var i=0;var o=0;var a=[];var n=[];e.orderStatusList=[];t.get("OrderHeader").forEach((d,h)=>{s=0;i=0;o=0;n=[];a=[];if(t.get("OrderItem").has(h)){t.get("OrderItem").get(d.id).forEach((e,r)=>{a.push(r+1);var d=t.get("Product").get(e.Material);var h=d.Tunch+d.Wastage;a.push(d.Category.toLowerCase()+" / "+d.SubCategory.toLowerCase()+" / "+d.Name.toLowerCase()+" ("+h+"Tunch) ");s+=t.get("Weight").get(e.WeightId).GrossWeight;a.push(t.get("Weight").get(e.WeightId).GrossWeight);o+=t.get("Weight").get(e.WeightId).NetWeight;a.push(t.get("Weight").get(e.WeightId).NetWeight);i+=t.get("Weight").get(e.WeightId).Amount;a.push(t.get("Weight").get(e.WeightId).Amount);n.push({Item:d.Category.toLowerCase(),Description:d.SubCategory.toLowerCase()+" / "+d.Name.toLowerCase(),Tunch:h,NetWeight:t.get("Weight").get(e.WeightId).NetWeight,GrossWeight:t.get("Weight").get(e.WeightId).GrossWeight?t.get("Weight").get(e.WeightId).GrossWeight:0,Fine:t.get("Weight").get(e.WeightId).Fine,Amount:t.get("Weight").get(e.WeightId).Amount?t.get("Weight").get(e.WeightId).Amount:0})})}e.orderStatusList[r++]={id:h,CustomerName:t.get("Customer").get(d.Customer).Name,CustomerCode:t.get("Customer").get(d.Customer).CustomerCode,CustomerCity:t.get("Customer").get(d.Customer).City,CustomerMob:t.get("Customer").get(d.Customer).MobilePhone,CustomerAddress:t.get("Customer").get(d.Customer).Address,TotalWeight:s.toFixed(2),TotalNetWeight:o,TotalAmount:i,OrderDate:d.Date,OrderNo:d.OrderNo,OrderStatus:d.Status,ItemDetails:a,Products:n}});e.getOwnerComponent().getModel("local").setProperty("/list",{OrderHeader:e.orderStatusList});e.getView().byId("idListOS").refreshItems();e.getView().byId("idListOS").removeSelections();e.getView().setBusy(false)},loadProdWeights:function(t,e){var s=[];t.get("Weight").forEach((t,e)=>{s.push(new sap.ui.model.Filter("id","EQ","'"+e+"'"))});this.ODataHelper.callOData(this.getOwnerComponent().getModel(),"/ProdWeights","GET",{filters:s},{},this).then(function(r){r.results.forEach(e=>{t.get("Weight").set(e.id,e)});e.setOrderStatus(t,e)}).catch(function(t){e.getView().setBusy(false);r.show("Cannot fetch Order Status please Refresh")})},loadProducts:function(t,e){var s=[];t.get("Product").forEach((t,e)=>{s.push(new sap.ui.model.Filter("id","EQ","'"+e+"'"))});this.ODataHelper.callOData(this.getOwnerComponent().getModel(),"/Products","GET",{filters:s},{},this).then(function(r){r.results.forEach(e=>{t.get("Product").set(e.id,e)});e.loadProdWeights(t,e)}).catch(function(t){e.getView().setBusy(false);r.show("Cannot fetch Order Status please Refresh")})},loadOrderItems:function(t,e){var s=[];t.get("OrderHeader").forEach((t,e)=>{s.push(new sap.ui.model.Filter("OrderNo","EQ","'"+e+"'"))});this.ODataHelper.callOData(this.getOwnerComponent().getModel(),"/OrderItems","GET",{filters:s},{},this).then(function(r){r.results.forEach(e=>{if(t.get("OrderItem").has(e.OrderNo)){t.get("OrderItem").get(e.OrderNo).push(e);t.get("Weight").set(e.WeightId,"");t.get("Product").set(e.Material,"")}});e.loadProducts(t,e)}).catch(function(t){e.getView().setBusy(false);r.show("Cannot fetch Order Status please Refresh")})},loadCustomer:function(t,e){var s=this;e.set("Customer",new Map);var i=[];t.forEach(t=>{i.push(new sap.ui.model.Filter("id","EQ","'"+t+"'"))});this.ODataHelper.callOData(this.getOwnerComponent().getModel(),"/Customers","GET",{filters:i},{},this).then(function(t){t.results.forEach(t=>{e.get("Customer").set(t.id,t)})}).catch(function(t){s.getView().setBusy(false);r.show("Cannot fetch Order Status please Refresh")})},loadOrderStatus:function(){var t=this;var e=new Set;var s=new Map;s.set("OrderHeader",new Map);s.set("OrderItem",new Map);s.set("Product",new Map);s.set("Weight",new Map);var i=new sap.ui.model.Filter("Status","EQ","N");var o=new sap.ui.model.Filter("Status","EQ","A");this.ODataHelper.callOData(this.getOwnerComponent().getModel(),"/OrderHeaders","GET",{filters:[i,o]},{},this).then(function(r){r.results.forEach((t,r)=>{s.get("OrderHeader").set(t.id,t);s.get("OrderItem").set(t.id,[]);e.add(t.Customer)});t.loadCustomer(e,s);t.loadOrderItems(s,t)}).catch(function(e){t.getView().setBusy(false);r.show("Cannot fetch Order Status please Refresh")})},orderStatusUpdate:function(t,e){t.forEach(t=>{var s=this.orderStatusList[t.split("/")[t.split("/").length-1]].id;this.ODataHelper.callOData(this.getOwnerComponent().getModel(),"/OrderHeaders('"+s+"')","PUT",{},{Status:e},this).then(function(t){}).catch(function(t){r.show("Error")})});setTimeout(()=>{this.getView().setBusy(true);this.loadOrderStatus()},1e3)},onApprove:function(t){var e=this.getView().byId("idListOS").getSelectedContextPaths();if(e.length){this.orderStatusUpdate(e,"A")}},onReject:function(t){var e=this.getView().byId("idListOS").getSelectedContextPaths();if(e.length){this.orderStatusUpdate(e,"R")}},onDelivered:function(t){var e=this.getView().byId("idListOS").getSelectedContextPaths();if(e.length){this.orderStatusUpdate(e,"D")}},onRefresh:function(){this.getView().setBusy(true);this.loadOrderStatus()},getPrint:function(t,e,s=0){if(s<t.length){var i=t[s].split("/")[t[s].split("/").length-1];var o=this.orderStatusList[i].ItemDetails.toString().split(",");var a=[this.orderStatusList[i].OrderNo,this.orderStatusList[i].OrderDate.toString().slice(4,16),this.orderStatusList[i].CustomerName,this.orderStatusList[i].CustomerCity,this.orderStatusList[i].CustomerMob].toString().split(",");var n=[this.orderStatusList[i].TotalWeight,this.orderStatusList[i].TotalNetWeight,this.orderStatusList[i].TotalAmount].toString().split(",");debugger;$.post("/invoice",{first:a,second:o,third:n}).done(function(r,i){var o=window.open("","MsgWindow","width=1200,height=700",true);o.document.write(r);e.getPrint(t,e,++s)}).fail(function(t,s,i){e.getView().setBusy(false);r.show("Error")})}else{e.getView().byId("idListOS").removeSelections();e.getView().setBusy(false)}},onPrint:function(){var t=this.getView().byId("idListOS").getSelectedContextPaths();this.getView().setBusy(true);this.getPrint(t,this)},getPdf:function(t,e,s=0){if(s<t.length){var i=t[s].split("/")[t[s].split("/").length-1];var o=this.orderStatusList[i].Products;var a=this.orderStatusList[i].CustomerName;var n=this.orderStatusList[i].CustomerAddress;var d=this.orderStatusList[i].CustomerCity;var h=this.orderStatusList[i].CustomerCode+"-O"+this.orderStatusList[i].OrderNo;r.show("Please wait, preparing...");const l={shipping:{name:a,address:n?n:"N/A",city:d?d:"N/A",state:"",country:"INDIA",postal_code:""},items:o,GST:"",order_number:h,header:{company_name:"Mangalam Ornaments",company_logo:"logo.png",company_address:"601-603, APEX MALLLALKOTHI TONK ROAD, JAIPUR RJ 302015 IN"},footer:{text:"---------------------------------------"},currency_symbol:" INR",weight_unit:"gm",date:{billing_date:Date().slice(4,15),due_date:""}};let g=(t,e)=>{if(false){t.image(e.header.company_logo,50,45,{width:50}).fontSize(20).text(e.header.company_name,110,57).moveDown()}else{t.fontSize(20).text(e.header.company_name,50,45).moveDown()}if(e.header.company_address.length!==0){y(t,e.header.company_address)}};let u=(t,e)=>{t.fillColor("#444444").fontSize(20).text("Invoice",50,160);S(t,185);const r=200;t.fontSize(10).text("Invoice Number:",50,r).font("Helvetica-Bold").text(e.order_number,150,r).font("Helvetica").text("Billing Date:",50,r+15).text(e.date.billing_date,150,r+15).text("Due Date:",50,r+30).text(e.date.due_date,150,r+30).font("Helvetica-Bold").text(e.shipping.name,300,r).font("Helvetica").text(e.shipping.address,300,r+15).text(e.shipping.city+", "+e.shipping.state+", "+e.shipping.country,300,r+30).moveDown();S(t,252)};let c=(t,e)=>{let r;const s=330;const i=e.currency_symbol;const o=e.weight_unit;t.font("Helvetica-Bold");p(t,s,"Item","Description","Gross Weight","Net Weight","Fine","Amount");S(t,s+20);t.font("Helvetica");var a=0;var n=0;for(r=0;r<e.items.length;r++){const d=e.items[r];const h=s+(r+1)*30;p(t,h,d.Item,d.Description,O(d.GrossWeight,o),v(d.NetWeight,o,d.Tunch),O(d.Fine,o),w(d.Amount,i));a+=parseFloat(d.Amount);n+=parseFloat(d.Fine);S(t,h+20)}const d=s+(r+1)*30;t.font("Helvetica-Bold");f(t,d,"Total Fine :",O(n.toFixed(2),o));const h=d+20;t.font("Helvetica-Bold");f(t,h,"GST :",W(e.GST));const l=h+20;t.font("Helvetica-Bold");f(t,l,"Total Amount :",w(I(a,e.GST).toFixed(2),i))};let m=(t,e)=>{if(e.footer.text.length!==0){t.fontSize(10).text(e.footer.text,50,780,{align:"center",width:500})}};let f=(t,e,r,s)=>{t.fontSize(10).text(r,380,e,{width:90,align:"right"}).text(s,0,e,{align:"right"})};let p=(t,e,r,s,i,o,a,n)=>{t.fontSize(10).text(r,50,e).text(s,130,e).text(i,215,e,{width:90,align:"right"}).text(o,310,e,{width:90,align:"right"}).text(a,380,e,{width:90,align:"right"}).text(n,0,e,{align:"right"})};let S=(t,e)=>{t.strokeColor("#aaaaaa").lineWidth(1).moveTo(50,e).lineTo(550,e).stroke()};let w=(t,e)=>{if(t){var r=t.toString().split(".");var s=r.length>1?"."+r[1]:"";r=r[0];var i=r.substring(r.length-3);var o=r.substring(0,r.length-3);if(o!="")i=","+i;var a=o.replace(/\B(?=(\d{2})+(?!\d))/g,",")+i;return a+s+e}};let O=(t,e)=>t+e;let v=(t,e,r)=>t+e+" X "+r+"T";let C=t=>{if(t.length!==0){var e=t.replace(/[^0-9]/g,"")}else{var e=0}return e};let W=t=>{let e=C(t);if(Number.isNaN(e)===false&&e<=100&&e>0){var r=t}else{var r="---"}return r};let I=(t,e)=>{let r=C(e);if(Number.isNaN(r)===false&&r<=100){let e="."+r;var s=t*(1+e)}else{var s=t*(1+taxValue)}return s};let y=(t,e)=>{let r=e;let s=r.match(/.{0,25}(\s|$)/g);let i=50;s.forEach(function(e,r){t.fontSize(10).text(s[r],200,i,{align:"right"});i=+i+15})};let L=r=>{var i=new PDFDocument({size:"A4",margin:40});var o=i.pipe(blobStream());g(i,r);u(i,r);c(i,r);m(i,r);i.end();o.on("finish",function(){const r=o.toBlob("application/pdf");const i=o.toBlobURL("application/pdf");const a=document.createElement("a");a.href=i;a.download=h;a.click();e.getPdf(t,e,++s)})};L(l)}else{e.getView().byId("idListOS").removeSelections()}},onInvoiceDownload:function(){var t=this.getView().byId("idListOS").getSelectedContextPaths();this.getPdf(t,this)}})});