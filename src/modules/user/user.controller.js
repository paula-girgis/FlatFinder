import { asyncHandler } from '../../utils/asynchandler.js';
import { User } from '../../../DB/models/user.model.js';
import bcryptjs from 'bcryptjs';
import crypto from 'crypto';
import { sendEmail } from './../../utils/sendEmails.js';
import { resetPassTemp, signupTemp } from './../../utils/generateHTML.js';
import { Token } from '../../../DB/models/token.model.js';
import jwt from 'jsonwebtoken';
import Randomstring from 'randomstring';

export const register = asyncHandler(async (req, res, next) => {
    const { FirstName,LastName, email, password, role } = req.body;
    const isUser = await User.findOne({ email });
    if (isUser) return next(new Error("Email already exists!"), { cause: 409 });

    const hashedPassword = bcryptjs.hashSync(password, Number(process.env.SALT_ROUND));
    const activationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const user = await User.create({
        FirstName,
        LastName,
        email,
        password: hashedPassword,
        role,
        activationCode
    });

    const baseUrl = process.env.NODE_ENV === 'production'
        ? `https://${req.get('host')}`
        : `${req.protocol}://${req.get('host')}`;
    const link = `${baseUrl}/auth/confirmEmail/${activationCode}`;

    const isSent = await sendEmail({
        to: email,
        subject: "Activate your account",
        html: signupTemp(link)
    });

    return isSent
        ? res.json({ success: true, message: "Activate your account!" })
        : next(new Error("Something went wrong!"));
});


// Activate Account
export const activateAcc = asyncHandler(async (req, res, next) => {
    const { activationCode } = req.params;
    const user = await User.findOneAndUpdate({ activationCode }, { isConfirmed: true, $unset: { activationCode: 1 } });
    if (!user) return next(new Error("Wrong activation code!"), { cause: 400 });
    return res.json({ success: true, message: "Your account is activated!" });
});

// Login
export const login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return next(new Error("Invalid email!"), { cause: 404 });
    if (!user.isConfirmed) return next(new Error("Email must be activated!"), { cause: 400 });
    
    const pass = bcryptjs.compareSync(password, user.password);
    if (!pass) return next(new Error("Wrong password!"), { cause: 400 });
    
    const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.TOKEN_KEY,
        { expiresIn: "3d" }
    );
    
    await Token.create({ token, user: user._id, agent: req.headers["user-agent"] });
    return res.json({ success: true, token });
});

// Send Forget Code
export const forgetCode = asyncHandler(async (req, res, next) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return next(new Error("Invalid email!"));
    
    const forgetCode = Randomstring.generate({ length: 5, charset: "numeric" });
    user.forgetCode = forgetCode;
    await user.save();
    
    return await sendEmail({ to: email, subject: "Reset your password", html: resetPassTemp(forgetCode) })
        ? res.json({ success: true, message: "Forget code sent!" })
        : next(new Error("Something went wrong!"));
});

// Reset Password
export const resetPassword = asyncHandler(async (req, res, next) => {
    const { forgetCode, password, email } = req.body;
    const user = await User.findOne({ email, forgetCode });
    if (!user) return next(new Error("Invalid code!"));
    
    user.password = bcryptjs.hashSync(password, Number(process.env.SALT_ROUND));
    user.forgetCode = undefined;
    await user.save();
    
    await Token.updateMany({ user: user._id }, { isValid: false });
    return res.json({ success: true, message: "Password updated! Try to log in." });
});
