import { watchFile } from "fs";
import { fork, type ChildProcess } from "child_process";

let child: ChildProcess | null = null;

function start() {
  child = fork("server.ts", {
    execArgv: ["--import", "tsx/esm"],
    stdio: "inherit",
  });
}

start();

watchFile("server.ts", { interval: 500 }, () => {
  console.log("↻ server.ts changed — restarting runtime...");
  child?.kill();
  start();
});
