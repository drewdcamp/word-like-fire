import "./WLF.css";
import * as React from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import Slider from "@mui/material/Slider";

import ReactAudioPlayer from 'react-audio-player';

import readingPlan from "./planSplit";
import bibleOverview from "./esvOverview";

const WLF = () => {
  const [date, setDate] = React.useState(new Date());

  ////                ////
  //   Passage Values   //
  ////                ////

  const Index = React.useMemo(() => {
    if (date) {
      const start = new Date("09/12/2022");

      const dbd = Math.floor(
        (date.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      );
      const wbd = Math.floor(dbd / 7);
      const dow = dbd % 7;

      return 3 * wbd + Math.floor(dow / 2);
    }
  }, [date]);

  const passageList = React.useMemo(() => {
    if (date) return readingPlan[Index % readingPlan.length];
  }, [Index, date]);

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

  ////             ////
  //   Date Values   //
  ////             ////

  const CustomDateInput = React.forwardRef(({ value, onClick }, ref) => (
    <button className="date-button" onClick={onClick} ref={ref}>
      {value}
    </button>
  ));

  const Tomorrow = React.useMemo(() => {
    let tomorrow = new Date(date);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  }, [date]);

  const Yesterday = React.useMemo(() => {
    let yesterday = new Date(date);
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday;
  }, [date]);

  const isToday = React.useCallback((date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }, []);

  const isWeekday = React.useCallback(
    (date) => {
      const day = date.getDay();
      return day !== 0 || isToday(date);
    },
    [isToday]
  );

  const DateRange = React.useMemo(() => {
    const dayOfWeek = date.getDay();

    if (dayOfWeek % 2 === 1) {
      return [date, Tomorrow];
    }

    if (dayOfWeek !== 0) {
      return [Yesterday, date];
    }

    return [date];
  }, [Tomorrow, Yesterday, date]);

  ////                     ////
  //   Audio Player Values   //
  ////                     ////

  const [passageIndex, setPassageIndex] = React.useState(0);

  const currentPassage = React.useMemo(() => {
    return passageList[passageIndex];
  }, [passageIndex, passageList]);

  const currentPassageSplit = React.useMemo(() => {
    if (currentPassage) {
      let parts = currentPassage.split(" ");
      let chapter = parts[parts.length - 1];
      parts.splice(parts.length - 1, 1);
      let book = parts.join(" ");

      return { book, chapter };
    }
  }, [currentPassage]);

  const currentAudioURL = React.useMemo(() => {
    if (currentPassageSplit.book === "Psalm" || bibleOverview[currentPassageSplit.book].chapterCount > 1) {
      return `https://white-sunset-a07f.drewdcamp6105.workers.dev/${currentPassageSplit.book}+${currentPassageSplit.chapter}`;
    } else {
      return `https://white-sunset-a07f.drewdcamp6105.workers.dev/${currentPassageSplit.book}`;
    }
  },[currentPassageSplit.book, currentPassageSplit.chapter]);

  const currentAudioBlob = React.useMemo(() => {
    const getAudioBlob = async () => {
          
      const { data } = await axios.get(currentAudioURL, {
        responseType: "arraybuffer",
        headers: {
          "Content-Type": "audio/wav",
        },
      });
    
      return new Blob([data], {
        type: "audio/wav",
      });
    };

    return await getAudioBlob();
  },[currentAudioURL])

  const currentAudioElement = React.useMemo(() => {
    if (currentAudioBlob) {
      const newAudio = new Audio(window.URL.createObjectURL(currentAudioBlob));
      return newAudio;
    }

    return null;
  }, [currentAudioBlob]);



  // const pressPlayButton = React.useCallback(() => {
  //   simulateMouseClick(iframeButton);
  // }, [iframeButton, simulateMouseClick]);

  return (
    <div className="WLF">
      <div className="header">
        <div className="title-main">
          WORD<span className="title-accent">LIKE</span>FIRE
        </div>
        <DatePicker
          selectsRange={true}
          selected={date}
          onChange={(date) => setDate(date[0])}
          customInput={<CustomDateInput />}
          startDate={DateRange[0]}
          endDate={DateRange[DateRange.length - 1]}
          filterDate={isWeekday}
          autofocus={true}
          withPortal
        />
        <div className="title-sub">{passageString}</div>
      </div>
      <div className="body">{currentAudioURL}</div>
      <div className="progress">
        
      </div>
      <div className="controls"></div>
    </div>
  );
};

export default WLF;
