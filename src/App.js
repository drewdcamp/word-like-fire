/* eslint-disable react-hooks/exhaustive-deps */
import "./App.css";
import { useEffect, useState, useMemo } from "react";
import { BrowserRouter, useSearchParams  } from "react-router-dom";
import ReadingPlan from "./plan";
import ContentLoader from "react-content-loader";

const App = () => {
  return (
    <BrowserRouter>
      <AppWrapper />
    </BrowserRouter>
  );
};

const AppWrapper = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  return (
    <div className="App">
      <div className="App-header">
        <div className="App-title-a">
          WORD<span className="App-title-b">LIKE</span>FIRE
        </div>
        <div className="App-title-c">BIBLE READING CHALLENGE</div>

        <div className="App-divider" />
      </div>
      <AppBody/>
      <footer className="App-footer">
        <p>
          Download the reading plan{" "}
          <a href="https://www.boonesferry.church/word-like-fire">here</a>.
          {"\n"}
        </p>
        <p>
          Scripture audio is from The ESV® Bible (The Holy Bible, English
          Standard Version®), copyright © 2001 by Crossway, a publishing
          ministry of Good News Publishers. Used by permission. All rights
          reserved.{" "}
        </p>
      </footer>
    </div>
  );
};

const AppBody = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [passageObject, setPassageObject] = useState([]);
  const [scriptureTitle, setScriptureTitle] = useState(
    "Scripture for 01/01/2002 - 01/02/2002:"
  );

  const incrementDate = () => {
    let dateString = searchParams.get("date");
    const now = dateString
      ? new Date(`${dateString}T12:00:00.000Z`)
      : new Date();

    console.log(now);

    const day = now.getDay();
    let target = new Date()
    target.setDate(now.getDate() + (day === 5 ? 3 : 2));
    
    let iso = target.toISOString();
    iso = iso.substring(0, iso.indexOf("T"));

    setSearchParams({"date" : iso});
  };

  const decrementDate = () => {
    let dateString = searchParams.get("date");

    const now = dateString
      ? new Date(`${dateString}T12:00:00.000Z`)
      : new Date();

    

    const day = now.getDay();
    let target = new Date();
    target.setDate(now.getDate() - (day === 2 ? 3 : 2));
    
    let iso = target.toISOString();
    iso = iso.substring(0, iso.indexOf("T"));

    setSearchParams({"date" : iso});
  };

  useEffect(() => {
    let dateString = searchParams.get("date");
    const now = dateString
      ? new Date(`${dateString}T12:00:00.000Z`)
      : new Date();
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
      setScriptureTitle(`${date}`);
    } else if (dow % 2 === 0) {
      let endDate = new Date(now);
      endDate.setDate(endDate.getDate() + 1);

      const startString = now.toLocaleDateString("en-us");
      const endString = endDate.toLocaleDateString("en-us");

      setScriptureTitle(`${startString} - ${endString}`);
      passageList = ReadingPlan[offset];
    } else {
      let startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 1);

      let startString = startDate.toLocaleDateString("en-us");
      let endString = now.toLocaleDateString("en-us");
      setScriptureTitle(`${startString} - ${endString}`);
      passageList = ReadingPlan[offset];
    }

    let tmpPassageObject = [];

    for (let i = 0; i < passageList.length; i++) {
      tmpPassageObject.push(
        <Passage key={passageList[i]} passageString={passageList[i]} />
      );
    }

    setPassageObject(tmpPassageObject);
  }, [searchParams.get("date")]);

  return (
    <div className="App-body">
      <p className="App-title-d">Viewing Scripture For:</p>
      <div className="Date-holder">
        <button className="Date-button" onClick={decrementDate}>{`<<`}</button>
        <button className="Date-button">{scriptureTitle}</button>
        <button className="Date-button" onClick={incrementDate}>{`>>`}</button>
      </div>
      {passageObject}
    </div>
  );
};

const Passage = ({ passageString }) => {
  const [activeClass, setActiveClass] = useState("Passage-player-loading");
  const [placeholderClass, setPlaceholderClass] =
    useState("Placeholder-active");
  const [queryString, setQueryString] = useState("");

  useEffect(() => {
    let tmp = passageString;
    tmp = tmp.replaceAll(" ", "+");
    tmp = tmp.replaceAll(",", "%2C");
    tmp = `https://www.esv.org/audio-player/${tmp}/`;
    setQueryString(tmp);

    const timeout = setTimeout(() => {
      setActiveClass("Passage-player-loaded");
      setPlaceholderClass("Placeholder-inactive");
    }, 500);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="Passage-holder">
      <ContentLoader
        className={placeholderClass}
        preserveAspectRatio="none"
        backgroundColor="#463025"
        foregroundColor="#564035"
        animateBegin="-0.1"
        speed={1}
        viewBox="0 0 100 100"
      >
        <rect x="0" y="30" width="100" height="70" />
        <rect x="0" y="0" width="20" height="20" />
        <rect x="85" y="0" width="15" height="20" />
      </ContentLoader>
      <iframe src={queryString} className={activeClass} title={passageString} />
    </div>
  );
};

export default App;
