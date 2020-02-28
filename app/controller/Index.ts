import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { HttpMethod } from "../entities/enums/HttpMethod";
import { IController } from "../entities/interfaces/IController";
import App from "../App";

export default class IndexController implements IController {
  public readonly method = HttpMethod.Get;
  path: string = "/";

  handler(req: Request<ParamsDictionary>, res: Response): void {
    res.send(JSON.stringify({ version: App.versionName }));
  }
}