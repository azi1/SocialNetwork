const jwt  = require('jsonwebtoken');
const config = require('config');

module.exports = function (req,res,next) {
    const token  = req.header('x-auth-token');

    if(!token) {
       return res.status(401).json({errors: [{msg: "No token, authorization required"}]});
    } 
    try {
        const decoded = jwt.verify(token, config.get('jwtsecret'));
        console.log(decoded, "decoded");
        req.user = decoded.user;
        next();

    } catch(e) {
        console.log(e, "error middleware");
        res.status(401).json({errors: [{msg: "token is not valid"}]});
        }

};