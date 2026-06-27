import { Router } from "express";
import * as auth from "../controllers/auth";
import * as events from "../controllers/events";
import * as groups from "../controllers/groups";

const router = Router();

router.post("/login", auth.login);

router.get("/ping", auth.validate, (req, res) =>
  res.json({ pong: true, admin: true }),
);

router.get("/events", auth.validate, events.getAll);
router.get("/events/:id", auth.validate, events.getEvent);
router.post("/events", auth.validate, events.addEvent);
router.put("/events/:id", auth.validate, events.updateEvent);
router.delete("/events/:id", auth.validate, events.deleteEvent);

router.get("/groups/:id_event", auth.validate, groups.getAll);
router.get("/groups/:id_event/:id", auth.validate, groups.getGroup);
router.post("/groups/:id_event", auth.validate, groups.addGroup);

export default router;
