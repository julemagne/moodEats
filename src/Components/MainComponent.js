import React, { Component } from 'react';
import Webcam from 'react-webcam';
import cuisine from "../cuisine.json";
import MapQuestStaticMap from 'react-primitives-mapquest-static-map';

class Main extends Component {
    constructor() {
        super();
        this.state = {
            weather: [],
            maxEmotion: '',
            food: '',
            emotionString: null,
            zipcode: '27519',
            restaurants: null,
            foodString: '',
            coordinates: { lat: '35.7915', lon: '-78.7811' },
            markers: [{ latitude: 35.7915, longitude: -78.7811 }]
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
        const mapQuest_Api_KEY = 'IzG0KQI7Fh7Kex49ViWuhCpi7CG0CGh7';

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
                        if (this.state.maxEmotion) {
                            this.setState({ food: cuisine[maxEmotion][weather['id']] });
                            this.setState({ foodString: "The suggested food type is: " + this.state.food });
                        } else {
                            this.setState({ foodString: "Try again!" });
                        }
                        return data.coord;
                    }).then(coordinates => {
                        if (coordinates) {
                            this.setState({ coordinates: { lat: String(coordinates.lat), lon: String(coordinates.lon) } })
                            // Find restaurants by cuisine
                            const url = 'https://www.mapquestapi.com/search/v4/place?location=' + coordinates.lon + ',' + coordinates.lat + '&q=' + 'chinese' + '&sort=distance&feedback=false&key=' + mapQuest_Api_KEY;
                            fetch(url).then(results => {
                                return results.json();
                            }).then(data => {
                                var listItems = data.results.map(function(item) {
                                    return (
                                        <li key={item.id} >{item.displayString}</li>
                                    );
                                });

                                var mapList = data.results.map(item => {
                                    let cd = item.place.geometry.coordinates;
                                    return { latitude: cd[1], longitude: cd[0] }
                                });

                                this.setState({ markers: mapList });
                                this.setState({ restaurants: listItems });
                            })
                        }
                    })
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
            <div className="inFront bg">
                <div>
                    <p>
                        Please enter your zip code:
                    </p>
                    <input type="text" value={this.state.zipcode} onChange={this.handleChange} />
                    <div className="webcamAccordion">
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
                        { this.state.foodString }
                    </div>

                    <div>
                        <ul>
                            { this.state.restaurants}
                        </ul>
                    </div>

                    <MapQuestStaticMap
                        latitude={this.state.coordinates.lat}
                        longitude={this.state.coordinates.lon}
                        zoom={12}
                        size={{ width: 500, height: 500 }}
                        scale={2}
                        locations={this.state.markers}
                    />
                </div>
            </div>
        )
    }
}

export default Main;
