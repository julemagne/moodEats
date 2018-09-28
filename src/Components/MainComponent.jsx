import React, { Component } from 'react';
import Webcam from 'react-webcam';
import cuisine from "../cuisine.json";
import MapQuestStaticMap from 'react-primitives-mapquest-static-map';

class Main extends Component {
    constructor() {
        super();
        this.state = {
            weather: null,
            mapQuest_Api_KEY: 'IzG0KQI7Fh7Kex49ViWuhCpi7CG0CGh7',
            maxEmotion: null,
            food: null,
            emotionString: null,
            zipcode: '27519',
            restaurants: null,
            foodString: null,
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
        const mapQuest_Api_KEY = this.state.mapQuest_Api_KEY;

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
                        this.setState({ emotionString: "Please try another picture", maxEmotion: null });
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
                            let food = cuisine[maxEmotion][weather['id']];
                            this.setState({ food: food, foodString: "The suggested food type is: " + food });
                        } else {
                            this.setState({ foodString: "Try again!", food: null });
                        }
                        return data.coord;
                    }).then(coordinates => {
                        if (coordinates) {
                            this.setState({ coordinates: { lat: String(coordinates.lat), lon: String(coordinates.lon) } })
                            // Find restaurants by cuisine
                            const url = 'https://www.mapquestapi.com/search/v4/place?location=' + coordinates.lon + ',' + coordinates.lat + '&q=' + this.state.food + '&sort=distance&feedback=false&key=' + mapQuest_Api_KEY;
                            fetch(url).then(results => {
                                return results.json();
                            }).then(mapData => {
                                let listItems = mapData.results.map(function (restaurant) {
                                    return (
                                        <li className="li-spacing" key={restaurant.id} >
                                            <h2>
                                                {restaurant.name}
                                            </h2>
                                            <h3>
                                                {restaurant.displayString}
                                            </h3>
                                        </li>
                                    );
                                });

                                var mapList = mapData.results.map(item => {
                                    let cd = item.place.geometry.coordinates;
                                    return { latitude: cd[1], longitude: cd[0] }
                                });

                                this.setState({ markers: mapList, restaurants: listItems });
                            })
                        }
                    }).catch(err => console.log(err))
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
                    <div className="mood_eats_container novaText">
                        <ul className="vertically_centered question_list rotate-350">
                            <li>Are you moody?</li>
                            <li>Do you need eats?</li>
                        </ul>
                        <h1 className="title rotate-357">MOOD EATS</h1>
                    </div>

                    <div className="photo_row_container">
                        <div className="webcamAccordion vertically_centered">
                            <Webcam
                                audio={false}
                                height={350}
                                width={350}
                                ref={this.setRef}
                                screenshotFormat="image/jpeg"
                                videoConstraints={videoConstraints}
                            />
                        </div>

                        <div className="buttons vertically_centered">
                            <div className="zipcode_row_container">
                                <span className="zipcodeLabel">Please enter your zip code:</span> <input type="text" value={this.state.zipcode} onChange={this.handleChange} />
                            </div>
                            <button className="btn-hover smash_dis_button" onClick={this.capture}>
                                Gimmie Food!
                            </button>
                        </div>

                        <div className="output_list vertically_centered">
                            {this.state.weather && (
                                <div className="weatherContainer">
                                    <span className="listName">Current weather:</span> {this.state.weather.description}!
                                </div>
                            )}

                            {this.state.maxEmotion ? (
                                <div className="weatherContainer">
                                    <span className="listName">The emotion is:</span> {this.state.maxEmotion}!
                                </div>
                            ) : (
                                    <div className="weatherContainer">
                                        {this.state.emotionString}
                                    </div>
                                )}

                            {this.state.food ? (
                                <div className="weatherContainer">
                                    <span className="listName">The suggested food type is:</span> {this.state.food}!
                                </div>
                            ) : (
                                    <div className="weatherContainer">
                                        {this.state.foodString}
                                    </div>
                                )}
                        </div>
                    </div>
                    <div className="map_row_container">
                        <div>
                            {this.state.food && (
                                <ul>
                                    {this.state.restaurants}
                                </ul>
                            )}
                        </div>

                        <MapQuestStaticMap
                            apiKey={this.state.mapQuest_Api_KEY}
                            latitude={this.state.coordinates.lat}
                            longitude={this.state.coordinates.lon}
                            zoom={12}
                            size={{ width: 500, height: 500 }}
                            scale={2}
                            locations={this.state.markers}
                        />
                    </div>
                </div>
            </div>
        )
    }
}

export default Main;
