/* eslint-disable react-hooks/exhaustive-deps */
import "./AudioPlayer.css";
import * as React from "react";
import * as localForage from "localforage";
import bibleOverview from "./esvOverview";
import axios from "axios";
import {
  FiPause,
  FiPlay,
  FiSkipBack,
  FiSkipForward,
  FiInfo,
  FiShare2,
} from "react-icons/fi";
import esvLogo from "./esv-logo.png";
import ScaleLoader from "react-spinners/ScaleLoader";
import Slider from "@mui/material/Slider";

const AudioPlayer = ({ PassageList }) => {
  const [index, setIndex] = React.useState(-1);
  const [currentPassage, setCurrentPassage] = React.useState();
  const [loading, setLoading] = React.useState(true);
  const [playing, setPlaying] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [passageBlob, setPassageBlob] = React.useState();
  const [progressString, setProgressString] = React.useState("00:00");
  const [timeLeftString, setTimeLeftString] = React.useState("-99:99");
  const [dialogOpen, setDialogOpen] = React.useState(false);

  React.useEffect(() => {
    // Pause and clean up on unmount
    return () => {
      if (audioElement) {
        audioElement.pause();
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  React.useEffect(() => {
    const fetchPassage = async () => {
      const { book, chapter } = splitPassageString(currentPassage);
      let audioBlob = null;
      try {
        audioBlob = await localForage.getItem(`${book} ${chapter}`);
      } catch (localError) {
        console.error(localError);
      }

      if (!audioBlob) {
        setLoading(true);
        try {
          audioBlob = await getAudioBlob(book, chapter);
          localForage.setItem(`${book} ${chapter}`, audioBlob);
        } catch (remoteError) {
          console.error(remoteError);
        }
      }

      setPassageBlob(audioBlob);
    };

    if (currentPassage) fetchPassage();
  }, [currentPassage]);

  const audioElement = React.useMemo(() => {
    if (passageBlob) {
      setLoading(false);
      const newAudio = new Audio(window.URL.createObjectURL(passageBlob));
      return newAudio;
    }

    setLoading(true);
    return null;
  }, [passageBlob]);

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

  const play = () => {
    setPlaying(true);
    audioElement.play();
  };

  const pause = () => {
    setPlaying(false);
  };

  const nextTrack = () => {
    setProgress(0);
    setDuration(0);
    setIndex((prevIndex) => {
      return prevIndex + 1;
    });
  };

  const prevTrack = () => {
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
          nextTrack();
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

  const splitPassageString = (passage) => {
    if (passage) {
      let parts = passage.split(" ");
      let chapter = parts[parts.length - 1];
      parts.splice(parts.length - 1, 1);
      let book = parts.join(" ");

      return { book, chapter };
    }
  };

  const getUrl = (book, chapter) => {
    if (bibleOverview[book].chapterCount > 1) {
      return `https://audio.esv.org/david-cochran-heath/mq/${book}+${chapter}.mp3`;
    } else {
      return `https://audio.esv.org/david-cochran-heath/mq/${book}.mp3`;
    }
  };

  const getAudioBlob = async (book, chapter) => {
    const url = getUrl(book, chapter);

    const { data } = await axios.get(url, {
      responseType: "arraybuffer",
      headers: {
        "Content-Type": "audio/wav",
      },
    });

    return new Blob([data], {
      type: "audio/wav",
    });
  };

  // Copies item to local forage
  const storePassage = async (passageString) => {
    const { book, chapter } = splitPassageString(passageString);

    let audioBlob = null;
    try {
      audioBlob = await localForage.getItem(`${book} ${chapter}`);
    } catch (localError) {
      console.error(localError);
    }

    if (!audioBlob) {
      try {
        audioBlob = await getAudioBlob(book, chapter);
        localForage.setItem(`${book} ${chapter}`, audioBlob);
      } catch (remoteError) {
        console.error(remoteError);
      }
    }
  };

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
      <div className="controls">
        <button className="side-button">
          <FiShare2 className="button-icon" />
        </button>
        <button
          className="side-button"
          onClick={prevTrack}
          disabled={index === 0}
        >
          <FiSkipBack className="button-icon" />
        </button>
        {playing ? (
          <button className="center-button" onClick={pause}>
            <FiPause className="button-icon" />
          </button>
        ) : (
          <button className="center-button" onClick={play}>
            <FiPlay className="button-icon" />
          </button>
        )}
        <button
          className="side-button"
          onClick={nextTrack}
          disabled={PassageList ? index === PassageList.length - 1 : true}
        >
          <FiSkipForward className="button-icon" />
        </button>
        <button
          className="side-button"
          onClick={() => {
            setDialogOpen(true);
          }}
        >
          <FiInfo className="button-icon" />
        </button>
      </div>
    </div>
  );
};

export default AudioPlayer;
