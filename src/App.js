import "./App.css";
import { useEffect, useState } from "react";
import ReadingPlan from "./plan";

function App() {
  const [scriptureTitle, setScriptureTitle] = useState(
    "Scripture for 01/01/2002 - 01/02/2002:"
  );

  const [passageObject, setPassageObject] = useState([]);

  useEffect(() => {
    const now = new Date();
    const start = new Date("09/12/2022");
    const dbd = Math.floor(
      (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    const wbd = Math.floor(dbd / 7);
    const dow = dbd % 7;

    let offset = 3 * wbd + Math.floor(dow / 2);
    let passageList = [];

    if (dow === 6) {
      let date = now.toLocaleDateString("en-us");
      setScriptureTitle(`No Scripture for ${date}`);
    } else if (dow % 2 === 0) {
      let endDate = new Date(now);
      endDate.setDate(endDate.getDate() + 1);

      const startString = now.toLocaleDateString("en-us");
      const endString = endDate.toLocaleDateString("en-us");

      setScriptureTitle(`Scripture for ${startString} - ${endString}:`);
      passageList = ReadingPlan[offset];
    } else {
      let startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 1);

      let startString = startDate.toLocaleDateString("en-us");
      let endString = now.toLocaleDateString("en-us");
      setScriptureTitle(`Scripture for ${startString} - ${endString}:`);
      passageList = ReadingPlan[offset];
    }

    let tempPassageObject = [];

    for (let passage of passageList) {
      tempPassageObject.push(Passage(passage));
    }

    setPassageObject(tempPassageObject);
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <text className="App-title-a">
          WORD<span className="App-title-b">LIKE</span>FIRE
        </text>
        <text className="App-title-c">BIBLE READING CHALLENGE</text>
      </header>
      <div className="App-divider" />
      <text className="App-title-c">{scriptureTitle}</text>
      {passageObject}
    </div>
  );
}

function Passage(passageString) {

  let queryString = passageString;
  queryString = queryString.replaceAll(' ', '+');
  queryString = queryString.replaceAll(',', '%2C');
  queryString = `https://www.esv.org/audio-player/${queryString}/`;

  return (
    <div className="Passage-holder">
      <iframe src={queryString} className="Passage-player" title={passageString} />
    </div>
  );
}

export default App;
