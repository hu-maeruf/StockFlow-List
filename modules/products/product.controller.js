import { addProducts, retrieveProducts } from "./product.service.js";
import { validateProduct } from "./product.validation.js";
import reqBody from "../../utils/reqBody.js"
import AppError from "../../utils/AppError.js";

export const postProduct = async (req, res) => {
  try {
    reqBody(req);
    const { product_name, pr_sku, pr_price } = req.body;
    const input = validateProduct(pr_sku, product_name, pr_price);
    const orgID = req.orgID;
    await addProducts(input.pr_sku, input.pr_name, input.pr_price, orgID);
    return res.status(200).json({
      message: "Product Added"
    })
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        message: error.message
      })
    }
    if (error.code === "23505") {
      return res.status(409).json({
        message: "product sku must be unique"
      })
    }
    console.error(error);
    return res.status(500).json({
      message: "Unexpected Error Occurred"
    })
  }
}

export const getProducts = async (req, res) => {
  try {
    const orgID = req.orgID;
    const prodcuts = await retrieveProducts(orgID);
    return res.status(200).json({
      "products": prodcuts
    })
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Unexpected Error Occurred"
    })
  }
}