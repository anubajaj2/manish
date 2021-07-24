'use strict';

module.exports = function(OrderItem) {

  OrderItem.observe('after save', async function(ctx) {
    var app = require('../../server/server');
    var Product = app.models.Product;
    var idProd = ctx.instance.__data.Material.toString();
    if (ctx.isNewInstance === false) {
      next();
    }
    Product.findOne({
      where: {
        id: idProd
      },
      limit: 1
    }).then(function(prod) {
      //console.log(ctx.instance.EmailId + ctx.instance.CourseName);
      if (prod) {
        //	console.log(JSON.stringify(inq));
        if (!inq.SoftDelete) {
          inq.SoftDelete = true;
          inq.ChangedOn = new Date();
          inq.ChangedBy = "Needs To be Passed";
          inq.updateAttributes(inq, function() {
            console.log("The student inquiry is now soft deleted");
            return next();
          });
        } else {
          //do nothing
          console.log("Iquiry already deleted");
          return next();
        }
      } else {
        //do nothing
        console.log("No Iquiry found for this");
        return next();
      }
    });
  });

};
