const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserModel = require("../Models/user");

const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");
require("dotenv").config();
const crypto = require("crypto");


// Temporary store for OTPs (can use Redis or DB in production)
let otpStore = {};
const sendOTP = async (req, res) => {
  try {
    const { name, email, password,latitude=null,longitude=null, role='citizen'} = req.body;
    
    console.log("Received signup data:", req.body);
    console.log("Sending email to:", email);


    // check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "User already exists" });
    }

    // generate 6-digit OTP
    const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });
    otpStore[email] = { otp, name, password, latitude, longitude, role, createdAt: Date.now() };


    // send email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
  from: process.env.EMAIL_USER,
  to: email,
  subject: "Civix - Email Verification OTP",
  html: `
  <div style="font-family: Poppins, sans-serif; background-color:#000; color:white; padding:20px; text-align:center;">
    <h2 style="color:#8f00ff;">Welcome to Civix!</h2>
    <p>Hello <strong>${name}</strong>,</p>
    <p>Thank you for signing up. Please use the OTP below to verify your account:</p>
    <h1 style="letter-spacing: 6px; color: #5468ff;">${otp}</h1>
    <p>This OTP will expire in <b>5 minutes</b>. Do not share it with anyone.</p>
    <hr style="border: 0.5px solid #333; margin: 20px 0;" />
    <p style="color: #bbb; font-size: 13px;">© ${new Date().getFullYear()} Civix | All Rights Reserved.</p>
  </div>
  `,
};


    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: "OTP sent to your email" });

  } catch (err) {
    console.error("❌ Error in sendOTP:", err.message);
  res.status(500).json({
    success: false,
    message: "Error sending OTP",
    error: err.message,
  });
}

};


const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const record = otpStore[email];

    if (!record) {
      return res.status(400).json({ success: false, message: "OTP expired or not found" });
    }

    const { name, password, otp: storedOtp, createdAt,latitude,longitude,role} = record;

    // check OTP validity (5 minutes)
    if (Date.now() - createdAt > 5 * 60 * 1000) {
      delete otpStore[email];
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    if (otp !== storedOtp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    // hash password and save user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new UserModel({ name, email, password: hashedPassword,
      role: role || 'citizen',
      latitude: latitude ===undefined ? null : latitude,
      longitude: longitude ===undefined ? null : longitude
     });
    await newUser.save();

    delete otpStore[email];

    res.status(201).json({ success: true, message: "Signup successful. You can now login." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


// const signup=async(req,res)=>{

//     try{
//         const{name, email, password}=req.body;
//         const user=await UserModel.findOne({email});

//         if(user){
//             return res.status(403)
//             .json({message:'User Is Already Exists,You Can Login',success:false});
//         }
//         const userModel=new UserModel({name, email, password});
//         userModel.password=await bcrypt.hash(password,10); //hashing password for security
//         await userModel.save();
//         res.status(201)
//         .json({message:"Signup successfully",success:true});

//     }
//     catch(err){
//         res.status(500)
//         .json({
//             message:"Internal Server Error",
//             success:false
//         });
//     }
   
// }


const login=async(req,res)=>{

    try{
        const{email, password}=req.body;
        const user=await UserModel.findOne({email});
        const errorMsg='Auth Failed Email or password is wrong';
        if(!user){
            return res.status(403)
            .json({message:errorMsg,success:false});
        }
        const isPassEqual=await bcrypt.compare(password,user.password);
        if(!isPassEqual){
            return res.status(403)
            .json({message:errorMsg,success:false});
        }
        const token=jwt.sign(
            { email:user.email,  _id:user._id},
            process.env.JWT_SECRET,
            {expiresIn:'24h'}
        );

         // 👇 Print user detail in console
        console.log("✅ Logged-in user details:", {
            id: user._id,
            name: user.name,
            email: user.email
        });

        res.status(200)
        .json({message:"Login success",
            success:true,
            token,
            email,
            name:user.name,
            role:user.role,
            id:user._id
        });

    }
    catch(err){
        res.status(500)
        .json({
            message:"Internal Server Error",
            success:false
        });
    }
   
}


// ---------------------- FORGOT PASSWORD (OTP Based) ----------------------
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    // Generate OTP
    const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });
    otpStore[email] = { otp, createdAt: Date.now() };

    // Send OTP email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Civix - Password Reset OTP",
      html: `
      <div style="font-family:Poppins, sans-serif; padding:20px; background:#000; color:#fff; text-align:center">
        <h2 style="color:#8f00ff;">Civix Password Reset</h2>
        <p>Your OTP for resetting your password is:</p>
        <h1 style="letter-spacing:3px; color:#5468ff;">${otp}</h1>
        <p>This OTP will expire in <b>5 minutes</b>.</p>
      </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: "OTP sent to your email" });

  } catch (err) {
    console.error("❌ Error in forgotPassword (OTP):", err);
    res.status(500).json({ success: false, message: "Error sending OTP", error: err.message });
  }
};


// ---------------------- VERIFY OTP & RESET PASSWORD ----------------------
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const record = otpStore[email];
    if (!record)
      return res.status(400).json({ success: false, message: "OTP expired or not found" });

    const { otp: storedOtp, createdAt } = record;

    // check expiry (5 mins)
    if (Date.now() - createdAt > 5 * 60 * 1000) {
      delete otpStore[email];
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    // check otp match
    if (otp !== storedOtp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    // update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await UserModel.updateOne({ email }, { $set: { password: hashedPassword } });

    delete otpStore[email];

    res.status(200).json({ success: true, message: "Password reset successfully" });
  } catch (err) {
    console.error("❌ Error in resetPassword (OTP):", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};





module.exports = {
  sendOTP,
  verifyOTP,
  login,
  forgotPassword,
  resetPassword,
};
