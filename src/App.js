/* eslint-disable react-hooks/exhaustive-deps */
import "./App.css";
import * as React from "react";
import { useSearchParams } from "react-router-dom";
import AudioPlayer from "./AudioPlayer";
import readingPlan from "./planSplit"
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const App = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [date, setDate] = React.useState(new Date());

  const passageList = React.useMemo(() => {
    return readingPlan[Index(date)];
  }, [date])

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
          }
          else {
            passageStrings.push(`${book} ${start}`);
          }
        }
        else {
          let chapters = passages[book];

          if (chapters.length === 1) {
            passageStrings.push(`Psalm ${chapters[0]}`);
          }
          else {
            passageStrings.push(`Psalms ${chapters.join(", ")}`);
          }
        }
      }

      return passageStrings.join("; ");
    }

    return "Loading...";


  }, [passageList])

  const rangeArray = React.useMemo(() => {
    return DateRange(date);
  }, [date])

  const rangeString = React.useMemo(() => {
    if (rangeArray.length === 1) {
      return UsaString(rangeArray[0]);
    }

    return `${UsaString(rangeArray[0])} - ${UsaString(rangeArray[1])}`;
  }, [rangeArray])

  React.useEffect(() => {
    let paramDate = searchParams.get("date")
    if (paramDate) {
      setDate(new Date(`${paramDate}T12:00:00.000Z`));
    }
    else {
      setDate(new Date());
    }
  }, [/* Run Once On Load */])

  React.useEffect(() => {
    if (IsoString(date) !== IsoString(new Date())) {
      setSearchParams({ date: IsoString(date) });
    }
    else {
      setSearchParams({});
    }
  }, [date])

  const isWeekday = (date) => {
    const day = date.getDay();
    return (day !== 0) || isToday(date);
  };

  const handleCalendarOpen = () => {
    document.addEventListener('touchstart', (event) => {
        event.stopPropagation();
    }, true);
};

  return (
    <div className="App">
      <div className="header">
        <div className="title-a">
          WORD<span className="title-b">LIKE</span>FIRE
        </div>
        <div className="title-c">BIBLE READING CHALLENGE</div>
        <div className="divider" />
        <DatePicker
          onCalendarOpen={handleCalendarOpen}
          className="date-button"
          selectsRange={true}
          todayButton="Today"
          startDate={rangeArray[0]}
          endDate={rangeArray[rangeArray.length - 1]}
          onChange={(date) => {
            setDate(date[0]);
          }}
          filterDate={isWeekday}
          withPortal
          autofocus={true}
        />
        <div className="title-c">{passageString}</div>
        <div className="divider" />
      </div>
      <AudioPlayer PassageList={passageList} className="body"/>
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

  return (3 * wbd + Math.floor(dow / 2));
}

const IsoString = (date) => {
  let iso = date.toISOString();
  return iso.substring(0, iso.indexOf("T"));;
};

const UsaString = (date) => {
  let year = date.getFullYear();

  let month = (1 + date.getMonth()).toString();
  month = month.length > 1 ? month : '0' + month;

  let day = date.getDate().toString();
  day = day.length > 1 ? day : '0' + day;

  return month + '/' + day + '/' + year;
}

const isToday = (date) => {
  const today = new Date()
  return date.getDate() == today.getDate() &&
    date.getMonth() == today.getMonth() &&
    date.getFullYear() == today.getFullYear()
}

const NextDate = (date) => {
  let nextDate = new Date(date);
  const dayOfWeek = date.getDay();
  let offset = 2;
  if (dayOfWeek === 5) {
    offset = 3;
  }

  nextDate.setDate(nextDate.getDate() + offset);
  return nextDate;
};

const PrevDate = (date) => {
  let nextDate = new Date(date);
  const dayOfWeek = date.getDay();
  let offset = 2;
  if (dayOfWeek === 2) {
    offset = 3;
  }

  nextDate.setDate(nextDate.getDate() - offset);
  return nextDate;
};

const Tomorrow = (date) => {
  let tomorrow = new Date(date);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow;
}

const Yesterday = (date) => {
  let yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday;
}

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
