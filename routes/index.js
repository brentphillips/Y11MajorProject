
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Brents Blog', tab: "home"});
};