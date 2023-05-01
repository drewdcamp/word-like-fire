/* eslint-disable react-hooks/exhaustive-deps */
import "./AudioPlayer.css";
import * as React from "react";
import bibleOverview from "./esvOverview";
import esvLogo from "./esv-logo.png";
import ScaleLoader from "react-spinners/ScaleLoader";
import Slider from "@mui/material/Slider";
import AudioControls from "./AudioControls";
import useScriptureAudio from "./useScriptureAudio";
import {storePassage} from "./useScriptureAudio";

const AudioPlayer = ({ PassageList }) => {
  const [index, setIndex] = React.useState(-1);
  const [currentPassage, setCurrentPassage] = React.useState();
  const [playing, setPlaying] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [progressString, setProgressString] = React.useState("00:00");
  const [timeLeftString, setTimeLeftString] = React.useState("-99:99");

  const [loading, audioElement] = useScriptureAudio(currentPassage);

  React.useEffect(() => {
    // Pause and clean up on unmount
    return () => {
      if (audioElement) {
        audioElement.pause();
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const splitPassageString = (passage) => {
    if (passage) {
      let parts = passage.split(" ");
      let chapter = parts[parts.length - 1];
      parts.splice(parts.length - 1, 1);
      let book = parts.join(" ");

      return { book, chapter };
    }
  };

  React.useEffect(() => {
    if (audioElement) {
      const { book, chapter } = splitPassageString(currentPassage);
      setProgress(0);
      setDuration(
        Math.floor(bibleOverview[book].chapterTimings[chapter - 1] / 1000)
      );

      clearInterval(intervalRef.current);

      if (playing) {
        audioElement.play();
        startTimer();
      }
    }
  }, [audioElement]);

  // Fetch all passages when the passage list changes
  React.useEffect(() => {
    setProgress(0);
    setDuration(0);

    const fetchAll = async () => {
      for (const passage of PassageList) {
        storePassage(passage);
      }
    };

    if (PassageList) fetchAll();

    setIndex(0);
  }, [PassageList]);

  React.useEffect(() => {
    if (audioElement) {
      audioElement.pause();
      setProgress(audioElement.currentTime);
    }

    if (PassageList) {
      setCurrentPassage(PassageList[index]);
    }
  }, [index, PassageList]);

  React.useEffect(() => {
    if (audioElement) {
      if (playing) {
        audioElement.play();
        startTimer();
      } else {
        audioElement.pause();
        clearInterval(intervalRef.current);
      }
    }
  }, [playing]);

  React.useEffect(() => {
    let timeLeft = Math.ceil(duration - progress);
    let progressM = Math.floor(progress / 60);
    let progressS = Math.floor(progress % 60);
    let timeLeftM = Math.floor(timeLeft / 60);
    let timeLeftS = Math.floor(timeLeft % 60);

    setProgressString(
      `+${progressM < 10 ? "0" : ""}${progressM}:${
        progressS < 10 ? "0" : ""
      }${progressS}`
    );
    setTimeLeftString(
      `-${timeLeftM < 10 ? "0" : ""}${timeLeftM}:${
        timeLeftS < 10 ? "0" : ""
      }${timeLeftS}`
    );
  }, [progress, duration]);

  const intervalRef = React.useRef();

  const playButton = () => {
    setPlaying(true);
    audioElement.play();
  };

  const pauseButton = () => {
    setPlaying(false);
  };

  const nextButton = () => {
    setProgress(0);
    setDuration(0);
    setIndex((prevIndex) => {
      return prevIndex + 1;
    });
  };

  const prevButton = () => {
    setProgress(0);
    setDuration(0);
    setIndex((prevIndex) => {
      return prevIndex - 1;
    });
  };

  const startTimer = () => {
    clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      if (audioElement.ended) {
        if (!(index === PassageList.length - 1)) {
          audioElement.currentTime = 0;
          nextButton();
        } else {
          audioElement.pause();
        }
      } else {
        setProgress(audioElement.currentTime);
      }
    }, [50]);
  };

  React.useEffect(() => {
    setIndex(0);
  }, [PassageList]);

  return (
    <div className="AudioPlayer">
      <div className="body">
        <div className="fill" />
        <div className="body-title">{currentPassage}</div>
        {loading ? (
          <div className="loading-crop">
            <ScaleLoader
              color="#d69136"
              loading
              margin={2}
              radius={0}
              speedMultiplier={1}
              width={4}
            />
          </div>
        ) : (
          <img src={esvLogo} alt="ESV Logo" className="logo-crop" />
        )}
        <div className="body-text">Read by David Cochran Heath</div>
        <Slider
          sx={{ width: "80%", color: "rgb(200, 150, 100)" }}
          defaultValue={0}
          value={progress}
          max={duration}
          onChange={(event, value) => {
            setProgress(value);
            audioElement.currentTime = value;
          }}
        />
        <div className="time-holder">
          <div className="time">{progressString}</div>
          <div className="time">{timeLeftString}</div>
        </div>
        <div className="fill" />
      </div>
      <AudioControls 
        playClicked={playButton}
        pauseClicked={pauseButton}
        nextClicked={nextButton}
        prevClicked={prevButton}
        index={index}
        playing={playing}
        PassageList={PassageList}
      />
    </div>
  );
};

export default AudioPlayer;
