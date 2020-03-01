import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { HttpMethod } from "../../lib/entities/enums/HttpMethod";
import { IController } from "../../lib/entities/interfaces/IController";
import MockedPartsRepository from "../services/MockedPartsRepository";


export default class PartsGetController implements IController {
  public readonly method = HttpMethod.Get;
  path: string = "/parts/:id";

  handler(req: Request<ParamsDictionary>, res: Response): void {
    res.json(MockedPartsRepository.getInstance().get(req.params.id));
  }
}