import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { HttpMethod } from "../../lib/entities/enums/HttpMethod";
import { IController } from "../../lib/entities/interfaces/IController";


export default class PartsListController implements IController {
  public readonly method = HttpMethod.Get;
  path: string = "/parts/list";

  handler(req: Request<ParamsDictionary>, res: Response): void {
    res.json({ parts: [{ partId: "1" }] });
  }
}