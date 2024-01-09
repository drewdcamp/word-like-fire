/* eslint-disable react-hooks/exhaustive-deps */
import "./App.css";
import * as React from "react";
import { useSearchParams } from "react-router-dom";
import AudioPlayer from "./AudioPlayer";
import readingPlan from "./planSplit";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const App = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [date, setDate] = React.useState();

  const passageList = React.useMemo(() => {
    if (date) return readingPlan[Index(date) % readingPlan.length];
  }, [date]);

  const passageString = React.useMemo(() => {
    if (passageList) {
      let passages = {};

      for (let passage of passageList) {
        let parts = passage.split(" ");
        let chapter = parts[parts.length - 1];
        parts.splice(parts.length - 1, 1);
        let book = parts.join(" ");

        if (!(book in passages)) {
          passages[book] = [];
        }

        passages[book].push(chapter);
      }

      let passageStrings = [];

      for (const book in passages) {
        if (book !== "Psalm") {
          let chapters = passages[book];
          let start = chapters[0];
          let end = chapters[chapters.length - 1];

          if (start !== end) {
            passageStrings.push(`${book} ${start}-${end}`);
          } else {
            passageStrings.push(`${book} ${start}`);
          }
        } else {
          let chapters = passages[book];

          if (chapters.length === 1) {
            passageStrings.push(`Psalm ${chapters[0]}`);
          } else {
            passageStrings.push(`Psalms ${chapters.join(", ")}`);
          }
        }
      }

      return passageStrings.join("; ");
    }

    return "Loading...";
  }, [passageList]);

  const rangeArray = React.useMemo(() => {
    if (date) {
      return DateRange(date);
    }

    return [new Date()];
  }, [date]);

  const inFrame = React.useMemo(() => {
    try {
      return window.self !== window.top;
    } catch (e) {
      return true;
    }
  }, []);

  React.useEffect(
    () => {
      let paramDate = searchParams.get("date");
      if (paramDate) {
        setDate(new Date(`${paramDate}T12:00:00.000Z`));
      } else {
        setDate(new Date());
      }
    },
    [
      /* Run Once On Load */
    ]
  );

  React.useEffect(() => {
    if (date) {
      if (IsoString(date) !== IsoString(new Date())) {
        setSearchParams({ date: IsoString(date) });
      } else {
        setSearchParams({});
      }
    }
  }, [date]);

  const isWeekday = (date) => {
    const day = date.getDay();
    return day !== 0 || isToday(date);
  };

  return (
    <div className="App">
      {inFrame ? (
        <div className="header">
          <div className="divider" />
          <DatePicker
            className="date-button"
            selectsRange={true}
            todayButton="Today"
            startDate={rangeArray[0]}
            endDate={rangeArray[rangeArray.length - 1]}
            onChange={(date) => {
              setDate(date[0]);
            }}
            filterDate={isWeekday}
            autofocus={true}
            withPortal
          />
          <div className="title-c">{passageString}</div>
          <div className="divider" />
        </div>
      ) : (
        <div className="header">
          <div className="title-a">
            WORD<span className="title-b">LIKE</span>FIRE
          </div>
          <div className="title-c">BIBLE READING CHALLENGE</div>
          <div className="divider" />
          <DatePicker
            className="date-button"
            selectsRange={true}
            todayButton="Today"
            startDate={rangeArray[0]}
            endDate={rangeArray[rangeArray.length - 1]}
            onChange={(date) => {
              setDate(date[0]);
            }}
            filterDate={isWeekday}
            autofocus={true}
            withPortal
          />
          <div className="title-c">{passageString}</div>
          <div className="divider" />
        </div>
      )}
      <AudioPlayer PassageList={passageList} className="body" />
    </div>
  );
};

////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////
// HELPER FUNCTIONS
////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////

const Index = (date) => {
  const start = new Date("09/12/2022");

  const dbd = Math.floor(
    (date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
  const wbd = Math.floor(dbd / 7);
  const dow = dbd % 7;

  return 3 * wbd + Math.floor(dow / 2);
};

const IsoString = (date) => {
  let iso = date.toISOString();
  return iso.substring(0, iso.indexOf("T"));
};

const isToday = (date) => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

const Tomorrow = (date) => {
  let tomorrow = new Date(date);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow;
};

const Yesterday = (date) => {
  let yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday;
};

const DateRange = (date) => {
  const dayOfWeek = date.getDay();

  if (dayOfWeek % 2 === 1) {
    return [date, Tomorrow(date)];
  }

  if (dayOfWeek !== 0) {
    return [Yesterday(date), date];
  }

  return [date];
};

export default App;
