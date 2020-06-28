'use strict';

module.exports = function(OrderHeader) {
  debugger;
  OrderHeader.observe('before save', function computePercentage(ctx,next) {
    if (ctx.instance) {
      //ctx.instance.OrderNo = 990;
      //Read only max order no for given, if order is found, +1 and create
      //if not found, give it as order no 1

      //get all the orders which are created today after midnight
      //read only order no from DB, not other columns pass date as yyyy-mm-dd
      ///ctx.instance.Date
      debugger;
      // var date = ctx.instance.Date;
      // date.setHours(0,0,0,0);
      // var dateTo = JSON.parse(JSON.stringify(date));
      // dateTo.addDays(1);

      var start = new Date(JSON.parse(JSON.stringify(ctx.instance.Date)));
      start.setHours(0,0,0,0);

      var end = new Date(JSON.parse(JSON.stringify(ctx.instance.Date)));
      end.setHours(23,59,59,999);
      OrderHeader.find({
        where: {
          and: [{
            Date: {
              gt: start
            }
          }, {
            Date: {
              lt: end
            }
          }]
        },
        fields:{
          "OrderNo": true,
          "id": true
        }
      })
      .then(function(orders) {
        //sort the orders in descending order created today
        if(orders.length > 0){
          //if there are/is order created today sort and get next order no
          orders.sort(function (a, b) {
					  return b.OrderNo - a.OrderNo;
					});

          //i am gonna create a new order only when the last order has at least one item inside
          var oItem = ctx.Model.app.models.OrderItem;
          oItem.findOne({where : {
          				"OrderNo": orders[0].id.toString()
          			}})
          .then(function(record){
                  if(record){
                    //incrementing order no here --comes here when order has item
                    ctx.instance.OrderNo = orders[0].OrderNo + 1;
                    //telling system to go ahead and create new order with new no.
                    //next() --> it will go to framework and create a new data record
                    next();
                  }else{
                    //do not do anything
                    debugger;
                    // return next();
                    //ctx.res(ctx.instance.__data);
                    //return ctx.instance.__data;
                    ctx.instance.OrderNo = orders[0].OrderNo;
                    ctx.instance.__data.id = orders[0].id.toString();
                    next(new Error("last order already empty use same:" + orders[0].id));
                  }
                });
        }else{
          //assign a fresh order no
          //for wholesale, this becomes 251
            ctx.instance.OrderNo = 1;
            //next() --> it will go to framework and create a new data record
            next();
        }

      });

    }

  });
};
