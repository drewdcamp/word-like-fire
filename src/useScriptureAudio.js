import * as React from "react";
import * as localForage from "localforage";
import bibleOverview from "./esvOverview";
import axios from "axios";

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

const useScriptureAudio = ( passage ) => {
  const [passageBlob, setPassageBlob] = React.useState();
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchPassage = async () => {
      const { book, chapter } = splitPassageString(passage);
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

    if (passage) fetchPassage();
  }, [passage]);

  const audioElement = React.useMemo(() => {
    if (passageBlob) {
      setLoading(false);
      const newAudio = new Audio(window.URL.createObjectURL(passageBlob));
      return newAudio;
    }

    setLoading(true);
    return null;
  }, [passageBlob]);

  

  return [ loading, audioElement ];
};

// Copies item to local forage
export const storePassage = async (passageString) => {
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

export default useScriptureAudio;
