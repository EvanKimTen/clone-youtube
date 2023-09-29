import multer from "multer";

export const localsMiddleware = (req, res, next) => {
    res.locals.loggedIn = Boolean(req.session.loggedIn);
    // req.session.loggedIn --> this's not specified as boolean yet.
    res.locals.siteName = "Wetube";
    res.locals.loggedInUser = req.session.user || {}; // could be undefined so that's why parenthesis added with OR
    // at first undefined cuz not logged in yet.
    // console.log(res.locals);
    next();
}

export const protectorMiddleware = (req, res, next) => {
    if (req.session.loggedIn) {
        next();
    } else {
        return res.redirect("/login");
    }
}

export const publicOnlyMiddleware = (req, res, next) => {
    if (!req.session.loggedIn) {
        return next();
    } else {
        return res.redirect("/");
    }
}

export const uploadFiles = multer({ dest: 'uploads/' }) // upload file -> change the name of files and saved to the uploads folder
// --> then that gives info about that file to postEdit.