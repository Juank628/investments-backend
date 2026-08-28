import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { ICreateUserBody, ILoginBody } from "./users.types";
import { JWT_EXPIRATION_TIME } from "./users.constants";
import User from "../models/User";

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, password } = req.body as ICreateUserBody;
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  if (!email || !password) {
    res.status(422).json({
      error: "Missing required parameters",
      details: {
        email: !email ? "email is required" : undefined,
        password: !password ? "password is required" : undefined,
      },
    });
    return;
  }

  if (!passwordRegex.test(password)) {
    res.status(422).json({
      error: "Invalid password",
      details: {
        password:
          "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character",
      },
    });
    return;
  }

  const user = await User.findOne({ where: { email } });

  if (user) {
    res.status(409).json({
      error: "User already exists",
    });
    return;
  }

  try {
    const encryptedPassword = await bcrypt.hash(password, 10);
    await User.create({ email, password: encryptedPassword });
    res.status(201).json({
      message:
        "User created successfully. Contact the admin to assign the role to the user",
    });
    return;
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email, password } = req.body ?? {} as ILoginBody;

  if (!email || !password) {
    res.status(422).json({
      error: "Missing required parameters",
      details: {
        email: !email ? "email is required" : undefined,
        password: !password ? "password is required" : undefined,
      },
    });
    return;
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    if (user.blocked) {
      res
        .status(401)
        .json({ error: "User blocked. Contact the admin to unblock" });
      return;
    }

    const isAuth = await bcrypt.compare(password, user.password);

    if (!isAuth) {
      res.status(401).json({ error: "Invalid credentials" });
      user.attempts = user.attempts + 1;
      user.blocked = user.attempts >= 3;
      user.save();
      return;
    }

    if (!user.role) {
      res.status(401).json({ error: "User not assigned to a role" });
      return;
    }

    user.attempts = 0;
    user.blocked = false;
    user.save();

    const privateKey = process.env.JWT_PRIVATE_KEY;

    if (!privateKey) {
      res.status(500).json({ error: "Internal server error" });
      return;
    }

    const token = jwt.sign(
      {
        email: user.email,
        role: user.role,
      },
      privateKey,
      {
        expiresIn: JWT_EXPIRATION_TIME[user.role],
      },
    );

    const isProduction = process.env.NODE_ENV === "production";

    res
      .status(201)
      .cookie("access_token", token, {
        httpOnly: true, //cookie can not be read using javascript on the client
        secure: isProduction, //only https clients on production
        //in production UI and backend are on different domains, so SameSite=None is required;
        //browsers reject None without Secure, so dev (proxied, same-origin) uses Lax instead
        sameSite: isProduction ? "none" : "lax",
        maxAge: JWT_EXPIRATION_TIME[user.role] * 1000,
        path: "/",
      })
      .json({ message: "success" });
  } catch (error) {
    next(error);
  }
};
