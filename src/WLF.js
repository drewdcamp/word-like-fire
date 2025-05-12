import "./WLF.css";
import * as React from "react";
import Slider from "@mui/material/Slider";
import Dialog from "@mui/material/Dialog";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import {
  FiPause,
  FiPlay,
  FiSkipBack,
  FiSkipForward,
  FiInfo,
  FiCast,
} from "react-icons/fi";

import useScriptureAudio from "./useScriptureAudio";

import readingPlan from "./planSplit";
import esvLogo from "./esv-logo.png";
import bibleOverview from "./esvOverview";

const WLF = () => {
  const [date, setDate] = React.useState(new Date());

  const inIframe = React.useMemo(() => {
    try {
      return window.self !== window.top;
    } catch (e) {
      return true;
    }
  }, []);

  ////                ////
  //   Passage Values   //
  ////                ////

  const Index = React.useMemo(() => {
    if (date) {
      const oldStart = new Date("09/12/2022");
      const newStart = new Date("05/12/2025");

      const start = date < newStart ? oldStart : newStart;

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

      return passageStrings;
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

  React.useEffect(() => {
    setPassageIndex(0);
  }, [passageList]);

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

  const [loading, audioElement] = useScriptureAudio(currentPassage);
  const [progress, setProgress] = React.useState(false);

  const duration = React.useMemo(() => {
    return 1 + Math.floor(
      bibleOverview[currentPassageSplit.book].chapterTimings[
        currentPassageSplit.chapter - 1
      ] / 1000.0
    );
  }, [currentPassageSplit.book, currentPassageSplit.chapter]);

  const progressString = React.useMemo(() => {
    let minutesInt = Math.floor(progress / 60);
    let secondsInt = Math.floor(progress % 60);
    let minutes = `${minutesInt < 10 ? "0" : ""}${minutesInt}`;
    let seconds = `${secondsInt < 10 ? "0" : ""}${secondsInt}`;
    return `+${minutes}:${seconds}`;
  }, [progress]);

  const timeLeftString = React.useMemo(() => {
    let timeLeft = duration - progress;
    let minutesInt = Math.floor(timeLeft / 60);
    let secondsInt = Math.floor(timeLeft % 60);
    let minutes = `${minutesInt < 10 ? "0" : ""}${minutesInt}`;
    let seconds = `${secondsInt < 10 ? "0" : ""}${secondsInt}`;
    return `-${minutes}:${seconds}`;
  }, [progress, duration]);

  const canGoBack = React.useMemo(() => {
    return passageIndex > 0;
  }, [passageIndex]);

  const canGoForward = React.useMemo(() => {
    return passageIndex < passageList.length - 1;
  }, [passageIndex, passageList]);

  const [dialogOpen, setDialogOpen] = React.useState(false);

  const [sliderHeld, setSliderHeld] = React.useState(false);

  const canPlay = React.useMemo(() => {
    return !loading && !sliderHeld;
  },[loading, sliderHeld])

  const [shouldPlay, setShouldPlay] = React.useState(false)

  const playing = React.useMemo(() => {
    return canPlay && shouldPlay;
  }, [canPlay, shouldPlay])

  const playCallback = React.useCallback(() => {
    setShouldPlay(true);
    audioElement.play();
  }, [audioElement]);

  const pauseCallback = React.useCallback(() => {
    setShouldPlay(false);
    audioElement.pause();
  }, [audioElement]);

  const nextCallback = React.useCallback(() => {
    setProgress(0);
    setPassageIndex((previousIndex) => {
      return previousIndex + 1;
    });
  }, []);

  const prevCallback = React.useCallback(() => {
    setProgress(0);
    setPassageIndex((previousIndex) => {
      return previousIndex - 1;
    });
  }, []);

  const startTimer = React.useCallback(() => {
    clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      if (audioElement.ended) {
        if (!(passageIndex === passageList.length - 1)) {
          audioElement.currentTime = 0;
          setPassageIndex((previousIndex) => {
            return previousIndex + 1;
          });
        } else {
          audioElement.pause();
        }
      } else {
        setProgress(audioElement.currentTime);
      }
    }, [50]);
  }, [audioElement, passageIndex, passageList.length]);

  React.useEffect(() => {
    if (audioElement) {
      if (playing) {
        audioElement.play();
        startTimer();
      } else {
        audioElement.pause();
      }
    }
  }, [audioElement, playing, startTimer]);

  const [oldAudioElement, setOldAudioElement] = React.useState(null);

  React.useEffect(() => {
    if (audioElement) {
      audioElement.currentTime = 0;

      if (oldAudioElement && oldAudioElement !== audioElement) {
        oldAudioElement.pause();
        audioElement.currentTime = 0;
      }

      setOldAudioElement(audioElement);
    }
  }, [audioElement, oldAudioElement]);

  React.useEffect(() => {
    if (!playing && audioElement) {
      audioElement.currentTime = progress;
    }
  }, [progress, playing, audioElement]);

  React.useEffect(() => {
    if (playing && audioElement?.currentTime) {
      setProgress(audioElement?.currentTime);
    }
  }, [audioElement?.currentTime, playing]);

  const intervalRef = React.useRef();

  return (
    <div className="WLF">
      <Dialog
        PaperProps={{
          style: {
            backgroundColor: "hsla(25, 5%, 20%, 0.95)",
            padding: "16px",
            boxShadow: "none",
            color: "white",
          },
        }}
        onClose={() => {
          setDialogOpen(false);
        }}
        open={dialogOpen}
      >
        {inIframe ? (
          <p>
            Download the audio app{" "}
            <a
              href="https://drewdcamp.github.io/word-like-fire/"
              target="_blank"
              rel="noreferrer"
            >
              here
            </a>
            .{"\n"}
          </p>
        ) : (
          <p>
            Download the reading plan{" "}
            <a
              href="https://www.boonesferry.church/word-like-fire"
              target="_blank"
              rel="noreferrer"
            >
              here
            </a>
            .{"\n"}
          </p>
        )}

        <p>
          Scripture audio is from The ESV® Bible (The Holy Bible, English
          Standard Version®), copyright © 2001 by Crossway, a publishing
          ministry of Good News Publishers. Used by permission. All rights
          reserved.{" "}
        </p>
      </Dialog>

      <div className="header">
        {inIframe ? (
          <div className="title-main"></div>
        ) : (
          <div className="title-main">
            WORD<span className="title-accent">LIKE</span>FIRE
          </div>
        )}
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
        <div className="title-sub">
          {passageString.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>
      </div>
      <div className="body">
        <img src={esvLogo} alt="ESV Logo" className="circle-cutout" />
        <div className="title-passage">{currentPassage}</div>
      </div>
      <div className="progress">
        <Slider
          sx={{ width: "100%", color: "hsl(25, 100%, 60%)" }}
          defaultValue={0}
          value={progress}
          max={duration}
          onChange={(event, value) => {
            setSliderHeld(true);
            setProgress(value);
          }}
          onChangeCommitted={(event, value) => {
            setSliderHeld(false);
            setProgress(value);
          }}
        />
        <div className="timer-holder">
          <div className="timer">{progressString}</div>
          <div className="timer">{loading ? "Loading..." : ""}</div>
          <div className="timer">{timeLeftString}</div>
        </div>
      </div>
      <div className="controls">
        <button className="button" disabled={true}>
          <FiCast size={38} />
        </button>
        <button className="button" disabled={!canGoBack} onClick={prevCallback}>
          <FiSkipBack size={38} />
        </button>
        <button
          className="button"
          disabled={false}
          onClick={shouldPlay ? pauseCallback : playCallback}
        >
          {shouldPlay ? (
            <FiPause size={38} />
          ) : (
            <FiPlay size={38} />
          )}
        </button>
        <button
          className="button"
          disabled={!canGoForward}
          onClick={nextCallback}
        >
          <FiSkipForward size={38} />
        </button>
        <button
          className="button"
          disabled={false}
          onClick={() => {
            setDialogOpen(true);
          }}
        >
          <FiInfo size={38} />
        </button>
      </div>
    </div>
  );
};

export default WLF;
