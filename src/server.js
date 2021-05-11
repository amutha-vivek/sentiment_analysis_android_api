const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
require("./db/mongoose");
const Sentiment = require("sentiment");
const sentiment = new Sentiment();
const spawn = require("child_process").spawn;
const fs = require("fs");
const User = require("./models/user");

const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/signup", async (req, res) => {
  const postData = JSON.parse(req.body.PostData);
  console.log(postData);
  const user = new User(postData);
  try {
    await user.save();
    console.log(user);
    res.send("Yes");
  } catch (e) {
    console.log(e);
    res.send("No");
  }
});

app.post("/login", async (req, res) => {
  const postData = JSON.parse(req.body.PostData);
  console.log(postData.email);
  try {
    const user = await User.findByCredentials(
      postData.email,
      postData.password
    );
    res.send("Yes");
  } catch (e) {
    console.log(e);
    res.send("No");
  }
});

app.post("/keyword", (req, res) => {
  try {
    const postData = JSON.parse(req.body.PostData);
    console.log(postData);
    const keyword = postData.keyword;
    console.log(keyword);
    // setTimeout(() => {
    if (!fs.existsSync("uploads/" + keyword + ".txt")) {
      console.log("hello");
      const pythonProcess = spawn("python", [
        path.join(__dirname, "../py/Sentiment.py"),
        keyword
      ]);
      pythonProcess.stdout.on("data", async data => {
        let dataArray = JSON.stringify(data.toString());
        console.log(dataArray);
      });
      pythonProcess.stderr.pipe(process.stderr);
    }
    // }, 3000);

    // }, 3000);

    // const analysis = require("./sentimentAnalysis");

    let scoref = 0;
    let count = 0;
    let negCount = 0;
    let posCount = 0;
    let neuCount = 0;
    setTimeout(() => {
      try {
        let lineReader = require("readline").createInterface({
          input: require("fs").createReadStream("uploads/" + keyword + ".txt")
        });
        lineReader.on("line", line => {
          console.log(line);
          // console.log("Line from file:", line);
          let result = sentiment.analyze(line);
          scoref += result.score;
          if (result.score < 0) {
            negCount++;
          } else if (result.score > 0) {
            posCount++;
          } else {
            neuCount++;
          }
          count++;
          // await console.log(scoref);
        });
      } catch (e) {
        console.log(e);
        res.render("error");
      }

      setTimeout(() => {
        console.log(`Score: ${scoref}`);
        scoref = `Score: ${scoref}`;
        let negPercentage = `Negative: ${(negCount / count) * 100}%`;
        console.log(`Percentage: ${negPercentage}% Negative`);
        let posPercentage = `Positive: ${(posCount / count) * 100}%`;
        console.log(`Percentage: ${posPercentage}% Positive`);
        let neuPercentage = `Neutral: ${(neuCount / count) * 100}%`;
        console.log(`Percentage: ${neuPercentage}% Neutral`);
        res.send({
          scoref,
          negPercentage,
          posPercentage,
          neuPercentage
        });
      }, 6000);
    }, 7000);
  } catch (e) {
    console.log(e);
    res.send("error");
  }
});
// app.post("/file", upload.single("tweets"), (req, res) => {
//   console.log(req.file);
//   const fileName = req.file.filename;
//   let scoref = 0;
//   let count = 0;
//   let negCount = 0;
//   let posCount = 0;
//   let neuCount = 0;
//   setTimeout(() => {
//     try {
//       let lineReader = require("readline").createInterface({
//         input: require("fs").createReadStream("uploads/" + fileName)
//       });
//       lineReader.on("line", line => {
//         console.log(line);
//         // console.log("Line from file:", line);
//         let result = sentiment.analyze(line);
//         scoref += result.score;
//         if (result.score < 0) {
//           negCount++;
//         } else if (result.score > 0) {
//           posCount++;
//         } else {
//           neuCount++;
//         }
//         count++;
//         // await console.log(scoref);
//       });
//     } catch (e) {
//       console.log(e);
//       res.render("error");
//     }

//     setTimeout(() => {
//       console.log(`Score: ${scoref}`);
//       scoref = `Score: ${scoref}`;
//       let negPercentage = `Negative: ${(negCount / count) * 100}%`;
//       console.log(`Percentage: ${negPercentage}% Negative`);
//       let posPercentage = `Positive: ${(posCount / count) * 100}%`;
//       console.log(`Percentage: ${posPercentage}% Positive`);
//       let neuPercentage = `Neutral: ${(neuCount / count) * 100}%`;
//       console.log(`Percentage: ${neuPercentage}% Neutral`);
//       res.render("sentiment", {
//         scoref,
//         negPercentage,
//         posPercentage,
//         neuPercentage
//       });
//     }, 6000);
//   }, 7000);
// });

app.listen(process.env.PORT || 3000, () => {
  console.log("Server started on port 3000");
});
