module.exports = 
/**
 * @param {import("../Request")} req 
 * @param {import("../Response")} res 
 */
function defaultNotFoundHandler(req, res) {
    return res.status(404).text("404 Page Not Found.");
}

