const express = require("express");
const multer = require("multer");
const sharp = require("sharp");

const User = require("../models/user");
const auth = require("../middleware/auth");
const { sendWelcomeEmail, sendCancelEmail } = require("../emails/account");

const router = new express.Router();

router.post("/users", async(req, res) => {
    const user = User(req.body);
    try {
        await user.save();
        const token = await user.generateNewToken();
        sendWelcomeEmail(user.name, user.email);

        res.status(201).send({ user, token });
    } catch (e) {
        console.log(e);
        res.status(400).send("error saving");
    }
});

router.get("/users/me", auth, async(req, res) => {
    res.send(req.user);
});

//using route parameters to get the data from user
router.get("/users/:id", async(req, res) => {
    console.log(req.params); //we can access the route parameters by calling req.params
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).send("No User Found");
        }
        return res.send(200, res.send(user));
    } catch (error) {
        return res.status(500).send("Server Issue");
    }
});

//Updating tasks
router.patch("/users/me", auth, async(req, res) => {
    const updates = Object.keys(req.body); //gets data from body
    const allowedUpdates = ["name", "email", "password", "age"];
    const isValidOperation = updates.every((update) =>
        allowedUpdates.includes(update)
    );
    if (!isValidOperation) {
        return res.status(400).send("Invalid Update");
    }
    try {
        updates.forEach((update) => {
            req.user[update] = req.body[update];
        });
        await req.user.save();
        // const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        //     new: true,
        //     runValidators: true,
        // });

        res.send(200, req.user);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.delete("/users/me", auth, async(req, res) => {
    const id = req.params.id;
    try {
        // const user = await User.findByIdAndDelete(req.user._id);
        // if (!user) {
        //     return res.status(400).send("User not found");
        await req.user.remove();
        sendCancelEmail(req.user.name, req.user.email);
        res.send(req.user);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});
//login
router.post("/users/login", async(req, res) => {
    try {
        const user = await User.findByCredentials(
            req.body.email,
            req.body.password
        );
        //calling method on a single instance of User model -> user
        const token = await user.generateNewToken();

        res.send({ user, token });
        // login();
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
});

router.post("/users/logout", auth, async(req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token; //removing the token matching the <token> variable
        });
        await req.user.save();
        res.status(200).send();
    } catch (error) {
        console.log(error);
        res.status(500).send("Unable to logout");
    }
});

//logout from all sessions
router.post("/users/logout/all", auth, async(req, res) => {
    try {
        console.log(req.user);
        req.user.tokens = [];
        console.log(req.user);
        await req.user.save();
        res.status(200).send();
    } catch (error) {
        console.log(error);
        res.status(500).send("Unable to logout");
    }
});

//uploading user avatar
const upload = multer({
    // dest: "avatars", //this is not needed when we want the file data
    limits: {
        fileSize: 1000000,
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|png|jpeg)$/)) {
            return cb(new Error("Upload a jpg file"));
        }
        return cb(undefined, true);
    },
});
router.post(
    "/users/me/avatar", //
    auth,
    upload.single("avatar"),
    async(req, res) => {
        const buffer = await sharp(req.file.buffer)
            .resize({ width: 250, height: 250 })
            .png()
            .toBuffer();
        req.user.avatar = buffer;
        // req.user.avatar = req.file.buffer;
        await req.user.save();
        res.send();
    },
    (err, req, res, next) => {
        res.status(400).send({ error: err.message });
    }
);

router.delete(
    "/users/me/avatar", //
    auth,
    //   upload.single("avatar"),
    async(req, res) => {
        req.user.avatar = undefined;
        await req.user.save();
        res.send({ message: "Avatar removed" });
    },
    (err, req, res, next) => {
        res.status(400).send({ error: err.message });
    }
);

//serving up images as url
router.get("/users/:id/avatar.png", async(req, res) => {
    try {
        const user = await User.findById(req.params.id);
        // console.log(user.avatar);
        if (!user || !user.avatar) {
            //checking if user or avatar is not empty
            throw Error("User/Avatar not found");
        }

        res.set("content-type", "image/jpg"); //setting up response header
        res.send(user.avatar);
    } catch (error) {
        console.log(error);
        res.status(404).send(error.toString());
    }
});

module.exports = router;