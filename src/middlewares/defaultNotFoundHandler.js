module.exports = 
/**
 * @param {import("../core/Request")} req 
 * @param {import("../core/Response")} res 
 */
function defaultNotFoundHandler(req, res) {
    res = res.status(404);
    const message = "404 Page Not Found.";
    
    if(req.wantsHtml) {
        return res.html(`<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>404 - Not Found</title>
        </head>
        <body>
            <p>${message}</p>
        </body>
        </html>`);
    }

    if(req.wantsJson) {
        return res.json({message});
    }

    if(req.wantsXml) {
        return res.setHeader("Content-type", "application/xml")
            .text(`<?xml version='1.0' encoding='UTF-8'?><message>${message}</message>`)
    }

    return res.text(message);
}

