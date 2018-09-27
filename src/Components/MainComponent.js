import React, { Component } from 'react';
import Webcam from 'react-webcam';

class Main extends Component {
    constructor () {
        super();
        this.state = {
            weather: [],
            maxEmotion: ''
        };
    }

    setRef = webcam => {
        this.webcam = webcam;
      };
     
      capture = () => {
          // Take Picture and get mood
        const SUBSCRIPTION_KEY = 'b087994442994dbf92cc35088a0dd104';
        
        this.webcam.getCanvas().toBlob(blob => {
            fetch('https://westcentralus.api.cognitive.microsoft.com/face/v1.0/detect?returnFaceId=false&returnFaceLandmarks=false&returnFaceAttributes=emotion',
            {
               method: 'POST',
               headers: {
                'Content-Type': 'application/octet-stream',
                'Ocp-Apim-Subscription-Key': SUBSCRIPTION_KEY
               },
               body: blob
            }).then(response => {
                return response.json();
            }).then(data => {
                let emotions = data[0].faceAttributes.emotion;
                var maxEmotion = null;
                var maxEmotionNum = null;
    
                for (let emotion in emotions) {
                    if (emotions[emotion] > maxEmotionNum) {
                        maxEmotion = emotion;
                        maxEmotionNum = emotions[emotion];
                        this.setState({maxEmotion: emotion});
                    }
                }
    
                return maxEmotion;
            })
         })

            // Get the weather
            fetch('http://api.openweathermap.org/data/2.5/weather?zip=27519,us&appid=0a936f2103ce9629dc0c77c09e4a6114')
            .then(results => {
                return results.json();
            }).then(data => {
                this.setState({weather: data.weather[0]});
            })

            // Determine which type of cuisine


            // Find restaurants by cuisine
      };


        render() 
            {
                const videoConstraints = {
                    width: 1280,
                    height: 720,
                    facingMode: "user"
                  };
            return(
                <div>
                <Webcam
                audio={false}
                height={350}
                ref={this.setRef}
                screenshotFormat="image/jpeg"
                width={350}
                videoConstraints={videoConstraints}
              />
              
              <button onClick={this.capture}>Capture photo</button>
           
                    <div className="weatherContainer">
                        The weather is: { this.state.weather.description }
                    </div>
                    <div className="weatherContainer">
                        The emotion is: { this.state.maxEmotion }
                    </div>
                </div>
            )
        }
    }

    export default Main;