const express = require("express");
const app = express();
const router = express.Router();

const { getUsers,
    addUsers,
    updateUsers,
    validateUsers,
    verifyToken,
    getUserRoleslist } = require('../controllers/userController');
const Authorization = require('../middleware/autherization');
app.use(router);
router.use(express.json());

//Get all users
router.get("/users/all", Authorization, getUsers);
router.post("/users/add", addUsers);
router.put("/users/update", Authorization, updateUsers);
router.get("/users/role/list", getUserRoleslist);
//Validate the user -> If phonenumber is exists login else register
router.post("/auth/validate", validateUsers);

//verify token
router.get("/auth/verifytoken", Authorization, verifyToken);

module.exports = router;