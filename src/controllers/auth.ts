import { RequestHandler } from "express";
import { z } from "zod";
import * as auth from "../services/auth";

export const login: RequestHandler = async (req, res) => {
  const loginSchema = z.object({
    password: z.string(),
  });
  const body = loginSchema.safeParse(req.body);
  if (!body.success) return res.json({ error: "Dados inválidos" });

  if (auth.validatePassword(body.data.password)) {
    return res.json({
      token: auth.createToken(),
    });
  }
  return res.json({ error: "Senha inválida" });
};

export const validate: RequestHandler = (req, res, next) => {
  if (!req.headers.authorization)
    return res.status(403).json({ error: "Acesso negado" });

  const token = req.headers.authorization.split(" ")[1];
  if (!token || !auth.validateToken(token)) {
    return res.status(403).json({ error: "Acesso negado" });
  }
  return next();
};
