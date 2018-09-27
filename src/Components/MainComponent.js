import React, { Component } from 'react';
import Webcam from 'react-webcam';
import cuisine from "../cuisine.json";

class Main extends Component {
    constructor() {
        super();
        this.state = {
            weather: [],
            maxEmotion: '',
            food: '',
            emotionString: null,
            zipcode: '27519',
            restaurants: null
        };
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        this.setState({ zipcode: event.target.value });
    }

    setRef = webcam => {
        this.webcam = webcam;
    };

    capture = () => {
        // Take Picture and get mood
        const AzureFace_SUBSCRIPTION_KEY = 'b087994442994dbf92cc35088a0dd104';
        const weatherApiKey = '0a936f2103ce9629dc0c77c09e4a6114';
        const mapQuest_Api_KEY = '';

        this.webcam.getCanvas().toBlob(blob => {
            fetch('https://westcentralus.api.cognitive.microsoft.com/face/v1.0/detect?returnFaceId=false&returnFaceLandmarks=false&returnFaceAttributes=emotion',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/octet-stream',
                        'Ocp-Apim-Subscription-Key': AzureFace_SUBSCRIPTION_KEY
                    },
                    body: blob
                }).then(response => {
                    return response.json();
                }).then(data => {
                    if (data[0]) {
                        let emotions = data[0].faceAttributes.emotion;
                        var maxEmotionNum = null;

                        for (let emotion in emotions) {
                            if (emotions[emotion] > maxEmotionNum) {
                                maxEmotionNum = emotions[emotion];
                                this.setState({ maxEmotion: emotion });
                            }
                        }

                        this.setState({ emotionString: "The emotion is: " + this.state.maxEmotion });
                    } else {
                        this.setState({ emotionString: "Please try another picture" });
                    }
                    return this.state.maxEmotion;
                }
                ).then(maxEmotion => {
                    // Get the weather
                    let url = 'http://api.openweathermap.org/data/2.5/weather?zip=' + (this.state.zipcode || '27519') + ',us&appid=' + weatherApiKey;
                    fetch(url).then(results => {
                        return results.json();
                    }).then(data => {
                        var weather = data.weather[0];
                        this.setState({ weather: weather });
                        // Determine which type of cuisine
                        this.setState({ food: cuisine[maxEmotion][weather['id']] });
                    })

                    // Find restaurants by cuisine
                    // fetch(url).then(results => {
                    //     return results.json();
                    // }).then(data => {
                    //     var restaurants = data.weather[0];
                    //     this.setState({ restaurants: restaurants });


                    // })
                })
        })
    };

    render() {
        const videoConstraints = {
            width: 1280,
            height: 720,
            facingMode: "user"
        };
        return (
            <div>
                <div>
                    <p>
                        Please enter your zip code:
                    </p>
                    <input type="text" value={this.state.zipcode} onChange={this.handleChange} />
                    <div>
                        <Webcam
                            audio={false}
                            height={350}
                            ref={this.setRef}
                            screenshotFormat="image/jpeg"
                            width={350}
                            videoConstraints={videoConstraints}
                        />
                    </div>

                    <div>
                        <button onClick={this.capture}>
                            Capture photo
                        </button>
                    </div>

                    <div className="weatherContainer">
                        The weather is: {this.state.weather.description}
                    </div>

                    <div className="weatherContainer">
                        {this.state.emotionString}
                    </div>

                    <div className="weatherContainer">
                        The food is: {this.state.food}
                    </div>
                </div>
                <script src='https://maps.googleapis.com/maps/api/js?key=AIzaSyAjo2E9Np9S3d6zg60Tz9MaFKoOPCUC1gQ&libraries=places'></script>
            </div>
        )
    }
}

export default Main;
