import * as z from "zod";

export const zcredentials = z.object({
  email: z.email(),
  password: z.string().min(3),
}); //increase the min number of chars in password out of dev and dont use magic numbers
export const zuuid = z.uuid();
export const zemail = z.email();
export const zcreditObject = z.object({
  currency: z.string().length(3),
  amount: z.coerce.number(),
  reciverEmail: z.email(),
});
export const zsymbol = z.string().length(3);
export const ztrade = z.object({
  quoteId: z.uuid(),
  reciverEmail: z.email().optional(),
});

export const zquote = z.object({
  pair: z.string().min(6).max(7),
  side: z.literal(["BUY", "SELL"]),
  amount: z.coerce.number(),
});
