import bcrypt from "bcrypt"
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import validator from "validator";
 const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique: true, 
        lowercase: true,
        trim: true,
        validate: [validator.isEmail, 'Invalid email']
    },
    password: {
         type: String,
         required: [true, "Password must be required"],
         select: false
    },
    role:{
        type: String,
        enum:["Junior","Senior"],
        required:true
    },
    branch:{
        type:String
    },
    year:{
        type:String
    },
    department:{
        type:String
    },
   skills:[
        { type: String }
    ],
    bio:{
        type: String
    },
    interests:[
        { type: String }
    ],
   
     refreshToken: {
         type: String,

     },
     verified: { type: Boolean, default: false },
     emailVerificationToken: String,


 }, { timestamps: true })
userSchema.index({ name: 'text', branch: 'text', skills: 'text' });
userSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10)
        next()
    } else {
        return next();
    }
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
        fullName: this.fullName
    },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({
        _id: this._id,
    },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

 export const User= mongoose.model("User",userSchema)