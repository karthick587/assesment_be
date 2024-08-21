const userModel = require("../Model/userModel");
const roleModel = require("../Model/roleModel");
const JWT = require('jsonwebtoken');

// Add a user and get all users
const addUsers = async (req, res) => {
    try {
        const user = new userModel(req.body);
        const result = await user.save();
        res.status(201).send({ statusCode: 201, message: "User Added successfully", user: result });
    } catch (err) {
        res.status(400).send({ statusCode: 400, message: err });
    }
};
// const insertRoles = async () => {
//     try {
//         await roleModel.insertMany([
//             {
//                 code: "admin",
//                 codeName: "Administrator",
//                 createdBy: null, // Replace with actual ObjectId if known
//                 createdAt: new Date(),
//                 updatedBy: null, // Replace with actual ObjectId if known
//                 updatedAt: new Date()
//             },
//             {
//                 code: "customer",
//                 codeName: "Customer",
//                 createdBy: null, // Replace with actual ObjectId if known
//                 createdAt: new Date(),
//                 updatedBy: null, // Replace with actual ObjectId if known
//                 updatedAt: new Date()
//             },
//             {
//                 code: "vendor",
//                 codeName: "Vendor",
//                 createdBy: null, // Replace with actual ObjectId if known
//                 createdAt: new Date(),
//                 updatedBy: null, // Replace with actual ObjectId if known
//                 updatedAt: new Date()
//             }
//         ]);

//         console.log("Roles inserted successfully");
//     } catch (err) {
//         console.error("Error inserting roles:", err);
//     } 
// };

// insertRoles();
// Update users (Implementation can be added based on requirements)
const updateUsers = async (req, res) => {
    try {
        const { _id, name, email, PhoneNumber, password, roles, updatedBy } = req.body;

        // Validate input
        if (!_id) {
            return res.status(400).send({ statusCode: 400, message: "User ID is required" });
        }

        // Prepare the update object
        const updateData = {
            name,
            email,
            PhoneNumber,
            updatedAt: new Date(),
            updatedBy,
        };

        // If password is provided, hash it before saving
        if (password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        // If roles are provided, update them
        if (roles && Array.isArray(roles)) {
            updateData.roles = roles;
        }

        // Update the user
        const result = await userModel.findByIdAndUpdate(_id, updateData, { new: true });

        if (!result) {
            return res.status(404).send({ statusCode: 404, message: "User not found" });
        }

        res.status(200).send({ statusCode: 200, message: "User updated successfully", user: result });
    } catch (err) {
        console.error(err);
        res.status(500).send({ statusCode: 500, message: "There was a problem updating the information in the database." });
    }
};


// Get all users
const getUsers = async (req, res) => {
    try {
        const result = await userModel.find({});
        res.send(result);
    } catch (err) {
        res.status(400).send({ statusCode: 400, message: "There was a problem retrieving the information from the database." });
    }
};

// Get all user roles
const getUserRoleslist = async (req, res) => {
    try {
        const result = await roleModel.find({});
        res.send(result);
    } catch (err) {
        res.status(400).send({ statusCode: 400, message: "There was a problem retrieving the information from the database." });
    }
};

// Validate the user -> If PhoneNumber exists, login else register
const validateUsers = async (req, res) => {
    const { PhoneNumber, password } = req.body;

    try {
        const user = await userModel.findOne({ PhoneNumber });
        if (!user) {
            return res.status(400).json({ statusCode: 400, message: "User not found" });
        }

        const isPasswordMatch = await user.validatePassword(password);
        if (isPasswordMatch) {
            const token = JWT.sign({
                id: user._id,
                PhoneNumber: user.PhoneNumber
            }, process.env.JWT_SECRET, { expiresIn: '7d' });

            return res.status(200).json({ statusCode: 200, message: "Login succeeded", token });
        } else {
            return res.status(400).json({ statusCode: 400, message: "Password doesn't match" });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ statusCode: 500, message: "Internal server error" });
    }
};

// Verify token
const verifyToken = async (req, res) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(400).send({ statusCode: 400, message: "Token is required" });
    }

    try {
        const decodeToken = JWT.decode(token);
        const user = await userModel.findById(decodeToken.id);

        if (!user || decodeToken.exp < Date.now() / 1000) {
            return res.status(400).send({ statusCode: 400, message: "Invalid token" });
        }

        res.status(200).send({ statusCode: 200, result: user });
    } catch (err) {
        res.status(400).send({ statusCode: 400, message: "Failed" });
    }
};

module.exports = {
    getUsers,
    addUsers,
    updateUsers,
    validateUsers,
    verifyToken,
    getUserRoleslist
};
