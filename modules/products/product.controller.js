import { addProducts, retrieveProducts, retrieveProductByID, updatePatch, delProduct, filterProducts } from "./product.service.js";
import { getProductByFilter, updatedValues, validateProduct } from "./product.validation.js";
import reqBody from "../../utils/reqBody.js"
import AppError from "../../utils/AppError.js";

export const postProduct = async (req, res) => {
  try {
    reqBody(req);
    const { product_name, pr_sku, pr_price } = req.body;
    const input = validateProduct(pr_sku, product_name, pr_price);
    const orgID = req.orgID;
    await addProducts(input.pr_sku, input.pr_name, input.pr_price, orgID);
    return res.status(201).json({
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
    const key = Object.keys(req.query);
    const input = req.query;
    if (key.length > 0) {
      const result = getProductByFilter(input, key, orgID);
      const products = await filterProducts(result);
      return res.status(200).json({
        "products": products
      })
    }
    const products = await retrieveProducts(orgID);
    return res.status(200).json({
      "products": products
    })
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        message: error.message
      })
    }
    console.error(error);
    return res.status(500).json({
      message: "Unexpected Error Occurred"
    })
  }
}

export const getProductByID = async (req, res) => {
  try {
    const orgID = req.orgID;
    const prID = Number(req.params.productId);
    if (!Number.isSafeInteger(prID) || prID <= 0) {
      return res.status(404).json({
        message: "Product Not Found"
      })
    }
    const prodcuts = await retrieveProductByID(orgID, prID);
    if (prodcuts.length === 0) {
      return res.status(404).json({
        message: "Product Not Found"
      })
    }
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

export const patchProduct = async (req, res) => {
  try {
    reqBody(req);
    const prID = Number(req.params.productId);
    if (!Number.isSafeInteger(prID) || prID <= 0) {
      return res.status(404).json({
        message: "Product Not Found"
      })
    }
    const orgID = req.orgID;
    const { values, updates } = updatedValues(req.body, prID, orgID);
    const result = await updatePatch(values, updates);
    if (result.length === 0) {
      return res.status(404).json({
        message: "Product Not Found"
      })
    }
    return res.status(200).json(result);
  } catch (error) {

    if (error.code === "23505") {
      return res.status(409).json({
        message: "product sku must be unique"
      })
    }

    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        message: error.message
      })
    }
    console.error(error);
    return res.status(500).json({
      message: "Unexpected Error Occurred"
    })
  }
}

export const deleteProduct = async (req, res) => {
  try {
    const orgID = req.orgID;
    const prID = Number(req.params.productId);
    if (!Number.isSafeInteger(prID) || prID <= 0) {
      return res.status(404).json({
        message: "Product Not Found"
      })
    }
    const result = await delProduct(prID, orgID);
    if (result.length === 0) {
      return res.status(404).json({
        message: "Product Not Found"
      })
    }
    return res.status(200).json({
      message: "Product deleted"
    })
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Unexpected Error Occurred"
    })
  }
}