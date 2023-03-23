/* eslint-disable react-hooks/exhaustive-deps */
import "./App.css";
import { useEffect, useState, forwardRef } from "react";
import { BrowserRouter, useSearchParams } from "react-router-dom";
import ReadingPlan from "./plan";
import ContentLoader from "react-content-loader";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const App = () => {
  return (
    <BrowserRouter>
      <AppWrapper />
    </BrowserRouter>
  );
};

const AppWrapper = () => {
  return (
    <div className="App">
      <div className="App-header">
        <div className="App-title-a">
          WORD<span className="App-title-b">LIKE</span>FIRE
        </div>
        <div className="App-title-c">BIBLE READING CHALLENGE</div>

        <div className="App-divider" />
      </div>
      <AppBody />
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
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [pickerOpen, setPickerOpen] = useState(false);
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

    let target = now;
    target.setDate(now.getDate() + 2);
    if (target.getDay() === 0) {
      target.setDate(target.getDate() + 1);
    }

    let iso = target.toISOString();
    iso = iso.substring(0, iso.indexOf("T"));

    setSearchParams({ date: iso });
  };

  const decrementDate = () => {
    let dateString = searchParams.get("date");

    const now = dateString
      ? new Date(`${dateString}T12:00:00.000Z`)
      : new Date();

    let target = now;
    target.setDate(now.getDate() - 2);
    if (target.getDay() === 0) {
      target.setDate(now.getDate() - 3);
    }

    let iso = target.toISOString();
    iso = iso.substring(0, iso.indexOf("T"));

    setSearchParams({ date: iso });
  };

  const chooseDate = (newDate) => {
    let iso = newDate[0].toISOString();
    iso = iso.substring(0, iso.indexOf("T"));

    let today = new Date().toISOString();
    today = today.substring(0, today.indexOf("T"));

    setSearchParams(iso === today ? {} : { date: iso });
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
      setStartDate(now);
      setEndDate(now);
      setScriptureTitle(`${date}`);
    } else if (dow % 2 === 0) {
      let tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);

      setStartDate(now);
      setEndDate(tomorrow);

      const startString = now.toLocaleDateString("en-us");
      const endString = tomorrow.toLocaleDateString("en-us");

      setScriptureTitle(`${startString} - ${endString}`);
      passageList = ReadingPlan[offset];
    } else {
      let yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);

      setStartDate(yesterday);
      setEndDate(now);

      let startString = yesterday.toLocaleDateString("en-us");
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

  const isValid = (date) => {
    const day = date.getDay();
    return day !== 0;
  };

  return (
    <div className="App-body">
      <div className="Date-holder">
        <button className="Date-button" onClick={decrementDate}>{`<<`}</button>
        <DatePicker
          className="Date-button"
          selectsRange={true}
          todayButton="Today"
          startDate={startDate}
          endDate={endDate}
          onChange={(date) => {
            chooseDate(date);
          }}
          filterDate={isValid}
          withPortal
        />
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