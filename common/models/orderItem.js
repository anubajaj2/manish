'use strict';

module.exports = function(OrderItem) {

  OrderItem.observe('after save', async function(ctx, next) {
    var app = require('../../server/server');
    var Product = app.models.Product;
    var idProd = ctx.instance.__data.Material.toString();
    if (ctx.isNewInstance === false) {
      next();
    }
    // console.log("--------------------------------------------------" + idProd);
    Product.findOne({
      where: {
        id: idProd
      },
      limit: 1
    }).then(function(prod) {
      // console.log(prod);
      if (prod) {
        prod.Rank += 1;
        prod.ChangedOn = new Date();
        // prod.ChangedBy = "Needs To be Passed";
        prod.updateAttributes(prod, function() {
          console.log("Rank Updated");
          return next();
        });
      } else {
        //do nothing
        console.log("Product not found");
        return next();
      }
    });
  });

};
