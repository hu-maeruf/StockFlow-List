import AppError from "../../utils/AppError.js";
import reqBody from "../../utils/reqBody.js";
import { normalizeRegister, normalizeLogin } from "./auth.validation.js";
import { registerUser, loginUser, getProfile } from "./auth.service.js";

export const register = async (req, res) => {
  try {
    reqBody(req);
    const { name, email, password } = req.body;

    const input = normalizeRegister(name, email, password);
    await registerUser(input);

    return res.status(201).json({
      message: "Registered Successfully"
    })

  } catch (error) {

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        message: error.message
      })
    }

    console.error(error.message)
    return res.status(500).json({
      message: "Unexpected Error Occurred"
    })
  }
}

export const login = async (req, res) => {
  try {
    reqBody(req);
    const { email, password } = req.body;
    const input = normalizeLogin(email, password);

    const token = await loginUser(input);

    res.status(200).json({ token });
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        message: error.message
      })
    }
    console.error(error)
    return res.status(500).json({
      message: "Unexpected Error Occurred"
    })
  }
}

export const getMe = async (req, res) => {
  try {
    const user = getProfile();
    res.status(200).json(user.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Unexpected Error Occurred"
    })
  }
}