import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import App from "../App";
import { HttpMethod } from "../../lib/entities/enums/HttpMethod";
import { IController } from "../../lib/entities/interfaces/IController";


export default class IndexController implements IController {
  public readonly method = HttpMethod.Get;
  path: string = "/";

  handler(req: Request<ParamsDictionary>, res: Response): void {
    res.json({ version: App.versionName });
  }
}