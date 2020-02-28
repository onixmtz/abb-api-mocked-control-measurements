class App {
  private versionCode: number = 1;
  private versionName: string = "0.0.1";

  start() {
    (async () => {
      this.helloWorld();
    })();
  }

  async helloWorld() {
    const str = "Hello world";
    for (let s in str.split("")) {
      await timeout(Math.round(Math.random() * 200 + 100));
      console.log(str[s]);
    }
  }
}

const timeout = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

(new App()).start();
