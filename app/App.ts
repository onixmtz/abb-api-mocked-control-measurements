require("source-map-support").install();
const dotenv = require("dotenv");
const express = require("express");
import Core from "express-serve-static-core";
import { IController } from "../lib/entities/interfaces/IController";
import { isValidTcpPort } from "../lib/utils/Tools";
import IndexController from "./controller/IndexController";
import PartsGetController from "./controller/PartsGetController";
import PartsListController from "./controller/PartsListController";
import { IApp } from "./entities/interfaces/IApp";


export default class App {
  static readonly versionCode: number = 1;
  static readonly versionName: string = "0.0.1";

  protected static readonly DEFAULT_PORT = 8080;
  protected port: number = App.DEFAULT_PORT;
  protected static expressInstance?: Core.Express = undefined;
  private controllers: IController[] = [
    new IndexController(),
    new PartsListController(),
    new PartsGetController(),
  ];

  private constructor(port: number) {
    if (!isValidTcpPort(port)) {
      throw new Error(`Invalid port "${port}"`);
    }
    this.port = port;
  }

  private addController(controller: IController) {
    if (!App.expressInstance) {
      throw new Error("Can't add controllers without an Express instance");
    }
    const { method, path, handler } = controller;
    console.log(`Adding controller for path ${path}`);
    App.expressInstance[method](path, handler)
  }

  private addControllers() {
    this.controllers.forEach(this.addController);
  }

  static getPort(): number {
    const { PORT } = process.env;
    return PORT ? parseInt(PORT) : this.DEFAULT_PORT;
  }

  static createInstance(): IApp {
    dotenv.config();
    const port = App.getPort();
    try {
      return new App(port);
    } catch (e) {
      console.warn("\tError: ", e);
    }
    return new App(App.DEFAULT_PORT);
  }

  start() {
    console.log("Starting App...");
    App.expressInstance = express();
    this.addControllers();
    this.startListening();
  }

  private startListening() {
    if (!App.expressInstance) {
      throw new Error("Can't start listening without an Express instance");
    }
    App.expressInstance.listen(this.port, () => console.warn(`App STARTED!\n\tListening on tcp:${this.port}`));
  }
}
