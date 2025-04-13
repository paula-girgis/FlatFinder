export const register = asyncHandler(async (req, res, next) => {
  const { name, email, password, phoneNo, universityName, role, gender } = req.body;

  const isUser = await User.findOne({ email });
  if (isUser) return next(new Error("Email already exists!"), { cause: 409 });

  const hashedPassword = await bcryptjs.hash(password, Number(process.env.SALT_ROUND));
  const activationCode = Math.floor(100000 + Math.random() * 900000).toString();

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    phoneNo,
    universityName,
    role,
    gender,
    activationCode
  });

  const link = https://flat-finder-seven.vercel.app/auth/confirmEmail/${activationCode};

  // Send response immediately before sending email
  res.json({ success: true, message: "Account created. Please check your email to activate." });

  // Send email in background
  sendEmail({
    to: email,
    subject: "Activate your account",
    html: signupTemp(link)
  }).catch(err => {
    console.error("Email sending failed:", err);
    // Optionally update user or log the error
  });
});
