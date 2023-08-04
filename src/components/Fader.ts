import React, {useState, useEffect} from 'react'
import PropTypes from 'prop-types'
import '../globals.css'
import { dialogflow_v2 } from 'googleapis'

const Fader = ({text}) => {

    const [fadeProp, setFadeProp] = useState({
        fade: 'fade-in',
    }
    )
  return (
    <div className={fadeProp.fade}>
        {text}
    </div>



  )
}

Fader.defaultProps = {
    text: 'Hello World',
}


Fader.propTypes = {
    text: PropTypes.string.isRequired,
}

export default Fader
