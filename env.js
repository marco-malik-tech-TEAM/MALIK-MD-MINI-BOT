import dotenv from "dotenv";
dotenv.config();

// TLS verification enabled - only disable if you have certificate issues
// if (process.env.NODE_ENV !== "production") {
//     process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
// }

export const NODE_ENV = process.env.NODE_ENV || "development";
export const PORT = process.env.PORT || 5000;
