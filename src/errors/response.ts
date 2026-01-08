import { ErrorCode } from "./error_codes";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { HttpStatus } from "../utilities/http";

export const ERROR_RESPONSE_MAP: Record<
  ErrorCode,
  { status: ContentfulStatusCode; body: { success: false; message: string } }
> = {
  [ErrorCode.NO_PERMISSION]: {
    status: 403,
    body: {
      success: false,
      message: "No permission. Login as admin.",
    },
  },

  [ErrorCode.NOT_FOUND]: {
    status: 404,
    body: {
      success: false,
      message: "Resource not found.",
    },
  },

  [ErrorCode.RESOURCE_ALREADY_EXISTS]: {
    status: 500,
    body: {
      success: false,
      message: "Resource already exists",
    },
  },

  [ErrorCode.INVALID_INPUT]: {
    status: HttpStatus.UNAUTHORIZED,
    body: {
      success: false,
      message: "Invalid user name of password",
    },
  },

  [ErrorCode.INVALID_CREDENTIALS]: {
    status: HttpStatus.UNAUTHORIZED,
    body: {
      success: false,
      message: "Invalid username or password",
    },
  },

  [ErrorCode.UNAUTHORIZED]: {
    status: HttpStatus.UNAUTHORIZED,
    body: {
      success: false,
      message: "Unauthorized Request",
    },
  },

  [ErrorCode.AUTH_TOKEN_EXPIRED]: {
    status: HttpStatus.UNAUTHORIZED,
    body: {
      success: false,
      message: "Timeout, Login Again",
    },
  },

  [ErrorCode.MARKET_PRICE_UNAVAILABLE]: {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    body: {
      success: false,
      message: "Market Price is not avilable at the moment",
    },
  },

  [ErrorCode.INVALID_QUOTE]: {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    body: {
      success: false,
      message: "Quote cannot be found or completed",
    },
  },

  [ErrorCode.QUOTE_EXPIRED]: {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    body: {
      success: false,
      message: "Quote Expired",
    },
  },

  [ErrorCode.DUPLICATE_TRADE]: {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    body: {
      success: false,
      message: "Duplicate Trade Request, Create a new qoute",
    },
  },

  [ErrorCode.INSUFFICIENT_BALANCE]: {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    body: {
      success: false,
      message: "Isufficient Balance please topup",
    },
  },

  [ErrorCode.USER_DOESNT_EXIST]: {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    body: {
      success: false,
      message: "User youre trying to send doenst exist, check the email id.",
    },
  },

  [ErrorCode.JWT_RETURNED_STRING]: {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    body: {
      success: false,
      message: "JWT Returned string",
    },
  },

  [ErrorCode.DB_ERROR]: {
    status: HttpStatus.DB_ERROR,
    body: {
      success: false,
      message: "DB Error",
    },
  },
};
