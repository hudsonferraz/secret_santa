import { RequestHandler } from "express";
import * as people from "../services/people";
import { z } from "zod";

export const getAll: RequestHandler = async (req, res) => {
  const { id_event, id_group } = req.params;

  const items = await people.getAll({
    id_event: Number(id_event),
    id_group: Number(id_group),
  });

  if (items) return res.json({ people: items });
  res.json({ error: "Ocorreu um erro" });
};

export const getPerson: RequestHandler = async (req, res) => {
  const { id, id_event, id_group } = req.params;

  const personItem = await people.getOne({
    id: Number(id),
    id_event: Number(id_event),
    id_group: Number(id_group),
  });

  if (personItem) return res.json({ person: personItem });
  res.json({ error: "Ocorreu um erro" });
};

export const addPerson: RequestHandler = async (req, res) => {
  const { id_event, id_group } = req.params;

  const addPersonSchema = z.object({
    name: z.string(),
    phone_number: z.string(),
  });
  const body = addPersonSchema.safeParse(req.body);
  if (!body.success) return res.json({ error: "Dados inválidos" });

  const newPerson = await people.addPerson({
    id_event: Number(id_event),
    id_group: Number(id_group),
    name: body.data.name,
    phone_number: body.data.phone_number,
  });

  if (newPerson) return res.status(201).json({ person: newPerson });
  res.json({ error: "Ocorreu um erro" });
};

export const updatePerson: RequestHandler = async (req, res) => {
  const { id, id_event, id_group } = req.params;

  const updatePersonSchema = z.object({
    name: z.string().optional(),
    phone_number: z.string().optional(),
    matched: z.string().optional(),
  });
  const body = updatePersonSchema.safeParse(req.body);
  if (!body.success) return res.json({ error: "Dados inválidos" });

  const updatedPerson = await people.updatePerson(
    { id: Number(id), id_event: Number(id_event), id_group: Number(id_group) },
    body.data,
  );

  if (updatedPerson) {
    const personItem = await people.getOne({
      id: Number(id),
      id_event: Number(id_event),
    });
    return res.json({ person: personItem });
  }
  res.json({ error: "Ocorreu um erro" });
};

export const deletePerson: RequestHandler = async (req, res) => {
  const { id, id_event, id_group } = req.params;

  const deletedPerson = await people.deletePerson({
    id: Number(id),
    id_event: Number(id_event),
    id_group: Number(id_group),
  });

  if (deletedPerson) return res.json({ person: deletedPerson });
  res.json({ error: "Ocorreu um erro" });
};
