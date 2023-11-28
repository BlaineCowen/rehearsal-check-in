import {useState, FC} from 'react'
import PropTypes from 'prop-types'
import '../globals.css'

interface FaderProps {
    text?: string;
  }
  
  const Fader: FC<FaderProps> = ({ text = 'Hello World' }) => {
    const [fadeProp, setFadeProp] = useState({
      fade: 'fade-in',
    });
  
    return (
      <div className={fadeProp.fade}>
        {text}
      </div>
    );
  };


Fader.propTypes = {
    text: PropTypes.string.isRequired,
};

export default Fader
