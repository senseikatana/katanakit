import { type Request, type Response, Router } from "express";

const router: Router = Router();

router.get("/", (_request: Request, response: Response) => {
	response.json({ message: "Get all users" });
});

router.get("/:id", (request: Request, response: Response) => {
	const { id = "" } = request.params;
	response.json({ message: `Get user by ${id}` });
});

router.post("/", (_request: Request, response: Response) => {
	response.json({ message: "Create a new user" });
});

export default router;
