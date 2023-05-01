import * as React from 'react';
import useForagedScripture from './useForagedScripture';

const PassagePlayer = ({passage}) =>
{
    const passageBuffer = useForagedScripture(passage);

    const audioElement = React.useMemo(() => {
        return new
    }, [passageBuffer])
}