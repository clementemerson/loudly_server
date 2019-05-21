module.exports = function(app) {
    app.get('/Users/:id', function (req, res) {
        console.log(req.params.id);
        res.end('<h1>Some Title<h1>');
     });
}