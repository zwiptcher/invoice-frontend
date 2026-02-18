import { useEffect } from 'react';
import { useNavigation } from 'react-router-dom';
import nprogress from 'nprogress';
import 'nprogress/nprogress.css';

// Configure nprogress
nprogress.configure({
    showSpinner: false,
    trickleSpeed: 200,
    minimum: 0.08
});

const LoadingBar = () => {
    const navigation = useNavigation();

    useEffect(() => {
        if (navigation.state === 'loading') {
            nprogress.start();
        } else {
            nprogress.done();
        }
    }, [navigation.state]);

    return null;
};

export default LoadingBar;
