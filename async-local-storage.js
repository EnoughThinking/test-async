const Benchmark = require("benchmark");
const { AsyncLocalStorage } = require("async_hooks");
const { writeFileSync, appendFileSync } = require("fs");

const suite = new Benchmark.Suite();
const ASL = new AsyncLocalStorage();

const makePromise = (value) =>
  new Promise((resolve) => process.nextTick(resolve(value)));

const run = (type, callback) => {
  if (type === "asl") {
    ASL.run(new Map(), callback);
  } else if (type === "witness") {
    callback();
  }
};

const json = '{"foo":"foo","bar":"bar","foobar":"foobar"}';

const func = async (json) => {
  // use an awaited promise to avoid v8 optimization
  const keys = await makePromise(Object.keys(JSON.parse(json)));

  return keys.length + 84;
};

const funcASL = async (json) => {
  const keys = await makePromise(Object.keys(JSON.parse(json)));
  const value = ASL.getStore().get("KEY");

  return keys.length + value;
};

const methods = {
  DeepASL: function () {
    return new Promise((resolve) => {
      run("asl", async () => {
        ASL.getStore().set("KEY", 84);
        const f = async () => {
          const f = async () => {
            const f = async () => {
              const f = async () => {
                const f = async () => {
                  const f = async () => {
                    const f = async () => {
                      const f = async () => {
                        const f = async () => {
                          const f = async () => {
                            const f = async () => {
                              const f = async () => {
                                const f = async () => {
                                  await funcASL(json);
                                };
                                await f();
                              };
                              await f();
                            };
                            await f();
                          };
                          await f();
                        };
                        await f();
                      };
                      await f();
                    };
                    await f();
                  };
                  await f();
                };
                await f();
              };
              await f();
            };
            await f();
          };
          await f();
        };
        await f();
        resolve();
      });
    });
  },
  ASL: function () {
    return new Promise((resolve) => {
      run("asl", async () => {
        ASL.getStore().set("KEY", 84);

        await funcASL(json);
        resolve();
      });
    });
  },
  Witness: function () {
    return new Promise((resolve) => {
      run("witness", async () => {
        await func(json);
        resolve();
      });
    });
  },
};

if (process.argv[2] === "ASL") {
  writeFileSync("ASL.txt", "");
  suite
    .add("ASL", methods["ASL"])
    .add("Witness", methods["Witness"])
    .on("cycle", function (event) {
      console.log(String(event.target));
    })
    .run({ async: true });
}

if (process.argv[2] === "DeepASL") {
  writeFileSync("DeepASL.txt", "");
  suite
    .add("DeepASL", methods["DeepASL"])
    .add("Witness", methods["Witness"])
    .on("cycle", function (event) {
      console.log(String(event.target));
    })
    .run({ async: true });
}
