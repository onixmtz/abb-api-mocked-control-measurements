import { Request, Response } from "express";
import { HttpMethod } from "../enums/HttpMethod";

export type IController = {
  method: HttpMethod;
  path: string;
  handler(req: Request,  res: Response): void;
}