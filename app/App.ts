require("source-map-support").install();
const dotenv = require("dotenv");
const express = require("express");
import Core from "express-serve-static-core";
import { Server } from "http";
import { IController } from "../lib/entities/interfaces/IController";
import { isValidTcpPort } from "../lib/utils/Tools";
import IndexController from "./controller/IndexController";
import PartsGetController from "./controller/PartsGetController";
import PartsListController from "./controller/PartsListController";
import { IApp } from "./entities/interfaces/IApp";
import MockedPartsRepository from "./services/MockedPartsRepository";


export default class App {
  static readonly versionCode: number = 3;
  static readonly versionName: string = "0.0.3";

  protected static readonly DEFAULT_PORT = 8080;
  protected port: number = App.DEFAULT_PORT;
  protected static expressInstance?: Core.Express = express();
  protected static httpInstance?: Server;
  private menuShown: boolean = false;
  private tlsPort?: number;

  private constructor(port?: number) {
    if (!isValidTcpPort(port!)) {
      throw new Error(`Invalid port "${port}"`);
    }
    const validPort = port || App.DEFAULT_PORT;

    const { TLS_ENABLED, TLS_CERT_PATH, TLS_KEY_PATH } = process.env;
    if (TLS_ENABLED && TLS_ENABLED === "true") {
      this.port = isValidTcpPort(validPort + 1) ? validPort + 1 : validPort - 1;
      try {
        if (!TLS_CERT_PATH || !TLS_KEY_PATH) {
          throw new Error(`Invalid paths to cert and/or key`);
        }
        this.tlsPort = port;
      } catch (e) {
        console.warn(`\nCould not start with TLS\n${e}\n\t`, ((e as Error).stack?.toString()
          .split("\n").filter((_, index) => index > 0 && index < 5).join("\n\t") + "\n\t\t\t...\n")
        );
        process.exit(2);
      }
    } else {
      this.port = port || App.DEFAULT_PORT;
    }
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
    [
      new IndexController(),
      new PartsListController(),
      new PartsGetController(),
    ].forEach(this.addController);
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
  async menu() {
    console.log(`\n  Menu:\n\n  1. Run 100 randomizations on data\n  2. Reinitialize data\n  3. Stop and exit`);
    return new Promise(resolve => {
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      readline.question(`    > `, (rawAnswer: string) => {
        readline.close();
        switch (rawAnswer) {
          case "1":
            MockedPartsRepository.getInstance().recalculateNewRandomizedDeviations(100);
            console.log("\nAdding 100 randomizations to dataset\n");
            break;
          case "2":
            console.log("\nReinitializing data...\n");
            MockedPartsRepository.getInstance().reset();
            break;
          case "3":
            process.exit(0);
        }
        setTimeout(resolve, 500);
      });
    });
  }
  async start() {
    console.log("Starting App...");
    this.startListening();
    this.addControllers();
    await (async () => new Promise(resolve => setTimeout(resolve, 100)))();
    if (!this.menuShown) {
      this.menuShown = true;
      while (true) {
        await this.menu();
      }
    }
  }

  private startListening() {
    if (!App.expressInstance) {
      throw new Error("Can't start listening without an Express instance");
    }

    App.httpInstance = App.expressInstance.listen(this.port, () => {
      console.warn(`App started:\tListening on http:${this.port}`);
      this.startListeningTls();
    });
  }

  private startListeningTls(): boolean {
    if (this.tlsPort) {
      const { TLS_CERT_PATH, TLS_KEY_PATH } = process.env;
      const https = require("https");
      const fs = require("fs");
      const [cert, key] = [fs.readFileSync(TLS_CERT_PATH), fs.readFileSync(TLS_KEY_PATH)];
      https.createServer({ cert, key }, App.expressInstance).listen(this.tlsPort);
      console.warn(`TLS started:\tListening on https:${this.tlsPort}`)
      return true;
    }
    return false;
  }
}
