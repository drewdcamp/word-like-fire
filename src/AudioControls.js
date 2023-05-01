/* eslint-disable react-hooks/exhaustive-deps */
import "./AudioPlayer.css";
import * as React from "react";
import {
  FiPause,
  FiPlay,
  FiSkipBack,
  FiSkipForward,
  FiInfo,
  FiCast,
} from "react-icons/fi";
import Dialog from "@mui/material/Dialog";

const AudioControls = ({
  playClicked,
  pauseClicked,
  prevClicked,
  nextClicked,
  playing,
  index,
  PassageList,
}) => {
  const [dialogOpen, setDialogOpen] = React.useState(false);

  return (
    <div className="controls">
      <Dialog
        PaperProps={{
          style: {
            backgroundColor: "rgba(75, 75, 100,0.75)",
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
      </Dialog>

      <button className="side-button" disabled={true}>
        <FiCast className="button-icon" />
      </button>
      <button
        className="side-button"
        onClick={prevClicked}
        disabled={index === 0}
      >
        <FiSkipBack className="button-icon" />
      </button>
      {playing ? (
        <button className="center-button" onClick={pauseClicked}>
          <FiPause className="button-icon" />
        </button>
      ) : (
        <button className="center-button" onClick={playClicked}>
          <FiPlay className="button-icon" />
        </button>
      )}
      <button
        className="side-button"
        onClick={nextClicked}
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
  );
};

export default AudioControls;
