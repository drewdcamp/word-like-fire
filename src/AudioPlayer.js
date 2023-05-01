/* eslint-disable react-hooks/exhaustive-deps */
import "./AudioPlayer.css";
import * as React from 'react'
import * as localForage from "localforage";
import bibleOverview from "./esvOverview"
import axios from 'axios';
import { FiPause, FiPlay, FiSkipBack, FiSkipForward, FiInfo, FiShare2 } from "react-icons/fi";
import esvLogo from "./esv-logo.png";
import ReactAudioPlayer from "react-audio-player";

const AudioPlayer = ({ PassageList }) => {
    const [index, setIndex] = React.useState(0);
    const [playing, setPlaying] = React.useState(false);
    const [passageProgress, setPassageProgress] = React.useState(0);
    const [passageBlob, setPassageBlob] = React.useState();

    const currentPassage = React.useMemo(() => { return PassageList[index] }, [index, PassageList]);

    React.useEffect(() => {
        const fetchPassage = async () => {
            const { book, chapter } = splitPassageString(currentPassage);
            console.log(`Fetching blob for ${book} Chapter ${chapter}`);
            let audioBlob = null;
            try {
                audioBlob = await localForage.getItem(`${book} ${chapter}`);
                console.log(`-Retrieved ${audioBlob} from Forage`);
            }
            catch (localError) {
                console.error(localError);
            }

            if (!audioBlob) {
                console.log(`-Grabbing Remote`);
                try {
                    audioBlob = await getAudioBlob(book, chapter);
                    localForage.setItem(`${book} ${chapter}`, audioBlob);
                }
                catch (remoteError) {
                    console.error(remoteError);
                }
            }

            setPassageBlob(audioBlob);
        }
        fetchPassage();
    }, [currentPassage]);

    const audioElement = React.useMemo(() => {
        if (passageBlob) {
            console.log("Updating audioElement");
            return new Audio(window.URL.createObjectURL(passageBlob));
        }

        console.log("Nulling audioElement");
        return null;
    }, [passageBlob]);

    const play = () => {
        if (audioElement)
        {
            audioElement.play();
        }
        setPlaying(true);
    }

    const pause = () => {
        audioElement.pause();
        setPlaying(false);
    }

    const nextTrack = () => {
        setIndex((prevIndex) => {
            return prevIndex + 1;
        });
    };

    const prevTrack = () => {
        setIndex((prevIndex) => {
            return prevIndex - 1;
        });
    };

    const prevDisabled = React.useMemo(() => { return index === 0 }, [index])
    const nextDisabled = React.useMemo(() => { return index === PassageList.length - 1 }, [index])

    const playPauseButton = React.useMemo(() => {
        if (playing) {
            return (
                <button className="center-button" onClick={pause}>
                    <FiPause className="button-icon" />
                </button>
            );
        }

        return (
            <button className="center-button" onClick={play}>
                <FiPlay className="button-icon" />
            </button>
        );
    }, [playing])

    React.useEffect(() => { setIndex(0) }, [PassageList])

    return (
        <div className="AudioPlayer">
            <div className="body">
                <div className="fill" />
                <div className="body-title">{currentPassage}</div>
                <img src={esvLogo} alt="ESV Logo" className="logo-crop" />

                <div className="body-text">Read by David Cochran</div>
                <div className="fill" />
            </div>
            <div className="controls">
                <button className="side-button">
                    <FiShare2 className="button-icon" />
                </button>
                <button className="side-button" onClick={prevTrack} disabled={prevDisabled}>
                    <FiSkipBack className="button-icon" />
                </button>
                {playPauseButton}
                <button className="side-button" onClick={nextTrack} disabled={nextDisabled}>
                    <FiSkipForward className="button-icon" />
                </button>
                <button className="side-button">
                    <FiInfo className="button-icon" />
                </button>
            </div>
        </div>
    );
}

const splitPassageString = (passage) => {
    let parts = passage.split(" ");
    let chapter = parts[parts.length - 1];
    parts.splice(parts.length - 1, 1);
    let book = parts.join(" ");

    return { book, chapter }
}

const getUrl = (book, chapter) => {
    if (bibleOverview[book].chapterCount > 1) {
        return `https://audio.esv.org/david-cochran-heath/mq/${book}+${chapter}.mp3`;
    } else {
        return `https://audio.esv.org/david-cochran-heath/mq/${book}.mp3`;
    }
};

const getAudioBlob = async (book, chapter) => {
    const url = getUrl(book, chapter);
    const response = await axios.get(url, { responseType: "arraybuffer" });
    return new Blob([response], { type: "audio/mp3" });
};

export default AudioPlayer;