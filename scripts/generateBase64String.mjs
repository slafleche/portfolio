import readline from "readline";
import svg64 from "svg64";
import { readFileSync } from "fs";
import path from "path";
import fs from "fs";
import chalk from "chalk";

const directoryPath = path.join(process.cwd(), "src/svgs");

function pbcopy(data) {
  return new Promise(function (resolve, reject) {
    const proc = require("child_process").spawn("pbcopy");
    proc.on("error", function (err) {
      reject(err);
    });
    proc.on("close", function (err) {
      resolve();
    });
    proc.stdin.write(data);
    proc.stdin.end();
  });
}

const listAllSVGs = (svgs) => {
  var output = "\n";

  for (var i = 0; i < svgs.length; i++) {
    const { label, source } = svgs[i];
    output += `${label}: \n\n${svg64(readFileSync(source, "utf-8"))}\n\n`;
  }
  return output;
};

const getSVGsFromFolder = () => {
  const svgs = [];
  return new Promise((resolve, reject) => {
    fs.readdir(directoryPath, function (error, data) {
      if (error) {
        reject(error);
      } else {
        data
          .filter((svg) => {
            return svg.endsWith(".svg");
          })
          .forEach(function (svg) {
            svgs.push({
              label: svg.replaceAll(".svg", ""),
              source: path.resolve(directoryPath, svg),
            });
          });
        resolve(svgs);
      }
    });
  });
};

const getUserInput = (menu, svgs) => {
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(menu, (answer) => {
      if (answer == "a") {
        const allSvgs = listAllSVGs(svgs);
        console.log("\n");
        console.log(allSvgs);
        console.log("\n\n");
        resolve(allSvgs);
      } else {
        try {
          const svg = svgs[answer];
          const data = svg64(readFileSync(path.resolve(svg.source), "utf-8"));
          pbcopy(data);
          resolve(data + "\n\nCopied to clipboard!\n");
        } catch (error) {
          console.log("Invalid Selection, try again...\n");
          process.exit(1);
          reject(error);
        }
      }
    });
  });
};

getSVGsFromFolder().then(
  (svgs) => {
    let menu =
      chalk.green(`\n > Would you like to:\n`) +
      `\n  (${chalk.cyan("A")}) Print out ${chalk.yellow.underline.italic(
        "all"
      )} SVGs?\n`;

    for (var i = 0; i < svgs.length; i++) {
      menu += `  (${chalk.cyan(i)}) Print out ${chalk.yellow(
        chalk(svgs[i].label.replaceAll(/.svg$/gi, ""))
      )}.svg\n`;
    }
    menu += "\n";

    try {
      getUserInput(menu, svgs).then((result) => {
        console.log(`\n${result}`);
        process.exit(0);
      });
    } catch (error) {
      console.log("\n error processing folders: ", error);
      process.exit(1);
    }
  },
  (error) => {
    console.log("Unable to read SVGs in directory: " + error);
    process.exit(1);
  }
);
