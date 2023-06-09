const bcrypt = require("bcrypt");
const userModel = require("../models/userModel");
const {
  isValidObjectId,
  isValidEmail,
  isValidName,
  isValidPhone,
  isValidRequestBody,
} = require("../validators/validation");
const jwt = require("jsonwebtoken");

//============================================CREATE USER ============================================

const createUser = async function (req, res) {
  try {
    let data = req.body;
    if (Object.keys(data).length == 0)
      return res
        .status(400)
        .send({ status: false, message: "please give some data" });

    const { fname, lname, email, phone, password } = data; //Destructuring

    if (!fname)
      return res
        .status(400)
        .send({ status: false, message: "fname is mandatory" });
    if (!isValidName(fname))
      return res
        .status(400)
        .send({ status: false, message: "fname is invalid" });

    if (!lname)
      return res
        .status(400)
        .send({ status: false, message: "lname is mandatory" });
    if (!isValidName(lname))
      return res
        .status(400)
        .send({ status: false, message: "lname is invalid" });

    if (!email)
      return res
        .status(400)
        .send({ status: false, message: "email is mandatory" });
    if (!isValidEmail(email))
      return res
        .status(400)
        .send({ status: false, message: "email is invalid" });
    let emailExist = await userModel.findOne({ email });
    if (emailExist)
      return res.status(400).send({
        status: false,
        message: "user with this email already exists",
      });

    if (!phone)
      return res
        .status(400)
        .send({ status: false, message: "phone is mandatory" });
    if (!isValidPhone(phone))
      return res
        .status(400)
        .send({ status: false, message: "phone is invalid" });
    let phoneExist = await userModel.findOne({ phone });
    if (phoneExist)
      return res.status(400).send({
        status: false,
        message: "user with this phone number already exists",
      });

    if (!password)
      return res
        .status(400)
        .send({ status: false, message: "password is mandatory" });

    let salt = await bcrypt.genSalt(10);
    data.password = await bcrypt.hash(data.password, salt);
    const user = await userModel.create(data);
    return res.status(201).send({
      status: true,
      message: "user is successfully created",
      data: user,
    });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

//===================================LOGIN==========================================
const userLogin = async function (req, res) {
  try {
    let data = req.body;
    let { email, password } = data;

    if (Object.keys(data).length == 0)
      return res
        .status(400)
        .send({ status: false, message: "Please Enter data" });

    if (!email)
      return res
        .status(400)
        .send({ status: false, message: "Please enter email" });

    if (!isValidEmail(email))
      return res
        .status(400)
        .send({ status: false, message: "Please enter valid email" });

    if (!password)
      return res
        .status(400)
        .send({ status: false, message: "Please enter password" });

    const Login = await userModel.findOne({ email });
    if (!Login)
      return res
        .status(404)
        .send({ status: false, message: "Not a register email Id" });

    let decodePwd = await bcrypt.compare(password, Login.password);
    if (!decodePwd)
      return res
        .status(400)
        .send({ status: false, message: "Password not match" });

    let token = jwt.sign(
      {
        userId: Login._id.toString(),
      },
      "As calm as the sea",
      { expiresIn: "50d" }
    );

    return res.status(200).send({
      status: true,
      message: "User login successfull",
      data: { userId: Login._id, token: token },
    });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

//=================================GET ALL PROFILE ====================================================================

const getAllUser = async function(req,res){
  try{
    const users = await userModel.find({isDeleted: false})
    return res.status(200).send({status: true, message: "All Users", data:users }) 
  }catch (err){
    return res.status(500).send({status:false, message: err.message})
  }
}


//=================================GET PROFILE ====================================================================

const getProfile = async function (req, res) {
  try {
    const userId = req.params.id;

    if (!isValidObjectId(userId))
      return res
        .status(400)
        .send({ status: false, message: "Not a valid userId" });

    const checkUser = await userModel.findById(userId);
    if (!checkUser)
      return res
        .status(404)
        .send({ status: false, message: "UserId not found" });

    return res
      .status(200)
      .send({ status: true, message: "User profile details", data: checkUser });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

//======================================================UPDATE USER=====================================================

const updateUser = async function (req, res) {
  try {
    let userId = req.params.id;
    let data = req.body;
    const { fname, lname, email, phone, password } = data;

    let user = await userModel.findById(userId);
    if (!user) {
      return res
        .status(400)
        .send({ status: false, message: "User does not exist" });
    }

    if (!isValidRequestBody(data))
      return res
        .status(400)
        .send({ status: false, message: "please give some data" });

    let updateQueries = {};

    if (fname) {
      if (!isValidName(fname))
        return res
          .status(400)
          .send({ status: false, message: "fname is invalid" });
      updateQueries["fname"] = fname;
    }

    if (lname) {
      if (!isValidName(lname))
        return res
          .status(400)
          .send({ status: false, message: "lname is invalid" });
      updateQueries["lname"] = lname;
    }

    if (email) {
      if (!isValidEmail(email))
        return res
          .status(400)
          .send({ status: false, message: "email is invalid" });
      let emailExist = await userModel.findOne({ email: email });
      if (emailExist)
        return res.status(400).send({
          status: false,
          message: "user with this email already exists",
        });
      updateQueries["email"] = email;
    }

    if (phone) {
      if (!isValidPhone(phone))
        return res
          .status(400)
          .send({ status: false, message: "phone is invalid" });

      let phoneExist = await userModel.findOne({ phone: phone });
      if (phoneExist)
        return res.status(400).send({
          status: false,
          message: "user with this phone number already exists",
        });
      updateQueries["phone"] = phone;
    }

    if (password) {
      let salt = await bcrypt.genSalt(10);
      updateQueries["password"] = await bcrypt.hash(data.password, salt);
    }

    if (Object.keys(updateQueries).length == 0)
      return res.status(400).send({
        status: false,
        message: "please give some queries to update",
      });

    let updatedData = await userModel.findOneAndUpdate(
      { _id: userId },
      updateQueries,
      {
        new: true,
      }
    );

    return res.status(200).send({
      status: true,
      message: "User profile details",
      data: updatedData,
    });
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

//======================================================DELETE USER=====================================================

const deleteUserById = async function (req, res) {
  try {
    const userId = req.params.id;
    if (!isValidObjectId(userId))
      return res.status(400).send({
        status: false,
        message: "Please enter valid USER Id in params",
      });

    const findUser = await userModel.findById(userId);
    if (!findUser) {
      return res.status(400).send({ status: false, message: "No user found" });
    }

    if (findUser.isDeleted == true) {
      return res
        .status(400)
        .send({ status: false, message: "User has been already deleted" });
    }

    const deletedUser = await userModel.findOneAndUpdate(
      { _id: userId },
      { $set: { isDeleted: true, deletedAt: new Date() } },
      { new: true }
    );

    return res.status(200).send({
      status: true,
      message: "Success",
      data: deletedUser,
    });
  } catch (err) {
    res.status(500).send({ status: false, message: err.message });
  }
};

module.exports = {
  createUser,
  userLogin,
  getProfile,
  updateUser,
  deleteUserById,
  getAllUser
};
